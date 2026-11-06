(()=>{
let config={pages:[],assets:{}},revision=-1,readerIndex=0;const listeners=new Set(),images=new Map();
function pages(){return [...new Map(config.pages.map(p=>[p.role,p])).values()]}
function image(id){const src=config.assets[id];if(!src)return Promise.resolve(null);if(!images.has(src)){const img=new Image();img.src=src;images.set(src,img.decode().then(()=>img).catch(()=>null))}return images.get(src)}
async function draw(page){const c=document.createElement('canvas');c.width=page.width;c.height=page.height;const x=c.getContext('2d');x.fillStyle=page.background;x.fillRect(0,0,c.width,c.height);for(const e of page.elements){if(e.hidden)continue;x.save();x.translate(e.x+e.w/2,e.y+e.h/2);x.rotate((e.angle||0)*Math.PI/180);x.translate(-e.w/2,-e.h/2);if(e.type==='rect'){x.fillStyle=e.color;x.beginPath();if(e.radius)x.roundRect(0,0,e.w,e.h,Math.min(e.radius,e.w/2,e.h/2));else x.rect(0,0,e.w,e.h);x.fill()}else if(e.type==='text'){x.fillStyle=e.color||'#315d91';x.font=`${e.fontWeight||400} ${e.fontSize||24}px ${e.fontWeight>=900?'"Portfolio Serif",':''}"PingFang SC",sans-serif`;x.textBaseline='top';x.textAlign=e.align||'left';const textX=e.align==='center'?e.w/2:e.align==='right'?e.w:0;const size=e.fontSize||24,limit=e.w;let y=0;for(const para of (e.text||'').split('\n')){let line='';for(const ch of para){if(x.measureText(line+ch).width>limit&&line){x.fillText(line,textX,y);line=ch;y+=size*1.45}else line+=ch}x.fillText(line,textX,y);y+=size*1.45}}else if(e.type==='image'){const img=await image(e.asset);if(img){const scale=e.fit==='cover'?Math.max(e.w/img.width,e.h/img.height):Math.min(e.w/img.width,e.h/img.height);x.beginPath();const radius=Math.max(0,Math.min(e.radius||0,e.w/2,e.h/2));if(radius)x.roundRect(0,0,e.w,e.h,radius);else x.rect(0,0,e.w,e.h);x.clip();if(e.crop){const c=e.crop;x.drawImage(img,c.x*img.width,c.y*img.height,c.w*img.width,c.h*img.height,0,0,e.w,e.h)}else x.drawImage(img,(e.w-img.width*scale)/2,(e.h-img.height*scale)/2,img.width*scale,img.height*scale)}}x.restore()}return c}
function mountReader(direction=0){const list=pages().filter(p=>p.role.startsWith('reader-'));if(!list.length)return;readerIndex=Math.min(readerIndex,list.length-1);const p=list[readerIndex],root=document.querySelector('#profileContent');if(!root)return;const previous=direction&&!matchMedia('(max-width: 650px)').matches?root.firstElementChild?.cloneNode(true):null;const board=document.createElement('div');board.className='linked-layout';board.dataset.width=p.width;Object.assign(board.style,{width:p.width+'px',height:p.height+'px',position:'relative',background:p.background});for(const e of p.elements){if(e.hidden)continue;const node=document.createElement('div');Object.assign(node.style,{position:'absolute',left:e.x+'px',top:e.y+'px',width:e.w+'px',height:e.h+'px',transform:`rotate(${e.angle||0}deg)`,color:e.color,fontSize:(e.fontSize||24)+'px',fontWeight:e.fontWeight||400,textAlign:e.align||'left',lineHeight:'1.45',whiteSpace:'pre-wrap'});node.dataset.readerKind=e.type;node.style.order=String((e.x>=740?2000:0)+Math.round(e.y));if(e.type==='image'){node.style.aspectRatio=e.w+'/'+e.h;if(/^(archive-paper-v2|archive-clip-v2|archive-company-\d+-pastel-v5)$/.test(e.asset))node.dataset.readerDecoration='true'}if(e.type==='rect'){node.style.background=e.color;node.style.borderRadius=(e.radius||0)+'px'}else if(e.type==='text')node.textContent=e.text;else{const img=document.createElement('img');img.src=config.assets[e.asset]||'';img.alt=e.name;Object.assign(img.style,{width:'100%',height:'100%',objectFit:e.fit||'contain'});Object.assign(node.style,{overflow:'hidden',borderRadius:(e.radius||0)+'px'});if(e.crop){const c=e.crop;Object.assign(img.style,{position:'absolute',width:(100/c.w)+'%',height:(100/c.h)+'%',left:(-100*c.x/c.w)+'%',top:(-100*c.y/c.h)+'%',objectFit:'fill'})}node.append(img)}board.append(node)}const controls=document.createElement('div');controls.className='linked-reader-controls';Object.assign(controls.style,{position:'absolute',left:'910px',top:'870px',display:'flex',alignItems:'center',gap:'20px',color:'#22221f'});for(const dir of [-1,0,1]){const n=document.createElement(dir?'button':'span');n.textContent=dir<0?'←':dir>0?'→':`${readerIndex+1} / ${list.length}`;if(dir){n.type='button';n.setAttribute('aria-label',dir<0?'上一段工作经历':'下一段工作经历');n.disabled=readerIndex+dir<0||readerIndex+dir>=list.length;n.onclick=()=>{readerIndex+=dir;mountReader(dir)};Object.assign(n.style,{border:'0',background:'transparent',color:'inherit',fontSize:'30px',width:'48px',height:'48px',opacity:n.disabled?'.3':'1',cursor:'pointer'})}controls.append(n)}board.append(controls);root.replaceChildren(board);if(previous&&window.gsap&&!matchMedia('(prefers-reduced-motion: reduce)').matches){previous.inert=true;Object.assign(previous.style,{position:'absolute',left:'0',top:'0',pointerEvents:'none',clipPath:'inset(100px 80px 180px 705px)',transformOrigin:'730px 120px'});root.style.position='relative';root.append(previous);gsap.to(previous,{rotationY:-70*direction,rotation:-5*direction,x:-65*direction,opacity:0,duration:.48,ease:'power2.inOut',onComplete:()=>previous.remove()})}window.fitProfileFile?.()}
function artworkNode(e){const n=document.createElement(e.href?'a':'div');if(e.href){n.href=e.href;n.setAttribute('aria-label',e.text||e.name)}Object.assign(n.style,{position:'absolute',left:e.x+'px',top:e.y+'px',width:e.w+'px',height:e.h+'px',transform:`rotate(${e.angle||0}deg)`,color:e.color||'#315d91',fontSize:(e.fontSize||24)+'px',fontWeight:e.fontWeight||400,textAlign:e.align||'left',lineHeight:'1.45',whiteSpace:'pre-wrap',textDecoration:'none',fontFamily:'"PingFang SC",sans-serif'});if(e.type==='text'){n.dataset.typeSize=String(e.fontSize||16);if(e.caseField)n.dataset.caseField=e.caseField}if(e.type==='rect'){n.style.background=e.color;n.style.borderRadius=(e.radius||0)+'px'}else if(e.type==='text'){n.textContent=e.text}else{const img=document.createElement('img');img.loading='lazy';img.src=config.assets[e.asset]||'';img.alt=e.name;Object.assign(img.style,{width:'100%',height:'100%',objectFit:e.fit||'contain'});Object.assign(n.style,{overflow:'hidden',borderRadius:(e.radius||0)+'px'});if(e.crop){const c=e.crop;Object.assign(img.style,{position:'absolute',width:(100/c.w)+'%',height:(100/c.h)+'%',left:(-100*c.x/c.w)+'%',top:(-100*c.y/c.h)+'%',objectFit:'fill'})}n.append(img)}return n}
function fitCases(){document.querySelectorAll('.linked-case-board').forEach(board=>{const card=board.parentElement,w=+board.dataset.width,h=+board.dataset.height;const s=Math.min(card.clientWidth/w,card.clientHeight/h);board.style.transform=`translate(-50%,-50%) scale(${s})`;board.querySelectorAll('[data-type-size]').forEach(n=>n.style.fontSize=(Number(n.dataset.typeSize)/s)+'px')})}
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
   const item=artworkNode(e);
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
  appendCopy(flow,text.filter(e=>!isCaption(e)));
  appendCasePictures(flow,pictures);
  appendCopy(flow,text.filter(isCaption));
 }
 appendCopy(flow,links);
 card.append(flow);
}
function mountCases(){for(const p of pages().filter(p=>p.role.startsWith('case-'))){const i=Number(p.role.slice(5)),card=document.querySelector('#case-panel-'+i);if(!card)continue;card.querySelector('.linked-case-board')?.remove();card.classList.add('has-linked-case');card.style.setProperty('--card',p.background);const board=document.createElement('div');board.className='linked-case-board';board.dataset.width=p.width;board.dataset.height=p.height;Object.assign(board.style,{position:'absolute',left:'50%',top:'50%',width:p.width+'px',height:p.height+'px',transformOrigin:'center',background:p.background});for(const e of p.elements)if(!e.hidden)board.append(artworkNode(e));card.append(board);mountMobileCase(card,p.elements);const b=document.querySelector('#case-tab-'+i);if(b){b.style.setProperty('--tab',p.background);const heading=p.elements.find(e=>e.caseField==='title');if(heading)b.textContent=heading.text.trim()}}fitCases()}
addEventListener('resize',fitCases);const deck=document.querySelector('#caseDeck');if(deck)new ResizeObserver(fitCases).observe(deck);

