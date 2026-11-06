/* The editor's four independent library pages share the original asset library. */
(()=>{
let config=null,pendingConfig=null;const fallback=renderWorks;
function fit(){track.querySelectorAll('.editable-work-board').forEach(b=>{const s=b.parentElement.clientWidth/300;b.style.transform=`scale(${s})`;b.parentElement.style.height=(Number(b.dataset.height)||656)*s+'px';b.querySelectorAll('[data-type-size]').forEach(n=>{n.style.fontSize=(Number(n.dataset.typeSize)/s)+'px'})})}
renderWorks=function(filter='all'){
 const page=config?.pages.find(p=>p.role==='work-'+filter);
 if(!page?.workRegions)return fallback(filter);
 filtered=page.workRegions.map(r=>D.works.find(w=>w.key===r.key)).filter(Boolean);track.replaceChildren();
 for(const region of page.workRegions){const work=D.works.find(w=>w.key===region.key);if(!work)continue;
 const card=document.createElement('article');card.className='work-card';const frame=document.createElement('div');frame.style.cssText='position:relative;width:100%;overflow:hidden';const board=document.createElement('div');board.className='editable-work-board';board.style.cssText='position:relative;width:300px;height:800px;transform-origin:top left';
 for(const e of page.elements){if(e.hidden)continue;const owner=e.workKey||page.workRegions.find(r=>e.x>=r.x&&e.x<r.x+340)?.key;if(owner!==region.key)continue;const n=document.createElement('div');Object.assign(n.style,{position:'absolute',left:(e.x-region.x)+'px',top:(e.y-30)+'px',width:e.w+'px',height:e.h+'px',transform:`rotate(${e.angle||0}deg)`,borderRadius:(e.radius||0)+'px',overflow:'hidden',color:e.color||'#315d91',fontSize:(e.fontSize||24)+'px',fontWeight:e.fontWeight||400,textAlign:e.align||'left',whiteSpace:'pre-wrap',lineHeight:'1.45'});
 if(e.type==='text'){n.textContent=e.text;n.dataset.typeSize=e.workField==='title'?'16':'13';n.style.fontWeight='400';n.style.lineHeight='1.6';n.style.overflow='visible';if(e.workField!=='title')n.style.color='#737373';}
 else if(e.type==='rect')n.style.background=e.color;
 else {const direct=config.assetTypes?.[e.asset]?.startsWith('video/'),mapped=mediaConfig.videos[work.key]||{},src=direct?config.assets[e.asset]:mapped.src,poster=(src?src+'.poster.jpg':'')||config.assets[e.posterAsset]||mapped.poster||(!direct?config.assets[e.asset]:'');const video=e.mediaKind==='video'||direct;
 const media=document.createElement(video&&src?'video':'img');if(media.tagName==='VIDEO'){media.src=src;media.poster=poster||src+'.poster.jpg';media.controls=true;media.playsInline=true;media.preload='none';media.onplay=()=>document.querySelectorAll('video').forEach(v=>{if(v!==media)v.pause()})}else{media.src=poster||'';media.alt=e.name;media.loading='lazy';n.onclick=()=>openWork(work.key);n.style.cursor='pointer'}Object.assign(media.style,{width:'100%',height:'100%',objectFit:e.fit||'contain'});if(e.crop&&media.tagName==='IMG'){const c=e.crop;Object.assign(media.style,{position:'absolute',width:100/c.w+'%',height:100/c.h+'%',left:-100*c.x/c.w+'%',top:-100*c.y/c.h+'%',objectFit:'fill'})}n.append(media);if(video&&!src){const tag=document.createElement('span');tag.textContent='视频待上传';tag.style.cssText='position:absolute;bottom:8px;left:8px;background:#fdfbf5;padding:5px 8px;font-size:13px';n.append(tag)}}board.append(n)}board.dataset.height=String(Math.max(0,...[...board.children].map(n=>parseFloat(n.style.top)+parseFloat(n.style.height)))+16);frame.append(board);card.append(frame);track.append(card)}track.scrollLeft=0;fit();updateWorkPage();
};
function applyLayout(){
 if(!pendingConfig||Array.from(track.querySelectorAll('video')).some(video=>!video.paused))return;
 config=pendingConfig;
 pendingConfig=null;
 const scrollLeft=track.scrollLeft;
 renderWorks(document.querySelector('[data-filter].active')?.dataset.filter||'all');
 track.scrollLeft=scrollLeft;
}
new ResizeObserver(fit).observe(track);
track.addEventListener('pause',applyLayout,true);
window.WCYLayout.subscribe((_pages,_draw,nextConfig)=>{
 pendingConfig=nextConfig;
 applyLayout();
});
})();
