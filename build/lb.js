/* Фото на весь экран: нажать на фото в окне товара или на странице товара.
   Листается пальцем/стрелками, увеличивается двумя пальцами или двойным нажатием, «назад» закрывает.
   На сайте берёт большое фото /img/big/<ключ>.webp (если его нет — обычное). Подключается и к сайту, и к черновику (в сборке — ПЕРВЫМ, до окна товара). */
(function(){
var SEL="#pv .pvi,#pv .gal .gtr>img,.pp .pvi,.pp .gal .gtr>img";
var st=document.createElement("style");
st.textContent=SEL.split(",").join("{cursor:zoom-in}")+"{cursor:zoom-in}"+
"#lbx{position:fixed;inset:0;z-index:2147483100;background:#000;display:flex;flex-direction:column;-webkit-user-select:none;user-select:none}#lbx[hidden]{display:none!important}"+
"#lbx .lbt{flex:1 1 auto;display:flex;overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;scrollbar-width:none;-webkit-overflow-scrolling:touch;touch-action:pan-x}#lbx .lbt::-webkit-scrollbar{display:none}"+
"#lbx .lbt.zm{overflow:hidden;touch-action:none}"+
"#lbx .lbs{position:relative;flex:0 0 100%;min-width:0;height:100%;scroll-snap-align:start;scroll-snap-stop:always;display:flex;align-items:center;justify-content:center;overflow:hidden}"+
"#lbx .lbs img{flex:0 0 auto;max-width:none;max-height:none;transform-origin:0 0;will-change:transform;-webkit-user-drag:none}"+
"#lbx .lbx{position:absolute;top:max(10px,env(safe-area-inset-top));right:10px;width:48px;height:48px;border:0;border-radius:50%;background:rgba(255,255,255,.92);color:#111;font:400 30px/1 sans-serif;cursor:pointer;z-index:3;display:flex;align-items:center;justify-content:center;padding:0 0 3px}"+
"#lbx .lbn{position:absolute;top:max(20px,calc(env(safe-area-inset-top) + 10px));left:14px;color:#fff;font:600 16px -apple-system,BlinkMacSystemFont,sans-serif;z-index:3;text-shadow:0 1px 3px #000}"+
"#lbx .lba{position:absolute;top:50%;transform:translateY(-50%);width:48px;height:48px;border:0;border-radius:50%;background:rgba(255,255,255,.85);color:#111;font:700 30px/1 sans-serif;cursor:pointer;z-index:3;display:flex;align-items:center;justify-content:center;padding:0 0 4px}#lbx .lbp{left:10px}#lbx .lbq{right:10px}"+
"#lbx .lbh{position:absolute;left:0;right:0;bottom:max(14px,env(safe-area-inset-bottom));text-align:center;color:rgba(255,255,255,.75);font:14px -apple-system,BlinkMacSystemFont,sans-serif;pointer-events:none;z-index:3}"+
"@media (hover:none){#lbx .lba{display:none}}";
document.head.appendChild(st);
var v,tr,cnt,hint,pushed=false,skip=false,cur=0,Z={z:1,x:0,y:0};
function big(s){return s.replace(/\/img\/([\w\-]+)\.webp/,"/img/big/$1.webp")}
function build(){v=document.createElement("div");v.id="lbx";v.hidden=true;v.setAttribute("role","dialog");v.setAttribute("aria-label","Фото товара");
v.innerHTML='<div class="lbt"></div><span class="lbn"></span><button type="button" class="lbx" aria-label="Закрыть">×</button><button type="button" class="lba lbp" aria-label="Предыдущее фото">‹</button><button type="button" class="lba lbq" aria-label="Следующее фото">›</button><div class="lbh">Двойное нажатие — увеличить</div>';
document.body.appendChild(v);tr=v.querySelector(".lbt");cnt=v.querySelector(".lbn");hint=v.querySelector(".lbh");
v.addEventListener("click",function(e){e.stopPropagation();if(e.target.closest(".lbx")){closeV();return}var a=e.target.closest(".lba");if(a){go(cur+(a.classList.contains("lbq")?1:-1));return}
 if(e.target===tr||e.target.classList.contains("lbs")){if(Z.z===1)closeV()}});
tr.addEventListener("scroll",function(){var n=Math.round(tr.scrollLeft/(tr.clientWidth||1));if(n!==cur){cur=n;upd()}});
touch();}
function fit(im){var s=im.parentNode;if(!s||!im.naturalWidth)return;var W=s.clientWidth,H=s.clientHeight,k=Math.min(W/im.naturalWidth,H/im.naturalHeight);im.style.width=Math.round(im.naturalWidth*k)+"px";im.style.height=Math.round(im.naturalHeight*k)+"px"}
function fitAll(){if(v&&!v.hidden)[].forEach.call(tr.querySelectorAll("img"),fit)}
window.addEventListener("resize",function(){fitAll();if(v&&!v.hidden){reset();tr.scrollLeft=cur*tr.clientWidth}});
function img(){var s=tr.children[cur];return s&&s.firstChild}
function apply(){var i=img();if(!i)return;i.style.transform=Z.z===1?"":"translate("+Z.x+"px,"+Z.y+"px) scale("+Z.z+")";tr.classList.toggle("zm",Z.z>1)}
function reset(){Z={z:1,x:0,y:0};[].forEach.call(tr.querySelectorAll("img"),function(i){i.style.transform=""});tr.classList.remove("zm")}
function clamp(){var i=img();if(!i)return;var w=i.offsetWidth,h=i.offsetHeight,s=i.parentNode,W=s.clientWidth,H=s.clientHeight,ox=i.offsetLeft,oy=i.offsetTop;
 /* координаты: картинка в (ox,oy) размера w×h, после scale(z) с началом в её углу */
 var sw=w*Z.z,sh=h*Z.z;function lim(p,o,size,view){var lo=view-o-size,hi=-o;if(size<=view)return (view-size)/2-o;return Math.min(hi,Math.max(lo,p))}
 Z.x=lim(Z.x,ox,sw,W);Z.y=lim(Z.y,oy,sh,H)}
function zoomAt(nz,cx,cy){var i=img();if(!i)return;var r=i.parentNode.getBoundingClientRect(),ox=i.offsetLeft,oy=i.offsetTop;nz=Math.max(1,Math.min(5,nz));
 var px=cx-r.left,py=cy-r.top,ix=(px-ox-Z.x)/Z.z,iy=(py-oy-Z.y)/Z.z;Z.x=px-ox-ix*nz;Z.y=py-oy-iy*nz;Z.z=nz;if(nz>1)hint.style.display="none";if(nz===1){Z.x=0;Z.y=0}else clamp();apply()}
function touch(){var t0=null,last=0,lx=0,ly=0;
 tr.addEventListener("touchstart",function(e){if(e.touches.length===2){e.preventDefault();var a=e.touches[0],b=e.touches[1];t0={d:Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY),z:Z.z,mx:(a.clientX+b.clientX)/2,my:(a.clientY+b.clientY)/2}}
  else if(e.touches.length===1){var p=e.touches[0],now=Date.now();if(now-last<300&&Math.abs(p.clientX-lx)<30&&Math.abs(p.clientY-ly)<30){e.preventDefault();zoomAt(Z.z>1?1:2.5,p.clientX,p.clientY);last=0;hint.style.display="none"}else last=now;lx=p.clientX;ly=p.clientY;
   if(Z.z>1)t0={px:p.clientX,py:p.clientY,x:Z.x,y:Z.y}}},{passive:false});
 tr.addEventListener("touchmove",function(e){if(!t0)return;if(e.touches.length===2&&t0.d){e.preventDefault();var a=e.touches[0],b=e.touches[1],d=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);zoomAt(t0.z*d/t0.d,t0.mx,t0.my);hint.style.display="none"}
  else if(e.touches.length===1&&Z.z>1&&t0.px!=null){e.preventDefault();var p=e.touches[0];Z.x=t0.x+p.clientX-t0.px;Z.y=t0.y+p.clientY-t0.py;clamp();apply()}},{passive:false});
 tr.addEventListener("touchend",function(e){if(e.touches.length===0){t0=null;if(Z.z<1.05&&Z.z!==1){Z.z=1;zoomAt(1,0,0)}}else if(e.touches.length===1&&Z.z>1){var p=e.touches[0];t0={px:p.clientX,py:p.clientY,x:Z.x,y:Z.y}}});
 tr.addEventListener("dblclick",function(e){zoomAt(Z.z>1?1:2.5,e.clientX,e.clientY)});
 tr.addEventListener("wheel",function(e){if(!e.ctrlKey&&Z.z===1)return;e.preventDefault();zoomAt(Z.z*(e.deltaY<0?1.15:1/1.15),e.clientX,e.clientY)},{passive:false});
 var md=null;tr.addEventListener("mousedown",function(e){if(Z.z>1){e.preventDefault();md={px:e.clientX,py:e.clientY,x:Z.x,y:Z.y}}});
 window.addEventListener("mousemove",function(e){if(!md)return;Z.x=md.x+e.clientX-md.px;Z.y=md.y+e.clientY-md.py;clamp();apply()});window.addEventListener("mouseup",function(){md=null});}