function mountContact(){const p=pages().find(p=>p.role==='contact'),root=document.querySelector('#contact');if(!p||!root)return;root.replaceChildren();root.style.background=p.background;const board=document.createElement('div');board.className='contact-flow';for(const e of p.elements){if(e.hidden||e.type!=='text')continue;const n=document.createElement(e.contactAction==='email'?'a':e.contactAction==='wechat'?'button':'p');n.textContent=e.text;n.style.cssText=`font-size:${e.fontSize}px;font-weight:${e.fontWeight||400};line-height:${e.fontSize===36?1.2:1.6};margin:0;color:${e.color}`;if(e.contactAction==='email')n.href='mailto:wuchenyu0726@sina.com';if(e.contactAction==='wechat')n.onclick=()=>document.querySelector('#wechatModal')?.showModal();board.append(n)}root.append(board)}
let polling=false;
async function poll(){if(polling||(document.hidden&&revision!==-1))return;polling=true;try{const res=await fetch('layout-config.json',{cache:'no-store'});if(!res.ok)return;const next=await res.json();if(next.revision===revision)return;revision=next.revision;config=next;mountReader();mountCases();mountContact();for(const fn of listeners)fn(pages(),draw,config)}catch{}finally{polling=false}}
window.WCYLayout={subscribe(fn){listeners.add(fn);if(config.pages.length)fn(pages(),draw,config)},draw};
addEventListener('focus',poll);document.addEventListener('visibilitychange',poll);poll();setInterval(poll,1500);
})();
