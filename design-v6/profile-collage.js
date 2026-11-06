(()=>{
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
window.initProfileCollage=function(root){
 if(root.dataset.collageReady)return;root.dataset.collageReady='true';
 const cards=[...root.querySelectorAll('.experience-paper')],next=root.querySelector('.experience-next'),prev=root.querySelector('.experience-prev'),count=root.querySelector('.experience-count');
 if(!next||!prev)return;let index=0,busy=false;
 function arrange(){cards.forEach((card,i)=>{const depth=(i-index+cards.length)%cards.length;card.style.zIndex=String(3-depth);card.inert=depth!==0;card.setAttribute('aria-hidden',String(depth!==0));const vars={x:depth*7,y:depth*6,rotation:depth===0?-1:depth*2,rotationY:0,opacity:1};if(window.gsap)gsap.set(card,vars);else card.style.transform=`translate(${vars.x}px,${vars.y}px) rotate(${vars.rotation}deg)`});count.textContent=`0${index+1} / 03`;prev.disabled=index===0;next.disabled=index===cards.length-1;}
 function turn(direction){if(busy||index+direction<0||index+direction>=cards.length)return;busy=true;next.disabled=prev.disabled=true;const old=cards[index];const finish=()=>{index+=direction;arrange();busy=false;};if(window.gsap&&!reduced.matches){gsap.timeline({onComplete:finish}).to(old,{rotationY:-20*direction,rotation:-8*direction,x:-35*direction,y:-24,duration:.24,ease:'power2.in'}).to(old,{rotationY:-88*direction,x:-100*direction,opacity:0,duration:.24,ease:'power2.in'});}else finish();}
 next.addEventListener('click',()=>turn(1));prev.addEventListener('click',()=>turn(-1));arrange();
};document.querySelectorAll('.collage-file').forEach(window.initProfileCollage);
})();

(()=>{const dialog=document.querySelector('#profileDialog'),content=document.querySelector('#profileContent');window.fitProfileFile=()=>{if(!dialog.open)return;content.style.zoom='1';const width=+(content.firstElementChild?.dataset.width||1120);content.style.width=width+'px';const height=content.scrollHeight;const scale=Math.min(1,(innerWidth-80)/width,(innerHeight-150)/height);content.style.zoom=String(Math.max(.1,scale));dialog.style.width=`${width*scale}px`;dialog.scrollTop=0;};new MutationObserver(window.fitProfileFile).observe(dialog,{attributes:true,attributeFilter:['open']});addEventListener('resize',window.fitProfileFile);})();
