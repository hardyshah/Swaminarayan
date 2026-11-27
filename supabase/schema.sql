-- Swaminarayan site: members, contributions, satsang tracker, invites, settings, audit log.
-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- It is safe to run again; it only creates what is missing and replaces the functions and policies.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- tables
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  name        text,
  role        text not null default 'member' check (role in ('member','moderator','admin')),
  status      text not null default 'active' check (status in ('active','suspended')),
  layout      jsonb,
  last_seen   timestamptz,
  created_at  timestamptz not null default now()
);

-- email and mobile verification, copied from auth.users by sync_verification() below
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists email_verified boolean not null default false;
alter table public.profiles add column if not exists phone_verified boolean not null default false;

-- the comment/feedback resolution manager role
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('member','resolver','moderator','admin'));

create table if not exists public.invites (
  code        text primary key,
  email       text,
  role        text not null default 'member' check (role in ('member','moderator','admin')),
  note        text,
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz,
  used_by     uuid references public.profiles(id) on delete set null,
  used_at     timestamptz,
  revoked     boolean not null default false
);

create table if not exists public.contributions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  kind        text not null check (kind in ('comment','edit','upload','event')),
  page        text not null,
  target      text default '',
  title       text default '',
  body        text default '',
  file_path   text,
  file_name   text,
  file_type   text,
  file_size   bigint,
  status      text not null default 'pending' check (status in ('pending','approved','rejected','changes')),
  admin_note  text default '',
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint body_len check (char_length(body) <= 20000 and char_length(title) <= 200 and char_length(target) <= 300)
);
-- comments: open -> acknowledged -> resolved (deleted); anchored to a spot on the page
alter table public.contributions add column if not exists anchor text default '';
alter table public.contributions add column if not exists anchor_label text default '';
alter table public.contributions add column if not exists source_url text default '';
alter table public.contributions add column if not exists acknowledged_by uuid references public.profiles(id) on delete set null;
alter table public.contributions add column if not exists acknowledged_at timestamptz;
alter table public.contributions drop constraint if exists contributions_status_check;
alter table public.contributions add constraint contributions_status_check check (status in ('pending','approved','rejected','changes','open','acknowledged'));
alter table public.invites drop constraint if exists invites_role_check;
alter table public.invites add constraint invites_role_check check (role in ('member','resolver','moderator','admin'));
create index if not exists contributions_page on public.contributions(page);
create index if not exists contributions_user on public.contributions(user_id);
create index if not exists contributions_status on public.contributions(status);

create table if not exists public.activities (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  day         date not null,
  kind        text not null,
  qty         numeric not null default 0 check (qty >= 0 and qty <= 100000),
  note        text default '',
  created_at  timestamptz not null default now()
);
create index if not exists activities_user_day on public.activities(user_id, day);

create table if not exists public.settings (
  key   text primary key,
  value jsonb not null
);

create table if not exists public.audit (
  id      bigint generated always as identity primary key,
  actor   uuid,
  action  text not null,
  target  text,
  detail  text,
  at      timestamptz not null default now()
);

-- ---------------------------------------------------------------- helpers
create or replace function public.is_staff() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role in ('admin','moderator') and status = 'active' and email_verified and phone_verified);
$$;
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin' and status = 'active' and email_verified and phone_verified);
$$;
create or replace function public.is_resolver() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role in ('admin','moderator','resolver') and status = 'active' and email_verified and phone_verified);
$$;
-- 24-hour rule: while any comment is overdue, only overdue comments can be actioned
create or replace function public.overdue_guard(cid uuid, created timestamptz) returns void language plpgsql security definer set search_path = public as $$
declare n int;
begin
  if created < now() - interval '24 hours' then return; end if;
  select count(*) into n from contributions where kind = 'comment' and status in ('open','acknowledged') and id <> cid and created_at < now() - interval '24 hours';
  if n > 0 then raise exception 'resolve the % overdue comment(s) older than 24 hours first', n; end if;
end $$;
create or replace function public.is_active() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and status = 'active' and email_verified and phone_verified);
$$;
create or replace function public.log(a text, t text, d text) returns void language sql security definer set search_path = public as $$
  insert into audit(actor, action, target, detail) values (auth.uid(), a, t, d);
$$;

