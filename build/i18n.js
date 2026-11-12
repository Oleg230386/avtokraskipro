/* Язык сайта: РУС (по умолчанию) | ҚАЗ. Словарь — build/kk.json (сайт грузит /assets/kk.json только при выборе казахского, черновик — встроенный window.KK).
   Переводится всё, что совпадает со словарём целиком; названия и описания товаров, которых нет в словаре, остаются как есть. Выбор хранится в браузере (akp_lang). */
(function(){
var KEY="akp_lang",LANG="ru";try{LANG=localStorage.getItem(KEY)==="kk"?"kk":"ru"}catch(e){}
var DE=document.documentElement;
function unhide(){DE.classList.remove("kkp")}
/* ---- переключатель в шапке ---- */
function sw(){[].forEach.call(document.querySelectorAll(".top-nav.brandline"),function(n){if(n.querySelector(".lng"))return;var d=document.createElement("div");d.className="lng";d.setAttribute("role","group");d.setAttribute("aria-label","Тіл / Язык");
d.innerHTML='<button type="button" data-l="ru"'+(LANG==="ru"?' class="on" aria-pressed="true"':' aria-pressed="false"')+'>РУС</button><button type="button" data-l="kk"'+(LANG==="kk"?' class="on" aria-pressed="true"':' aria-pressed="false"')+'>ҚАЗ</button>';
var a=n.querySelector(".abt");if(a)n.insertBefore(d,a);else n.appendChild(d)})}
document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest(".lng button");if(!b)return;var l=b.getAttribute("data-l");if(l===LANG)return;
try{localStorage.setItem(KEY,l)}catch(x){}
if(l==="ru"){location.reload();return}
LANG="kk";[].forEach.call(document.querySelectorAll(".lng button"),function(x){var on=x.getAttribute("data-l")==="kk";x.classList.toggle("on",on);x.setAttribute("aria-pressed",on)});start()});
/* ---- перевод ---- */
var T=null,S=null,PRE=[];
function core(s){var t=s.replace(/\s+/g," ").trim();if(!t)return null;
if(T.hasOwnProperty(t))return T[t];
var m;
if(m=t.match(/^(\d+) позици(?:я|и|й)$/))return m[1]+" тауар";
if(m=t.match(/^Всего: (\d+)$/))return "Барлығы: "+m[1];
if(m=t.match(/^Найдено: (\d+)$/))return "Табылды: "+m[1];
if(m=t.match(/^Показано: (\d+)$/))return "Көрсетілді: "+m[1];
if(m=t.match(/^← Назад к разделу «(.+)»$/))return "← «"+(core(m[1])||m[1])+"» бөліміне оралу";
if(m=t.match(/^\/ (.+)$/)){var r=core(m[1]);return r?"/ "+r:null}
if(m=t.match(/^Код: (.*?)(?:\. Фасовка: (.*))?$/))return "Коды: "+m[1]+(m[2]!=null?". Қаптама: "+pk(m[2]):"");
if(m=t.match(/^Фасовка: (.*?) · (.*)$/))return "Қаптама: "+m[1]+" · "+(core(m[2])||m[2]);
if(m=t.match(/^(?:(.*?)\.? )?Фасовка: (.*)$/))return (m[1]?m[1].split(". ").map(function(x){return core(x)||x}).join(". ")+". ":"")+"Қаптама: "+pk(m[2]);
if(m=t.match(/^(✓ |В корзине: )(\d+) шт$/))return (m[1]==="✓ "?"✓ ":"Себетте: ")+m[2]+" дана";
if(m=t.match(/^(\d+) шт$/))return m[1]+" дана";
if(m=t.match(/^Перейти в корзину, товаров: (\d+)$/))return "Себетке өту, тауарлар: "+m[1];
if(m=t.match(/^(\d+) шт\. Цены по сайту(, без позиций с ценой по запросу)?\. Окончательную сумму подтвердит менеджер\.$/))return m[1]+" дана. Бағалар сайт бойынша"+(m[2]?", бағасы сұрау бойынша тауарларсыз":"")+". Соңғы соманы менеджер растайды.";
if(m=t.match(/^(.*\d ₸) за шт$/))return m[1]+" / дана";
if(m=t.match(/^(.*\d ₸) за (кг|комплект)$/))return m[1]+" / "+(m[2]==="кг"?"кг":"жинақ");
if(t.indexOf(" · ")>0){var p=t.split(" · "),ch=0;p=p.map(function(x){var r=core(x);if(r!=null){ch=1;return r}return x});return ch?p.join(" · "):null}
/* «Лаки U-POL» → «U-POL лактары» */
for(var i=0;i<PRE.length;i++){var k=PRE[i];if(t.indexOf(k+" ")===0){var rest=t.slice(k.length+1);if(/^[A-Za-z0-9][A-Za-z0-9 ,.&+\-]*$/.test(rest))return rest+" "+S[k]}}
return null}
function pk(v){return v.replace(/шт\.?/g,"дана").replace(/упак\.|уп\./g,"қаптама").replace(/рулон/g,"орам").replace(/отвердитель/g,"қатайтқыш").replace(/комплект/g,"жинақ")}
function tx(s){var r=core(s);if(r==null)return null;var a=s.match(/^\s*/)[0],b=s.match(/\s*$/)[0];return (a?" ":"")+r+(b&&s.trim()?" ":"")}
function title(t){var m=t.match(/^(.+?) — (купить в Астане, цены|цены и наличие в Астане|каталог и цены в Астане|купить в Астане(.*)) \| Avtokraski_Pro$/);
if(m){var n=core(m[1])||m[1];return n+" — "+(m[2].indexOf("каталог")===0?"Астанадағы каталог және бағалар":m[2].indexOf("цены и наличие")===0?"Астанадағы бағалар мен қолда бары":"Астанада сатып алу"+(m[3]?m[3].replace(", цена",", бағасы"):", бағалар"))+" | Avtokraski_Pro"}
var r=core(t.replace(" | Avtokraski_Pro",""));return r?r+(t.indexOf(" | Avtokraski_Pro")>0?" | Avtokraski_Pro":""):null}
var SKIP={SCRIPT:1,STYLE:1,TEXTAREA:1,INPUT:1,NOSCRIPT:1,SVG:1};
var AT=["aria-label","placeholder","title"];
function el(e){for(var j=0;j<AT.length;j++){var v=e.getAttribute&&e.getAttribute(AT[j]);if(v){var r=core(v);if(r!=null&&r!==v)e.setAttribute(AT[j],r)}}}
function walk(root){if(!root)return;if(root.nodeType===3){tn(root);return}if(root.nodeType!==1||SKIP[root.nodeName.toUpperCase()]||root.closest&&root.closest(".lng"))return;
el(root);if(root.querySelectorAll)[].forEach.call(root.querySelectorAll("[aria-label],[placeholder],[title]"),el);
var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null,false),n,L=[];while(n=w.nextNode())L.push(n);L.forEach(tn)}
function tn(n){var p=n.parentNode;if(!p||SKIP[p.nodeName.toUpperCase()])return;var v=n.nodeValue;if(!v||!/[А-Яа-яЁё]/.test(v))return;var r=tx(v);if(r!=null&&r!==v)n.nodeValue=r}
var MO=null;
function run(){DE.lang="kk";walk(document.body);var t=title(document.title);if(t)document.title=t;unhide();
if(!MO&&window.MutationObserver){MO=new MutationObserver(function(ms){ms.forEach(function(m){if(m.type==="attributes"){el(m.target);return}[].forEach.call(m.addedNodes,walk)});sw()});
MO.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:AT})}}
function load(cb){if(T)return cb();var set=function(d){T=d.t;S=d.sec;PRE=Object.keys(S).sort(function(a,b){return b.length-a.length});cb()};
if(window.KK)return set(window.KK);
fetch("/assets/kk.json?v=1").then(function(r){return r.json()}).then(set,unhide)}
function start(){load(run)}
/* при переходах в черновике шапка рисуется заново — вставляем переключатель снова */
if(window.MutationObserver)new MutationObserver(function(){if([].some.call(document.querySelectorAll(".top-nav.brandline"),function(n){return !n.querySelector(".lng")}))sw()}).observe(document.body,{childList:true,subtree:true});
function init(){sw();if(LANG==="kk")start();else unhide()}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
