/* Editable case layouts and media share the local project document. */
(()=>{const key=location.pathname.split('/').pop().replace('.html','');let revision=-1,mediaConfig={videos:{}};const main=document.querySelector('.project-layout');if(!main)return;
function node(e,config,offset,topOffset=0){const n=document.createElement(e.href?'a':'div');n.className='detail-element';if(e.anchor)n.id=e.anchor;n.dataset.kind=e.type;if(e.type==='text')n.dataset.typeSize=String(e.fontSize||16);if(e.type==='image'){n.style.aspectRatio=e.w+'/'+e.h;n.style.setProperty('--archive-frame-ratio',String(e.w/e.h));}if(e.href)n.href=e.href;Object.assign(n.style,{position:'absolute',left:(e.x-offset)+'px',top:(e.y-topOffset)+'px',width:e.w+'px',height:e.h+'px',transform:`rotate(${e.angle||0}deg)`,fontSize:(e.fontSize||20)+'px',fontWeight:e.fontWeight||400,color:e.color||'#294b68',textAlign:e.align||'left',whiteSpace:'pre-wrap',lineHeight:'1.5',textDecoration:'none',fontFamily:'"PingFang SC",sans-serif'});
if(e.type==='text'){n.textContent=e.text.trim();if(!e.href&&e.headingLevel){n.setAttribute('role','heading');n.setAttribute('aria-level',String(e.headingLevel))}}else if(e.type==='rect'){n.style.background=e.color;n.style.borderRadius=(e.radius||0)+'px'}else{const cfg=mediaConfig.videos?.[e.mediaKey||e.asset.replace(/-cover$/,'')]||{},directVideo=config.assetTypes?.[e.asset]?.startsWith('video/'),video=directVideo||e.mediaKind==='video'||!!cfg.src;const img=document.createElement(video?'video':'img');Object.assign(img.style,{width:'100%',height:'100%',objectFit:e.fit||'contain'});Object.assign(n.style,{overflow:'hidden',borderRadius:(e.radius||0)+'px'});
if(video){const src=directVideo?config.assets[e.asset]:cfg.src;const poster=config.assets[e.posterAsset]||cfg.poster||(!directVideo?config.assets[e.asset]:'')||(src?src+'.poster.jpg':'');img.setAttribute('aria-label',e.name+(src?'视频':'视频，原片待上传'));img.addEventListener('play',()=>main.querySelectorAll('video').forEach(v=>{if(v!==img)v.pause()}));n.append(img);if(src)window.mountPortfolioVideo(img,src,poster,e.name);if(!src){n.classList.add('video-pending');const label=document.createElement('span');label.className='detail-video-state';label.textContent='视频待上传';n.append(label)}}else{img.src=config.assets[e.asset]||'';img.alt=e.name;img.loading='lazy';img.decoding='async';if(e.crop){const c=e.crop;Object.assign(img.style,{position:'absolute',width:(100/c.w)+'%',height:(100/c.h)+'%',left:(-100*c.x/c.w)+'%',top:(-100*c.y/c.h)+'%',objectFit:'fill'})}n.tabIndex=0;n.setAttribute('role','button');n.setAttribute('aria-label','轻微放大图片：'+e.name);n.setAttribute('aria-pressed','false');n.classList.add('detail-image-preview');const toggle=()=>{const active=n.classList.toggle('is-gently-zoomed');n.setAttribute('aria-pressed',String(active))};n.onclick=toggle;n.onblur=()=>{n.classList.remove('is-gently-zoomed');n.setAttribute('aria-pressed','false')};n.onkeydown=ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();toggle()}else if(ev.key==='Escape'){n.classList.remove('is-gently-zoomed');n.setAttribute('aria-pressed','false')}};n.append(img)}}return n}
function mount(p,config){const left=document.createElement('aside'),right=document.createElement('div');left.className='detail-edit-left';right.className='detail-edit-right';const lb=document.createElement('div'),rb=document.createElement('div');lb.className=rb.className='detail-edit-board';lb.style.width='460px';lb.style.height=(p.summaryHeight||850)+'px';lb.dataset.height=p.summaryHeight||850;rb.style.width='980px';rb.style.height=p.height+'px';const groups=new Map();for(const project of p.projects||[]){const group=document.createElement('section');group.className='detail-project';group.setAttribute('aria-label',project.title);Object.assign(group.style,{position:'absolute',left:'0',top:project.y+'px',width:'980px',height:project.height+'px'});group.style.setProperty('--project-paper',project.color);groups.set(project.id,{node:group,y:project.y});rb.append(group)}for(const e of p.elements){if(e.hidden)continue;const summary=e.detailGroup==='summary'||(!e.detailGroup&&e.x<460);const group=groups.get(e.detailProject);if(summary){const layer=node(e,config,0);layer.style.order=String(Math.round(e.y));if(e.type==='text'&&/^_+$/.test(e.text.trim())){layer.dataset.summaryKind='rule';layer.setAttribute('aria-hidden','true')}else if(e.type==='text'&&/^[\d.,%万条+ /]+$/.test(e.text.trim())){layer.dataset.summaryKind='metric'}lb.append(layer)}else{const layer=node(e,config,460,group?.y||0);layer.style.maxWidth=Math.max(0,962-Math.max(0,e.x-460))+'px';(group?.node||rb).append(layer)}}if(p.projects?.length){rb.replaceChildren(...[...rb.children].sort((a,b)=>parseFloat(a.style.top)-parseFloat(b.style.top)))}left.append(lb);right.append(rb);const binding=document.createElement('span');binding.className='archive-binding';binding.setAttribute('aria-hidden','true');for(let i=0;i<5;i++)binding.append(document.createElement('i'));main.replaceChildren(left,right,binding);main.classList.add('editor-detail-layout');main.style.background=p.background;main.dataset.height=p.height;if(key==='huihuo')mountVideoRails(p,config,rb);mountImageRows(rb);document.title=p.name.replace('最新版 · 案例详情 / ','')+'｜吴晨渝作品集';fit()}
function mountImageRows(board){
 for(const parent of [board,...board.querySelectorAll('.detail-project')]){
  const images=[...parent.children].filter(n=>n.dataset.kind==='image');
  const rows=[];
  for(const image of images.sort((a,b)=>parseFloat(a.style.top)-parseFloat(b.style.top))){
   const row=rows.find(row=>Math.abs(parseFloat(row[0].style.top)-parseFloat(image.style.top))<Math.min(parseFloat(row[0].style.height),parseFloat(image.style.height))/3);
   if(row)row.push(image);else rows.push([image]);
  }
  for(const row of rows.filter(row=>row.length>1)){
   const rail=document.createElement('div');
   rail.className='detail-image-row archive-media-row';
   const first=[...parent.children].find(n=>row.includes(n));
   first.before(rail);
   for(const image of row.sort((a,b)=>parseFloat(a.style.left)-parseFloat(b.style.left))){
    image.style.setProperty('--archive-image-width',image.style.width);
    rail.append(image);
   }
  }
 }
}
function mountVideoRails(p,config,rb){
 const panels=p.elements.filter(e=>e.type==='rect'&&e.x>460&&e.w>700&&e.h>450);
 for(const panel of panels){const media=p.elements.filter(e=>e.type==='image'&&e.y>=panel.y&&e.y<panel.y+panel.h).sort((a,b)=>a.x-b.x);if(!media.length)continue;
 const rail=document.createElement('section');rail.className='case-video-rail';rail.setAttribute('aria-label','视频作品，左右滚动查看');rail.tabIndex=0;Object.assign(rail.style,{position:'absolute',left:(panel.x-460)+'px',top:panel.y+'px',width:Math.min(panel.w,962-Math.max(0,panel.x-460))+'px',height:panel.h+'px'});
 for(const e of media){const card=document.createElement('article');card.className='case-rail-card';const item=node({...e,x:0,y:0,w:224,h:398},config,0);Object.assign(item.style,{position:'relative',left:'auto',top:'auto',width:'224px',height:'398px',flex:'none'});card.append(item);
 const caption=p.elements.filter(t=>t.type==='text'&&!t.hidden&&t.x>=e.x-32&&t.x<e.x+e.w&&t.y>=e.y+e.h-8&&t.y<panel.y+panel.h+40);
 for(const t of caption){const label=document.createElement('p');label.textContent=t.text;card.append(label);rb.querySelectorAll('.detail-element').forEach(n=>{if(n.textContent===t.text)n.remove()})}rail.append(card);
 rb.querySelectorAll('.detail-element').forEach(n=>{if(n.querySelector('video')?.getAttribute('aria-label')?.startsWith(e.name))n.remove()})}
 rail.onkeydown=ev=>{if(ev.key==='ArrowRight'||ev.key==='ArrowLeft'){ev.preventDefault();rail.scrollLeft+=ev.key==='ArrowRight'?248:-248}};rb.append(rail)
 }
}
function fit(){
 if(!main.classList.contains('editor-detail-layout'))return;
 const mobile=innerWidth<=760,width=main.clientWidth-26,scale=width/1440;
 const left=main.querySelector('.detail-edit-left'),right=main.querySelector('.detail-edit-right');
 const lb=left.firstChild,rb=right.firstChild;
 lb.style.zoom=String(mobile?1:scale);rb.style.zoom=lb.style.zoom;
 left.style.width=(mobile?width:460*scale)+'px';right.style.width=(mobile?width:980*scale)+'px';
 main.style.setProperty('--archive-spine',(13+460*scale)+'px');
 for(const board of [lb,rb]){
  const zoom=Number(board.style.zoom)||1;
  board.querySelectorAll('[data-type-size]').forEach(n=>n.style.fontSize=(Number(n.dataset.typeSize)/zoom)+'px');
 }
}
const staticPublish=document.documentElement.hasAttribute('data-static-publish');
let polling=false;
async function poll(){if(polling||document.hidden||(staticPublish&&revision!==-1))return;polling=true;try{const [r,m]=await Promise.all([fetch('layout-config.json',{cache:'no-store'}),fetch('media-config.json',{cache:'no-store'})]);if(!r.ok||(staticPublish&&!m.ok))return;const d=await r.json(),nextMedia=m.ok?await m.json():mediaConfig;const sig=JSON.stringify([d.revision,nextMedia]);if(revision===sig||[...main.querySelectorAll('video')].some(v=>!v.paused&&!v.ended))return;const p=d.pages.find(p=>p.role==='detail-'+key);if(!p)return;revision=sig;if(staticPublish)clearInterval(pollTimer);mediaConfig=nextMedia;const y=scrollY;mount(p,d);if(y)scrollTo(0,y)}catch(e){console.warn('Detail layout unavailable',e)}finally{polling=false}}
addEventListener('resize',fit);document.addEventListener('visibilitychange',poll);const pollTimer=setInterval(poll,1500);poll();
})();
