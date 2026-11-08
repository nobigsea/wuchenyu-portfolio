import * as THREE from './vendor/three.module.js';
import {makeFolderArt} from './folder-art.js';

const host=document.querySelector('#folder3d'),stage=document.querySelector('.folder-stage');
const pull=document.querySelector('#pullFolder'),reset=document.querySelector('#resetFolder');
const dialog=document.querySelector('#profileDialog'),readBack=document.querySelector('#returnPaper'),inspect=document.querySelector('#inspectPaper');
const gsap=window.gsap;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const palette={ink:'#315d91',paper:'#fdfcf8',gold:'#e8d697',pink:'#edc4b6',mint:'#d5e5dc'};
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t)};
const lerp=(a,b,t)=>a+(b-a)*t;
let renderer;
try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'})}catch{window.enableProfileFallback()}
if(renderer) start().catch(error=>{console.warn('三维档案袋暂不可用，已保留可阅读的档案内页。',error);window.enableProfileFallback()});

async function start(){

 const fonts=Promise.allSettled([document.fonts.load('900 48px "Portfolio Serif"'),document.fonts.load('32px "Portfolio Hand"')]);
 let fontDeadline;
 await Promise.race([fonts,new Promise(resolve=>{fontDeadline=setTimeout(resolve,1200)})]);
 clearTimeout(fontDeadline);
 const canvas=renderer.domElement;canvas.tabIndex=0;canvas.setAttribute('role','img');canvas.setAttribute('aria-label','三维档案袋。拖动或使用方向键旋转，回车抽出自我介绍，Home回到正面。');host.append(canvas);
 document.addEventListener('pointerdown',()=>canvas.setAttribute('data-pointer-focus',''),true);
 document.addEventListener('keydown',()=>canvas.removeAttribute('data-pointer-focus'),true);
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.92;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.VSMShadowMap;
 const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-5,5,3,-3,.1,60);camera.position.set(0,.4,14);camera.lookAt(0,0,0);
 scene.add(new THREE.HemisphereLight(0xffffff,0xc9c4b2,1.65));const light=new THREE.DirectionalLight(0xffffff,2.4);light.position.set(-3,10,6);light.castShadow=true;light.shadow.mapSize.set(1024,1024);light.shadow.camera.left=-7;light.shadow.camera.right=7;light.shadow.camera.top=8;light.shadow.camera.bottom=-7;light.shadow.bias=-.0006;light.shadow.normalBias=.02;light.shadow.radius=5;light.shadow.blurSamples=10;scene.add(light);const fill=new THREE.DirectionalLight(0xdde8ff,.85);fill.position.set(5,1,-7);scene.add(fill);
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(40,40),new THREE.ShadowMaterial({opacity:.065}));floor.rotation.x=-Math.PI/2;floor.position.y=-2.65;floor.receiveShadow=true;scene.add(floor);floor.visible=false;const shadowCanvas=document.createElement('canvas');shadowCanvas.width=512;shadowCanvas.height=96;const shadowCtx=shadowCanvas.getContext('2d');shadowCtx.filter='blur(14px)';shadowCtx.fillStyle='rgba(50,39,20,.13)';shadowCtx.beginPath();shadowCtx.ellipse(256,48,175,12,0,0,Math.PI*2);shadowCtx.fill();const softShadow=new THREE.Mesh(new THREE.PlaneGeometry(4.4,.7),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false,toneMapped:false}));softShadow.position.set(0,-2.52,-.3);scene.add(softShadow);
 const model=new THREE.Group(),sleeve=new THREE.Group(),paper=new THREE.Group(),rightPivot=new THREE.Group();model.add(sleeve,paper);scene.add(model);
 const seed=(n=913)=>()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296};
 function paperCanvas(w,h,color){const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d');ctx.fillStyle=color;ctx.fillRect(0,0,w,h);const random=seed();for(let i=0;i<w*h/19;i++){ctx.fillStyle=random()>.5?'rgba(70,53,27,.055)':'rgba(255,255,255,.15)';const x=random()*w,y=random()*h;ctx.fillRect(x,y,random()*2+.3,.8)}return[c,ctx]}
 function texture(c){const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),8);return t}
 function material(color,map){return new THREE.MeshStandardMaterial({color,map:map||null,roughness:.95,metalness:0})}
 const art=makeFolderArt(),stock=material('#ffffff',texture(art.grain)),edge=material('#ac8b61');
 function rounded(w,h,r=.035){const shape=new THREE.Shape(),x=-w/2,y=-h/2;shape.moveTo(x+r,y);shape.lineTo(x+w-r,y);shape.quadraticCurveTo(x+w,y,x+w,y+r);shape.lineTo(x+w,y+h-r);shape.quadraticCurveTo(x+w,y+h,x+w-r,y+h);shape.lineTo(x+r,y+h);shape.quadraticCurveTo(x,y+h,x,y+h-r);shape.lineTo(x,y+r);shape.quadraticCurveTo(x,y,x+r,y);return shape}
 function slab(w,h,depth,mat,parent,x=0,y=0,z=0){const mesh=new THREE.Mesh(new THREE.ExtrudeGeometry(rounded(w,h),{depth,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.008,bevelThickness:.005,curveSegments:8}),mat);mesh.position.set(x,y,z-depth/2);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh}
 function plane(w,h,map,parent,x,y,z,back=false){const mat=new THREE.MeshBasicMaterial({map,toneMapped:false});const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),mat);mesh.position.set(x,y,z);if(back)mesh.rotation.y=Math.PI;parent.add(mesh);return mesh}
 // Thin volumetric pocket; the rear opening is lower so the paper can be pulled out.
 slab(3.25,4.65,.035,stock.clone(),sleeve,0,0,.055);
 slab(3.25,4.48,.035,stock.clone(),sleeve,0,-.085,-.075);
 const frontPrint=plane(3.23,4.63,texture(art.front),sleeve,0,0,.08);
 const backPrint=plane(3.23,4.46,texture(art.back),sleeve,0,-.085,-.10,true);
 for(const sign of [-1,1]){const gusset=new THREE.Mesh(new THREE.BoxGeometry(.026,4.44,.125),edge);gusset.position.set(sign*1.61,-.1,0);sleeve.add(gusset)}
 const seam=new THREE.Mesh(new THREE.BoxGeometry(3.22,.028,.13),edge);seam.position.y=-2.31;sleeve.add(seam);
 const flapPivot=new THREE.Group();flapPivot.position.set(0,2.16,.04);sleeve.add(flapPivot);slab(3.21,.32,.017,stock.clone(),flapPivot,0,.13,0);plane(3.18,.29,texture(art.flap),flapPivot,0,.13,-.014,true);
 // Reference uses a single cream eyelet on the rear face.
 const eyelet=new THREE.Mesh(new THREE.CylinderGeometry(.14,.14,.024,40),new THREE.MeshStandardMaterial({color:'#f0ece0',roughness:.8}));eyelet.rotation.x=Math.PI/2;eyelet.position.set(0,1,-.127);sleeve.add(eyelet);
 const hole=new THREE.Mesh(new THREE.CylinderGeometry(.054,.054,.028,32),material('#454438'));hole.rotation.x=Math.PI/2;hole.position.set(0,1,-.144);sleeve.add(hole);
 const tag=new THREE.Group();tag.position.set(1.77,.98,0);sleeve.add(tag);slab(.38,1.02,.018,material('#bd2535'),tag);plane(.37,1,texture(art.tag),tag,0,0,.017);plane(.37,1,texture(art.tag),tag,0,0,-.017,true);
 // One full landscape spread is stored sideways inside the portrait pocket.
 // It rotates together with the folder, rather than opening along a false centre hinge.
 const paperStock=material('#f1f1ef');
 slab(3,4.46,.025,paperStock,paper);
 const preview=document.createElement('div');
 preview.className='profile-dialog folder-paper-preview';
 preview.setAttribute('aria-hidden','true');
 preview.inert=true;
 preview.hidden=true;
 const previewContent=document.createElement('div');
 previewContent.id='profilePaperSurface';
 preview.append(previewContent);
 host.append(preview);
 let previewDirty=true;
 const readerContent=document.querySelector('#profileContent');
 new MutationObserver(()=>{previewDirty=true;requestRender()}).observe(readerContent,{
  subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['aria-hidden','class']
 });
 const paperCorner=new THREE.Vector3();
 function point(object,x,y,z=0){
  return paperCorner.set(x,y,z).applyMatrix4(object.matrixWorld).project(camera).clone();
 }
 function paintPaper(){
  if(progress<.17||dialog.open||!readerContent.firstElementChild){
   preview.hidden=true;
   return;
  }
  if(previewDirty){
   previewContent.replaceChildren(...[...readerContent.children].map(node=>node.cloneNode(true)));
   previewDirty=false;
  }
  preview.hidden=false;
  const w=previewContent.offsetWidth,h=previewContent.offsetHeight;
  if(!w||!h)return;
  model.updateWorldMatrix(true,true);
  const face=model.rotation.y>Math.PI/2?-1:1;
  const scale=Math.min(4.46/w,3/h);
  const halfWidth=w*scale/2,halfHeight=h*scale/2;
  const top=innerWidth<=760?lerp(2.23,halfWidth,smooth(.70,1,progress)):halfWidth;
  const p0=point(paper,face*halfHeight,top,face*.037);
  const p1=point(paper,face*halfHeight,top-2*halfWidth,face*.037);
  const p2=point(paper,-face*halfHeight,top,face*.037);
  const size=canvas.getBoundingClientRect();
  const xy=p=>[(p.x+1)*size.width/2,(1-p.y)*size.height/2];
  const [x,y]=xy(p0),[rx,ry]=xy(p1),[bx,by]=xy(p2);
  previewContent.style.transform=`matrix(${(rx-x)/w},${(ry-y)/w},${(bx-x)/h},${(by-y)/h},${x},${y})`;
  if(progress<.70){
   const [lx,ly]=xy(point(sleeve,-1.63,2.16,0));
   const [hx,hy]=xy(point(sleeve,1.63,2.16,0));
   const slope=(hy-ly)/(hx-lx||1);
   preview.style.clipPath=`polygon(0 0,100% 0,100% ${ly+(size.width-lx)*slope}px,0 ${ly-lx*slope}px)`;
  }else preview.style.clipPath='none';
 }
 queueMicrotask(()=>window.WCYLayout?.subscribe(async(pages,draw)=>{
  for(const [role,mesh] of [['folder-front',frontPrint],['folder-back',backPrint]]){
   const page=pages.find(p=>p.role===role);
   if(!page)continue;
   const map=texture(await draw(page));
   mesh.material.map?.dispose();
   mesh.material.map=map;
   mesh.material.needsUpdate=true;
  }
  requestRender();
 }));
 const mats=[];sleeve.traverse(o=>{if(o.material&&!mats.includes(o.material))mats.push(o.material)});
 window.ensureProfileContent();
 let progress=0,target=0,animating=false,showReader=false,yaw=.45,pitch=.16,roll=-.035,fromYaw=yaw,fromPitch=pitch,fromRoll=roll,startTime=0,startProgress=0,drag=null,visible=true,frame=0,hoverScale=1,hoverTarget=1,lastFrameTime=0;
 const motion={progress:0,hover:1,paperHover:1};let folderTimeline,readerTween;let paperHoverTarget=1;
 const paperHoverTo=gsap?.quickTo(motion,'paperHover',{duration:.26,ease:'power2.out',onUpdate:requestRender});
 function setPaperHover(value){if(paperHoverTarget===value)return;paperHoverTarget=value;if(gsap)paperHoverTo(value);else{motion.paperHover=value;requestRender()}}
 const hoverTo=gsap?.quickTo(motion,'hover',{duration:.28,ease:'power2.out',onUpdate:()=>{hoverScale=motion.hover;requestRender()}});
 function setHover(value){if(hoverTarget===value)return;hoverTarget=value;if(gsap)hoverTo(value)}
 function restoreClosed(){setPaperHover(1);motion.paperHover=1;progress=target=motion.progress=0;animating=false;yaw=.45;pitch=.16;roll=-.035;hoverScale=motion.hover=1;pull.disabled=false;reset.disabled=false;pull.textContent='打开档案袋 ↗';pull.setAttribute('aria-expanded','false');document.querySelector('#folderHint').textContent='拖动旋转 360° · 点击打开档案袋';pose();renderer.render(scene,camera);requestRender()}
 function finishFolder(){if(!animating)return;progress=motion.progress=target;animating=false;pull.disabled=false;reset.disabled=false;if(target<1){yaw=Math.PI;pitch=0;roll=0;pull.textContent='抽出并展开内页 ↗';pull.setAttribute('aria-expanded','true');document.querySelector('#folderHint').textContent='点击露出的内页，自动展开并放大阅读';requestRender();return}yaw=Math.PI;pitch=0;roll=-Math.PI/2;pose();renderer.render(scene,camera);if(showReader)openReader();else requestRender()}

 function syncVisibility(){setHover(1);setPaperHover(1);if(gsap){if(document.hidden||!visible){folderTimeline?.pause();hoverTo.tween.pause();paperHoverTo.tween.pause()}else{if(animating)folderTimeline?.resume();hoverTo(1);paperHoverTo(1)}}requestRender()}
 const hoverEnabled=matchMedia('(hover: hover) and (pointer: fine)');
 const hoverBox=new THREE.Box3(),corner=new THREE.Vector3();
 function screenBounds(object,exposed=false){model.updateWorldMatrix(true,true);const r=canvas.getBoundingClientRect();let left=Infinity,right=-Infinity,top=Infinity,bottom=-Infinity;const points=[];if(exposed){const low=Math.min(2.2,2.16-paper.position.y);for(const x of [-1.51,1.51])for(const y of [low,2.24])points.push(new THREE.Vector3(x,y,-.03).applyMatrix4(paper.matrixWorld))}else{hoverBox.setFromObject(object);for(const x of [hoverBox.min.x,hoverBox.max.x])for(const y of [hoverBox.min.y,hoverBox.max.y])for(const z of [hoverBox.min.z,hoverBox.max.z])points.push(new THREE.Vector3(x,y,z))}for(const p of points){p.project(camera);const x=r.left+(p.x+1)*r.width/2,y=r.top+(1-p.y)*r.height/2;left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y)}return {left,right,top,bottom,width:right-left,height:bottom-top}}
 function approach(event){if(event.pointerType!=='mouse'||!hoverEnabled.matches||reduced.matches||drag||animating||dialog.open){setHover(1);setPaperHover(1);requestRender();return}const exposed=progress>.39&&progress<.99,box=screenBounds(exposed?paper:model,exposed),dx=Math.max(box.left-event.clientX,0,event.clientX-box.right),dy=Math.max(box.top-event.clientY,0,event.clientY-box.bottom),closeness=clamp(1-Math.hypot(dx,dy)/80);if(exposed){setHover(1);setPaperHover(1+.055*closeness*closeness);canvas.style.cursor=closeness>.8?'pointer':'grab'}else{setPaperHover(1);setHover(1+.035*closeness*closeness)}requestRender()}
 function openReader(timelineOwned=false){if(dialog.open)return;const source=screenBounds(paper);dialog.showModal();window.fitProfileFile?.();const dest=dialog.getBoundingClientRect();restoreClosed();if(gsap&&!reduced.matches){const from={x:(source.left+source.right)/2-(dest.left+dest.width/2),y:(source.top+source.bottom)/2-(dest.top+dest.height/2),scale:Math.min(source.width/dest.width,source.height/dest.height)};if(timelineOwned){gsap.set(dialog,from);readerTween=folderTimeline}else{readerTween?.kill();readerTween=gsap.fromTo(dialog,from,{x:0,y:0,scale:1,duration:.55,ease:'power3.inOut',clearProps:'transform'})}}readBack.focus({preventScroll:true})}

 function resize(){const r=host.getBoundingClientRect();if(!r.width||!r.height)return;renderer.setSize(r.width,r.height,false);updateCamera()}
 function updateCamera(){const r=host.getBoundingClientRect(),aspect=Math.max(.1,r.width/r.height);const opened=smooth(.70,1,progress);const portraitHalf=lerp(Math.max(2.7,1.9/aspect),Math.max(3.15,1.9/aspect),smooth(.15,.42,progress));const extractedHalf=lerp(portraitHalf,Math.max(3.85,1.9/aspect),smooth(.44,.70,progress));const half=lerp(extractedHalf,Math.max(2.3,3.05/aspect),opened);camera.left=-half*aspect;camera.right=half*aspect;camera.top=half;camera.bottom=-half;camera.updateProjectionMatrix()}
 function pose(){if(dialog.open){progress=target=motion.progress=0;animating=false;hoverScale=motion.hover=1}const closed = 1 - smooth(0,.42,progress);model.scale.set(hoverScale*(1+.12*closed),hoverScale*(1-.07*closed),hoverScale*(1+.24*closed));host.dataset.hoverScale=hoverScale.toFixed(4);
 const flip=smooth(0,.23,progress),expose=smooth(.16,.42,progress),extract=smooth(.44,.70,progress),landscape=smooth(.70,1,progress);
 if(animating){const align=smooth(0,.14,Math.abs(progress-startProgress));model.rotation.set(lerp(fromPitch,0,align),lerp(fromYaw,Math.PI*flip,align),lerp(fromRoll,-Math.PI/2*landscape,align))}else model.rotation.set(pitch,yaw,roll);
 paper.scale.setScalar(motion.paperHover);host.dataset.paperHover=motion.paperHover.toFixed(4);paper.position.set(0,.04+expose*.92+extract*.70+(motion.paperHover-1)*1.1,-extract*.16);flapPivot.rotation.x=-smooth(.12,.30,progress)*1.5;flapPivot.visible=progress<.28;
 sleeve.visible=true;model.position.set(landscape*.82,-expose*.27+landscape*.27,0);floor.material.opacity=.065*(1-landscape);softShadow.material.opacity=1-landscape;updateCamera();host.dataset.rotation=String(Math.round(model.rotation.y*180/Math.PI));host.dataset.phase=animating?'opening':progress>=.99?'spread':progress?'exposed':'closed';host.dataset.progress=progress.toFixed(3);paintPaper();
 }

 function render(timestamp){frame=0;if(document.hidden||!visible)return;if(!gsap){const dt=Math.min(64,lastFrameTime?timestamp-lastFrameTime:16);lastFrameTime=timestamp;hoverScale=lerp(hoverScale,hoverTarget,1-Math.exp(-dt/105));if(Math.abs(hoverScale-hoverTarget)<.0001)hoverScale=hoverTarget;if(animating){const elapsed=(performance.now()-startTime)/(reduced.matches?1:target<1?1050:1150),t=clamp(elapsed),ease=t*t*(3-2*t);progress=lerp(startProgress,target,ease);if(t>=1)finishFolder()}}pose();renderer.render(scene,camera);if(!host.dataset.rendered){host.dataset.rendered='true';document.querySelector('#openProfileFallback').hidden=true;document.dispatchEvent(new Event('portfolio:folder-ready'))}if(!gsap&&(animating||Math.abs(hoverScale-hoverTarget)>.0001))requestRender()}
 function requestRender(){if(!frame)frame=requestAnimationFrame(render)}
 function setOpen(open,reader=true){if(animating||dialog.open)return;if(open&&progress>=.99){openReader();return}setPaperHover(1);setHover(1);target=open?(progress<.4?.42:1):0;if(!open){restoreClosed();return}fromYaw=model.rotation.y;fromPitch=model.rotation.x;fromRoll=model.rotation.z;startProgress=progress;startTime=performance.now();showReader=reader;animating=true;pull.disabled=true;reset.disabled=true;pull.textContent=target<1?'正在打开档案袋…':'正在展开个人档案…';if(gsap){folderTimeline?.kill();motion.progress=progress;const update=()=>{if(!dialog.open){progress=motion.progress;requestRender()}};if(target<1){folderTimeline=gsap.timeline({onUpdate:update,onComplete:finishFolder}).to(motion,{progress:target,duration:reduced.matches?0:1.05,ease:'power2.inOut'})}else{const duration=n=>reduced.matches?0:n;folderTimeline=gsap.timeline({onUpdate:update,onComplete:()=>{host.dataset.sequence='complete'}})
 .addLabel('extract').call(()=>{host.dataset.sequence='extract'})
 .to(motion,{progress:.70,duration:duration(.75),ease:'power2.inOut'})
 .addLabel('landscape').call(()=>{host.dataset.sequence='landscape'})
 .to(motion,{progress:1,duration:duration(.75),ease:'power2.inOut'})
 .call(()=>{progress=1;animating=false;yaw=Math.PI;pitch=0;roll=-Math.PI/2;pose();renderer.render(scene,camera);host.dataset.sequence='read';openReader(true)})
 .addLabel('read').to(dialog,{x:0,y:0,scale:1,duration:duration(1.8),ease:'power2.inOut',clearProps:'transform'});}}
 requestRender()}
 pull.onclick=()=>setOpen(true,true);readBack.onclick=()=>{readerTween?.kill();dialog.style.transform='';dialog.close();restoreClosed();canvas.focus({preventScroll:true})};inspect.onclick=readBack.onclick;
 dialog.addEventListener('click',e=>{if(e.target===dialog){readerTween?.kill();dialog.style.transform='';dialog.close();restoreClosed();canvas.focus({preventScroll:true})}});dialog.addEventListener('cancel',e=>{e.preventDefault();readerTween?.kill();dialog.style.transform='';dialog.close();restoreClosed();canvas.focus({preventScroll:true})});

 reset.onclick=()=>{if(animating)return;setHover(1);restoreClosed()};
 canvas.addEventListener('pointerdown',e=>{if(animating||e.button!==0)return;setHover(1);setPaperHover(1);drag={x:e.clientX,y:e.clientY,yaw,pitch,moved:false,id:e.pointerId};canvas.setPointerCapture(e.pointerId)});
 canvas.addEventListener('pointermove',e=>{if(!drag){approach(e);return}const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.hypot(dx,dy)>5)drag.moved=true;yaw=drag.yaw+dx*.013;pitch=drag.pitch+dy*.012;roll=0;requestRender()});
 canvas.addEventListener('pointerup',e=>{if(!drag)return;const moved=drag.moved;drag=null;canvas.releasePointerCapture(e.pointerId);if(!moved){const r=canvas.getBoundingClientRect(),mouse=new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),ray=new THREE.Raycaster();ray.setFromCamera(mouse,camera);if(ray.intersectObjects(model.children,true).length)setOpen(true,true)}});canvas.addEventListener('pointercancel',()=>{drag=null;setHover(1);requestRender()});canvas.addEventListener('pointerleave',()=>{setHover(1);setPaperHover(1);canvas.style.cursor='grab';requestRender()});
 document.addEventListener('visibilitychange',syncVisibility);reduced.addEventListener('change',()=>{setHover(1);if(reduced.matches){hoverTo?.tween.pause();paperHoverTo?.tween.pause();motion.paperHover=1;hoverScale=motion.hover=1;if(animating&&gsap)folderTimeline?.progress(1)}requestRender()});
 canvas.addEventListener('keydown',e=>{if(animating)return;if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','Enter',' '].includes(e.key))e.preventDefault();if(e.key==='ArrowLeft')yaw-=Math.PI/4;if(e.key==='ArrowRight')yaw+=Math.PI/4;if(e.key==='ArrowUp')pitch-=Math.PI/6;if(e.key==='ArrowDown')pitch+=Math.PI/6;if(e.key==='Home'){reset.click();return}if(e.key==='Enter'||e.key===' '){setOpen(true,true);return}if(e.key==='Escape'&&progress){setOpen(false,false);return}requestRender()});
 host.dataset.motionEngine=gsap?'gsap':'fallback';new ResizeObserver(()=>{resize();requestRender()}).observe(host);new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;syncVisibility()}).observe(host);document.body.classList.add('has-3d');resize();restoreClosed();requestRender();
 canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();window.enableProfileFallback()});
}
