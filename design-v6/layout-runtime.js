(()=>{
let config={pages:[],assets:{}},revision=-1,readerIndex=0;const listeners=new Set(),images=new Map();
function pages(){return [...new Map(config.pages.map(p=>[p.role,p])).values()]}
function image(id){const src=config.assets[id];if(!src)return Promise.resolve(null);if(!images.has(src)){const img=new Image();img.src=src;images.set(src,img.decode().then(()=>img).catch(()=>null))}return images.get(src)}
async function draw(page){const c=document.createElement('canvas');c.width=page.width;c.height=page.height;const x=c.getContext('2d');x.fillStyle=page.background;x.fillRect(0,0,c.width,c.height);for(const e of page.elements){if(e.hidden)continue;x.save();x.translate(e.x+e.w/2,e.y+e.h/2);x.rotate((e.angle||0)*Math.PI/180);x.translate(-e.w/2,-e.h/2);if(e.type==='rect'){x.fillStyle=e.color;x.beginPath();if(e.radius)x.roundRect(0,0,e.w,e.h,Math.min(e.radius,e.w/2,e.h/2));else x.rect(0,0,e.w,e.h);x.fill()}else if(e.type==='text'){x.fillStyle=e.color||'#315d91';x.font=`${e.fontWeight||400} ${e.fontSize||24}px ${e.fontWeight>=900?'"Portfolio Serif",':''}"PingFang SC",sans-serif`;x.textBaseline='top';x.textAlign=e.align||'left';const textX=e.align==='center'?e.w/2:e.align==='right'?e.w:0;const size=e.fontSize||24,limit=e.w;let y=0;for(const para of (e.text||'').split('\n')){let line='';for(const ch of para){if(x.measureText(line+ch).width>limit&&line){x.fillText(line,textX,y);line=ch;y+=size*1.45}else line+=ch}x.fillText(line,textX,y);y+=size*1.45}}else if(e.type==='image'){const img=await image(e.asset);if(img){const scale=e.fit==='cover'?Math.max(e.w/img.width,e.h/img.height):Math.min(e.w/img.width,e.h/img.height);x.beginPath();const radius=Math.max(0,Math.min(e.radius||0,e.w/2,e.h/2));if(radius)x.roundRect(0,0,e.w,e.h,radius);else x.rect(0,0,e.w,e.h);x.clip();if(e.crop){const c=e.crop;x.drawImage(img,c.x*img.width,c.y*img.height,c.w*img.width,c.h*img.height,0,0,e.w,e.h)}else x.drawImage(img,(e.w-img.width*scale)/2,(e.h-img.height*scale)/2,img.width*scale,img.height*scale)}}x.restore()}return c}
const mobileReader=matchMedia('(max-width: 760px)');
function isReaderDecoration(e){
 return /^(archive-paper-v2|archive-clip-v2|archive-company-\d+-pastel-v5)$/.test(e.asset||'');
}
function readerNode(e){
 const node=document.createElement('div');
 node.dataset.readerKind=e.type;
 Object.assign(node.style,{
  position:'absolute',left:e.x+'px',top:e.y+'px',width:e.w+'px',height:e.h+'px',
  transform:`rotate(${e.angle||0}deg)`,color:e.color,fontSize:(e.fontSize||24)+'px',
  fontWeight:e.fontWeight||400,textAlign:e.align||'left',lineHeight:'1.45',whiteSpace:'pre-wrap'
 });
 if(e.type==='rect'){
  node.style.background=e.color;
  node.style.borderRadius=(e.radius||0)+'px';
 }else if(e.type==='text'){
  node.textContent=e.text;
 }else{
  const img=document.createElement('img');
  img.src=config.assets[e.asset]||'';
  img.alt=e.name;
  node.style.aspectRatio=e.w+'/'+e.h;
  Object.assign(node.style,{overflow:'hidden',borderRadius:(e.radius||0)+'px'});
  Object.assign(img.style,{width:'100%',height:'100%',objectFit:e.fit||'contain'});
  if(e.crop){
   const c=e.crop;
   Object.assign(img.style,{
    position:'absolute',width:(100/c.w)+'%',height:(100/c.h)+'%',
    left:(-100*c.x/c.w)+'%',top:(-100*c.y/c.h)+'%',objectFit:'fill'
   });
  }
  node.append(img);
 }
 return node;
}
function readerControls(index,length,onTurn){
 const controls=document.createElement('div');
 controls.className='linked-reader-controls';
 Object.assign(controls.style,{
  position:'absolute',left:'910px',top:'870px',display:'flex',alignItems:'center',gap:'20px',color:'#22221f'
 });
 for(const dir of [-1,0,1]){
  const control=document.createElement(dir?'button':'span');
  control.textContent=dir<0?'←':dir>0?'→':`${index+1} / ${length}`;
  if(dir){
   control.type='button';
   control.setAttribute('aria-label',dir<0?'上一段工作经历':'下一段工作经历');
   control.disabled=index+dir<0||index+dir>=length;
   control.onclick=()=>onTurn(dir);
   Object.assign(control.style,{
    border:'0',background:'transparent',color:'inherit',fontSize:'30px',
    width:'48px',height:'48px',opacity:control.disabled?'.3':'1',cursor:'pointer'
   });
  }
  controls.append(control);
 }
 return controls;
}
// Scale the desktop image layers together while the text stays in the mobile flow.
function readerImageGroup(layers){
 const group=document.createElement('div');
 group.className='reader-image-group';
 const bounds=layers.map(e=>{
  const angle=(e.angle||0)*Math.PI/180;
  const width=e.w*Math.abs(Math.cos(angle))+e.h*Math.abs(Math.sin(angle));
  const height=e.w*Math.abs(Math.sin(angle))+e.h*Math.abs(Math.cos(angle));
  return {left:e.x+(e.w-width)/2,top:e.y+(e.h-height)/2,width,height};
 });
 const left=Math.min(...bounds.map(b=>b.left));
 const top=Math.min(...bounds.map(b=>b.top));
 const width=Math.max(...bounds.map(b=>b.left+b.width))-left;
 const height=Math.max(...bounds.map(b=>b.top+b.height))-top;
 group.style.aspectRatio=width+'/'+height;
 for(const e of layers){
  const node=readerNode(e);
  node.querySelector('img').loading='lazy';
  Object.assign(node.style,{
   left:(e.x-left)/width*100+'%',top:(e.y-top)/height*100+'%',
   width:e.w/width*100+'%',height:e.h/height*100+'%'
  });
  group.append(node);
 }
 return group;
}
function mountCollageReader(root,list){
 const personal=document.createElement('section');
 personal.className='reader-leaf reader-personal';
 const items=page=>page.elements.filter(e=>!e.hidden).sort((a,b)=>a.y-b.y||a.x-b.x);
 const mobileItem=e=>{
  const node=readerNode(e);
  if(e.type==='text'){
   const size=e.fontSize||24;
   node.textContent=e.text.trimEnd();
   node.style.fontSize=(size>=35?Math.min(42,Math.round(size*.62)):size<=16?11:Math.max(15,Math.round(size*.72)))+'px';
   node.style.whiteSpace='pre-line';
  }else{
   node.querySelector('img').loading='lazy';
   node.style.setProperty('--reader-image-width',Math.round(e.w*.72)+'px');
   node.style.setProperty('--reader-image-ratio',String(e.w/e.h));
  }
  return node;
 };
 const readable=e=>e.type!=='rect'&&!isReaderDecoration(e);
 const personalItems=items(list[0]).filter(e=>e.x<740&&readable(e));
 const grouped=new Set();
 for(const e of personalItems){
  if(grouped.has(e))continue;
  const value=personalItems.find(other=>other.type==='text'&&other.x>e.x&&other.y===e.y);
  const label=personalItems.find(other=>other.type==='text'&&other.x===e.x&&other.fontSize<=16&&other.y>e.y&&other.y<=e.y+42);
  if(e.type==='text'&&value&&label){
   const row=document.createElement('div');
   row.className='reader-field';
   const labels=document.createElement('div');
   labels.append(mobileItem(e),mobileItem(label));
   row.append(labels,mobileItem(value));
   personal.append(row);
   grouped.add(value);
   grouped.add(label);
  }else{
   personal.append(mobileItem(e));
  }
 }
 const mobile=mobileReader.matches;
 const showcase=document.createElement('section');
 showcase.className='reader-showcase';
 const stack=document.createElement('div');
 stack.className='reader-showcase-stack';
 const experiences=list.map((_,index)=>{
  const page=list[index];
  const section=document.createElement('section');
  section.className='reader-leaf reader-experience';
  section.dataset.projectIndex=String(index);
  const poster=document.createElement('div');
  poster.className='reader-poster';
  const experienceItems=items(page).filter(e=>e.x>=740&&readable(e));
  const imageLayers=experienceItems.filter(e=>e.type==='image');
  const copy=experienceItems.filter(e=>e.type==='text');
  const [title,role,...notes]=copy;
  if(title)poster.append(mobileItem(title));
  if(role)poster.append(mobileItem(role));
  if(imageLayers.length)poster.append(readerImageGroup(imageLayers));
  section.append(poster);
  const note=document.createElement('div');
  note.className='reader-ticket';
  for(const item of notes){
   const node=mobileItem(item);
   if(/^20\s*\d{2}$/.test(item.text.trim()))node.classList.add('reader-year');
   note.append(node);
  }
  const caseRole=['case-0','case-3','case-1'][index];
  const caseLink=pages().find(p=>p.role===caseRole)?.elements.find(e=>!e.hidden&&e.caseField==='link'&&e.href);
  if(caseLink)note.append(mobileCaseText(caseLink));
  section.append(note);
  return section;
 });
 stack.append(...experiences);
 let transition;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const controls=readerControls(readerIndex,list.length,turn);
 const [previous,count,next]=controls.children;
 count.setAttribute('aria-live','polite');
 function update(){
  experiences.forEach((card,index)=>{
   card.inert=index!==readerIndex;
   card.setAttribute('aria-hidden',String(index!==readerIndex));
  });
  previous.disabled=readerIndex===0;
  next.disabled=readerIndex===list.length-1;
  previous.style.opacity=previous.disabled?'.3':'1';
  next.style.opacity=next.disabled?'.3':'1';
  count.textContent=`${readerIndex+1} / ${list.length}`;
 }
 function turn(direction){
  if(transition)return;
  const destination=readerIndex+direction;
  if(destination<0||destination>=list.length)return;
  const outgoing=experiences[readerIndex],incoming=experiences[destination];
  const focused=document.activeElement;
  const scrollTop=root.scrollTop;
  readerIndex=destination;
  update();
  if(focused.disabled)(direction>0?previous:next).focus({preventScroll:true});
  if(!window.gsap||reduced.matches)return;
  outgoing.classList.add('reader-exiting');
  transition=gsap.timeline({onComplete:()=>{
   outgoing.classList.remove('reader-exiting');
   gsap.set([outgoing,incoming],{clearProps:'transform,opacity,zIndex'});
   transition=null;
   if(mobile&&Math.abs(root.scrollTop-scrollTop)<=12)root.scrollTo({top:scrollTop,behavior:'instant'});
  }});
  transition.set(outgoing,{zIndex:2})
   .fromTo(incoming,{x:-10*direction,y:6,opacity:.78},
     {x:0,y:0,opacity:1,duration:.34,ease:'power2.out'},0)
   .to(outgoing,{x:25*direction,y:-8,rotation:1.4*direction,opacity:0,
     duration:.29,ease:'power2.inOut'},0);
 }
 update();
 showcase.append(stack,controls);
 if(mobile){
  root.classList.remove('reader-collage-desktop');
  root.replaceChildren(personal,showcase);
 }else{
  root.classList.add('reader-collage-desktop');
  const spread=document.createElement('div');
  spread.className='reader-collage-spread';
  spread.dataset.width='1080';
  spread.append(personal,showcase);
  root.replaceChildren(spread);
 }
 window.fitProfileFile?.();
}
function mountReader(){
 const list=pages().filter(p=>p.role.startsWith('reader-'));
 const root=document.querySelector('#profileContent');
 if(!list.length||!root)return;
 readerIndex=Math.min(readerIndex,list.length-1);
 mountCollageReader(root,list);
}
mobileReader.addEventListener('change',()=>mountReader());
function artworkNode(e){const n=document.createElement(e.href?'a':'div');if(e.href){n.href=e.href;n.setAttribute('aria-label',e.text||e.name)}Object.assign(n.style,{position:'absolute',left:e.x+'px',top:e.y+'px',width:e.w+'px',height:e.h+'px',transform:`rotate(${e.angle||0}deg)`,color:e.color||'#315d91',fontSize:(e.fontSize||24)+'px',fontWeight:e.fontWeight||400,textAlign:e.align||'left',lineHeight:'1.45',whiteSpace:'pre-wrap',textDecoration:'none',fontFamily:'"PingFang SC",sans-serif'});if(e.type==='text'){n.dataset.typeSize=String(e.fontSize||16);if(e.caseField)n.dataset.caseField=e.caseField}if(e.type==='rect'){n.style.background=e.color;n.style.borderRadius=(e.radius||0)+'px'}else if(e.type==='text'){n.textContent=e.text}else{const img=document.createElement('img');img.loading='eager';img.src=config.assets[e.asset]||'';img.alt=e.name;Object.assign(img.style,{width:'100%',height:'100%',objectFit:e.fit||'contain'});Object.assign(n.style,{overflow:'hidden',borderRadius:(e.radius||0)+'px'});if(e.crop){const c=e.crop;Object.assign(img.style,{position:'absolute',width:(100/c.w)+'%',height:(100/c.h)+'%',left:(-100*c.x/c.w)+'%',top:(-100*c.y/c.h)+'%',objectFit:'fill'})}n.append(img)}return n}
function fitCases(){
 for(const board of document.querySelectorAll('.linked-case-board')){
  const card=board.parentElement;
  const scale=Math.min(card.clientWidth/Number(board.dataset.width),card.clientHeight/Number(board.dataset.height));
  if(!Number.isFinite(scale)||scale<=0)continue;
  board.style.transform=`translate(-50%,-50%) scale(${scale})`;
  for(const text of board.querySelectorAll('[data-type-size]')){
   text.style.fontSize=Number(text.dataset.typeSize)*Math.min(1.4,1/scale)+'px';
  }
 }
}
document.addEventListener('portfolio:case-shown',fitCases);
function mobileCaseText(e){
 const tag=e.href?'a':e.caseField==='title'?'h3':'p';
 const node=document.createElement(tag);
 node.dataset.caseField=e.caseField||'';
 node.textContent=e.text.trim();
 if(e.href)node.href=e.href;
 return node;
}
function appendCasePictures(root,pictures){
 const rows=[];
 for(const e of [...pictures].sort((a,b)=>a.y-b.y)){
  const row=rows.find(row=>Math.abs(row[0].y-e.y)<Math.min(row[0].h,e.h)/3);
  if(row)row.push(e);else rows.push([e]);
 }
 for(const row of rows){
  const rail=document.createElement('div');
  rail.className='archive-media-row';
  if(row.length>1){
   rail.tabIndex=0;
   rail.setAttribute('role','region');
   rail.setAttribute('aria-label','案例图片，可横向滚动');
  }
  for(const e of row.sort((a,b)=>a.x-b.x)){
   const item=artworkNode({...e,crop:null,fit:'contain'});
   item.style.setProperty('--archive-frame-ratio',String(e.w/e.h));
   item.style.setProperty('--archive-image-width',e.w+'px');
   Object.assign(item.style,{position:'relative',left:'auto',top:'auto',height:'auto',transform:'none',aspectRatio:e.w+'/'+e.h});
   rail.append(item);
  }
  root.append(rail);
 }
}
function mountMobileCase(card,elements){
 card.querySelector('.mobile-case-content')?.remove();
 const flow=document.createElement('div');
 flow.className='mobile-case-content';
 const copy=elements.filter(e=>e.type==='text'&&e.text?.trim()&&!e.hidden);
 const pictures=elements.filter(e=>e.type==='image'&&!e.hidden);
 const links=copy.filter(e=>e.href);
 const text=copy.filter(e=>!e.href);
 const projects=text.filter(e=>e.caseField==='period'&&/^PROJECT\s/i.test(e.text.trim())).sort((a,b)=>a.x-b.x);
 const appendCopy=(root,list)=>root.append(...[...list].sort((a,b)=>a.y-b.y||a.x-b.x).map(mobileCaseText));
 if(projects.length>1){
  const projectTop=Math.min(...projects.map(e=>e.y));
  appendCopy(flow,text.filter(e=>e.y<projectTop-8));
  for(const [i,project] of projects.entries()){
   const withinColumn=e=>(i===0||e.x>=project.x-16)&&(!projects[i+1]||e.x<projects[i+1].x-16);
   const section=document.createElement('section');
   section.className='mobile-case-project';
   section.setAttribute('aria-label',project.text.trim());
   appendCopy(section,text.filter(e=>e.y>=projectTop-8&&withinColumn(e)));
   appendCasePictures(section,pictures.filter(withinColumn));
   flow.append(section);
  }
 }else{
  const pictureBottom=Math.max(...pictures.map(e=>e.y+e.h));
  const isCaption=e=>e.x>=300&&pictures.length&&e.y>=pictureBottom-50;
  const metrics=text.filter(e=>['stat','label'].includes(e.caseField));
  appendCopy(flow,text.filter(e=>!metrics.includes(e)&&!isCaption(e)));
  const evidence=document.createElement('div');
  evidence.className='case-flow-evidence';
  const stats=document.createElement('div');
  stats.className='case-flow-stats';
  appendCopy(stats,metrics);
  const gallery=document.createElement('div');
  gallery.className='case-flow-gallery';
  appendCasePictures(gallery,pictures);
  const captions=document.createElement('div');
  captions.className='case-flow-captions';
  captions.append(...text.filter(isCaption).sort((a,b)=>a.x-b.x).map(mobileCaseText));
  if(captions.childElementCount)gallery.append(captions);
  evidence.append(stats,gallery);
  flow.append(evidence);
 }
 appendCopy(flow,links);
 card.append(flow);
}
function mountCases(){
 for(const page of pages().filter(p=>p.role.startsWith('case-'))){
  const index=Number(page.role.slice(5));
  const card=document.querySelector('#case-panel-'+index);
  if(!card)continue;
  const elements=page.elements.filter(element=>
   !element.hidden && !(element.type==='text' && /^0[12]\s*\//.test(element.text?.trim()))
  );
  card.querySelector('.linked-case-board')?.remove();
  card.classList.add('has-linked-case');
  card.style.setProperty('--card',page.background);
  const board=document.createElement('div');
  board.className='linked-case-board';
  board.dataset.width=page.width;
  board.dataset.height=page.height;
  Object.assign(board.style,{position:'absolute',left:'50%',top:'50%',width:page.width+'px',height:page.height+'px',transformOrigin:'center',background:page.background});
  for(const element of elements)board.append(artworkNode(element));
  card.append(board);
  mountMobileCase(card,elements);
  const button=document.querySelector('#case-tab-'+index);
  if(button){
   button.style.setProperty('--tab',page.background);
   const heading=elements.find(element=>element.caseField==='title');
   if(heading)button.textContent=heading.text.trim();
  }
 }
 fitCases();
}
addEventListener('resize',fitCases);const deck=document.querySelector('#caseDeck');if(deck)new ResizeObserver(fitCases).observe(deck);

function mountContact(){const p=pages().find(p=>p.role==='contact'),root=document.querySelector('#contact');if(!p||!root)return;root.replaceChildren();root.style.background=p.background;const board=document.createElement('div');board.className='contact-flow';for(const e of p.elements){if(e.hidden||e.type!=='text')continue;const n=document.createElement(e.contactAction==='email'?'a':e.contactAction==='wechat'?'button':'p');n.textContent=e.text;
 if(n.tagName==='P'&&e.text.trimEnd().includes('\n')){
  const lines=e.text.split('\n');
  n.replaceChildren();
  for(const [index,line] of lines.entries()){
   if(index)n.append('\n');
   if(!line)continue;
   const span=document.createElement('span');
   span.className='contact-line';
   span.textContent=line;
   if(index===0&&line==='谢谢你，'){
    const comma=document.createElement('span');
    comma.className='contact-title-comma';
    comma.textContent='，';
    span.replaceChildren('谢谢你',comma);
    n.classList.add('contact-title');
   }
   n.append(span);
  }
 }
 n.style.cssText=`font-size:${e.fontSize}px;font-weight:${e.fontWeight||400};line-height:${e.fontSize===36?1.2:1.6};margin:0;color:${e.color}`;if(e.contactAction==='email')n.href='mailto:wuchenyu0726@sina.com';if(e.contactAction==='wechat')n.onclick=()=>document.querySelector('#wechatModal')?.showModal();board.append(n)}root.append(board)}
let polling=false;
const staticPublish=document.documentElement.hasAttribute('data-static-publish');
async function poll(){if(polling||(document.hidden&&revision!==-1)||(staticPublish&&revision!==-1))return;polling=true;try{const res=await fetch('layout-config.json',{cache:'no-store'});if(!res.ok)return;const next=await res.json();if(next.revision===revision)return;revision=next.revision;if(staticPublish)clearInterval(pollTimer);config=next;mountReader();mountCases();mountContact();for(const fn of listeners)fn(pages(),draw,config)}catch{}finally{polling=false}}
window.WCYLayout={subscribe(fn){listeners.add(fn);if(config.pages.length)fn(pages(),draw,config)},draw};
addEventListener('focus',poll);document.addEventListener('visibilitychange',poll);const pollTimer=setInterval(poll,1500);poll();
})();
