/* Корзина-заявка: товары собираются на сайте и отправляются менеджеру в WhatsApp. Оплаты нет. */
(function(){
var W="77771187355",KEY="akp_cart_v1",MEM=null;
function load(){try{var s=localStorage.getItem(KEY);return s?JSON.parse(s)||[]:[]}catch(e){return MEM||[]}}
function save(a){MEM=a;try{localStorage.setItem(KEY,JSON.stringify(a))}catch(e){}}
var CART=load();
function esc(t){return String(t==null?"":t).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function num(p){if(!p)return null;var d=String(p).replace(/[^\d]/g,"");return d&&/\d/.test(p)&&!/запрос/i.test(p)?+d:null}
function fmt(n){return String(n).replace(/\B(?=(\d{3})+(?!\d))/g," ")+" ₸"}
function find(k){for(var i=0;i<CART.length;i++)if(CART[i].k===k)return CART[i];return null}
function count(){var n=0;CART.forEach(function(x){n+=x.q});return n}

var css="button,a,.cbx,.cstep,.cstep span,#cv,#cfab,.ga,.gal{touch-action:manipulation}.cstep span{-webkit-user-select:none;user-select:none}.cbx{margin-top:6px}.cadd{width:100%;font:600 15px/1.15 Barlow,sans-serif;color:#1b2228;background:#ffc400;border:0;border-radius:6px;padding:8px 10px;min-height:42px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px}.cadd:hover{filter:brightness(1.05)}.cadd svg{width:18px;height:18px;flex:none}"+
".cstep{display:flex;align-items:center;justify-content:space-between;gap:4px;border:2px solid #ffc400;border-radius:6px;min-height:42px;box-sizing:border-box;background:var(--card)}.cstep button{flex:none;width:40px;height:38px;font:700 22px/1 Barlow,sans-serif;color:var(--ink);background:transparent;border:0;cursor:pointer}.cstep span{flex:1;text-align:center;font:600 14px/1.15 Barlow,sans-serif;color:var(--ink)}"+
".card .cbx{margin-top:4px}.card .cadd{font-size:13px;min-height:38px;padding:6px 8px}.card .cstep{min-height:38px}.card .cstep button{height:34px;width:34px}.card .cstep span{font-size:13px}"+
"@media (min-width:641px){.card .cadd{font-size:15px;min-height:44px}.card .cstep{min-height:44px}}"+
"#pv .cbx{margin:0 0 10px}#pv .cadd{font-size:17px;min-height:48px}#pv .cstep{min-height:48px}"+
"#cfab{position:fixed;right:16px;bottom:calc(78px + env(safe-area-inset-bottom,0px));z-index:35;display:flex;align-items:center;gap:8px;font:700 16px/1 Barlow,sans-serif;color:#1b2228;background:#ffc400;border:2px solid #1b2228;border-radius:999px;padding:12px 18px;box-shadow:0 4px 14px rgba(0,0,0,.25);cursor:pointer}#cfab[hidden]{display:none}#cfab svg{width:22px;height:22px}#cfab b{background:#c8161d;color:#fff;border-radius:999px;min-width:24px;height:24px;display:inline-flex;align-items:center;justify-content:center;font-size:14px;padding:0 6px;box-sizing:border-box}"+
"#ctoast{position:fixed;left:50%;transform:translateX(-50%);top:calc(14px + env(safe-area-inset-top,0px));z-index:70;background:#1b2228;color:#fff;font:600 15px/1.3 Barlow,sans-serif;padding:10px 16px;border-radius:10px;box-shadow:0 4px 14px rgba(0,0,0,.3);max-width:calc(100% - 32px);text-align:center;pointer-events:none;opacity:0;transition:opacity .2s}#ctoast.on{opacity:1}"+
"#cv{position:fixed;inset:0;z-index:60;background:var(--bg);overflow-y:auto;-webkit-overflow-scrolling:touch;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}#cv[hidden]{display:none}#cv .cvw{max-width:760px;margin:0 auto;padding:12px 16px 40px}"+
"#cv .cvh{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:6px}#cv h1{font:700 30px/1.1 'Barlow Condensed','Arial Narrow',sans-serif;margin:0}#cv .cvx{font:600 16px Barlow,sans-serif;color:var(--ink);background:var(--chip);border:0;border-radius:6px;padding:10px 16px;min-height:44px;cursor:pointer}"+
"#cv .cvn{color:var(--mute);margin:0 0 14px;font-size:15px}#cv .cit{display:flex;gap:12px;background:var(--card);border:1px solid var(--line);border-radius:8px;padding:10px;margin-bottom:8px}#cv .cit img,#cv .cit .ni{width:64px;height:64px;object-fit:contain;background:#fff;border-radius:6px;flex:none}#cv .cim{flex:1;min-width:0}"+
"#cv .ct{font:600 16px/1.2 Barlow,sans-serif;margin:0 0 2px;overflow-wrap:anywhere}#cv .cs{color:var(--mute);font-size:13px;margin:0 0 6px}#cv .crow{display:flex;align-items:center;gap:10px;flex-wrap:wrap}#cv .cstep{width:140px;min-height:40px}#cv .cstep button{height:36px}#cv .cp{font:700 18px/1 'Barlow Condensed','Arial Narrow',sans-serif;margin-left:auto}#cv .cp.ask{font:500 14px Barlow,sans-serif;color:var(--mute)}"+
"#cv .crm{font:500 13px Barlow,sans-serif;color:var(--mute);background:none;border:0;text-decoration:underline;cursor:pointer;padding:4px 0}#cv .ctot{display:flex;justify-content:space-between;align-items:baseline;gap:10px;font:700 24px/1.2 'Barlow Condensed','Arial Narrow',sans-serif;margin:14px 0 2px}#cv .ctn{color:var(--mute);font-size:13px;margin:0 0 14px}"+
"#cv label{display:flex;flex-direction:column;gap:4px;font-size:14px;color:var(--mute);margin-bottom:10px}#cv input,#cv textarea{font:inherit;font-size:16px;color:var(--ink);background:var(--card);border:1px solid var(--line);border-radius:6px;padding:10px 12px;min-height:44px;box-sizing:border-box;width:100%}#cv textarea{min-height:70px;resize:vertical}"+
"#cv .csend{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;font:700 18px/1.2 Barlow,sans-serif;color:#fff;background:#1fa855;border:0;border-radius:8px;padding:14px 16px;min-height:54px;cursor:pointer;text-decoration:none;box-sizing:border-box}#cv .csend svg{width:22px;height:22px}#cv .cclr{display:block;margin:12px auto 0;font:500 14px Barlow,sans-serif;color:var(--mute);background:none;border:0;text-decoration:underline;cursor:pointer}"+
"#cv .cemp{text-align:center;color:var(--mute);padding:40px 0}#cv .cemp p{margin:0 0 16px}#cv .cemp button{font:600 16px Barlow,sans-serif;color:#fff;background:var(--acc);border:0;border-radius:6px;padding:12px 20px;cursor:pointer}";
var st=document.createElement("style");st.textContent=css;document.head.appendChild(st);

var CI='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.6 12.2a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.5L21.5 8H6.2"/></svg>';
var WI='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.1-5.4A8.4 8.4 0 1 1 21 11.5z"/></svg>';

/* ---- данные товара из карточки / из окна товара ---- */
function fromCard(c){var t=(c.querySelector("h2")||{}).textContent||"",sb=(c.querySelector(".sub")||{}).textContent||"",pr=(c.querySelector(".price")||{}).textContent||"",im=c.querySelector("img.ph"),
km=sb.match(/(?:Код|Коды):\s*(.*?)(?:\.\s*(?:Фасовка|Қаптама):|\.?$)/),fm=sb.match(/(?:Фасовка|Қаптама):\s*(.*)$/);return mk(t,km?km[1].trim():"",fm?fm[1].trim():"",pr,im?(im.getAttribute("src")||""):"")}
function fromPv(pv){var t=(pv.querySelector("h1")||{}).textContent||"",cd="",pk="",dts=pv.querySelectorAll(".pvw > dl dt");[].forEach.call(dts,function(d){var v=d.nextElementSibling?d.nextElementSibling.textContent:"";if(d.textContent==="Код товара")cd=v;if(d.textContent==="Фасовка")pk=v});
var pr=pv.querySelector(".pvw > .price"),im=pv.querySelector(".pvi")||pv.querySelector(".gal img");return mk(t,cd,pk,pr?pr.textContent:"",im?im.getAttribute("src"):"")}
function mk(t,cd,pk,pr,img){t=t.trim();pr=pr.replace(/\s+/g," ").trim();return{k:t+"|"+pk,t:t,c:cd,f:pk,p:pr,v:num(pr),i:img&&img.indexOf("data:")!==0?img.split("?")[0]:"",q:1}}

/* ---- кнопки на карточках ---- */
function ctl(item){var b=document.createElement("div");b.className="cbx";b._it=item;paint(b);return b}
function paint(b){var x=find(b._it.k);b.innerHTML=x?'<div class="cstep"><button type="button" data-c="-" aria-label="Меньше">−</button><span>'+(b._pv?'В корзине: ':'✓ ')+x.q+' шт</span><button type="button" data-c="+" aria-label="Больше">+</button></div>':'<button type="button" class="cadd" data-c="add">'+CI+'Добавить в корзину</button>'}
function paintAll(){[].forEach.call(document.querySelectorAll(".cbx"),function(b){if(b._it)paint(b)});fab()}
function decorate(root){if(!root.querySelectorAll)return;var cs=root.matches&&root.matches(".card")?[root]:root.querySelectorAll(".card");[].forEach.call(cs,function(c){if(c.querySelector(".cbx")||!c.querySelector("h2"))return;var b=ctl(fromCard(c)),wa=c.querySelector("a.wa");if(wa)c.insertBefore(b,wa);else c.appendChild(b)})}
function decoratePv(){var pv=document.getElementById("pv");if(!pv||pv.hidden)return;var w=pv.querySelector(".pvw");if(!w||w.querySelector(".cbx")||!w.querySelector("h1"))return;var b=ctl(fromPv(pv));b._pv=1;paint(b);var btns=w.querySelectorAll(":scope > a.btn:not(.doc)"),wa=btns.length?btns[btns.length-1]:null;if(wa)w.insertBefore(b,wa);else{var pz=w.querySelector(":scope > .price")||w.querySelector(":scope > .pvd");if(pz)w.insertBefore(b,pz.nextSibling);else w.appendChild(b)}}

function decoratePp(){var w=document.querySelector(".pvw.pp");if(!w||w.querySelector(".cbx")||!w.querySelector("h1"))return;var b=ctl(fromPv(w));b._pv=1;paint(b);var btns=w.querySelectorAll(":scope > a.btn:not(.doc)"),wa=btns.length?btns[btns.length-1]:null;if(wa)w.insertBefore(b,wa);else{var pz=w.querySelector(":scope > .price")||w.querySelector(":scope > .pvd");if(pz)w.insertBefore(b,pz.nextSibling);else w.appendChild(b)}}
function setQ(item,d){var x=find(item.k);if(!x){if(d<=0)return;x={};for(var p in item)x[p]=item[p];x.q=0;CART.push(x)}x.q+=d;if(x.q<=0)CART=CART.filter(function(y){return y.k!==item.k});save(CART);paintAll();if(!cv.hidden)render()}

/* ---- плавающая кнопка и подсказка ---- */
var fb=document.createElement("button");fb.type="button";fb.id="cfab";fb.hidden=true;document.body.appendChild(fb);
function fab(){var n=count();fb.hidden=!n;fb.innerHTML=CI+'Перейти в корзину <b>'+n+'</b>';fb.setAttribute("aria-label","Перейти в корзину, товаров: "+n)}
var to=document.createElement("div");to.id="ctoast";to.setAttribute("role","status");document.body.appendChild(to);var tt=null;
function toast(m){to.textContent=m;to.classList.add("on");clearTimeout(tt);tt=setTimeout(function(){to.classList.remove("on")},1600)}

/* ---- окно корзины ---- */
var cv=document.createElement("div");cv.id="cv";cv.hidden=true;cv.setAttribute("role","dialog");cv.setAttribute("aria-modal","true");cv.setAttribute("aria-label","Корзина");document.body.appendChild(cv);var pushed=false,NM="",CM="";
try{NM=localStorage.getItem("akp_name")||""}catch(e){}
function msg(){var s="Здравствуйте! Хочу заказать с сайта avtokraskipro.kz:\n",tot=0,ask=0;CART.forEach(function(x,i){s+="\n"+(i+1)+") "+x.t+(x.f?" ("+x.f+")":"")+" — "+x.q+" шт";if(x.v!=null){s+=" × "+fmt(x.v)+" = "+fmt(x.v*x.q);tot+=x.v*x.q}else{s+=", цена по запросу";ask++}});
s+="\n\nВсего позиций: "+CART.length+", штук: "+count();if(tot)s+="\nСумма по ценам сайта: "+fmt(tot)+(ask?" (без позиций с ценой по запросу)":"");if(NM.trim())s+="\nИмя: "+NM.trim();if(CM.trim())s+="\nКомментарий: "+CM.trim();s+="\n\nПодскажите, пожалуйста, наличие и как забрать / доставку.";return s}
function render(){var h='<div class="cvw"><div class="cvh"><h1>Корзина</h1><button type="button" class="cvx" id="cvx">← Назад</button></div>';
if(!CART.length){h+='<div class="cemp"><p>Корзина пока пустая. Нажмите «Добавить в корзину» на нужных товарах.</p><button type="button" id="cvx2">Вернуться к каталогу</button></div></div>';cv.innerHTML=h;return}
h+='<p class="cvn">Это не оплата. Список товаров уйдёт менеджеру в WhatsApp — он подтвердит наличие, цену и доставку.</p>';var tot=0,ask=0;
CART.forEach(function(x,i){if(x.v!=null)tot+=x.v*x.q;else ask++;h+='<div class="cit" data-i="'+i+'">'+(x.i?'<img src="'+esc(x.i)+'" alt="" loading="lazy">':'')+'<div class="cim"><p class="ct">'+esc(x.t)+'</p><p class="cs">'+(x.f?"Фасовка: "+esc(x.f)+" · ":"")+(x.v!=null?fmt(x.v)+" за шт":"цена по запросу")+'</p><div class="crow"><div class="cstep"><button type="button" data-r="-" aria-label="Меньше">−</button><span>'+x.q+' шт</span><button type="button" data-r="+" aria-label="Больше">+</button></div>'+(x.v!=null?'<span class="cp">'+fmt(x.v*x.q)+'</span>':'<span class="cp ask">цена по запросу</span>')+'</div><button type="button" class="crm" data-r="x">Удалить</button></div></div>'});
h+='<div class="ctot"><span>Итого</span><span>'+(tot?fmt(tot):"по запросу")+'</span></div><p class="ctn">'+count()+' шт. Цены по сайту'+(ask?", без позиций с ценой по запросу":"")+'. Окончательную сумму подтвердит менеджер.</p>';
h+='<label>Ваше имя (необязательно)<input type="text" id="cnm" autocomplete="name" value="'+esc(NM)+'"></label><label>Комментарий: город, доставка, вопрос (необязательно)<textarea id="ccm">'+esc(CM)+'</textarea></label>';
h+='<a class="csend" id="csend" href="#" target="_blank" rel="noopener">'+WI+'Отправить заказ в WhatsApp</a><button type="button" class="cclr" id="cclr">Очистить корзину</button></div>';
cv.innerHTML=h;link()}
function link(){var a=document.getElementById("csend");if(a)a.href="https://wa.me/"+W+"?text="+encodeURIComponent(msg())}
function openC(){render();cv.hidden=false;cv.scrollTop=0;document.body.style.overflow="hidden";try{history.pushState({cv:1},"");pushed=true}catch(e){pushed=false}var x=document.getElementById("cvx");if(x)x.focus()}
function closeC(fromPop){if(cv.hidden)return;cv.hidden=true;cv.innerHTML="";var pv=document.getElementById("pv"),sv=document.getElementById("sv");if((!pv||pv.hidden)&&(!sv||sv.hidden))document.body.style.overflow="";if(pushed&&!fromPop){pushed=false;try{history.back()}catch(e){}}else pushed=false}
window.openCart=openC;
cv.addEventListener("input",function(e){if(e.target.id==="cnm"){NM=e.target.value;try{localStorage.setItem("akp_name",NM)}catch(_){}}if(e.target.id==="ccm")CM=e.target.value;link()});

/* ---- клики (до обработчика, который открывает карточку) ---- */
window.addEventListener("click",function(e){var t=e.target;
var b=t.closest&&t.closest(".cbx [data-c]");if(b){e.preventDefault();e.stopPropagation();var box=b.closest(".cbx"),c=b.getAttribute("data-c");if(c==="add"){setQ(box._it,1);toast("Добавлено в корзину")}else setQ(box._it,c==="+"?1:-1);return}
if(t.closest&&t.closest("#cfab")){e.preventDefault();e.stopPropagation();openC();return}
if(t.closest&&t.closest("#cv")){var r=t.closest("[data-r]");if(r){var it=CART[+r.closest(".cit").getAttribute("data-i")];if(!it)return;var a=r.getAttribute("data-r");if(a==="x")CART=CART.filter(function(y){return y!==it});else{it.q+=a==="+"?1:-1;if(it.q<=0)CART=CART.filter(function(y){return y!==it})}save(CART);render();paintAll();return}
if(t.closest("#cvx")||t.closest("#cvx2")){closeC();return}if(t.closest("#cclr")){if(confirmClr()){CART=[];save(CART);render();paintAll()}return}if(t.closest("#csend"))link();e.stopPropagation()}},true);
var clrAt=0;function confirmClr(){var b=document.getElementById("cclr"),n=Date.now();if(n-clrAt<4000)return true;clrAt=n;if(b)b.textContent="Нажмите ещё раз, чтобы очистить";return false}
document.addEventListener("keydown",function(e){if(e.key==="Escape"&&!cv.hidden){e.stopPropagation();closeC()}},true);
window.addEventListener("popstate",function(e){if(!cv.hidden&&!(e.state&&e.state.cv))closeC(true)});
window.addEventListener("hashchange",function(){if(!cv.hidden)closeC(true)});
window.addEventListener("storage",function(e){if(e.key===KEY){CART=load();paintAll();if(!cv.hidden)render()}});
window.addEventListener("pageshow",function(){CART=load();paintAll()});

/* ---- следим за новыми карточками (смена раздела, поиск, окно товара) ---- */
decorate(document);decoratePp();fab();
new MutationObserver(function(ms){var pvc=false;ms.forEach(function(m){if(m.target&&m.target.id==="pv")pvc=true;[].forEach.call(m.addedNodes,function(n){if(n.nodeType===1&&!(n.closest&&n.closest("#pv,#cv")))decorate(n)})});if(pvc)decoratePv()}).observe(document.body,{childList:true,subtree:true});
})();
