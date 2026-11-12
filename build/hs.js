function initHS(){var el=document.getElementById("hs");if(!el||el.getAttribute("data-ok"))return;el.setAttribute("data-ok","1");if(HST){clearTimeout(HST);HST=null}
var ids=[];TOP.forEach(function(code){for(var i=0;i<CD.length;i++){var m=CD[i].match(/<h2>([\s\S]*?)<\/h2>/);if(m&&(m[1].indexOf(code+" · ")===0||m[1]===code)){ids.push(i);break}}});
var h='<a class="hs-brand" href="#home"><img data-img="ig-av" alt="" width="32" height="32"><b>AVTOKRASKI<span>_PRO</span></b><small>· популярные товары</small></a><div class="hs-vp"><div class="hs-tr">';
ids.forEach(function(i){var m=CD[i].match(/data-img="([^"]+)"/),t=CD[i].match(/<h2>([\s\S]*?)<\/h2>/);if(!m)return;h+='<div class="hs-it" data-i="'+i+'" role="button" tabindex="0" aria-label="'+hsEsc(t?t[1]:"")+'"><img data-img="'+m[1]+'" alt="'+hsEsc(t?t[1]:"")+'" width="300" height="300"></div>'});
h+='</div></div><div class="hs-nav"><button type="button" class="hs-prev" aria-label="Назад">‹</button><button type="button" class="hs-next" aria-label="Вперёд">›</button></div><div class="hs-bar"></div>';
el.innerHTML=h;setImg(el.querySelector(".hs-brand img"));
var tr=el.querySelector(".hs-tr"),IT=el.querySelectorAll(".hs-it"),N=IT.length,cur=0,bar=el.querySelector(".hs-bar"),paused=false;
function vis(){var w=window.innerWidth;return w<=560?1:(w<=900?2:4)}
function load(){var v=vis();for(var k=cur;k<cur+v*2&&k<N;k++){var im=IT[k].querySelector("img");if(im&&!im.getAttribute("src"))setImg(im)}}
function go(k){var v=vis(),mx=Math.max(0,N-v);cur=k>mx?0:(k<0?mx:k);tr.style.transform="translateX("+(-cur*100/v)+"%)";load();run()}
function run(){if(HST)clearTimeout(HST);bar.classList.remove("run");void bar.offsetWidth;if(paused||!document.body.contains(el))return;bar.classList.add("run");HST=setTimeout(function(){if(document.body.contains(el))go(cur+1)},2000)}
el.querySelector(".hs-prev").addEventListener("click",function(){go(cur-1)});el.querySelector(".hs-next").addEventListener("click",function(){go(cur+1)});
el.addEventListener("mouseenter",function(){paused=true;run()});el.addEventListener("mouseleave",function(){paused=false;run()});
var x0=null;el.addEventListener("touchstart",function(e){x0=e.touches[0].clientX},{passive:true});el.addEventListener("touchend",function(e){if(x0===null)return;var dx=e.changedTouches[0].clientX-x0;x0=null;if(Math.abs(dx)>40)go(cur+(dx<0?1:-1))});
window.addEventListener("resize",function(){if(document.body.contains(el))go(cur)});
function more(it){var w=document.createElement("div");w.innerHTML=CD[+it.getAttribute("data-i")];var c=w.firstChild,sb=c.querySelector(".sub"),t=c.querySelector("h2").textContent,km=sb?sb.textContent.match(/^(?:Код|Коды): (.*?)(?:\. (?:Фасовка|Қаптама):.*)?$/):null,cd=km?km[1]:"",nm=cd&&t.indexOf(cd+" · ")===0?t.slice(cd.length+3):t,wa=c.querySelector("a.wa");
if(wa)wa.setAttribute("href",u("Здравствуйте! Интересует товар: "+nm+(cd?" (код "+cd+")":"")+". Подскажите цену и наличие."));var a=it.querySelector("img"),b=c.querySelector("img.ph");if(a&&b&&a.getAttribute("src"))b.setAttribute("src",a.getAttribute("src"));if(window.openP)window.openP(c)}
[].forEach.call(IT,function(it){it.addEventListener("click",function(){more(it)});it.addEventListener("keydown",function(e){if(e.key==="Enter")more(it)})});
go(0);if(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches){paused=true;run()}}