-- ---------------------------------------------------------------- invite-only sign-up
-- Blocks any new account that does not carry a valid, unused invite code in its sign-up data.
create or replace function public.check_invite() returns trigger language plpgsql security definer set search_path = public as $$
declare inv invites%rowtype; c text;
begin
  c := upper(coalesce(new.raw_user_meta_data->>'invite', ''));
  select * into inv from invites where code = c for update;
  if not found or inv.revoked or inv.used_by is not null or (inv.expires_at is not null and inv.expires_at < now())
     or (inv.email is not null and inv.email <> '' and lower(inv.email) <> lower(new.email)) then
    raise exception 'invite code not valid';
  end if;
  return new;
end $$;
drop trigger if exists auth_check_invite on auth.users;
create trigger auth_check_invite before insert on auth.users for each row execute function public.check_invite();

-- Creates the member's profile with the role from the invite, and uses up the invite.
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
declare c text; r text;
begin
  c := upper(coalesce(new.raw_user_meta_data->>'invite', ''));
  select role into r from invites where code = c;
  perform set_config('spc.sync', '1', true);
  insert into profiles(id, email, name, role, phone, email_verified, phone_verified)
    values (new.id, new.email, coalesce(nullif(new.raw_user_meta_data->>'name',''), split_part(new.email,'@',1)), coalesce(r,'member'),
            nullif(new.phone,''), new.email_confirmed_at is not null, new.phone_confirmed_at is not null)
    on conflict (id) do nothing;
  perform set_config('spc.sync', '', true);
  update invites set used_by = new.id, used_at = now() where code = c;
  insert into audit(actor, action, target, detail) values (new.id, 'sign-up', new.email, 'invite ' || c);
  return new;
end $$;
drop trigger if exists auth_new_user on auth.users;
create trigger auth_new_user after insert on auth.users for each row execute function public.handle_new_user();

-- Keeps profiles.email_verified / phone_verified / phone in step with Supabase Auth
-- (email confirmed by link, mobile confirmed by SMS code).
create or replace function public.sync_verification() returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform set_config('spc.sync', '1', true);
  update profiles set
    email_verified = new.email_confirmed_at is not null,
    phone_verified = new.phone_confirmed_at is not null,
    phone = case when coalesce(new.phone,'') = '' then phone else '+' || ltrim(new.phone, '+') end
  where id = new.id;
  if (old.phone_confirmed_at is null and new.phone_confirmed_at is not null) then
    insert into audit(actor, action, target, detail) values (new.id, 'phone-verified', new.email, null);
  end if;
  if (old.email_confirmed_at is null and new.email_confirmed_at is not null) then
    insert into audit(actor, action, target, detail) values (new.id, 'email-verified', new.email, null);
  end if;
  perform set_config('spc.sync', '', true);
  return new;
end $$;
drop trigger if exists auth_sync_verification on auth.users;
create trigger auth_sync_verification after update of email_confirmed_at, phone_confirmed_at, phone on auth.users
  for each row execute function public.sync_verification();

-- ---------------------------------------------------------------- guard rails
-- Members cannot change their own role or status; only admins can.
create or replace function public.guard_profile() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (new.role is distinct from old.role or new.status is distinct from old.status) then
    if not is_admin() then raise exception 'only an admin can change roles or status'; end if;
    if new.id = auth.uid() and (new.role <> 'admin' or new.status <> 'active') then raise exception 'you cannot remove your own admin access'; end if;
    perform log('user', old.email, 'role ' || old.role || '→' || new.role || ', status ' || old.status || '→' || new.status);
  end if;
  new.email := old.email; new.id := old.id; new.created_at := old.created_at;
  -- verification flags and the mobile number only change through Supabase Auth (sync_verification)
  if coalesce(current_setting('spc.sync', true), '') <> '1' then
    new.phone := old.phone; new.email_verified := old.email_verified; new.phone_verified := old.phone_verified;
  end if;
  return new;
end $$;
drop trigger if exists profiles_guard on public.profiles;
create trigger profiles_guard before update on public.profiles for each row execute function public.guard_profile();