function upd(){reset();var n=tr.children.length;cnt.textContent=n>1?(cur+1)+" / "+n:"";v.querySelector(".lbp").style.visibility=n>1?"":"hidden";v.querySelector(".lbq").style.visibility=n>1?"":"hidden"}
function go(n){var c=tr.children.length;if(!c)return;n=(n+c)%c;cur=n;tr.scrollTo({left:n*tr.clientWidth,behavior:"smooth"});upd()}
function openV(list,idx){if(!v)build();var h="";list.forEach(function(s){h+='<div class="lbs"><img alt="" src="'+s.replace(/"/g,"&quot;")+'"></div>'});tr.innerHTML=h;
 [].forEach.call(tr.querySelectorAll("img"),function(im,n){im.onload=function(){fit(im)};var b=big(list[n]);if(b!==list[n]){var t=new Image();t.onload=function(){im.src=b};t.src=b}});
 v.hidden=false;hint.style.display="";document.documentElement.style.overflow="hidden";cur=idx;tr.scrollLeft=idx*tr.clientWidth;requestAnimationFrame(function(){tr.scrollLeft=idx*tr.clientWidth});upd();
 try{history.pushState({lbx:1},"");pushed=true}catch(e){pushed=false}}
function hideV(){if(v){v.hidden=true;tr.innerHTML=""}document.documentElement.style.overflow=""}
function closeV(){if(!v||v.hidden)return;if(pushed){pushed=false;hideV();skip=true;try{history.back()}catch(e){skip=false}}else hideV()}
document.addEventListener("click",function(e){var i=e.target.closest&&e.target.closest(SEL);if(!i||!i.getAttribute("src"))return;e.preventDefault();e.stopPropagation();
 var g=i.closest(".gtr"),all=g?[].slice.call(g.querySelectorAll("img")).filter(function(x){return x.getAttribute("src")}):[i];openV(all.map(function(x){return x.getAttribute("src")}),Math.max(0,all.indexOf(i)))},true);
window.addEventListener("popstate",function(e){if(skip){skip=false;e.stopImmediatePropagation();return}if(v&&!v.hidden){pushed=false;hideV();e.stopImmediatePropagation()}},true);
document.addEventListener("keydown",function(e){if(!v||v.hidden)return;if(e.key==="Escape"){e.stopImmediatePropagation();closeV()}else if(e.key==="ArrowRight")go(cur+1);else if(e.key==="ArrowLeft")go(cur-1)},true);
})();
