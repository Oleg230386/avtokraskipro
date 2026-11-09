/* Просмотр техкарты прямо на сайте: страницы-картинки поверх товара, кнопка «Назад к товару» и «Скачать PDF». */
(function(){
var st=document.createElement("style");
st.textContent="#tdv{position:fixed;inset:0;z-index:2147483000;background:#f2f2f2;display:flex;flex-direction:column}#tdv[hidden]{display:none!important}"+
"#tdv .tdb{flex:0 0 auto;display:flex;gap:8px;align-items:center;padding:10px 12px;padding-top:max(10px,env(safe-area-inset-top));background:#111;box-shadow:0 2px 8px rgba(0,0,0,.25)}"+
"#tdv .tdx{flex:1 1 auto;min-height:48px;border:0;border-radius:10px;background:#d2141e;color:#fff;font:700 17px -apple-system,BlinkMacSystemFont,sans-serif;cursor:pointer}"+
"#tdv .tdd{flex:0 0 auto;min-height:48px;display:flex;align-items:center;padding:0 14px;border-radius:10px;background:#fff;color:#111;font:600 15px -apple-system,BlinkMacSystemFont,sans-serif;text-decoration:none}"+
"#tdv .tds2{flex:1 1 auto;overflow:auto;-webkit-overflow-scrolling:touch;padding:12px;padding-bottom:max(20px,env(safe-area-inset-bottom))}"+
"#tdv .tds2 img{display:block;width:100%;max-width:900px;height:auto;margin:0 auto 12px;background:#fff;box-shadow:0 1px 6px rgba(0,0,0,.15)}"+
"#tdv .tdf{text-align:center;padding:4px 0 10px}#tdv .tdf button{min-height:48px;padding:0 22px;border:0;border-radius:10px;background:#d2141e;color:#fff;font:700 16px -apple-system,BlinkMacSystemFont,sans-serif}";
document.head.appendChild(st);
var v=null,pushed=false,skip=false;
function build(){v=document.createElement("div");v.id="tdv";v.hidden=true;v.setAttribute("role","dialog");v.setAttribute("aria-label","Техническая карта");
v.innerHTML='<div class="tdb"><button type="button" class="tdx">← Назад к товару</button><a class="tdd" target="_blank" rel="noopener" download>Скачать PDF</a></div><div class="tds2"></div>';
document.body.appendChild(v);
v.addEventListener("click",function(e){if(e.target.closest(".tdx,.tdf button")){e.preventDefault();e.stopPropagation();closeV()}});}
function openV(pdf,n){if(!v)build();var b=v.querySelector(".tds2"),h="";for(var i=1;i<=n;i++)h+='<img src="'+pdf.replace(/\.pdf$/,"-"+i+".webp")+'" alt="Техкарта, страница '+i+'" loading="'+(i<3?"eager":"lazy")+'">';
b.innerHTML=h+'<div class="tdf"><button type="button">← Назад к товару</button></div>';b.scrollTop=0;v.querySelector(".tdd").setAttribute("href",pdf);v.hidden=false;
document.documentElement.style.overflow="hidden";try{history.pushState({tdv:1},"");pushed=true}catch(e){pushed=false}}
function hideV(){if(v){v.hidden=true;v.querySelector(".tds2").innerHTML=""}document.documentElement.style.overflow=""}
function closeV(){if(!v||v.hidden)return;if(pushed){pushed=false;hideV();skip=true;try{history.back()}catch(e){skip=false}}else hideV()}
document.addEventListener("click",function(e){var a=e.target.closest&&e.target.closest("a.btn.doc[data-pg]");if(!a)return;e.preventDefault();e.stopPropagation();openV(a.getAttribute("href"),+a.getAttribute("data-pg")||1)},true);
window.addEventListener("popstate",function(e){if(skip){skip=false;e.stopImmediatePropagation();return}if(v&&!v.hidden){pushed=false;hideV();e.stopImmediatePropagation()}},true);
document.addEventListener("keydown",function(e){if(e.key==="Escape"&&v&&!v.hidden){e.stopImmediatePropagation();closeV()}},true);
})();
