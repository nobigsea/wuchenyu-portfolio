const dialog=document.querySelector('#imageDialog'),full=document.querySelector('#fullImage');
let opener;
for(const button of document.querySelectorAll('[data-image]'))button.addEventListener('click',event=>{event.preventDefault();opener=button;full.src='../dist/assets/'+button.dataset.image+'.webp';full.alt=button.querySelector('img').alt;document.querySelector('#imageCaption').textContent=button.dataset.caption;dialog.showModal();document.body.style.overflow='hidden'});
function closeImage(){dialog.close()}
document.querySelector('#closeImage').onclick=closeImage;dialog.addEventListener('click',e=>{if(e.target===dialog)closeImage()});dialog.addEventListener('close',()=>{document.body.style.overflow='';opener?.focus()});
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
if(!reduced.matches&&'IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){e.target.classList.add('reveal');observer.unobserve(e.target)}},{threshold:.12});document.querySelectorAll('h1,h2,.hero-subtitle,.hero-lead,.hero-result,.decision-copy p,.evidence-picture,.proof-item>div,.delivery,.outcome>p,.next-case').forEach(e=>observer.observe(e))}
let busy=false;function progress(){const max=document.documentElement.scrollHeight-innerHeight;document.querySelector('.reading-progress span').style.top=(max?scrollY/max*100:0)+'%'}addEventListener('scroll',()=>{if(busy)return;busy=true;requestAnimationFrame(()=>{progress();busy=false})},{passive:true});progress();
