(function(){
var SEC=[["laki","Лаки"],["grunty","Грунты"],["aerozoli","Аэрозоли"],["shpatlevki","Шпатлёвки"],["otverditeli","Разбавители"],["abrazivy","Абразивы"],["lenty","Ленты и маскировка"],["raspyliteli","Краскопульты"],["raptor","Защитное покрытие Raptor"],["avtohimiya","Автохимия и полировка"],["oborudovanie","Оборудование"],["prochee","Прочие материалы"]];
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
function build(){if(IDX)return;IDX=[];var seen={};for(var i=0;i<CD.length;i++){var c=CD[i],h2=(c.match(/<h2>(.*?)<\/h2>/)||[,""])[1],pr=(c.match(/class="price">(.*?)<\/div>/)||[,""])[1];if(!c)continue;var key=h2+"|"+pr;if(seen[key])continue;seen[key]=1;var body=c.replace(/<div class="price">.*?<\/div>/,"").replace(/<(img|a)[^>]*>/g," ").replace(/<[^>]+>/g," ");IDX.push({c:c,t:norm(dec(body)),h:norm(dec(h2))})}}
var sv=document.createElement("div");sv.id="sv";sv.hidden=true;sv.setAttribute("role","dialog");sv.setAttribute("aria-modal","true");
sv.innerHTML='<div class="svw"><div class="svh"><input type="search" id="sq" placeholder="Название, артикул, бренд…" autocomplete="off" autocapitalize="off" aria-label="Поиск по каталогу"><button type="button" class="svx" id="svx">Закрыть</button></div><div class="svm" id="svm"></div><div class="svs" id="svs"></div><div class="grid" id="svr"></div><button type="button" class="btn ghost more" id="svmore" hidden>Показать ещё</button></div>';
document.body.appendChild(sv);
var sq=sv.querySelector("#sq"),svm=sv.querySelector("#svm"),svs=sv.querySelector("#svs"),svr=sv.querySelector("#svr"),svmore=sv.querySelector("#svmore");
var RES=[],SHOWN=0,STEP=40,pushed=false,timer=null;
function hydrate(root){[].forEach.call(root.querySelectorAll(".card"),function(c){var tx=function(q){var e=c.querySelector(q);return e?e.textContent:""},t=tx("h2"),sb=tx(".sub");c.setAttribute("data-t",(tx(".top")+" "+t+" "+tx(".meta")+" "+sb).toLowerCase());var a=c.querySelector("a.wa");if(a){var w=a.getAttribute("data-w");if(!w){var k=sb.match(/^Код: (.*?)(?:\. Фасовка:.*)?$/),cd=k?k[1]:null,nm=cd&&t.indexOf(cd+" · ")===0?t.slice(cd.length+3):t;w="Здравствуйте! Интересует товар: "+nm+(cd?" (код "+cd+")":"")+". Подскажите цену и наличие."}a.href=u(w);a.target="_blank";a.rel="noopener";a.textContent=ATT}});[].forEach.call(root.querySelectorAll("img[data-img]"),setImg)}
function more(){var part=RES.slice(SHOWN,SHOWN+STEP).map(function(r){return r.c}).join("");var d=document.createElement("div");d.innerHTML=part;hydrate(d);while(d.firstChild)svr.appendChild(d.firstChild);SHOWN+=STEP;svmore.hidden=SHOWN>=RES.length}
function links(tk){var o="";SEC.forEach(function(s){if(matchAll(norm(s[1]),tk))o+='<a class="chip" href="#'+s[0]+'">'+s[1]+' →</a>'});BRS.forEach(function(b){if(matchAll(norm(b[1]),tk))o+='<a class="chip" href="#brand-'+b[0]+'">'+b[1].split(" ")[0]+' →</a>'});return o}
function run(){build();var q=sq.value.trim();svr.innerHTML="";svs.innerHTML="";SHOWN=0;RES=[];if(!q){svm.textContent="Введите название, артикул или бренд. Можно по-русски или латиницей.";svs.innerHTML=["Raptor","Лаки","Краскопульты","PPG","Аэрозоли","D8125"].map(function(x){return'<a class="chip" href="#" data-q="'+x+'">'+x+'</a>'}).join("");svmore.hidden=true;return}
var tk=toks(q);if(!tk.length)return;var hit=[],rest=[];IDX.forEach(function(r){if(matchAll(r.t,tk))(matchAll(r.h,tk)?hit:rest).push(r)});RES=hit.concat(rest);svm.textContent=RES.length?"Найдено: "+RES.length:"Ничего не найдено. Попробуйте другое слово или артикул.";svs.innerHTML=links(tk);more()}
function open(){if(!sv.hidden)return;sv.hidden=false;sv.scrollTop=0;document.body.style.overflow="hidden";run();try{history.pushState({sv:1},"");pushed=true}catch(e){pushed=false}setTimeout(function(){sq.focus()},30)}
function close(fromPop){if(sv.hidden)return;sv.hidden=true;document.body.style.overflow="";if(pushed&&!fromPop){pushed=false;try{history.back()}catch(e){}}else pushed=false}
document.addEventListener("click",function(e){var t=e.target;if(t.closest(".gsb")){open();return}if(t.closest("#svx")){close();return}if(t.closest("#svmore")){more();return}var q=t.closest("#sv a[data-q]");if(q){e.preventDefault();sq.value=q.getAttribute("data-q");run();return}var a=t.closest("#sv a[href^='#']");if(a&&a.getAttribute("data-q")==null){close(false)}},false);
sq.addEventListener("input",function(){clearTimeout(timer);timer=setTimeout(run,160)});
sq.addEventListener("keydown",function(e){if(e.key==="Enter"){clearTimeout(timer);run();sq.blur()}});
document.addEventListener("keydown",function(e){if(e.key==="Escape"&&document.getElementById("pv").hidden)close()});
window.addEventListener("popstate",function(e){if(!sv.hidden&&!(e.state&&e.state.sv)&&document.getElementById("pv").hidden)close(true)});
window.addEventListener("hashchange",function(){close(true)});
})();
