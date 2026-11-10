/* Find the murti's eyes: a pair of bright, white, almond-shaped blobs of similar size side by side.
   Input: RGBA pixel array, width, height. Output {l,r,d,cx,cy,score} in input pixel units, or null. */
(function(root){
function findEyes(px,W,H){
 const S=Math.min(1,420/Math.max(W,H)),w=Math.round(W*S),h=Math.round(H*S),m=new Uint8Array(w*h);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(Math.floor(y/S)*W+Math.floor(x/S))*4,r=px[i],g=px[i+1],b=px[i+2];
  const mn=Math.min(r,g,b),mx=Math.max(r,g,b);if(mn>165&&mx-mn<50)m[y*w+x]=1}
 const lab=new Int32Array(w*h),comps=[];let id=0;const st=[];
 for(let p=0;p<w*h;p++){if(!m[p]||lab[p])continue;id++;let x0=1e9,y0=1e9,x1=-1,y1=-1,n=0,sx=0,sy=0;st.push(p);lab[p]=id;
  while(st.length){const q=st.pop(),x=q%w,y=(q/w)|0;n++;sx+=x;sy+=y;if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;
   for(const o of[q-1,q+1,q-w,q+w]){if(o<0||o>=w*h)continue;if((o===q-1&&x===0)||(o===q+1&&x===w-1))continue;if(m[o]&&!lab[o]){lab[o]=id;st.push(o)}}}
  const bw=x1-x0+1,bh=y1-y0+1;
  if(n>=12&&n<w*h*.03&&bw/bh>1.1&&bw/bh<3.8&&n/(bw*bh)>.4&&n/(bw*bh)<.92)comps.push({x0,y0,x1,y1,bw,bh,n,cx:sx/n,cy:sy/n})}
 // darkness inside the blob's bbox (the pupil) and around it
 const lum=(x,y)=>{const i=(Math.floor(y/S)*W+Math.floor(x/S))*4;return(px[i]+px[i+1]+px[i+2])/3};
 for(const c of comps){let dark=0,t=0;for(let y=c.y0;y<=c.y1;y++)for(let x=c.x0;x<=c.x1;x++){t++;if(lum(x,y)<70)dark++}c.pupil=dark/t;
  let ring=0,rt=0;const pad=Math.max(2,Math.round(c.bh*.6));for(let x=c.x0-pad;x<=c.x1+pad;x++)for(const y of[c.y0-pad,c.y1+pad]){if(x<0||y<0||x>=w||y>=h)continue;rt++;if(lum(x,y)<150)ring++}c.ring=rt?ring/rt:0}
 let best=null;
 for(let i=0;i<comps.length;i++)for(let j=0;j<comps.length;j++){if(i===j)continue;const a=comps[i],b=comps[j];if(a.cx>=b.cx)continue;
  const ar=Math.max(a.n,b.n)/Math.min(a.n,b.n);if(ar>2.4||a.pupil<.04||b.pupil<.04)continue;const mw=(a.bw+b.bw)/2,mh=(a.bh+b.bh)/2;
  const dx=b.cx-a.cx,dy=Math.abs(b.cy-a.cy);if(dy>mh*.9||dx<mw*1.25||dx>mw*4.2)continue;
  // the gap between the eyes should not itself be white
  let gapW=0,gt=0;for(let x=Math.round(a.x1+1);x<b.x0;x++){const y=Math.round((a.cy+b.cy)/2);gt++;if(m[y*w+x])gapW++}if(gt&&gapW/gt>.5)continue;
  const s=(1/ar)*(1-dy/(mh*1.2))*(.5+a.pupil+b.pupil)*(.4+a.ring+b.ring)*Math.sqrt(a.n+b.n)*(1.15-(a.cy/h)*.3);
  if(!best||s>best.s)best={s,a,b}}
 if(!best)return null;
 const k=1/S,{a,b}=best;
 return{l:{x:a.cx*k,y:a.cy*k,w:a.bw*k,h:a.bh*k},r:{x:b.cx*k,y:b.cy*k,w:b.bw*k,h:b.bh*k},d:(b.cx-a.cx)*k,cx:(a.cx+b.cx)/2*k,cy:(a.cy+b.cy)/2*k,score:best.s}}
/* A face box from the eye pair, using murti proportions (big eyes, eye line ~42% down the face). */
function faceFromEyes(e){const fw=e.d*2.3,fh=e.d*2.5;return{xmin:e.cx-fw/2,xmax:e.cx+fw/2,ymin:e.cy-fh*.42,ymax:e.cy+fh*.58}}
root.SHANGAAR_EYES={findEyes,faceFromEyes};
})(typeof window!=="undefined"?window:globalThis);
