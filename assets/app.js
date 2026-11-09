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

(function(){
var W="77771187355",ATT="Узнать цену и наличие";function u(t){return"https://wa.me/"+W+"?text="+encodeURIComponent(t)}
function setImg(i){var k=i.getAttribute("data-img");if(k){i.setAttribute("src","/img/"+k+".webp");i.removeAttribute("data-img")}}
var CDL=null;function loadCD(cb){if(window.CD){cb();return}if(!CDL){CDL=[];var s=document.createElement("script");s.src="/assets/cards.js?v=1";s.onload=function(){var q=CDL;CDL=null;q.forEach(function(f){f()})};document.head.appendChild(s)}CDL.push(cb)}
var app=document.getElementById("app");
function mark(root){[].forEach.call(root.querySelectorAll(".card"),function(c){var tx=function(q){var e=c.querySelector(q);return e?e.textContent:""};c.setAttribute("data-t",(tx(".top")+" "+tx("h2")+" "+tx(".meta")+" "+tx(".sub")).toLowerCase())})}
mark(app);
document.addEventListener("input",function(e){var q=e.target;if(q.type!=="search"||q.id==="sq")return;var v=q.value.trim().toLowerCase().split(" "),n=0;[].forEach.call(app.querySelectorAll("main .card"),function(c){var t=c.getAttribute("data-t"),ok=v.every(function(w){return t.indexOf(w)>-1});c.hidden=!ok;if(ok)n++});var ct=app.querySelector(".count");if(ct)ct.textContent="Показано: "+n});
var HST=null;
function initHS(){var el=document.getElementById("hs");if(!el||el.getAttribute("data-ok"))return;el.setAttribute("data-ok","1");if(HST){clearTimeout(HST);HST=null}

var tr=el.querySelector(".hs-tr"),IT=el.querySelectorAll(".hs-it"),N=IT.length,cur=0,bar=el.querySelector(".hs-bar"),paused=false;
function vis(){var w=window.innerWidth;return w<=560?1:(w<=900?2:4)}
function load(){var v=vis();for(var k=cur;k<cur+v*2&&k<N;k++){var im=IT[k].querySelector("img");if(im&&!im.getAttribute("src"))setImg(im)}}
function go(k){var v=vis(),mx=Math.max(0,N-v);cur=k>mx?0:(k<0?mx:k);tr.style.transform="translateX("+(-cur*100/v)+"%)";load();run()}
function run(){if(HST)clearTimeout(HST);bar.classList.remove("run");void bar.offsetWidth;if(paused||!document.body.contains(el))return;bar.classList.add("run");HST=setTimeout(function(){if(document.body.contains(el))go(cur+1)},4000)}
el.querySelector(".hs-prev").addEventListener("click",function(){go(cur-1)});el.querySelector(".hs-next").addEventListener("click",function(){go(cur+1)});
el.addEventListener("mouseenter",function(){paused=true;run()});el.addEventListener("mouseleave",function(){paused=false;run()});
var x0=null;el.addEventListener("touchstart",function(e){x0=e.touches[0].clientX},{passive:true});el.addEventListener("touchend",function(e){if(x0===null)return;var dx=e.changedTouches[0].clientX-x0;x0=null;if(Math.abs(dx)>40)go(cur+(dx<0?1:-1))});
window.addEventListener("resize",function(){if(document.body.contains(el))go(cur)});
function more(it){var w=document.createElement("div");w.innerHTML=(window.HSC||{})[it.getAttribute("data-i")]||"";if(!w.firstChild)return;var c=w.firstChild,sb=c.querySelector(".sub"),t=c.querySelector("h2").textContent,km=sb?sb.textContent.match(/^Код: (.*?)(?:\. Фасовка:.*)?$/):null,cd=km?km[1]:"",nm=cd&&t.indexOf(cd+" · ")===0?t.slice(cd.length+3):t,wa=c.querySelector("a.wa");
if(wa)wa.setAttribute("href",u("Здравствуйте! Интересует товар: "+nm+(cd?" (код "+cd+")":"")+". Подскажите цену и наличие."));var a=it.querySelector("img"),b=c.querySelector("img.ph");if(a&&b&&a.getAttribute("src"))b.setAttribute("src",a.getAttribute("src"));if(window.openP)window.openP(c)}
[].forEach.call(IT,function(it){it.addEventListener("click",function(e){if(e.target.closest("a.pl"))return;e.preventDefault();more(it)});it.addEventListener("keydown",function(e){if(e.key==="Enter")more(it)})});
go(0);if(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches){paused=true;run()}}

initHS();
(function(){var pv=document.createElement("div");pv.id="pv";pv.hidden=true;pv.setAttribute("role","dialog");pv.setAttribute("aria-modal","true");document.body.appendChild(pv);var pushed=false;
function esc(t){var d=document.createElement("div");d.textContent=t;return d.innerHTML}
var DOCS={"5335":{pdf:"/docs/emakout-5335sp-tehkarta.pdf",pg:2,src:"ЭмЛак, техническое описание «Эмаль ЭМАКОУТ 5335 SP»",rows:[["Тип", "двухкомпонентная (2К) эпоксидная эмаль: основа + отвердитель HD-126 SP"], ["Назначение", "защита стальных и бетонных ёмкостей (в т. ч. для пищевых продуктов, питьевой воды, нефтепродуктов), металлоконструкций из стали, чугуна и лёгких сплавов во всех типах атмосфер, включая морскую и промышленную"], ["Цвет", "красно-коричневый и другие"], ["Подготовка поверхности", "металл: обезжиривание, очистка до Sa 2½, Sa 2 или St 3, обеспыливание; можно по грунту или без грунта. Бетон: ровный, чистый, влажность не более 4 %"], ["Смешивание", "основа + отвердитель HD-126 SP (соотношение — в сертификате качества), перемешать 10–15 мин"], ["Разбавитель", "ЭмЛак № 221; для пищевых ёмкостей — № 233 или № 233 Б, до 5 % по объёму"], ["Жизнеспособность", "не менее 2 ч при 20 °C"], ["Условия нанесения", "воздух от +10 до +35 °C, влажность до 80 %, металл выше точки росы на 3 °C, без осадков"], ["Способ нанесения", "безвоздушное распыление (сопло 0,43–0,63 мм, давление от 30 МПа); кисть или валик — для кромок и дефектных мест"], ["Слои", "1–2 слоя; сухая плёнка 100–150 мкм на слой (типично 100 мкм)"], ["Расход", "около 0,176 кг/м² на слой 100 мкм"], ["Высыхание до отлипа", "8 ч при 10 °C; 4 ч при 20 °C; 2 ч при 30 °C"], ["До перекрытия", "30 ч при 10 °C; 20 ч при 20 °C; 10 ч при 30 °C"], ["До эксплуатации", "не менее 10 суток при 20 °C"], ["Плотность / сухой остаток", "1,5 ± 0,1 г/см³; нелетучие вещества 85 ± 2 % по объёму"], ["Хранение", "до +35 °C в закрытой таре; гарантийный срок 12 месяцев"]]},"7320":{pdf:"/docs/emakout-7320v-tehkarta.pdf",pg:2,src:"ЭмЛак, техническое описание «Грунт-эмаль ЭМАКОУТ 7320 В»",rows:[["Тип", "однокомпонентная (1К) грунт-эмаль на основе винилового сополимера — грунт и финишный слой в одном"], ["Назначение", "защита от коррозии металлоконструкций, спецтехники и оборудования"], ["Стойкость", "перепады температур от −60 до +60 °C; агрессивные газы (SO₂, CO₂, Cl₂), кислоты, растворы щелочей, вода до +60 °C"], ["Срок службы покрытия", "не менее 10 лет в открытой промышленной атмосфере умеренного и холодного климата"], ["Подготовка поверхности", "обезжиривание, удаление непрочных слоёв, абразивоструйная очистка до Sa 2½, обеспыливание"], ["Разбавитель", "ЭмЛак № 221, не более 10 % по объёму"], ["Условия нанесения", "воздух от −15 до +30 °C, влажность до 85 %, металл выше точки росы на 3 °C, без осадков"], ["Способ нанесения", "безвоздушное распыление (сопло 0,38–0,43 мм), пневматическое распыление (сопло 1,4–1,6 мм, 0,4–0,6 МПа); кисть или валик — на небольших участках"], ["Слои", "обычно 2–3 слоя; сухая плёнка 40–60 мкм на слой (типично 50 мкм)"], ["Расход", "около 0,127 кг/м² на слой 50 мкм"], ["Высыхание до отлипа", "6 ч при −15 °C; 30 мин при 0 °C; 20 мин при 20 °C; 10 мин при 30 °C"], ["До перекрытия", "12 ч при −15 °C; 3 ч при 0 °C; 1 ч при 20 °C; 30 мин при 30 °C"], ["Плотность / сухой остаток", "1,14 ± 0,05 г/см³; нелетучие вещества 40 ± 5 % по объёму"], ["Хранение", "до +35 °C в закрытой таре; гарантийный срок 36 месяцев"]]},"D8125":{pdf:"/docs/D8125-tehkarta.pdf",pg:5,src:"PPG, техническая информация, январь 2020 (RLD276)",rows:[["Пропорция смешивания (по объёму)","лак D8125 — 2 части, отвердитель D826x — 1 часть, разбавитель D808/D807/D812/D8746 — 0,5 части"],["Вязкость","14–16 сек по DIN4 при 20°C"],["Жизнеспособность","2 часа при 20°C"],["Краскопульт","с верхним бачком, дюза 1,2–1,3 мм"],["Нанесение","2 полных слоя, сухая плёнка 50–60 мкм, выдержка между слоями 2 минуты. Или 1 лёгкий слой и затем полный, сухая плёнка 50 мкм, выдержка не нужна"],["Сушка при 60°C","15 мин (D8262, D8263), 20 мин (D8264)"],["Сушка при 40°C","30 мин"],["Воздушная сушка 20°C","до полировки 4 часа"],["ИК-сушка","коротковолновая около 5 мин, средневолновая около 10 мин; использовать разбавитель D8746"],["Основа","чистое беспыльное базовое покрытие PPG Envirobase High Performance или Deltron; перед нанесением липкая салфетка"],["Перекрас","шлифовка P800 (мокрая) или P400 (сухая)"],["VOC","не более 420 г/л в готовом виде"]],hard:[["до 20°C","D8262","D808 / D807"],["20–30°C","D8263","D807 / D812"],["свыше 30°C","D8264","D8746"]]}};
function tds(code){var k=null;for(var d in DOCS){if(code.indexOf(d)===0)k=d}if(!k)return"";var o=DOCS[k],h='<div class="tds"><h3>Техническая информация</h3><p class="src">'+esc(o.src)+'</p><dl>';o.rows.forEach(function(r){h+="<dt>"+esc(r[0])+"</dt><dd>"+esc(r[1])+"</dd>"});h+='</dl>';if(o.hard){h+='<table><thead><tr><th>Температура</th><th>Отвердитель</th><th>Разбавитель</th></tr></thead><tbody>';o.hard.forEach(function(r){h+="<tr><td>"+esc(r[0])+"</td><td>"+esc(r[1])+"</td><td>"+esc(r[2])+"</td></tr>"});h+='</tbody></table>'}h+='<a class="btn doc" href="'+o.pdf+'" data-pg="'+(o.pg||1)+'" target="_blank" rel="noopener">Открыть полную техкарту (PDF)</a></div>';return h}
window.openP=openP;
function openP(c){var im=c.querySelector("img.ph"),cat=(c.querySelector(".top")||{}).textContent||"",ti=c.querySelector("h2").textContent,me=(c.querySelector(".meta")||{}).textContent||"",sb=(c.querySelector(".sub")||{}).textContent||"",ds=c.querySelector(".desc"),pr=c.querySelector(".price"),wa=c.querySelector("a.wa");
var rows="",m=sb.match(/Код:\s*(.*?)(?:\.\s*Фасовка:|\.?$)/),f=sb.match(/Фасовка:\s*(.*)$/);if(me)rows+="<dt>Бренд / серия</dt><dd>"+esc(me)+"</dd>";if(cat)rows+="<dt>Раздел</dt><dd>"+esc(cat)+"</dd>";if(m)rows+="<dt>Код товара</dt><dd>"+esc(m[1].trim())+"</dd>";if(f)rows+="<dt>Фасовка</dt><dd>"+esc(f[1].trim())+"</dd>";if(!m&&!f&&sb)rows+="<dt>Данные</dt><dd>"+esc(sb)+"</dd>";
var h='<div class="pvw"><button class="pvb" type="button" id="pvx">← Назад к каталогу</button>';
h+=im&&im.getAttribute("src")?'<img class="pvi" src="'+im.getAttribute("src")+'" alt="'+esc(im.alt||ti)+'">':'<div class="pvn">Фото товара скоро появится</div>';
h+='<div class="pvc">'+esc(cat)+'</div><h1>'+esc(ti)+'</h1>'+(rows?'<dl>'+rows+'</dl>':'');
h+='<h3>Описание</h3>'+(ds?'<p class="pvd">'+esc(ds.textContent)+'</p>':'<p class="pvd none">Подробное описание, применение и совместимость уточняйте у менеджера в WhatsApp.</p>');
h+=tds(m?m[1].trim():"");h+=(pr?'<div class="price">'+pr.innerHTML+'</div>':'')+(wa?'<a class="btn" href="'+wa.getAttribute("href")+'" target="_blank" rel="noopener">Узнать цену и наличие</a>':'')+'</div>';
pv.innerHTML=h;pv.hidden=false;pv.scrollTop=0;document.body.style.overflow="hidden";document.getElementById("pvx").focus();try{history.pushState({pv:1},"");pushed=true}catch(e){pushed=false}}
function closeP(fromPop){if(pv.hidden)return;pv.hidden=true;pv.innerHTML="";document.body.style.overflow="";if(pushed&&!fromPop){pushed=false;try{history.back()}catch(e){}}else pushed=false}
document.addEventListener("click",function(e){var t=e.target;if(t.closest("#pvx")){closeP();return}if(t.closest("#pv"))return;var c=t.closest(".card");if(!c||t.closest("a"))return;openP(c)},false);
document.addEventListener("keydown",function(e){if(e.key==="Escape")closeP()});
window.addEventListener("popstate",function(){closeP(true)});

})();
(function(){
var SEC=[["laki","Лаки"],["grunty","Грунты"],["aerozoli","Аэрозоли"],["shpatlevki","Шпатлёвки"],["otverditeli","Разбавители"],["abrazivy","Абразивы"],["lenty","Ленты и маскировка"],["raspyliteli","Краскопульты"],["avtohimiya","Автохимия и полировка"],["oborudovanie","Оборудование"],["prochee","Прочие материалы"],["emal","Эмаль для спецтехники и металлоконструкций"]];
var BRS=[["ppg","PPG"],["u-pol","U-POL"],["ranal","RANAL"],["selemix","Selemix"],["norton","Norton"],["autolux","AutoLux"],["ik","IK Sprayers"],["carpro","CarPro"],["nar-ppm-hpx","NAR PPM HPX"],["matequs","Matequs"],["usi","USI Italia Millibar Walmec Anest Iwata GYS Rupes"]];
var EN={lacquer:"лак",clearcoat:"лак",clear:"лак",varnish:"лак",primer:"грунт",filler:"грунт",putty:"шпатлев",thinner:"разбавител",aerosol:"аэрозол",spray:"аэрозол",gun:"краскопульт",sprayer:"распылител",abrasive:"абразив",sandpaper:"абразив",наждачка:"абразив",наждачки:"абразив",наждачку:"абразив",наждачкой:"абразив",наждачная:"абразив",наждачный:"абразив",наждак:"абразив",шкурка:"абразив",шкурки:"абразив",шкурку:"абразив",tape:"лент",masking:"маскиров",polish:"полиров",polishing:"полиров",equipment:"оборудован",welding:"сварк",sealant:"герметик",paint:"краск"};
var RL="йцукенгшщзхъфывапролджэячсмитьбю",LL="qwertyuiop[]asdfghjkl;'zxcvbnm,.";
var CY={а:"a",б:"b",в:"v",г:"g",д:"d",е:"e",ж:"zh",з:"z",и:"i",й:"y",к:"k",л:"l",м:"m",н:"n",о:"o",п:"p",р:"r",с:"s",т:"t",у:"u",ф:"f",х:"h",ц:"c",ч:"ch",ш:"sh",щ:"sch",ы:"y",э:"e",ю:"yu",я:"ya"};
function norm(t){return String(t).toLowerCase().replace(/ё/g,"е")}
function swap(t,a,b){var o="";for(var i=0;i<t.length;i++){var k=a.indexOf(t[i]);o+=k>-1?b[k]:t[i]}return o}
function tr(t){var o="";for(var i=0;i<t.length;i++)o+=CY[t[i]]!=null?CY[t[i]]:t[i];return o}
function stem(t){if(t.length>3&&/[аеиыюяьйуо]$/.test(t))t=t.slice(0,-1);return t}
function alts(tok){var a=[stem(tok)];if(EN[tok])a.push(EN[tok]);var s1=norm(swap(tok,LL,RL));if(s1!==tok)a.push(stem(s1));var s2=norm(swap(tok,RL,LL));if(s2!==tok)a.push(s2);if(/[а-я]/.test(tok))a.push(tr(tok));return a}
function toks(q){return norm(q).replace(/[«»"']/g," ").split(/[\s,;]+/).filter(Boolean)}
function matchAll(text,tk){for(var i=0;i<tk.length;i++){var al=alts(tk[i]),ok=false;for(var j=0;j<al.length;j++){if(text.indexOf(al[j])>-1){ok=true;break}}if(!ok)return false}return true}
function dec(t){return t.replace(/&quot;/g,'"').replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&#39;/g,"'")}
var IDX=null;
function build(){if(IDX||!window.CD)return;var CD=window.CD;IDX=[];var seen={};for(var i=0;i<CD.length;i++){var c=CD[i],h2=(c.match(/<h2>(.*?)<\/h2>/)||[,""])[1],pr=(c.match(/class="price">(.*?)<\/div>/)||[,""])[1];if(!c)continue;var key=h2+"|"+pr;if(seen[key])continue;seen[key]=1;var body=c.replace(/<div class="price">.*?<\/div>/,"").replace(/<(img|a)[^>]*>/g," ").replace(/<[^>]+>/g," ");IDX.push({c:c,t:norm(dec(body)),h:norm(dec(h2))})}}
var sv=document.createElement("div");sv.id="sv";sv.hidden=true;sv.setAttribute("role","dialog");sv.setAttribute("aria-modal","true");
sv.innerHTML='<div class="svw"><div class="svh"><input type="search" id="sq" placeholder="Название, артикул, бренд…" autocomplete="off" autocapitalize="off" aria-label="Поиск по каталогу"><button type="button" class="svx" id="svx">Закрыть</button></div><div class="svm" id="svm"></div><div class="svs" id="svs"></div><div class="grid" id="svr"></div><button type="button" class="btn ghost more" id="svmore" hidden>Показать ещё</button></div>';
document.body.appendChild(sv);
var sq=sv.querySelector("#sq"),svm=sv.querySelector("#svm"),svs=sv.querySelector("#svs"),svr=sv.querySelector("#svr"),svmore=sv.querySelector("#svmore");
var RES=[],SHOWN=0,STEP=40,pushed=false,timer=null;
function hydrate(root){[].forEach.call(root.querySelectorAll(".card"),function(c){var tx=function(q){var e=c.querySelector(q);return e?e.textContent:""},t=tx("h2"),sb=tx(".sub");c.setAttribute("data-t",(tx(".top")+" "+t+" "+tx(".meta")+" "+sb).toLowerCase());var a=c.querySelector("a.wa");if(a){var w=a.getAttribute("data-w");if(!w){var k=sb.match(/^Код: (.*?)(?:\. Фасовка:.*)?$/),cd=k?k[1]:null,nm=cd&&t.indexOf(cd+" · ")===0?t.slice(cd.length+3):t;w="Здравствуйте! Интересует товар: "+nm+(cd?" (код "+cd+")":"")+". Подскажите цену и наличие."}a.href=u(w);a.target="_blank";a.rel="noopener";a.textContent=ATT}});[].forEach.call(root.querySelectorAll("img[data-img]"),setImg)}
function more(){var part=RES.slice(SHOWN,SHOWN+STEP).map(function(r){return r.c}).join("");var d=document.createElement("div");d.innerHTML=part;hydrate(d);while(d.firstChild)svr.appendChild(d.firstChild);SHOWN+=STEP;svmore.hidden=SHOWN>=RES.length}
function links(tk){var o="";SEC.forEach(function(s){if(matchAll(norm(s[1]),tk))o+='<a class="chip" href="/'+s[0]+'/">'+s[1]+' →</a>'});BRS.forEach(function(b){if(matchAll(norm(b[1]),tk))o+='<a class="chip" href="/brand/'+b[0]+'/">'+b[1].split(" ")[0]+' →</a>'});return o}
function run(){if(!window.CD){loadCD(run);return}build();var q=sq.value.trim();svr.innerHTML="";svs.innerHTML="";SHOWN=0;RES=[];if(!q){svm.textContent="Введите название, артикул или бренд. Можно по-русски или латиницей.";svs.innerHTML=["Raptor","Лаки","Краскопульты","PPG","Аэрозоли","D8125"].map(function(x){return'<a class="chip" href="#" data-q="'+x+'">'+x+'</a>'}).join("");svmore.hidden=true;return}
var tk=toks(q);if(!tk.length)return;var hit=[],rest=[];IDX.forEach(function(r){if(matchAll(r.t,tk))(matchAll(r.h,tk)?hit:rest).push(r)});RES=hit.concat(rest);svm.textContent=RES.length?"Найдено: "+RES.length:"Ничего не найдено. Попробуйте другое слово или артикул.";svs.innerHTML=links(tk);more()}
function open(){if(!sv.hidden)return;sv.hidden=false;sv.scrollTop=0;document.body.style.overflow="hidden";if(window.CD)run();else{svm.textContent="Загрузка каталога…";loadCD(run)}try{history.pushState({sv:1},"");pushed=true}catch(e){pushed=false}setTimeout(function(){sq.focus()},30)}
function close(fromPop){if(sv.hidden)return;sv.hidden=true;document.body.style.overflow="";if(pushed&&!fromPop){pushed=false;try{history.back()}catch(e){}}else pushed=false}
document.addEventListener("click",function(e){var t=e.target;if(t.closest(".gsb")){open();return}if(t.closest("#svx")){close();return}if(t.closest("#svmore")){more();return}var q=t.closest("#sv a[data-q]");if(q){e.preventDefault();sq.value=q.getAttribute("data-q");run();return}},false);
sq.addEventListener("input",function(){clearTimeout(timer);timer=setTimeout(run,160)});
sq.addEventListener("keydown",function(e){if(e.key==="Enter"){clearTimeout(timer);run();sq.blur()}});
document.addEventListener("keydown",function(e){if(e.key==="Escape"&&document.getElementById("pv").hidden)close()});
window.addEventListener("popstate",function(e){if(!sv.hidden&&!(e.state&&e.state.sv)&&document.getElementById("pv").hidden)close(true)});

})();

})();

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
km=sb.match(/Код:\s*(.*?)(?:\.\s*Фасовка:|\.?$)/),fm=sb.match(/Фасовка:\s*(.*)$/);return mk(t,km?km[1].trim():"",fm?fm[1].trim():"",pr,im?(im.getAttribute("src")||""):"")}
function fromPv(pv){var t=(pv.querySelector("h1")||{}).textContent||"",cd="",pk="",dts=pv.querySelectorAll(".pvw > dl dt");[].forEach.call(dts,function(d){var v=d.nextElementSibling?d.nextElementSibling.textContent:"";if(d.textContent==="Код товара")cd=v;if(d.textContent==="Фасовка")pk=v});
var pr=pv.querySelector(".pvw > .price"),im=pv.querySelector(".pvi")||pv.querySelector(".gal img");return mk(t,cd,pk,pr?pr.textContent:"",im?im.getAttribute("src"):"")}
function mk(t,cd,pk,pr,img){t=t.trim();pr=pr.replace(/\s+/g," ").trim();return{k:t+"|"+pk,t:t,c:cd,f:pk,p:pr,v:num(pr),i:img&&img.indexOf("data:")!==0?img.split("?")[0]:"",q:1}}

/* ---- кнопки на карточках ---- */
function ctl(item){var b=document.createElement("div");b.className="cbx";b._it=item;paint(b);return b}
function paint(b){var x=find(b._it.k);b.innerHTML=x?'<div class="cstep"><button type="button" data-c="-" aria-label="Меньше">−</button><span>'+(b._pv?'В корзине: ':'✓ ')+x.q+' шт</span><button type="button" data-c="+" aria-label="Больше">+</button></div>':'<button type="button" class="cadd" data-c="add">'+CI+'Добавить в корзину</button>'}
function paintAll(){[].forEach.call(document.querySelectorAll(".cbx"),function(b){if(b._it)paint(b)});fab()}
function decorate(root){if(!root.querySelectorAll)return;var cs=root.matches&&root.matches(".card")?[root]:root.querySelectorAll(".card");[].forEach.call(cs,function(c){if(c.querySelector(".cbx")||!c.querySelector("h2"))return;var b=ctl(fromCard(c)),wa=c.querySelector("a.wa");if(wa)c.insertBefore(b,wa);else c.appendChild(b)})}
function decoratePv(){var pv=document.getElementById("pv");if(!pv||pv.hidden)return;var w=pv.querySelector(".pvw");if(!w||w.querySelector(".cbx")||!w.querySelector("h1"))return;var b=ctl(fromPv(pv));b._pv=1;paint(b);var btns=w.querySelectorAll(":scope > a.btn:not(.doc)"),wa=btns.length?btns[btns.length-1]:null;if(wa)w.insertBefore(b,wa);else w.appendChild(b)}

function decoratePp(){var w=document.querySelector(".pvw.pp");if(!w||w.querySelector(".cbx")||!w.querySelector("h1"))return;var b=ctl(fromPv(w));b._pv=1;paint(b);var btns=w.querySelectorAll(":scope > a.btn:not(.doc)"),wa=btns.length?btns[btns.length-1]:null;if(wa)w.insertBefore(b,wa);else w.appendChild(b)}
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
 var c=e.target.closest&&e.target.closest(".card");last=c&&c.querySelector(".gal")?c:null;
 if(last)setTimeout(pop,0)},true);
function pop(){var pv=document.getElementById("pv");if(!pv||pv.hidden||!last)return;var one=pv.querySelector(".pvi");if(!one)return;
 var g=last.querySelector(".gal").cloneNode(true);g.querySelector(".gtr").scrollLeft=0;
 [].forEach.call(g.querySelectorAll("img"),function(i,n){i.removeAttribute("loading");i.className="";var o=last.querySelectorAll(".gal img")[n],s=o&&o.getAttribute("src");if(s)i.src=s;else if(window.ldImg&&i.getAttribute("data-img"))window.ldImg(i)});
 [].forEach.call(g.querySelectorAll(".gd i"),function(d,i){d.className=i?"":"on"});
 one.parentNode.replaceChild(g,one)}
})();
