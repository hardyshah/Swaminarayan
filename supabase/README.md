# Members area: setup

The members pages (`login.html`, `me.html`, `admin.html`) and the floating **Contribute** button on every page
run in **demo mode** until the site is connected to a Supabase project. In demo mode everything stays in the
visitor's own browser and nothing is shared.

Going live takes about 10 minutes and the free Supabase plan is enough.

## 1. Create the project

1. Sign up at <https://supabase.com> and click **New project**. Pick a region near your members (for India, Mumbai).
2. When it is ready, open **SQL Editor → New query**, paste all of [`schema.sql`](schema.sql) and press **Run**.
3. The result at the bottom shows **your_admin_invite_code**. Keep it; it makes you the first admin.

## 2. Sign-in settings

In **Authentication → Sign In / Providers → Email**:

- Keep **Email** on. Keep **Confirm email** on (members click a link in an email before their first sign-in).
- Leave **Allow new users to sign up** on. Nobody can actually join without a valid invite code: the database refuses any sign-up that does not carry one.

In **Authentication → URL Configuration**:

- **Site URL**: `https://hardyshah.github.io/Swaminarayan/`
- **Redirect URLs**: add `https://hardyshah.github.io/Swaminarayan/login.html`

The free plan sends only a few emails per hour from Supabase's own address. For more, add your own SMTP
(for example a Gmail app password or Resend) under **Authentication → Emails → SMTP settings**.

## 3. Connect the site

In **Project Settings → API** copy the **Project URL** and the **anon public** key into
[`../site/collab/config.js`](../site/collab/config.js):

```js
window.SPC_CONFIG = {
  supabaseUrl: "https://xxxx.supabase.co",
  supabaseAnonKey: "eyJ...",
  storageBucket: "uploads"
};
```

The anon key is meant to be public. The row-level security rules in `schema.sql` decide what each person can read and change.

## 4. Become admin and invite people

1. Open `login.html` → **Join with invite**, enter the admin invite code from step 1, your name, email and a password.
2. Confirm your email, sign in, and open **Admin → Invites** to create a code for each person.
   Copy the invite link and send it yourself (WhatsApp, email). Each code works once and can be locked to one email.

## What the database enforces

| Rule | Where |
| --- | --- |
| No account without a valid, unused, unexpired invite code (and the right email if the invite names one) | `check_invite` trigger on `auth.users` |
| Role comes from the invite; members cannot change their own role or status | `handle_new_user`, `guard_profile` |
| Members see their own items in any status and other members' items only once approved | `c_read` policy |
| New items always start as *pending*; editing your own item sends it back for review; approved items are locked | `guard_contribution` |
| Per-member hourly limit on new items (Admin → Site controls) | `guard_contribution` |
| Files go only into the member's own folder; others can open them only after approval | storage policies |
| Tracker entries are private to the member; staff can read them for the leaderboard | `a_own`, `a_staff` |
| Paused members cannot sign in, send items or log activity | `is_active()` in policies |
| Every sign-up, invite, review, role change and setting change is logged | `audit` table |

## Roles

- **member**: comment, suggest edits, upload, use the tracker.
- **moderator**: also reviews the queue and sees the dashboard.
- **admin**: also manages members, invites, site controls, score rules and backups.

## Note on the members-only switch

GitHub Pages serves the page files publicly, so **Admin → Site controls → Members-only site** sends visitors
who are not signed in to the sign-in page, but anyone who knows how can still fetch the files directly.
Everything members add (comments, uploads, tracker, scores) is protected by the database and is never public.
