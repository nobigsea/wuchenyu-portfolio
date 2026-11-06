/* GSAP refines only the three previously approved interactions. */
(()=>{
 const gsap=window.gsap;if(!gsap)return;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover:hover) and (pointer:fine)');
 document.body.classList.add('gsap-motion');
 const tabs=document.querySelector('.file-tabs'),states=new WeakMap();
 function tabState(button,instant=false){const selected=button.getAttribute('aria-selected')==='true';if(!instant&&states.get(button)===selected)return;states.set(button,selected);const vars={backgroundColor:selected?button.style.getPropertyValue('--tab'):'#e6e9e6',color:'#315d91',duration:reduce.matches||instant?0:.18,ease:'power2.out',overwrite:'auto'};gsap.to(button,vars)}
 if(tabs){tabs.querySelectorAll('button').forEach(b=>tabState(b,true));new MutationObserver(records=>records.forEach(r=>tabState(r.target))).observe(tabs,{subtree:true,attributes:true,attributeFilter:['aria-selected']})}
 function artwork(button,enlarge){const image=button?.querySelector('img');if(!image)return;gsap.to(image,{scale:enlarge&&!reduce.matches?1.02:1,duration:reduce.matches?0:.24,ease:'power2.out',overwrite:'auto',onComplete:()=>{if(!enlarge)image.style.removeProperty('will-change')}});if(enlarge&&!reduce.matches)image.style.willChange='transform'}
 document.addEventListener('pointerover',event=>{if(event.pointerType!=='mouse'||!fine.matches)return;const b=event.target.closest('.work-picture');if(b&&!b.contains(event.relatedTarget))artwork(b,true)});
 document.addEventListener('pointerout',event=>{const b=event.target.closest('.work-picture');if(b&&!b.contains(event.relatedTarget)&&!b.matches(':focus-visible'))artwork(b,false)});
 document.addEventListener('focusin',event=>{const b=event.target.closest('.work-picture');if(b&&b.matches(':focus-visible'))artwork(b,true)});
 document.addEventListener('focusout',event=>{const b=event.target.closest('.work-picture');if(b&&!b.matches(':hover'))artwork(b,false)});
 reduce.addEventListener('change',()=>{tabs?.querySelectorAll('button').forEach(b=>tabState(b,true));document.querySelectorAll('.work-picture').forEach(b=>artwork(b,false))});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)document.querySelectorAll('.work-picture img').forEach(image=>{gsap.killTweensOf(image);gsap.set(image,{scale:1});image.style.removeProperty('will-change')})});
})();