-- New items always start as pending (staff may approve their own), rate limit per hour, review stamps, audit.
create or replace function public.guard_contribution() returns trigger language plpgsql security definer set search_path = public as $$
declare n int; lim int;
begin
  if tg_op = 'INSERT' then
    new.user_id := auth.uid(); new.status := case when new.kind = 'comment' then 'open' else 'pending' end;
    new.admin_note := ''; new.reviewed_by := null; new.reviewed_at := null; new.acknowledged_by := null; new.acknowledged_at := null;
    if new.kind = 'comment' then
      select count(*) into n from contributions where user_id = auth.uid() and kind = 'comment' and status in ('open','acknowledged');
      if n >= 20 then raise exception 'comment limit: you already have 20 unresolved comments'; end if;
    end if;
    new.created_at := now(); new.updated_at := now();
    select coalesce((value->>'perHour')::int, 20) into lim from settings where key = 'rate';
    select count(*) into n from contributions where user_id = auth.uid() and created_at > now() - interval '1 hour';
    if n >= coalesce(lim, 20) and not is_staff() then raise exception 'rate limit: too many items in the last hour'; end if;
    if new.file_path is not null and split_part(new.file_path, '/', 1) <> auth.uid()::text then raise exception 'file path must be in your own folder'; end if;
    perform log('create-' || new.kind, new.page, new.title);
    return new;
  end if;
  -- UPDATE
  new.user_id := old.user_id; new.created_at := old.created_at; new.kind := old.kind; new.page := old.page;
  new.file_path := old.file_path; new.file_name := old.file_name; new.file_type := old.file_type; new.file_size := old.file_size;
  new.updated_at := now(); new.anchor := old.anchor; new.anchor_label := old.anchor_label;
  if old.kind = 'comment' then
    if is_resolver() and old.user_id <> auth.uid() then
      if new.status not in ('open','acknowledged') then raise exception 'comments are acknowledged, then resolved by deleting them'; end if;
      perform overdue_guard(old.id, old.created_at);
      if new.status = 'acknowledged' and old.status = 'open' then
        new.acknowledged_by := auth.uid(); new.acknowledged_at := now();
        perform log('ack-comment', old.page, left(old.body, 120));
      end if;
    else
      -- the author may edit the text of their own comment; status stays as it is
      new.status := old.status; new.admin_note := old.admin_note; new.acknowledged_by := old.acknowledged_by; new.acknowledged_at := old.acknowledged_at;
    end if;
    return new;
  end if;
  if is_staff() and (new.status is distinct from old.status or new.admin_note is distinct from old.admin_note) then
    new.reviewed_by := auth.uid(); new.reviewed_at := now();
    perform log('review-' || new.status, old.page, old.title || coalesce(' · ' || nullif(new.admin_note,''), ''));
  elsif not is_staff() then
    -- the author editing their own item: it goes back to the queue
    if old.status = 'approved' then raise exception 'approved items can no longer be edited'; end if;
    new.status := 'pending'; new.admin_note := old.admin_note; new.reviewed_by := old.reviewed_by; new.reviewed_at := old.reviewed_at;
  end if;
  return new;
end $$;
create or replace function public.guard_comment_delete() returns trigger language plpgsql security definer set search_path = public as $$
declare who text;
begin
  if old.kind <> 'comment' then
    perform log('delete', old.page, old.title); return old;
  end if;
  select name into who from profiles where id = old.user_id;
  if old.user_id = auth.uid() and not is_resolver() then
    perform log('withdraw-comment', old.page, left(old.body, 160)); return old;
  end if;
  if old.status = 'open' then raise exception 'acknowledge the comment first, then resolve it'; end if;
  perform overdue_guard(old.id, old.created_at);
  perform log('resolve-comment', old.page, '"' || left(old.body, 160) || '" by ' || coalesce(who, '?') || coalesce(' · action: ' || nullif(old.admin_note, ''), ''));
  return old;
end $$;
drop trigger if exists contributions_delete_guard on public.contributions;
create trigger contributions_delete_guard before delete on public.contributions for each row execute function public.guard_comment_delete();

drop trigger if exists contributions_guard on public.contributions;
create trigger contributions_guard before insert or update on public.contributions for each row execute function public.guard_contribution();

create or replace function public.log_settings() returns trigger language plpgsql security definer set search_path = public as $$
begin perform log('settings', new.key, left(new.value::text, 200)); return new; end $$;
drop trigger if exists settings_log on public.settings;
create trigger settings_log after insert or update on public.settings for each row execute function public.log_settings();

create or replace function public.log_invite() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then perform log('invite', coalesce(nullif(new.email,''), new.code), new.role);
  elsif new.revoked and not old.revoked then perform log('revoke-invite', new.code, null); end if;
  return new;
