/* Галерея фото в карточке: несколько фото листаются пальцем или стрелками. Подключается и к сайту, и к черновику. */
(function(){
var st=document.createElement("style");
st.textContent=".gal{position:relative}.gal .gtr{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;-webkit-overflow-scrolling:touch;border-radius:6px}.gal .gtr::-webkit-scrollbar{display:none}.gal .gtr>img{flex:0 0 100%;min-width:0;scroll-snap-align:start;scroll-snap-stop:always}"+
".gal .gd{position:absolute;left:0;right:0;bottom:6px;display:flex;justify-content:center;gap:6px;pointer-events:none}.gal .gd i{width:8px;height:8px;border-radius:50%;background:rgba(0,0,0,.22)}.gal .gd i.on{background:#c8161d}"+
".gal .ga{position:absolute;top:50%;transform:translateY(-50%);width:32px;height:32px;border-radius:50%;border:0;background:rgba(255,255,255,.92);box-shadow:0 1px 5px rgba(0,0,0,.3);font:700 22px/1 sans-serif;color:#15191c;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0 0 3px;z-index:2}.gal .gp{left:4px}.gal .gn{right:4px}"+
"#pv .gal{margin:0 0 4px}#pv .gal .gtr{border-radius:8px;border:1px solid var(--line,#ddd);background:#fff}#pv .gal .gtr>img{display:block;width:100%;max-height:70vh;aspect-ratio:1;object-fit:contain;background:#fff}#pv .gal .ga{width:42px;height:42px;font-size:28px}";
document.head.appendChild(st);
function upd(tr){var w=tr.clientWidth||1,n=Math.round(tr.scrollLeft/w),g=tr.parentNode;[].forEach.call(g.querySelectorAll(".gd i"),function(d,i){d.className=i===n?"on":""})}
document.addEventListener("scroll",function(e){var t=e.target;if(t&&t.classList&&t.classList.contains("gtr"))upd(t)},true);
var last=null;
document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest(".gal .ga");
 if(b){e.stopPropagation();e.preventDefault();var tr=b.parentNode.querySelector(".gtr"),w=tr.clientWidth,n=Math.round(tr.scrollLeft/w),c=tr.children.length;n=b.classList.contains("gn")?(n+1)%c:(n-1+c)%c;tr.scrollTo({left:n*w,behavior:"smooth"});return}
 var hs=e.target.closest&&e.target.closest(".hs-it"); if(hs){var k=hs.getAttribute("data-i"),html=(window.HSC&&window.HSC[k])||(window.CD&&window.CD[+k])||"",w=document.createElement("div");w.innerHTML=html;var cc=w.firstElementChild;last=cc&&cc.querySelector(".gal")?cc:null;if(last)setTimeout(pop,0);return}  /* слайдер на главной: окно товара тоже с галереей */
 var c=e.target.closest&&e.target.closest(".card");last=c&&c.querySelector(".gal")?c:null;
 if(last)setTimeout(pop,0)},true);
function pop(){var pv=document.getElementById("pv");if(!pv||pv.hidden||!last)return;var one=pv.querySelector(".pvi");if(!one)return;
 var g=last.querySelector(".gal").cloneNode(true);g.querySelector(".gtr").scrollLeft=0;
 [].forEach.call(g.querySelectorAll("img"),function(i,n){i.removeAttribute("loading");i.className="";var o=last.querySelectorAll(".gal img")[n],s=o&&o.getAttribute("src");if(s)i.src=s;else if(window.ldImg&&i.getAttribute("data-img"))window.ldImg(i)});
 [].forEach.call(g.querySelectorAll(".gd i"),function(d,i){d.className=i?"":"on"});
 one.parentNode.replaceChild(g,one)}
})();