end $$;
drop trigger if exists invites_log on public.invites;
create trigger invites_log after insert or update on public.invites for each row execute function public.log_invite();

-- ---------------------------------------------------------------- row-level security
alter table public.profiles      enable row level security;
alter table public.invites       enable row level security;
alter table public.contributions enable row level security;
alter table public.activities    enable row level security;
alter table public.settings      enable row level security;
alter table public.audit         enable row level security;

drop policy if exists p_self_read   on public.profiles;
drop policy if exists p_names_read  on public.profiles;
drop policy if exists p_self_update on public.profiles;
drop policy if exists p_admin_all   on public.profiles;
drop policy if exists p_read on public.profiles;
-- full rows (with email) only for yourself and staff; other members see names through member_names below
create policy p_read        on public.profiles for select to authenticated using (id = auth.uid() or is_staff());
create policy p_self_update on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy p_admin_all   on public.profiles for update to authenticated using (is_admin()) with check (is_admin());

-- names only, so approved comments can show who wrote them without exposing emails
create or replace view public.member_names as select id, name from public.profiles where status = 'active';
revoke all on public.member_names from anon;
grant select on public.member_names to authenticated;

drop policy if exists i_admin on public.invites;
create policy i_admin on public.invites for all to authenticated using (is_admin()) with check (is_admin());

drop policy if exists c_read   on public.contributions;
drop policy if exists c_insert on public.contributions;
drop policy if exists c_update on public.contributions;
drop policy if exists c_delete on public.contributions;
-- you see your own items in any status, approved items from everyone, and staff see everything
create policy c_read   on public.contributions for select to authenticated using (user_id = auth.uid() or (kind <> 'comment' and status = 'approved' and is_active()) or (kind = 'comment' and is_resolver()) or is_staff());
create policy c_insert on public.contributions for insert to authenticated with check (user_id = auth.uid() and is_active());
create policy c_update on public.contributions for update to authenticated using ((user_id = auth.uid() and status <> 'approved') or (kind = 'comment' and is_resolver()) or is_staff()) with check (true);
create policy c_delete on public.contributions for delete to authenticated using (user_id = auth.uid() or (kind = 'comment' and is_resolver()) or is_staff());

drop policy if exists a_own   on public.activities;
drop policy if exists a_staff on public.activities;
create policy a_own   on public.activities for all    to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid() and is_active());
create policy a_staff on public.activities for select to authenticated using (is_staff());

drop policy if exists s_read  on public.settings;
drop policy if exists s_write on public.settings;
-- settings are readable by visitors too (announcement banner, members-only switch)
create policy s_read  on public.settings for select to anon, authenticated using (true);
create policy s_write on public.settings for all    to authenticated using (is_admin()) with check (is_admin());

drop policy if exists au_read on public.audit;
create policy au_read on public.audit for select to authenticated using (is_staff());

-- ---------------------------------------------------------------- file storage (private bucket)
insert into storage.buckets (id, name, public, file_size_limit)
  values ('uploads', 'uploads', false, 52428800)
  on conflict (id) do update set public = false;

drop policy if exists f_insert_own  on storage.objects;
drop policy if exists f_read        on storage.objects;
drop policy if exists f_delete      on storage.objects;
-- members upload only into their own folder: uploads/<their id>/...
create policy f_insert_own on storage.objects for insert to authenticated
  with check (bucket_id = 'uploads' and (storage.foldername(name))[1] = auth.uid()::text and public.is_active());
-- a file can be opened by its owner, by staff, and by members once its item is approved
create policy f_read on storage.objects for select to authenticated using (
  bucket_id = 'uploads' and (
    (storage.foldername(name))[1] = auth.uid()::text or public.is_staff()
    or exists (select 1 from public.contributions c where c.file_path = name and c.status = 'approved' and public.is_active())));
create policy f_delete on storage.objects for delete to authenticated
  using (bucket_id = 'uploads' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_staff()));

-- ---------------------------------------------------------------- first admin invite
-- Creates one admin invite code the first time this script runs. The code is shown in the results below.
insert into public.invites (code, role, note)
  select upper(substr(md5(gen_random_uuid()::text), 1, 5) || '-' || substr(md5(gen_random_uuid()::text), 1, 5)), 'admin', 'Owner (first admin)'
  where not exists (select 1 from public.invites where role = 'admin');
select code as your_admin_invite_code, note from public.invites where role = 'admin' and used_by is null and not revoked;
