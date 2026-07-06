/*****YTPRO*******
Version: 3.9.8
Last Updated On: 1 May , 2026 , 19:25 IST
*/




if(window.eruda == null && localStorage.getItem("devMode") == "true"){
//ERUDA
var script = document.createElement('script'); script.src="//youtube.com/ytpro_cdn/npm/eruda"; document.body.appendChild(script); script.onload=()=>{eruda.init();}
}
/**/

if(!YTProVer){

/*Few Stupid Inits*/
var YTProVer="1.0.0";
var ytoldV="";
var isF=false;   //what is this for?
var isAp=false; // oh it's for bg play 
const originalPause = HTMLMediaElement.prototype.pause; // well long story short , save the original pause function
window.PIPause = false; // for pausing video when in PIP
window.isPIP=false;
window.pauseAllowed = true; // allow pause by default
var sTime=[];
var webUrls=["m.youtube.com","youtube.com","yout.be","accounts.google.com"];
var GeminiAT="";
var GeminiModels = {
    "3.0 Pro": '[1,null,null,null,"9d8ca3786ebdfbea",null,null,0,[4],null,null,1]',
    "3.0 Flash": '[1,null,null,null,"fbb127bbb056c959",null,null,0,[4],null,null,1]',
    "3.0 Flash Thinking": '[1,null,null,null,"5bf011840784117a",null,null,0,[4],null,null,1]',
    "3.0 Pro Plus": '[1,null,null,null,"e6fa609c3fa255c0",null,null,0,[4],null,null,4]',
    "3.0 Flash Plus": '[1,null,null,null,"56fdd199312815e2",null,null,0,[4],null,null,4]',
    "3.0 Flash Thinking Plus": '[1,null,null,null,"e051ce1aa80aa576",null,null,0,[4],null,null,4]',
    "3.0 Pro Advanced": '[1,null,null,null,"e6fa609c3fa255c0",null,null,0,[4],null,null,2]',
    "3.0 Flash Advanced": '[1,null,null,null,"56fdd199312815e2",null,null,0,[4],null,null,2]',
    "3.0 Flash Thinking Advanced": '[1,null,null,null,"e051ce1aa80aa576",null,null,0,[4],null,null,2]'
};

var YTPROCodecs={
video:["AV1","VP8","VP9","H264"],
audio:["Opus","Mp4a"]
}

let touchstartY = 0;
let touchendY = 0;
let initialDistance=null;

//swipe controls
var sens=0.005;
var vol=Android.getVolume();
var brt = Android.getBrightness()/100;

if(localStorage.getItem("saveCInfo") == null  || localStorage.getItem("gesC") == null || localStorage.getItem("gesM") == null || localStorage.getItem("bgplay") == null){
localStorage.setItem("autoSpn","true");
localStorage.setItem("bgplay","true");
localStorage.setItem("gesC","true");
localStorage.setItem("gesM","true");
localStorage.setItem("fzoom","false");
localStorage.setItem("saveCInfo","true");
localStorage.setItem("geminiModel","3.0 Flash");
localStorage.setItem("prompt","Give me details about this YouTube video Id: {videoId} , a detailed summary of timestamps with facts , resources and reviews of the main content");
localStorage.setItem("devMode","false");
localStorage.setItem("proxyOn","false");
localStorage.setItem("loopVid","false");
localStorage.setItem("autoPip","true");
if(!localStorage.getItem("ytproPreferredQuality")) localStorage.setItem("ytproPreferredQuality","144p");

window.ytproRecordDownload = function(title, filename, type, thumbUrl, durationSec, videoId){
try{
var history = JSON.parse(localStorage.getItem("ytproDownloadHistory") || "[]");
history.unshift({ title: title, filename: filename, type: type, date: Date.now(), thumb: thumbUrl || "", duration: durationSec || 0, videoId: videoId || "" });
if(history.length > 200) history = history.slice(0, 200);
localStorage.setItem("ytproDownloadHistory", JSON.stringify(history));
}catch(e){ console.error('[YTPRO] recordDownload failed', e); }
};

localStorage.setItem("block_60fps","false");

YTPROCodecs.video.forEach((x)=>{
localStorage.setItem(x,"true");
});

YTPROCodecs.audio.forEach((x)=>{
localStorage.setItem(x,"true");
});

}
if(localStorage.getItem("fzoom") == "true"){
document.getElementsByName("viewport")[0].setAttribute("content","");
}

if (["2.0 Flash", "2.0 Flash Thinking", "2.5 Flash", "2.5 Pro"].includes(localStorage.getItem('geminiModel'))) {
localStorage.setItem('geminiModel', "3.0 Flash");
}


if(window.location.pathname.indexOf("shorts") > -1){
ytoldV=window.location.pathname;
}
else{
ytoldV=(new URLSearchParams(window.location.search)).get('v') ;
}


/*Dark and Light Mode*/
var c="#000";
var d="#f2f2f2";
var dc="#fff";
var isD=false;
var dislikes="...";


if(document.cookie.indexOf("f6=40000") > -1){
dc ="#000";c ="#fff";d="rgba(255,255,255,0.1)";
isD=true;
}else{
dc ="#fff";c="#000";d="rgba(0,0,0,0.05)";
isD=false;
}

var downBtn=`<svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 24 24" fill="none">
<path
d="M16.59 9H15V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5H7.41a1 1 0 0 0-.7 1.7l4.59 4.59a1 1 0 0 0 1.42 0l4.59-4.59a1 1 0 0 0-.72-1.7Z"
stroke="${c}"
stroke-width="1.8"
stroke-linecap="round"
stroke-linejoin="round"
/>
<rect x="5" y="17.2" width="14" height="1.8" rx="0.9" fill="${c}" />
</svg>
`;










function override() {

var videoElem = document.createElement('video');
var origCanPlayType = videoElem.canPlayType.bind(videoElem);
videoElem.__proto__.canPlayType = makeModifiedTypeChecker(origCanPlayType);

var mse = window.MediaSource;

if (mse === undefined) return;
var origIsTypeSupported = mse.isTypeSupported.bind(mse);
mse.isTypeSupported = makeModifiedTypeChecker(origIsTypeSupported);
}


function makeModifiedTypeChecker(origChecker) {


return function (type) {
if (type === undefined) return '';
var disallowed_types = [];
if (localStorage['H264'] === 'false') {
disallowed_types.push('avc');
}
if (localStorage['VP8'] === 'false') {
disallowed_types.push('vp8');
}
if (localStorage['VP9'] === 'false') {
disallowed_types.push('vp9', 'vp09');
}
if (localStorage['AV1'] === 'true') {
disallowed_types.push('av01', 'av99');
}
if (localStorage['Opus'] === 'false') {
disallowed_types.push('opus');
}
if (localStorage['Mp4a'] === 'false') {
disallowed_types.push('mp4a');
}

// If video type is in disallowed_types, say we don't support them
for (var i = 0; i < disallowed_types.length; i++) {
if (type.indexOf(disallowed_types[i]) !== -1) return '';
}

if (localStorage['block_60fps'] === 'true') {
var match = /framerate=(\d+)/.exec(type);
if (match && match[1] > 30) return '';
}

return origChecker(type);
};
}

override();





function insertAfter(referenceNode, newNode) {
try{
referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}catch{}
}


/*wait for the element , using observer*/
async function waitForElement(selector,vid) {
return new Promise((resolve) => {
const element = document.querySelector(selector);
if(element){
if(vid && element.src != "") return resolve(element);
if(!vid) return resolve(element);
}
const observer = new MutationObserver(() => {
const el = document.querySelector(selector);
if (el){

if(vid && el.src) resolve(el),observer.disconnect();;
if(!vid) resolve(el),observer.disconnect();;
}
});
observer.observe(document.body, {
childList: true,
subtree: true
});
});
}


/*Add Settings Tab*/
var addSettingsTab=()=>{
if(document.getElementById("setDiv") == null){
var setDiv=document.createElement("div");
setDiv.setAttribute("style",`
z-index:9999999999;
font-size:22px;
text-align:center;
line-height:35px;
pointer-events:auto;
`);
setDiv.setAttribute("id","setDiv");
var svg=document.createElement("ytm-pivot-bar-item-renderer");
svg.innerHTML=`<svg fill="${ window.location.href.indexOf("watch") < 0 ? c : "#fff" }" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"  id="hSett"><path d="M12.844 1h-1.687a2 2 0 00-1.962 1.616 3 3 0 01-3.92 2.263 2 2 0 00-2.38.891l-.842 1.46a2 2 0 00.417 2.507 3 3 0 010 4.525 2 2 0 00-.417 2.507l.843 1.46a2 2 0 002.38.892 3.001 3.001 0 013.918 2.263A2 2 0 0011.157 23h1.686a2 2 0 001.963-1.615 3.002 3.002 0 013.92-2.263 2 2 0 002.38-.892l.842-1.46a2 2 0 00-.418-2.507 3 3 0 010-4.526 2 2 0 00.418-2.508l-.843-1.46a2 2 0 00-2.38-.891 3 3 0 01-3.919-2.263A2 2 0 0012.844 1Zm-1.767 2.347a6 6 0 00.08-.347h1.687a4.98 4.98 0 002.407 3.37 4.98 4.98 0 004.122.4l.843 1.46A4.98 4.98 0 0018.5 12a4.98 4.98 0 001.716 3.77l-.843 1.46a4.98 4.98 0 00-4.123.4A4.979 4.979 0 0012.843 21h-1.686a4.98 4.98 0 00-2.408-3.371 4.999 4.999 0 00-4.12-.399l-.844-1.46A4.979 4.979 0 005.5 12a4.98 4.98 0 00-1.715-3.77l.842-1.459a4.98 4.98 0 004.123-.399 4.981 4.981 0 002.327-3.025ZM16 12a4 4 0 11-7.999 0 4 4 0 018 0Zm-4 2a2 2 0 100-4 2 2 0 000 4Z"></path></svg>
`;
setDiv.appendChild(svg);
insertAfter(document.getElementsByTagName("ytm-home-logo")[0],setDiv)
if(document.getElementById("hSett") != null){
document.getElementById("hSett").addEventListener("click",
function(ev){
window.location.hash="settings";
});
}
}


};




/*Dislikes To Locale, Credits: Return YT Dislikes*/
function getDislikesInLocale(num){
var nn=num;
if (num < 1000){
nn = num;
}
else{
const int = Math.floor(Math.log10(num) - 2);
const decimal = int + (int % 3 ? 1 : 0);
const value = Math.floor(num / 10 ** decimal);
nn= value * 10 ** decimal;
}
let userLocales;
if (document.documentElement.lang) {
userLocales = document.documentElement.lang;
} else if (navigator.language) {
userLocales = navigator.language;
} else {
try {
userLocales = new URL(
Array.from(document.querySelectorAll("head > link[rel='search']"))
?.find((n) => n?.getAttribute("href")?.includes("?locale="))
?.getAttribute("href")
)?.searchParams?.get("locale");
} catch {
userLocales = "en";
}
}
return Intl.NumberFormat(userLocales, {
notation: "compact",
compactDisplay: "short",
}).format(nn);
}



/*Skips the bad part :)*/
async function skipSponsor(){
var sDiv=document.createElement("div");
sDiv.setAttribute("style",`height:3px;pointer-events:none;width:100%;position:absolute;z-index:99;`)
sDiv.setAttribute("id","sDiv");
var player = document.getElementsByClassName("video-stream")[0];
var dur=player.duration;

if(isNaN(dur)) return;

for(var x in sTime){
var s1=document.createElement("div");
var s2=sTime[x];
s1.setAttribute("style",`height:3px;width:${(100/dur) * (s2[1]-s2[0])}%;background:#0f8;position:absolute;z-index:9;left:${(100/dur) * s2[0]}%;`)
sDiv.appendChild(s1);
}




var e=await waitForElement("yt-progress-bar",false);


if(document.getElementById("sDiv") == null){
if(document.getElementsByClassName('ytPlayerProgressBarHost')[0] != null){
document.getElementsByClassName('ytPlayerProgressBarHost')[0].appendChild(sDiv);
}else{
try{document.getElementsByClassName('ytProgressBarLineProgressBarLine')[0].appendChild(sDiv);}catch{}
}
}




}





/*Fetch The Dislikes*/
async function fDislikes(url){ 
var Url=new URL(url);
var vID="";
if(Url.pathname.indexOf("shorts") > -1){
vID=Url.pathname.substr(8,Url.pathname.length);
}
else if(Url.pathname.indexOf("watch") > -1){
vID=Url.searchParams.get("v");
}


fetch("https://returnyoutubedislikeapi.com/votes?videoId="+vID)
.then(response => {
return response.json();
}).then(jsonObject => {
if('dislikes' in jsonObject){
dislikes=getDislikesInLocale(parseInt(jsonObject.dislikes));
}
}).catch(error => {});

}



/*Check For Sponsorships*/
async function checkSponsors(Url){


if(Url.indexOf("watch") > -1){

sTime=[];

await fetch("https://sponsor.ajay.app/api/skipSegments?videoID="+new URL(Url).searchParams.get("v"))
.then(response => {
return response.json();
}).then(jsonObject => {
for(var x in jsonObject){
var time=jsonObject[x].segment;
sTime.push(time);
}
}).catch(error => {});



/*Skip the Sponsor*/
var player = await waitForElement(".video-stream",true);


player.ontimeupdate=()=>{
skipSponsor();
var cur=player.currentTime;
for(var x in sTime){
var s2=sTime[x];
if(Math.floor(cur) == Math.floor(s2[0])){
if(localStorage.getItem("autoSpn") == "true"){
player.currentTime=s2[1];
addSkipper(s2[0]);
}
}
}
};





}

}


//DEBUG
/*
s1: FoQR9rLpRy8
s2: PN51tJhZscE
*/
/*Add Skip Sponsor Element*/
function addSkipper(sT){
var sSDiv=document.createElement("div");
sSDiv.setAttribute("style",`
height:50px;${(screen.width > screen.height) ? "width:50%;" : "width:80%;"}overflow:auto;background:rgba(130,130,130,.3);
backdrop-filter:blur(6px);
position:absolute;bottom:40px;
line-height:50px;
left:calc(15% / 2 );padding-left:10px;padding-right:10px;
z-index:99999999999999;text-align:center;border-radius:25px;
color:white;text-align:center;
`);
sSDiv.innerHTML=`<span style="height:30px;line-height:30px;margin-top:10px;display:block;font-family:monospace;font-size:16px;float:left;">Skipped Sponsor</span>
<span style="height:30px;line-height:44px;float:right;padding-right:30px;margin-top:10px;display:block;padding-left:30px;border-left:1px solid white;">
<svg data-action="rewind" xmlns="http://www.w3.org/2000/svg" width="23" height="23" style="margin-top:0px;" fill="currentColor" viewBox="0 0 16 16">
<path fill-rule="evenodd" d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2v1z"/>
<path d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466z"/>
</svg>
<svg data-action="close" xmlns="http://www.w3.org/2000/svg" width="20" height="20" style="margin-left:30px;" fill="#f24" class="bi bi-x-circle-fill" viewBox="0 0 16 16">
<path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>
</svg>
</span>`;
document.getElementById("player-control-container").appendChild(sSDiv);


sSDiv.addEventListener("click",(e)=>{
  var el=e.target.closest("[data-action]");
  
  if(!el) return;
  var action=el.dataset.action;
  
  if(action == "close"){
el.parentElement.parentElement.remove();
  }else if(action == "rewind"){
  el.parentElement.parentElement.remove();
  document.getElementsByClassName('video-stream')[0].currentTime=sT+1; 
  }
  
});


setTimeout(()=>{sSDiv.remove();},5000);
}


fDislikes(window.location.href);

// ---- Lightweight update check (notify-only, checks at most once per day) ----
(function checkForAppUpdate(){
  try{
    var lastCheck = parseInt(localStorage.getItem("ytproLastUpdateCheck") || "0");
    var now = Date.now();
    if(now - lastCheck < 24*60*60*1000) return; // once per day max
    localStorage.setItem("ytproLastUpdateCheck", String(now));

    fetch("https://api.github.com/repos/munnakumar678997/tube-edit/releases/latest")
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if(!data || !data.name) return;
        var latest = data.name.replace(/^v/i, "").trim();
        var current = YTProVer;
        if(latest && latest !== current){
          window.Android?.showToast?.("Tube Edit update available: v" + latest + " — check GitHub to download.");
        }
      })
      .catch(()=>{});
  }catch(e){}
})();
checkSponsors(window.location.href);


function ytproOnVideoPageLoad(){

var unV=setInterval(() => {

/*Unmute The Video*/ 
var vEl = document.getElementsByClassName('video-stream')[0];
if(!vEl){ return; }
vEl.muted=false;
vEl.loop = localStorage.getItem("loopVid") === "true";

// The audio is genuinely unmuted above, but YouTube's own "TAP TO UNMUTE"
// banner doesn't know that (it only hides itself in response to its own
// button being tapped) — so just hide the leftover banner ourselves.
var unmuteBanner = ytproFindByText(document.body, "TAP TO UNMUTE");
if(unmuteBanner){
var bannerBox = unmuteBanner.closest('button, [role="button"], div') || unmuteBanner;
bannerBox.style.display = 'none';
}

if(!vEl.muted){
clearInterval(unV);
}

}, 5);

setTimeout(()=>{
var unmuteBanner2 = ytproFindByText(document.body, "TAP TO UNMUTE");
if(unmuteBanner2){
var bannerBox2 = unmuteBanner2.closest('button, [role="button"], div') || unmuteBanner2;
bannerBox2.style.display = 'none';
}
var v2 = document.getElementsByClassName('video-stream')[0];
if(v2) v2.muted = false;
}, 800);

// Preload the mini-player's background feed a couple seconds after a
// video/shorts page loads, so by the time the user swipes down to minimize,
// the feed behind the shrunk video is already loaded (no blank/skeleton flash).
setTimeout(()=>{
if(localStorage.getItem("gesM") == "true"){
try{ ytproCreateMiniIframe(); }catch(e){}
}
}, 3000);

setTimeout(()=>{ try{ ytproApplyPreferredQuality(); }catch(e){} }, 2500);

// ---- Ensure the next video auto-plays when this one ends ----
// (loop is intentionally off, but YouTube's own "autoplay next" sometimes
// doesn't fire, especially while minimized — so we fetch the real "up next"
// video ourselves via the Innertube API and navigate straight to it if
// needed. This is more reliable than trying to click YouTube's own UI.)
// NOTE: this fetch only happens once the video actually ends — not while
// it's playing — so it never competes with the video's own streaming for
// bandwidth/CPU.
async function ytproFetchNextVideoId(){
try{
var vid = new URLSearchParams(window.location.search).get("v") ||
(window.location.pathname.indexOf("shorts") > -1 ? window.location.pathname.split("/shorts/")[1] : null);
if(!vid) return null;

const { Innertube } = await import('https://cdn.jsdelivr.net/npm/youtubei.js@17.0.1/bundle/browser.min.js');
const cookies = window.Android?.getAllCookies?.('https://www.youtube.com') ?? '';
const yt = await Innertube.create({ cookie: cookies, generate_session_locally: true });
const info = await yt.getInfo(vid);

return info?.watch_next_feed?.[0]?.id ||
info?.watch_next_feed?.[0]?.content?.video_id ||
info?.watch_next_feed?.[0]?.content?.id ||
null;
}catch(e){ console.error('[YTPRO] fetch next video failed', e); return null; }
}

var videoEl = document.getElementsByClassName('video-stream')[0];
if(videoEl && !videoEl.__ytproEndedBound){
videoEl.__ytproEndedBound = true;
videoEl.addEventListener('ended', ()=>{
if(localStorage.getItem("loopVid") === "true") return; // user wants this video to loop, leave it alone

setTimeout(async ()=>{
var v = document.getElementsByClassName('video-stream')[0];
// Still sitting on the ended frame after ~2.5s? YouTube's own autoplay
// didn't kick in — fetch and jump straight to the "up next" video.
if(v && v.ended){
try{
var nextId = await ytproFetchNextVideoId();
if(nextId){
var nextUrl = "https://m.youtube.com/watch?v=" + nextId;
window.navigation.navigate(nextUrl);
}
}catch(e){}
}
}, 2500);
});
}

}

if((window.location.pathname.indexOf("watch") > -1) || (window.location.pathname.indexOf("shorts") > -1)){
ytproOnVideoPageLoad();
}

/*Funtion to set Element Styles*/
function sty(e,v){
var s={
display:"flex",
alignItems:"center",
justifyContent:"center",
fontWeight:"550",
height:"65%",
minWidth:"80px",
width:"auto",
borderRadius:"20px",
background:d,
fontSize:"12px",
marginRight:"5px",
textAlign:"center",
};
for(x in s){
e.style[x]=s[x];
}
}


function getGeminiModels(){
var t="";

for(var x in GeminiModels){


t+=`<br>
<button data-action="saveModel" data-value="${x}" ${(x == localStorage.getItem('geminiModel')) ? `style="background:${c};color:${dc};"` : "" } >${x}
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="${c}"  viewBox="0 0 16 16">
<path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"/>
</svg>
</button>`;
}

return t;

}


/*Get Codecs*/
function getYTPROCodecs(){
var t=`<p style="text-align:center;font-size:14px;">This feature is experimental , this may break YTPro if not configured correctly. By default all the codecs are enabled , tap on the buttons below to switch them.</p><br> <vc  style="font-size:14px;">Video Codecs</vc><br>`;

for(var y in YTPROCodecs.video){

var x=YTPROCodecs.video[y];

t+=`<button data-action="setRemoveCodec" data-value="${x}" ${("true" == localStorage.getItem(x)) ? `style="background:${c};color:${dc};"` : "" } >${x}
<svg  ${("true" != localStorage.getItem(x)) ? `style="display:none"` : "" } xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="${dc}"  viewBox="0 0 16 16">
<path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425z"/>
</svg>
</button>`;
}

t+=`<br><br><vc  style="font-size:14px">Audio Codecs</vc><br>`
for(var y in YTPROCodecs.audio){

var x=YTPROCodecs.audio[y];

t+=`<button data-action="setRemoveCodec" data-value="${x}" ${("true" == localStorage.getItem(x)) ? `style="background:${c};color:${dc};"` : "" } >${x}
<svg ${("true" != localStorage.getItem(x)) ? `style="display:none"` : "" } xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="${dc}"  viewBox="0 0 16 16">
<path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425z"/>
</svg>
</button>`;
}

t+=`<br><br>
<div>Block 60FPS <span data-action="block_60fps" style="${sttCnf(0,0,"block_60fps")}" ><b style="${sttCnf(0,1,"block_60fps")}" ></b></span></div> `;

t+=`<br><br><button data-action="done" style="margin-top:10px;width:25%;float:right;text-align:center;background:${c};color:${dc};" >Done</button>`;


return t;

}


function setRemoveCodec(x,y){


if(localStorage[x] == "true"){
localStorage.setItem(x,"false");
y.style.background=isD ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.1)";
y.style.color=c;
y.children[0].style.display="none";
}else{
localStorage.setItem(x,"true");
y.style.background=c;
y.style.color=dc;
y.children[0].style.display="block";
}




}


/*The settings tab*/
async function ytproSettings(){
var ytpSet=document.createElement("div");
var ytpSetI=document.createElement("div");
ytpSet.setAttribute("id","settingsprodiv");
ytpSetI.setAttribute("id","ssprodivI");
ytpSet.setAttribute("style",`
height:100%;width:100%;position:fixed;top:0;left:0;
display:flex;justify-content:center;
background:rgba(0,0,0,0.7);
z-index:9999;
`);
ytpSet.addEventListener("click",
function(ev){

if(!(ev.target == ytpSetI  || ytpSetI.contains(ev.target))){

history.back();
}
});

ytpSetI.setAttribute("style",`
height:65%;width:calc(95% - 20px);overflow:auto;
background:${isD ? "#212121" : "#f1f1f1"};
position:fixed;
bottom:20px;
z-index:99999999999999;padding:10px;text-align:center;border-radius:25px;color:${c};text-align:center;
color:${isD ? "#ccc" : "#444"};`);

ytpSetI.innerHTML=`<style>
@import url('https://fonts.googleapis.com/css2?family=Delius&display=swap');
#settingsprodiv a{text-decoration:underline;} #settingsprodiv li{list-style:none; display:flex;align-items:center;justify-content:center;color:#fff;border-radius:25px;padding:10px;background:#000;margin:5px;}
#ssprodivI div{
height:10px;
width:calc(100% - 20px);
padding:10px;
font-size:1.45rem;
text-align:left;
display:flex;
align-items:center;
position:relative;
margin-top:3px;
}
#ssprodivI div span{
display:block;
height:23px;
width:40px;
border-radius:40px;
right:10px;
position:absolute;
background:#151515;
}
#ssprodivI div span b{
display:block;
height:19px;
width:19px;
position:absolute;
right:2px;
top:2px;
border-radius:50px;
background:#fff;
}
#ssprodivI div input::placeholder{color:${ isD ? "white" : "#000"};}
#ssprodivI div input,#ssprodivI div button{
height:35px;
background:${isD ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.1)"};
width:100%;
border:0;
border-radius:20px;
padding:10px;
font-size:1.25rem;
}
#ssprodivI button{
background:transparent;
font-size:1.45rem;
width:calc(100% - 20px);
height:40px;
color:${isD ? "#ccc" : "#444"};
margin-top:3px;
text-align:left;
}
#ssprodivI button svg{
float:right;
}
#ssprodivI .credit{
font-family: "Delius", cursive;
font-style: normal;
display:flex;
justify-content:center;
align-items:center;
text-align:center;
font-size:1.55rem;
font-weight:bolder;
color:${isD ? "#fff" : "#000"};
position:fixed;
bottom:20px;
width:calc(95% - 20px);
left:calc(2.5% + 0px);
background:${d};
border-radius:0 0 25px 25px;
backdrop-filter:blur(10px);
height:15px;
}
#ssprodivI .geminiModels,#ssprodivI .disableCodecs,#ssprodivI .geminiPrompt{
height:auto;
min-height:100px;
padding-bottom:12px;
background:${isD ? "#212121" : "#f1f1f1"};
position:fixed;
display:block;
width:calc(95% - 20px);
left:calc(2.5% + 0px);
bottom:20px;
z-index:999999;
box-shadow:0px 0px 5px black;
border-radius:25px;
display:none;
}
#ssprodivI .geminiModels:before,#ssprodivI .disableCodecs:before,#ssprodivI .geminiPrompt:before{
height:100%;
width:100%;
background:rgba(0,0,0,.6);
position:fixed;
top:0;
left:0;
z-index:-999;
}
#ssprodivI .geminiPrompt textarea{
height:300px;
width:95%;
border-radius:20px;
padding:15px;
background:${d};
}
#ssprodivI .disableCodecs{
column:50%;
}
#ssprodivI .disableCodecs button{
width:48%;
column:50%;
margin-right:2%;
color:${c};
}
#ssprodivI div.ytproSettingsTabs{
display:flex;
gap:5px;
width:calc(100% - 20px);
height:auto;
margin:10px auto;
padding:5px 0 0 0;
position:sticky;
top:0;
background:${isD ? "#212121" : "#f1f1f1"};
z-index:5;
}
#ssprodivI div.ytproSettingsTabs div{
flex:1;
height:auto;
padding:8px 0;
margin:0;
text-align:center;
justify-content:center;
border-radius:20px;
font-size:13px;
background:transparent;
color:${isD ? "#ccc" : "#444"};
}
#ssprodivI div.ytproSettingsTabs div.active{
background:${c};
color:${dc};
}
#ssprodivI div.ytproSettingsPane{display:none;height:auto;}
#ssprodivI div.ytproSettingsPane.active{display:block;}
#ssprodivI .proxyRow{display:flex;gap:6px;width:calc(100% - 20px);margin:5px auto;}
#ssprodivI .proxyRow input{flex:1;height:35px;border-radius:15px;border:0;padding:0 10px;background:${isD ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.1)"};color:${isD ? "#fff" : "#000"};}
</style>`;
ytpSetI.innerHTML+=`<br><b style='font-size:18px' >Tube Edit Settings</b>
<span style="font-size:10px">v${YTProVer}</span>
<br><br>
<div><input type="url" placeholder="Enter Youtube URL" id="ytproUrlInput" ></div>
<br>

<div class="ytproSettingsTabs">
<div data-tab="playback" class="active">Playback</div>
<div data-tab="downloads">Downloads</div>
<div data-tab="privacy">Privacy</div>
<div data-tab="about">About</div>
</div>

<div class="ytproSettingsPane active" data-pane="playback">
<button data-action="hearts">Liked Videos
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="${isD ? "#ccc" : "#444"}" viewBox="0 0 16 16">
<path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"/>
</svg>
</button>
<br>
<div>Autoskip Sponsors <span data-action="sttCnf" data-value="autoSpn" style="${sttCnf(0,0,"autoSpn")}" ><b style="${sttCnf(0,1,"autoSpn")}"></b></span></div>
<br>
<div>Gesture Controls <span data-action="sttCnf" data-value="gesC" style="${sttCnf(0,0,"gesC")}" ><b style="${sttCnf(0,1,"gesC")}"></b></span></div>
<br>
<div>Miniplayer Gesture <span data-action="sttCnf" data-value="gesM" style="${sttCnf(0,0,"gesM")}" ><b style="${sttCnf(0,1,"gesM")}"></b></span></div>
<br>
<div>Force Zoom <span data-action="sttCnf" data-value="fzoom"  style="${sttCnf(0,0,"fzoom")}" ><b style="${sttCnf(0,1,"fzoom")}" ></b></span></div> 
<br>
<div>Background Play <span data-action="sttCnf" data-value="bgplay" style="${sttCnf(0,0,"bgplay")}" ><b style="${sttCnf(0,1,"bgplay")}" ></b></span></div> 
<br>
<div>Auto PIP on Minimize <span data-action="sttCnf" data-value="autoPip" style="${sttCnf(0,0,"autoPip")}" ><b style="${sttCnf(0,1,"autoPip")}" ></b></span></div> 
<br>
<div style="display:flex;align-items:center;justify-content:space-between;width:calc(100% - 20px);margin:auto;">
<span>Preferred Video Quality</span>
<select id="ytproQualitySelect" style="background:${isD ? "#333" : "#eee"};color:${isD ? "#fff" : "#000"};border:0;border-radius:8px;padding:4px 8px;">
<option value="144p" ${localStorage.getItem("ytproPreferredQuality")==="144p"||!localStorage.getItem("ytproPreferredQuality")?"selected":""}>144p</option>
<option value="240p" ${localStorage.getItem("ytproPreferredQuality")==="240p"?"selected":""}>240p</option>
<option value="360p" ${localStorage.getItem("ytproPreferredQuality")==="360p"?"selected":""}>360p</option>
<option value="480p" ${localStorage.getItem("ytproPreferredQuality")==="480p"?"selected":""}>480p</option>
<option value="720p" ${localStorage.getItem("ytproPreferredQuality")==="720p"?"selected":""}>720p</option>
<option value="Auto" ${localStorage.getItem("ytproPreferredQuality")==="Auto"?"selected":""}>Auto</option>
</select>
</div>
<br>
<div>Hide Shorts <span data-action="sttCnf" data-value="shorts" style="${sttCnf(0,0,"shorts")}" ><b style="${sttCnf(0,1,"shorts")}" ></b></span></div> 
<br>
<div>Use single Gemini chat <span data-action="sttCnf" data-value="saveCInfo" style="${sttCnf(0,0,"saveCInfo")}" ><b style="${sttCnf(0,1,"saveCInfo")}"></b></span></div>
<br>
<div>Loop Current Video <span data-action="sttCnf" data-value="loopVid" style="${sttCnf(0,0,"loopVid")}" ><b style="${sttCnf(0,1,"loopVid")}"></b></span></div>
<br>
<button data-action="sleepTimer">Sleep Timer: <span id="sleepTimerLabel">Off</span>
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="${isD ? "#ccc" : "#444"}" viewBox="0 0 16 16">
<path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"/>
</svg>
</button>
<br>
<button data-action="geminiModels">Select Gemini Model
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="${isD ? "#ccc" : "#444"}" viewBox="0 0 16 16">
<path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"/>
</svg>
</button>
<br>
<button data-action="geminiPrompt">Edit Gemini Prompt
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="${isD ? "#ccc" : "#444"}" viewBox="0 0 16 16">
<path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"/>
</svg>
</button>
</div>

<div class="ytproSettingsPane" data-pane="downloads">
<p style="font-size:13px;text-align:left;width:calc(100% - 20px);margin:auto;color:${isD ? "#aaa" : "#555"}">Open any video's download menu for per-video quality options (including Audio Only). Open a playlist and its download menu will show a "Download Entire Playlist" button.</p>
<br>
<button data-action="disableCodecs">Disable Codecs
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="${isD ? "#ccc" : "#444"}" viewBox="0 0 16 16">
<path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"/>
</svg>
</button>
<br><br>
<div style="display:flex;align-items:center;justify-content:space-between;width:calc(100% - 20px);margin:auto;">
<b style="font-size:14px;">Your downloads</b>
<span data-action="clearDownloadHistory" style="font-size:12px;color:${isD ? "#ccc" : "#444"};text-decoration:underline;">Clear All</span>
</div>
<div id="ytproDownloadHistoryList" style="text-align:left;margin-top:8px;"></div>
</div>

<div class="ytproSettingsPane" data-pane="privacy">
<button data-action="clearBrowsingData">Clear Cookies, Cache &amp; History
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="${isD ? "#ccc" : "#444"}" viewBox="0 0 16 16">
<path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"/>
</svg>
</button>
<br>
<div>Use Proxy <span data-action="sttCnf" data-value="proxyOn" style="${sttCnf(0,0,"proxyOn")}" ><b style="${sttCnf(0,1,"proxyOn")}"></b></span></div>
<p style="font-size:12px;text-align:left;width:calc(100% - 20px);margin:5px auto;color:${isD ? "#aaa" : "#555"}">Point Tube Edit at a proxy/VPN server you already have (host + port) to reach region-locked videos. This app does not provide or operate a proxy itself.</p>
<div class="proxyRow">
<input type="text" id="proxyHostInput" placeholder="Proxy host (e.g. 1.2.3.4)" value="${window.Android?.getSavedProxy?.() ? window.Android.getSavedProxy().split(':')[0] : ''}">
<input type="text" id="proxyPortInput" placeholder="Port" style="max-width:70px;" value="${window.Android?.getSavedProxy?.() ? window.Android.getSavedProxy().split(':')[1] : ''}">
</div>
<button data-action="applyProxy" style="margin-top:5px;">Apply Proxy Settings</button>
<br>
<div>Developer Mode <span data-action="sttCnf" data-value="devMode" style="${sttCnf(0,0,"devMode")}" ><b style="${sttCnf(0,1,"devMode")}"></b></span></div>
</div>

<div class="ytproSettingsPane" data-pane="about">
<div style="text-align:left;width:calc(100% - 20px);margin:auto;">
<b style="font-size:14px;">What's New — v${YTProVer}</b>
<ul style="font-size:12px;color:${isD ? "#bbb" : "#555"};padding-left:18px;margin-top:8px;">
<li>Quick Download tab — reliable direct video/audio/thumbnail download</li>
<li>Download Entire Playlist (bulk download)</li>
<li>Download History &amp; file manager in Downloads tab</li>
<li>Sleep Timer &amp; Loop Current Video in Playback</li>
<li>Cookie/cache/history clear + optional proxy in Privacy</li>
<li>Encrypted local storage, new icon &amp; splash screen</li>
</ul>
</div>
<br>
<p style="font-size:1.25rem;width:calc(100% - 20px);margin:auto;text-align:left"><b style="font-weight:bold">Disclaimer</b>: This is an educational project aimed at showcasing javascript injection into a webview to enhance productivity.
<br><br></p>
<div style="text-align:center;color:#aaa;">Made with ❤ by Munna Agent</div>
</div>

<br><br><br>

<div class="geminiModels">

</div>


<div class="geminiPrompt" style="text-align:center;">

<textarea>
${localStorage.getItem("prompt")}
</textarea>

<button data-action="savePrompt" style="margin-top:10px;width:25%;float:right;text-align:center;background:${c};color:${dc};" >Save</button>
<br><br>
</div>


<div class="disableCodecs">

</div>


`;


document.body.appendChild(ytpSet);
ytpSet.appendChild(ytpSetI);


document.getElementById("ytproUrlInput").addEventListener("keyup",searchUrl);




var actionsList={
  hearts:()=>{
    window.location.hash='#hearts';
  },
  sttCnf:(button,action)=>{
    sttCnf(button,action);
  },
  geminiModels:()=>{
    document.getElementsByClassName('geminiModels')[0].style.display='block';document.getElementsByClassName('geminiModels')[0].innerHTML=getGeminiModels();
  },
  geminiPrompt:()=>{
    document.getElementsByClassName('geminiPrompt')[0].style.display='block';
  },
  disableCodecs:()=>{
    document.getElementsByClassName('disableCodecs')[0].style.display='block';document.getElementsByClassName('disableCodecs')[0].innerHTML=getYTPROCodecs();
  },
  savePrompt:(el)=>{
    localStorage.setItem('prompt',el.previousElementSibling.value);el.parentElement.style.display='none';
  },
  done:(el)=>{
    el.parentElement.style.display='none';
  },
  setRemoveCodec:(el,value)=>{
    setRemoveCodec(value,el)
  },
  block_60fps:(el)=>{
    sttCnf(el,"block_60fps");
  },
  saveModel:(el,value)=>{
    localStorage.removeItem('geminiChatInfo');
    localStorage.setItem('geminiModel',value);
    el.parentElement.style.display='none';
  },
  sleepTimer:()=>{
    var existing = document.getElementById('ytproSleepMenu');
    if(existing){ existing.remove(); return; }

    var menu = document.createElement('div');
    menu.id = 'ytproSleepMenu';
    menu.style.cssText = `position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:${isD ? "#212121" : "#f1f1f1"};border-radius:15px;padding:10px;z-index:999999999999999;box-shadow:0 0 10px rgba(0,0,0,.5);text-align:center;`;

    var options = [["Off",0],["15 min",15],["30 min",30],["45 min",45],["60 min",60]];
    options.forEach(([label,mins])=>{
      var b = document.createElement('button');
      b.textContent = label;
      b.style.cssText = `display:block;width:150px;margin:4px auto;padding:8px;border:0;border-radius:20px;background:${isD ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.1)"};color:${isD ? "#fff" : "#000"};`;
      b.addEventListener('click', ()=>{
        if(window.__ytproSleepTimeout) clearTimeout(window.__ytproSleepTimeout);
        var label2 = document.getElementById('sleepTimerLabel');
        if(mins === 0){
          if(label2) label2.textContent = "Off";
          window.Android?.showToast?.('Sleep timer cancelled');
        } else {
          window.__ytproSleepTimeout = setTimeout(()=>{
            var v = document.getElementsByClassName('video-stream')[0];
            if(v) v.pause();
            Android?.setBgPlay?.(false);
            window.Android?.showToast?.('Sleep timer: playback paused');
            var label3 = document.getElementById('sleepTimerLabel');
            if(label3) label3.textContent = "Off";
          }, mins * 60 * 1000);
          if(label2) label2.textContent = mins + " min";
          window.Android?.showToast?.('Sleep timer set: ' + mins + ' min');
        }
        menu.remove();
      });
      menu.appendChild(b);
    });

    document.body.appendChild(menu);
  },
  clearDownloadHistory:()=>{
    localStorage.setItem("ytproDownloadHistory", "[]");
    var list = document.getElementById("ytproDownloadHistoryList");
    if(list) list.innerHTML = `<p style="font-size:12px;color:${isD ? "#888" : "#777"};">No downloads yet.</p>`;
  },
  clearBrowsingData:()=>{
    window.Android?.clearBrowsingData?.();
  },
  applyProxy:()=>{
    var host=document.getElementById('proxyHostInput').value.trim();
    var port=document.getElementById('proxyPortInput').value.trim() || '8080';
    var enabled = localStorage.getItem('proxyOn') === 'true';
    if(enabled && host){
      window.Android?.setProxy?.(host, port, true);
    } else {
      window.Android?.setProxy?.('', '', false);
    }
  }
}

//buttons and switches
ytpSetI.querySelectorAll("[data-action]").forEach(button =>{
  button.addEventListener("click",()=>{
    
    if(button.dataset.action== "sttCnf"){
    actionsList[button.dataset.action](button,button.dataset.value);
    }else{
    actionsList[button.dataset.action](button);
    }
  })
});

var qualitySelect = ytpSetI.querySelector("#ytproQualitySelect");
if(qualitySelect){
qualitySelect.addEventListener("change", ()=>{
localStorage.setItem("ytproPreferredQuality", qualitySelect.value);
window.Android?.showToast?.("Preferred quality set to " + qualitySelect.value);
});
}

//settings tabs
ytpSetI.querySelector(".ytproSettingsTabs").addEventListener("click",(e)=>{
  var el=e.target.closest("[data-tab]");
  if(!el) return;
  ytpSetI.querySelectorAll(".ytproSettingsTabs div").forEach(t=>t.classList.remove("active"));
  ytpSetI.querySelectorAll(".ytproSettingsPane").forEach(p=>p.classList.remove("active"));
  el.classList.add("active");
  ytpSetI.querySelector(`.ytproSettingsPane[data-pane="${el.dataset.tab}"]`).classList.add("active");
  if(el.dataset.tab === "downloads") renderDownloadHistory();
});

function ytproTimeAgo(ts){
  var diff = Math.floor((Date.now() - ts) / 1000);
  var units = [["year",31536000],["month",2592000],["week",604800],["day",86400],["hour",3600],["minute",60]];
  for(var i=0;i<units.length;i++){
    var val = Math.floor(diff / units[i][1]);
    if(val >= 1) return val + " " + units[i][0] + (val > 1 ? "s" : "") + " ago";
  }
  return "Just now";
}

function ytproFormatDuration(sec){
  sec = Math.floor(sec || 0);
  if(!sec) return "";
  var h = Math.floor(sec/3600), m = Math.floor((sec%3600)/60), s = sec%60;
  var mm = h > 0 ? String(m).padStart(2,"0") : String(m);
  var ss = String(s).padStart(2,"0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

function renderDownloadHistory(){
  var list = ytpSetI.querySelector("#ytproDownloadHistoryList");
  if(!list) return;
  var history = JSON.parse(localStorage.getItem("ytproDownloadHistory") || "[]");

  if(!history.length){
    list.innerHTML = `<p style="font-size:12px;color:${isD ? "#888" : "#777"};text-align:center;">No downloads yet.</p>`;
    return;
  }

  var typeLabel = { video: "Video", audio: "Audio", thumbnail: "Thumbnail", caption: "Caption" };

  list.innerHTML = history.map((item, idx) => `
    <div style="display:flex;align-items:flex-start;padding:8px 4px;border-bottom:1px solid ${isD ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.08)"};">
      <div data-hist-open="${idx}" style="position:relative;flex-shrink:0;width:120px;height:68px;border-radius:8px;overflow:hidden;background:${isD ? "#000" : "#ccc"};">
        ${item.thumb ? `<img src="${item.thumb}" style="width:100%;height:100%;object-fit:cover;">` : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:22px;">${item.type === "audio" ? "🎵" : item.type === "caption" ? "📄" : "🖼️"}</div>`}
        ${item.duration ? `<span style="position:absolute;bottom:3px;right:3px;background:rgba(0,0,0,.8);color:#fff;font-size:9px;padding:1px 4px;border-radius:3px;">${ytproFormatDuration(item.duration)}</span>` : ""}
      </div>
      <div data-hist-open="${idx}" style="flex:1;margin-left:10px;overflow:hidden;">
        <div style="font-size:13px;font-weight:bold;color:${isD ? "#fff" : "#111"};display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;line-height:1.3;">${item.title}</div>
        <div style="font-size:11px;color:${isD ? "#aaa" : "#666"};margin-top:4px;">${typeLabel[item.type] || item.type} · ${ytproTimeAgo(item.date)}</div>
      </div>
      <div data-hist-menu="${idx}" style="flex-shrink:0;padding:6px;font-size:16px;color:${isD ? "#ccc" : "#444"};">⋮</div>
    </div>
    <div id="ytproHistMenu${idx}" style="display:none;justify-content:flex-end;gap:8px;padding:6px 4px;">
      <button data-hist-open="${idx}" style="border:0;border-radius:15px;padding:6px 12px;background:${c};color:${dc};font-size:11px;">Open</button>
      <button data-hist-del="${idx}" style="border:0;border-radius:15px;padding:6px 12px;background:${isD ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.1)"};font-size:11px;">Delete</button>
    </div>
  `).join("");

  list.querySelectorAll("[data-hist-open]").forEach(btn => {
    btn.addEventListener("click", () => {
      var item = history[parseInt(btn.dataset.histOpen)];
      window.Android?.openDownloadedFile?.(item.filename);
    });
  });
  list.querySelectorAll("[data-hist-menu]").forEach(btn => {
    btn.addEventListener("click", () => {
      var menu = document.getElementById("ytproHistMenu" + btn.dataset.histMenu);
      if(menu) menu.style.display = menu.style.display === "flex" ? "none" : "flex";
    });
  });
  list.querySelectorAll("[data-hist-del]").forEach(btn => {
    btn.addEventListener("click", () => {
      history.splice(parseInt(btn.dataset.histDel), 1);
      localStorage.setItem("ytproDownloadHistory", JSON.stringify(history));
      renderDownloadHistory();
    });
  });
}


renderDownloadHistory();



//disable Codecs
ytpSetI.querySelector(".disableCodecs").addEventListener("click",(e)=>{
  var el = e.target.closest("[data-action]");
  if(!el) return;
  
  actionsList[el.dataset.action](el,el.dataset.value);

})


//gemini model selector
ytpSetI.querySelector(".geminiModels").addEventListener("click",(e)=>{
  var el = e.target.closest("[data-action]");
  if(!el) return;
  
  actionsList[el.dataset.action](el,el.dataset.value);

})



}



function searchUrl(e){
  
  
if(e.keyCode === 13 || e === "Enter"){

var url=e.target.value;
const regex = /(?:https?:\/\/)?(?:www\.|m\.)?(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:(?:watch)?\?(?:.*&)?v(?:i)?=|(?:embed|v|vi|shorts|live)\/))([a-zA-Z0-9_-]{11})/;
  
const match = url.match(regex);
var id=match ? match[1] : null;
if(id){
  return navigateInternalYtMweb(id);
}


var a=document.createElement("a");
a.href=url;
document.body.appendChild(a);
try{document.getElementById("settingsprodiv").remove();}catch{}
a.click();

}
}

/* checkUpdates() disabled - auto-update removed */


/*Set Configration*/
function sttCnf(x,z,y){

/*Way too complex to understand*/
if(isD){
var s=["#000","#717171","#fff"];
}else{
var s=["#fff","#909090","#151515"];
}



if(typeof y == "string"){

if(localStorage.getItem(y) != "true"){
if(z == 1){
return `background:${s[0]};left:2px;`;
}else{
return `background:${s[1]};`;
}
}else{
if(z == 1){
return `background:${s[0]};`;
}else{
return `background:${s[2]};`;
}
}
}
if(localStorage.getItem(z) == "true"){
localStorage.setItem(z,"false");
x.style.background=s[1];
x.children[0].style.left="2px";
x.children[0].style.background=s[0];
}
else{
localStorage.setItem(z,"true");
x.style.background=s[2];
x.children[0].style.left="auto";
x.children[0].style.right="2px";
x.children[0].style.background=s[0];
}

if(localStorage.getItem("fzoom") == "false"){
document.getElementsByName("viewport")[0].setAttribute("content","width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no,");
}else{
document.getElementsByName("viewport")[0].setAttribute("content","");
}



if(localStorage.getItem("bgplay") == "true"){
Android.setBgPlay(true);
}else{
Android.setBgPlay(false);
}

Android?.setAutoPip?.(localStorage.getItem("autoPip") !== "false");

if(document.getElementsByClassName('video-stream')[0]){
document.getElementsByClassName('video-stream')[0].loop = localStorage.getItem("loopVid") === "true";
}


if(localStorage.getItem("gesC") != "true"){
try{
document.getElementById("brtS").remove();
document.getElementById("volS").remove();
}catch{}
  
}

if(localStorage.getItem("devMode") == "false"){
try{eruda.destroy();}catch{}
}else if(!window.eruda && localStorage.getItem("devMode") == "true"){
var script = document.createElement('script'); script.src="//youtube.com/ytpro_cdn/npm/eruda"; document.body.appendChild(script); script.onload=()=>{ eruda.init();}
}



}




/*Format File Size*/
function formatFileSize(bytes){
var s=parseInt(bytes);
let ss = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
for (var i=0; s > 1024; i++) s /= 1024;
return `${s.toFixed(1)} ${ss[i]}`;
}

/*Video Downloader*/
async function ytproDownVid(){

window.ytproSabrDownload();

}





function showHideAdaptives(){
var z=document.querySelectorAll(".adpFormats");
z.forEach((x)=>{
if(x.style.display=="none"){
x.style.display="flex";
}else{
x.style.display="none";
}

});

}

/*Add the meme type and extensions lol*/
function downCap(x,t){
Android.downvid(t,x,"plain/text");
}

/*Send to Download Manager*/
function YTDownVid(o,ex){
var mtype="";
if(ex ==".png"){
mtype="image/png";
}else if(ex ==".mp4"){
mtype="video/mp4";
}
else if(ex ==".mp3"){
mtype="audio/mp3";
}

//console.log(o.getAttribute("data-ytprourl"))

Android.downvid((o.getAttribute("data-ytprotit")+ex),o.getAttribute("data-ytprourl"),mtype);
}








var stopProp = false;
var zoomIn=false;
var scale=1;


/*Checks the Direction of the Swipe*/
function checkDirection(e) {
// Once minimized, dragging is handled entirely by ytproMakeDraggable() for
// repositioning only — a vertical swipe here must NOT also restore/resize
// the player (that caused the "jumps to portrait/rotate" glitch).
if(window.ytproIsMinimized) return;

if ((touchendY > touchstartY) && (touchendY - touchstartY > 20)) {
minimize(true);
}else if ((touchendY < touchstartY) && (touchstartY - touchendY > 20)) {
minimize(false);
//console.log((touchstartY - touchendY ))
}else if(window.__ytproDragProgress){
// Drag didn't reach the threshold — smoothly snap back to full size
// instead of leaving it stuck at a partial scale.
var player = document.getElementById("player-container-id");
if(player){
player.style.transition = 'transform .25s ease';
player.style.transform = 'scale(1)';
}
}
window.__ytproDragProgress = 0;
}

/*for zoom in and out*/
function getDistance(touches) {
const [a, b] = touches;
return Math.hypot(b.pageX - a.pageX, b.pageY - a.pageY);
}



/*touch start*/
document.body.addEventListener('touchstart', e => {
touchstartY = e.changedTouches[0].screenY;
if (e.touches.length === 2) {
initialDistance = getDistance(e.touches);
}
}, { capture: true });




/*touch move*/
document.body.addEventListener('touchmove', (e) => {


if(stopProp){
e.stopPropagation();
}

if (e.touches.length === 2 && initialDistance !== null) {
const currentDistance = getDistance(e.touches);
const z = currentDistance / initialDistance;

stopProp=true;


if((e.target.className.toString().includes("video-stream") || e.target.className.toString().includes("player-controls-background")) && document.fullscreenElement){

if (z > 1.05) {
var Vv=document.getElementsByClassName('video-stream')[0];
zoomIn=true;
scale=Math.max((screen.height / Vv.offsetHeight) , (screen.width / Vv.offsetWidth)); 
addMaxButton();
} else if (z < 0.95) {
zoomIn=false;
scale=1;
addMaxButton();
}
}



}

// Live drag-follow for swipe-down-to-minimize: track the finger in real
// time instead of only snapping on release (fixes the "jhatka" feeling).
if(e.touches.length === 1 && !window.ytproIsMinimized && !document.fullscreenElement && localStorage.getItem("gesM") == "true"){
var tgt = e.target;
if(tgt.className && (tgt.className.toString().includes("video-stream") || tgt.className.toString().includes("player-controls-background"))){
var dy = e.touches[0].screenY - touchstartY;
if(dy > 0){
var player = document.getElementById("player-container-id");
if(player){
var progress = Math.min(dy / 260, 1);
player.style.transition = 'none';
player.style.transform = `scale(${1 - progress*0.35})`;
window.__ytproDragProgress = progress;
}
}
}
}
},{capture:true});






/*touch end*/
document.body.addEventListener('touchend', e => {


touchendY = e.changedTouches[0].screenY;

if((e.target.className.toString().includes("video-stream") || e.target.className.toString().includes("player-controls-background")) && !document.fullscreenElement && localStorage.getItem("gesM") == "true"){
checkDirection();
}

if (e.touches.length < 2) {
initialDistance = null; // reset

setTimeout(()=>{
stopProp=false;
},500)

}

}, { capture: true });





navigation.addEventListener("navigate", e => {
if(e.destination.url.indexOf("watch") > -1 || e.destination.url.indexOf("shorts") > -1){
  dislikes="...";
fDislikes(e.destination.url);
checkSponsors(e.destination.url);
// Re-run unmute/miniplayer-preload/quality-automation for THIS video too —
// these previously only ran once on the very first page load and never
// again after switching videos via in-page (SPA) navigation.
setTimeout(()=>{ try{ ytproOnVideoPageLoad(); }catch(e){} }, 400);
}else{
// Remember the last non-video page the user was on (home feed, search
// results, a channel page, etc.) so the miniplayer can restore exactly
// that page instead of always falling back to the homepage.
try{ sessionStorage.setItem("ytproLastFeedUrl", e.destination.url); }catch(err){}
}
});


/*minimize function to mini the video*/
function ytproCreateMiniIframe(){

if(document.getElementById("miniIframe")) return document.getElementById("miniIframe");

var iframe=document.createElement("iframe");
iframe.setAttribute("id",`miniIframe`);
iframe.setAttribute("style",`
height:99.999%;width:100%;
background:${c};
top:0px;
line-height:50px;
position:fixed;
left:0;
z-index:999;
border:0;
display:none;
`);


iframe.src = sessionStorage.getItem("ytproLastFeedUrl") || "https://m.youtube.com/";
iframe.dataset.loadedUrl = iframe.src;
document.body.appendChild(iframe);


var iwindow = iframe.contentWindow || iframe.contentDocument.defaultView;
var doc = iwindow.document;

if (doc.readyState  == 'complete' ) {
if (iwindow.trustedTypes && iwindow.trustedTypes.createPolicy && !iwindow.trustedTypes.defaultPolicy) {
iwindow.trustedTypes.createPolicy('default', {createHTML: (string) => string,createScriptURL: string => string, createScript: string => string, });
}
}

iwindow.navigation.addEventListener("navigate", e => {
if(e.destination.url.indexOf("youtube.com") > -1){
if(e.destination.url.indexOf("/watch") > -1 || e.destination.url.indexOf("/shorts") > -1){
// Use the top page's own SPA navigation instead of a hard reload
// (window.location.href) — a full reload was causing a black-screen
// flash when tapping a video inside the minimized background page.
try{
window.navigation.navigate(e.destination.url);
}catch(err){
window.location.href=e.destination.url;
}
// Close the miniplayer since we're now switching to this new video.
try{ minimize(false); }catch(err){}
}
var script = doc.createElement("script");
var scriptSource=`window.addEventListener('DOMContentLoaded', function() {
var script2 = document.createElement('script');
script2.src="//youtube.com/ytpro_cdn/npm/ytpro";
document.body.appendChild(script2);
});
`;
}
else{
window.location.href=e.destination.url;
}


});

var script = doc.createElement("script");
var scriptSource=`window.addEventListener('DOMContentLoaded', function() {
var script2 = document.createElement('script');
script2.src="//youtube.com/ytpro_cdn/npm/ytpro";
document.body.appendChild(script2);
});
`;


var source = doc.createTextNode(scriptSource);
script.appendChild(source);
doc.body.appendChild(script);

return iframe;

}

// (mini-player preload now happens inside ytproOnVideoPageLoad, re-run on every video)

// ---- Preferred playback quality: default 144p, remembers manual changes ----
function ytproFindByText(root, text){
var walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, null);
var node;
while(node = walker.nextNode()){
if(node.children.length === 0 && node.textContent && node.textContent.trim() === text){
return node.closest('[role="button"], button, li, div') || node;
}
}
return null;
}

function ytproFindSettingsGear(playerRoot){
var rect = playerRoot.getBoundingClientRect();
var candidates = playerRoot.querySelectorAll('button, [role="button"]');
for(var el of candidates){
var r = el.getBoundingClientRect();
if(r.width === 0 || r.height === 0) continue;
if(r.width > 60 || r.height > 60) continue; // must be a small icon button, not a big card
var label = (el.getAttribute('aria-label') || el.getAttribute('title') || '').toLowerCase();
if(label.includes('setting') || label.includes('more video') || label.includes('quality') || label.includes('options')){
return el;
}
}
return null;
}

function ytproApplyPreferredQuality(){
// DISABLED: simulating a tap on the video to reveal controls was pausing/
// breaking playback for everyone (a tap on YouTube's video area toggles
// play/pause). This automation isn't safe without deeper access to
// YouTube's own player internals, so it's turned off for now. The user's
// preferred-quality choice is still saved and available if a safer way
// to apply it is found later.
return;
}

// (quality automation now happens inside ytproOnVideoPageLoad, re-run on every video)

// If the user manually picks a quality from YouTube's own menu, remember it.
document.body.addEventListener('click', (e)=>{
var txt = e.target && e.target.textContent && e.target.textContent.trim();
if(txt && /^(144p|240p|360p|480p|720p|1080p|Auto)$/.test(txt)){
localStorage.setItem("ytproPreferredQuality", txt);
}
}, true);


var ytproMiniPos = { corner: 'bottom-right' }; // remembers last chosen corner
window.ytproIsMinimized = false;

function ytproMiniCornerStyle(corner, w, h){
var margin = 12;
var styles = { top:'auto', left:'auto', right:'auto', bottom:'auto' };
if(corner.includes('top')) styles.top = margin + 'px'; else styles.bottom = margin + 'px';
if(corner.includes('left')) styles.left = margin + 'px'; else styles.right = margin + 'px';
return styles;
}

function ytproMakeDraggable(player, overlay){
var dragging = false, startX=0, startY=0, startLeft=0, startTop=0, moved=0;

function onStart(e){
dragging = true;
moved = 0;
var t = e.touches ? e.touches[0] : e;
startX = t.clientX; startY = t.clientY;
var rect = player.getBoundingClientRect();
startLeft = rect.left; startTop = rect.top;
player.style.transition = 'none'; // no lag while actively dragging
}

function onMove(e){
if(!dragging) return;
e.preventDefault();
e.stopPropagation();
var t = e.touches ? e.touches[0] : e;
var dx = t.clientX - startX;
var dy = t.clientY - startY;
moved = Math.max(moved, Math.abs(dx), Math.abs(dy));

player.style.left = (startLeft + dx) + 'px';
player.style.top = (startTop + dy) + 'px';
player.style.right = 'auto';
player.style.bottom = 'auto';
}

function onEnd(e){
if(!dragging) return;
dragging = false;
e.stopPropagation();
player.style.transition = 'top .25s ease, left .25s ease, right .25s ease, bottom .25s ease, transform .3s ease';

// Barely moved? Treat it as a tap — restore to full size (real YouTube's
// mini player expands when tapped, not swiped).
if(moved < 10){
minimize(false);
return;
}

// snap to whichever corner is nearest
var rect = player.getBoundingClientRect();
var midX = rect.left + rect.width/2;
var midY = rect.top + rect.height/2;
var corner = (midY < window.innerHeight/2 ? 'top' : 'bottom') + '-' + (midX < window.innerWidth/2 ? 'left' : 'right');
ytproMiniPos.corner = corner;

var styles = ytproMiniCornerStyle(corner);
Object.assign(player.style, styles);
}

overlay.addEventListener('touchstart', onStart, {passive:true});
overlay.addEventListener('touchmove', onMove, {passive:false});
overlay.addEventListener('touchend', onEnd, {passive:true});
}


function minimize(yes){


var iframe = document.getElementById("miniIframe") || ytproCreateMiniIframe();
var player=document.getElementById("player-container-id");

// Always keep the background pointed at whatever real page the user was
// last on (home feed / search results / channel, etc.) — refresh it only
// if it actually changed, so we don't reload the same page needlessly.
var wantedUrl = sessionStorage.getItem("ytproLastFeedUrl") || "https://m.youtube.com/";
if(iframe.dataset.loadedUrl !== wantedUrl){
iframe.src = wantedUrl;
iframe.dataset.loadedUrl = wantedUrl;
}

// Smooth animated shrink/grow instead of an instant jump.
player.style.transition = 'top .3s ease, left .3s ease, right .3s ease, bottom .3s ease, transform .3s ease, width .3s ease, height .3s ease';

if(yes){

window.ytproIsMinimized = true;
iframe.style.display="block";

var w = Math.round(window.innerWidth * 0.45);
var h = Math.round(w * 9/16);

player.setAttribute("ogTop",getComputedStyle(player).top);

player.style.position = 'fixed';
player.style.width = w + 'px';
player.style.height = h + 'px';
player.style.transform = 'scale(1)';
player.style.zIndex = "9999";
player.style.borderRadius = '10px';
player.style.overflow = 'hidden';
player.style.boxShadow = '0 2px 12px rgba(0,0,0,.5)';

Object.assign(player.style, ytproMiniCornerStyle(ytproMiniPos.corner));

if(!document.getElementById('ytproMiniClose')){
var closeBtn = document.createElement('div');
closeBtn.id = 'ytproMiniClose';
closeBtn.innerHTML = '&#10005;';
closeBtn.style.cssText = 'position:absolute;top:4px;right:4px;width:26px;height:26px;border-radius:50%;background:rgba(0,0,0,.6);color:#fff;font-size:14px;display:flex;align-items:center;justify-content:center;z-index:10001;';
closeBtn.addEventListener('click', (e)=>{
e.stopPropagation();
var v = document.getElementsByClassName('video-stream')[0];
if(v) v.pause();
minimize(false);
});
player.appendChild(closeBtn);
}

if(!document.getElementById('ytproMiniPause')){
var pauseBtn = document.createElement('div');
pauseBtn.id = 'ytproMiniPause';
var v0 = document.getElementsByClassName('video-stream')[0];
pauseBtn.innerHTML = (v0 && v0.paused) ? '&#9658;' : '&#10074;&#10074;';
pauseBtn.style.cssText = 'position:absolute;top:4px;left:4px;width:26px;height:26px;border-radius:50%;background:rgba(0,0,0,.6);color:#fff;font-size:12px;display:flex;align-items:center;justify-content:center;z-index:10001;';
pauseBtn.addEventListener('click', (e)=>{
e.stopPropagation();
var v = document.getElementsByClassName('video-stream')[0];
if(!v) return;
if(v.paused){ v.play(); pauseBtn.innerHTML = '&#10074;&#10074;'; }
else{ v.pause(); pauseBtn.innerHTML = '&#9658;'; }
});
player.appendChild(pauseBtn);
}

// Transparent overlay that captures ALL touches on the mini player itself,
// so our drag/tap gestures never reach YouTube's own internal video/controls
// touch handlers underneath (that conflict was causing the broken half
// black-screen glitch when dragging the minimized player).
if(!document.getElementById('ytproMiniOverlay')){
var overlay = document.createElement('div');
overlay.id = 'ytproMiniOverlay';
overlay.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;z-index:10000;background:transparent;';
player.appendChild(overlay);
ytproMakeDraggable(player, overlay);
}

}else{

window.ytproIsMinimized = false;
var existingClose = document.getElementById('ytproMiniClose');
if(existingClose) existingClose.remove();
var existingPause = document.getElementById('ytproMiniPause');
if(existingPause) existingPause.remove();
var existingOverlay = document.getElementById('ytproMiniOverlay');
if(existingOverlay) existingOverlay.remove();

iframe.style.display="none";


player.style.position = '';
player.style.width = '';
player.style.height = '';
player.style.top=player.getAttribute("ogTop");
player.style.left = '';
player.style.right = '';
player.style.bottom = '';
player.style.transform="scale(1)";
player.style.zIndex="normal";
player.style.borderRadius = '';
player.style.boxShadow = '';

player.removeAttribute("ogTop");


}
}



/*JAVA Callback for AccessToken*/
function callbackSNlM0e(){
return new Promise(resolve => {
callbackSNlM0e.resolve = resolve; 
});
}

/*JAVA Callback for Gemini Response*/
function callbackGeminiClient(){
return new Promise(resolve => {
callbackGeminiClient.resolve = resolve; 
});
}





/*Handles the reponse*/
function handleGeminiResponse(res){


/*Extract the body from the response*/
const getBody=(x)=>{
for(var i in x){
try{
var json=JSON.parse(x[i][2]);
if(json[4]?.[0]?.[0].indexOf("rc_") > -1) return json;
}catch(e){console.log("JSON parse error: "+e);}}
}

/*Modifies the timestamps , to handle them inside the video element*/
const modifyTimestamps=(x)=>{
var html=x;
var hrefs=html.match(/href="([^"]*)"/g) || [];
var urls= [...hrefs].map(url => url.replace(/href="|"/g, ""));
hrefs.forEach((x,i)=>{
var time=new URL(urls[i]).searchParams.get("t");
if(time != null){
html=html.replace(x,`href="javascript:void(0);" onclick="document.getElementsByClassName('video-stream')[0].currentTime='${time}'"`)
}else if(urls[i].indexOf("youtube.com") < 0 && urls[i].indexOf("youtu.be") < 0){
html=html.replace(x,`href="javascript:void(0);" onclick="try{document.getElementsByClassName('video-stream')[0].pause();}catch{}Android.oplink('${urls[i]}')"`)
}
})
return html;
}






/*checks if the object is empty*/
var response=res.stream;

if (response == undefined) return document.getElementById("GeminiResponse").innerHTML=`<center style="margin-top:15px" > An error Occurred while connecting to Gemini`;

var lines=response.split("\n");
var responseJson=JSON.parse(lines[2])


var body=getBody(responseJson) || [];

//console.log(body)

var chat=[];

chat.push(body?.[1]?.[0]);
chat.push(body?.[1]?.[1]);
chat.push(body?.[4]?.[0]?.[0]);

/*Stores the recent chat info*/
localStorage.setItem("geminiChatInfo",chat.toString());


body=body?.[4]?.[0];

var text=body?.[1]?.[0] || "";
text=text.replace(/http:\/\/googleusercontent\.com\/\S+/g,'');
var thoughts = body?.[37]?.[0]?.[0] || null;
var images=[];

for(var i in body?.[12]?.[1]){
var img=body?.[12]?.[1]?.[i]
images.push({
url:img[0][0][0],
alt:img[0][4],
title:img[7][0]
});

text+=`<center><img alt="${img[0][4]}" src="${img[0][0][0]}"></center>`;
}

//console.log(text,"\n\n\n-------- \n\n",thoughts)






let converter = new showdown.Converter();
converter.setFlavor('github');
let html = modifyTimestamps(converter.makeHtml(text));


let thoughtsHtml=(thoughts != null) ? `<button onclick="(this.nextElementSibling.style.height=='auto') ? (this.children[0].style.transform='rotate(-90deg)',this.nextElementSibling.style.height='0') : (this.children[0].style.transform='rotate(90deg)',this.nextElementSibling.style.height='auto');" class="think" >Show Thinking 
<svg xmlns="http://www.w3.org/2000/svg" style="transform:rotate(-90deg);margin-left:10px" width="16" height="16" fill="${isD ? "#ccc" : "#444"}" viewBox="0 0 16 16">
<path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"/>
</svg></button>
<div class="geminiThoughts">
<br>
${converter.makeHtml(thoughts)}


</div><br>` : "";

document.getElementById("GeminiResponse").innerHTML=`<a href="https://gemini.google.com/chat/${chat[0].replace("c_","")}" >Go to the chat</a><br><br>

${thoughtsHtml}



<div class="geminiAnswer">
${html}
</div>
`;


}





/*Main Gemini Function*/
async function geminiInfo(){
if(document.getElementById("GeminiResponse") == null){
var GeminiRes=document.createElement("div");
GeminiRes.setAttribute("style",`min-height:80px;max-height:400px;display:block;height:auto;overflow:scroll;font-weight:400;width:calc(92% - 20px);font-size:14px;padding:10px;position:relative;margin:auto;background:${d};border-radius:15px;margin-bottom:8px;`);
GeminiRes.setAttribute("id","GeminiResponse");


insertAfter(document.getElementById('ytproMainDivE'),GeminiRes);

}else{
var GeminiRes=document.getElementById("GeminiResponse");
}


document.getElementById("GeminiResponse").innerHTML=`
<div class="geminiLoader"></div>`;

var cookies=Android.getAllCookies(window.location.href);

if(cookies.indexOf("__Secure-1PSID=") < 0){
GeminiRes.innerHTML=`
<center style="margin-top:15px">
<span >Sign in to use Gemini<span>
<br><br>
<a href="https://accounts.google.com/ServiceLogin?service=youtube" >
<button style="background:${c};color:${isD ? "#000" : "#fff"};font-weight:500;height:35px;width:90px;border-radius:25px;text-align:center;line-height:35px;">Sign In</button>
</a>
<br><br>

</center>`;

return;

}


/*checks if the user is logged in*/
cookies=cookies.split(";");

var secured="";

cookies.forEach((x)=>{
if(x.indexOf("__Secure-1PSID=") > -1 || x.indexOf("__Secure-1PSIDTS=") > -1)
secured+=x+";";
})



var endpoint="https://gemini.google.com/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate";
var headers=JSON.stringify({
"accept": "*/*",
"accept-language": "en",
"content-type":"application/x-www-form-urlencoded;charset=UTF-8",
"x-goog-ext-525001261-jspb": GeminiModels[localStorage.getItem('geminiModel')], 
"x-same-domain": "1",
"cookie": secured,
"Referer": "https://gemini.google.com/",
"Referrer-Policy": "origin"
});


if(GeminiAT == ""){
Android.getSNlM0e(secured);
GeminiAT=await callbackSNlM0e();

var sd = document.createElement('script');
sd.src="//youtube.com/ytpro_cdn/npm/showdown/dist/showdown.min.js";
document.body.appendChild(sd);

}




var prompt=localStorage.getItem('prompt').replaceAll("{url}",window.location.href).replaceAll("{videoId}",new URL(window.location.href).searchParams.get("v")).replaceAll("{title}",document.getElementsByClassName('slim-video-metadata-header')[0].textContent.replaceAll("|","").replaceAll("\\","").replaceAll("?","").replaceAll("*","").replaceAll("<","").replaceAll("/","").replaceAll(":","").replaceAll('"',"").replaceAll(">","")); 
//`send me details with timestamps and images related to this youtube com video ${}`;
// , including all the aspects and scopes with timestamp , add facts in the analysis as well ,Here's the youtube 



var chat = null;

if(localStorage.getItem("saveCInfo") == "true" && localStorage.getItem("geminiChatInfo") != null){
chat = localStorage.getItem("geminiChatInfo").split(",");
}

const formData = new URLSearchParams();
formData.append("f.req", JSON.stringify([
null,
JSON.stringify([[prompt],null,chat])
]));

formData.append("at", GeminiAT);



Android.GeminiClient(endpoint,headers,formData.toString());
var response=await callbackGeminiClient();

handleGeminiResponse(response);

}


var volSvg=`<svg xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 0 24 24" width="16" focusable="false" aria-hidden="true" style="pointer-events: none;filter:drop-shadow(0px 0px 1px black);position:absolute;top:10%"><path fill="#fff" d="M11.485 2.143 3.913 6.687A6 6 0 001 11.832v.338a6 6 0 002.913 5.144l7.572 4.543A1 1 0 0013 21V3a1.001 1.001 0 00-1.515-.857Zm6.88 2.079a1 1 0 00-.001 1.414 9 9 0 010 12.728 1 1 0 001.414 1.414 11 11 0 000-15.556 1 1 0 00-1.413 0Zm-2.83 2.828a1 1 0 000 1.415 5 5 0 010 7.07 1 1 0 001.415 1.415 6.999 6.999 0 000-9.9 1 1 0 00-1.415 0Z"></path></svg>`;
var brtSvg=`<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="16" viewBox="0 0 24 24" width="16" style="filter:drop-shadow(0px 0px 1px black);position:absolute;top:10%;"><rect fill="none" height="24" width="24"/><path fill="#fff" d="M12,7c-2.76,0-5,2.24-5,5s2.24,5,5,5s5-2.24,5-5S14.76,7,12,7L12,7z M2,13l2,0c0.55,0,1-0.45,1-1s-0.45-1-1-1l-2,0 c-0.55,0-1,0.45-1,1S1.45,13,2,13z M20,13l2,0c0.55,0,1-0.45,1-1s-0.45-1-1-1l-2,0c-0.55,0-1,0.45-1,1S19.45,13,20,13z M11,2v2 c0,0.55,0.45,1,1,1s1-0.45,1-1V2c0-0.55-0.45-1-1-1S11,1.45,11,2z M11,20v2c0,0.55,0.45,1,1,1s1-0.45,1-1v-2c0-0.55-0.45-1-1-1 C11.45,19,11,19.45,11,20z M5.99,4.58c-0.39-0.39-1.03-0.39-1.41,0c-0.39,0.39-0.39,1.03,0,1.41l1.06,1.06 c0.39,0.39,1.03,0.39,1.41,0s0.39-1.03,0-1.41L5.99,4.58z M18.36,16.95c-0.39-0.39-1.03-0.39-1.41,0c-0.39,0.39-0.39,1.03,0,1.41 l1.06,1.06c0.39,0.39,1.03,0.39,1.41,0c0.39-0.39,0.39-1.03,0-1.41L18.36,16.95z M19.42,5.99c0.39-0.39,0.39-1.03,0-1.41 c-0.39-0.39-1.03-0.39-1.41,0l-1.06,1.06c-0.39,0.39-0.39,1.03,0,1.41s1.03,0.39,1.41,0L19.42,5.99z M7.05,18.36 c0.39-0.39,0.39-1.03,0-1.41c-0.39-0.39-1.03-0.39-1.41,0l-1.06,1.06c-0.39,0.39-0.39,1.03,0,1.41s1.03,0.39,1.41,0L7.05,18.36z"/></svg>`;


/*THE 0NE AND 0NLY FUNCTION*/
async function pkc(){

if(window.location.href.indexOf("youtube.com/watch") > -1){


try{
var elm=document.getElementsByTagName("dislike-button-view-model")[0].children[0]; 
elm.children[0].children[0].style.width="auto";
elm.children[0].children[0].style.paddingRight="15px";

if(!document.getElementById("diskl")){
  var diskl=document.createElement("span");
  diskl.setAttribute("id","diskl");
  diskl.innerHTML=dislikes;
  diskl.style.marginLeft="5px";
  
insertAfter(elm.getElementsByClassName("yt-spec-button-shape-next__icon")[0],diskl);

}else{
document.getElementById("diskl").innerHTML=dislikes;
}

}catch(e){}


//Volume and brightness slider 
try{

if(localStorage.getItem("gesC") == "true"){
  

var v= document.getElementById("player-container-id");
var rect=v.getBoundingClientRect();

var elStyle={
height:"70%",
width:rect.width*0.14+"px",
display:"flex",
"flex-direction":"column",
"align-items":"center",
"justify-content":"center",
position:"absolute",
top:"16%", 
right:"0px",
opacity:"0",
//background:"#a57a"
};  
  
  

var el=document.createElement("div");
var elB=document.createElement("div");
elB.setAttribute("id","brtS");
el.setAttribute("id","volS");

Object.assign(el.style,elStyle);
Object.assign(elB.style,elStyle);
elB.style.left="0";

el.innerHTML=`${volSvg}<div style="position:absolute;bottom:5%;left:calc(50% - 1.5px);background:rgba(255,255,255,0.5); height:70%;width:3px;border-radius:3px;color:red;box-shadow:0px 0px 2px black;pointer-events:none" ><div style="background:white;width:100%;height:${vol * 100}%;border-radius:3px;position:absolute;bottom:0;box-shadow:0px 0px 2px black;" id="volIS"></div></div>`;
elB.innerHTML=`${brtSvg}<div style="position:absolute;bottom:5%;left:calc(50% - 1.5px);background:rgba(255,255,255,0.5); height:70%;width:3px;border-radius:3px;color:red;box-shadow:0px 0px 2px black;pointer-events:none" ><div style="background:white;width:100%;height:${brt * 100}%;border-radius:3px;position:absolute;bottom:0;box-shadow:0px 0px 1px black;" id="brtIS"></div></div>`;


if(!document.getElementById("brtS")){
document.getElementById("player-container-id").appendChild(elB);

elB.addEventListener("touchmove",(e)=>{
// Brightness/volume swipe should only apply during real fullscreen playback —
// same as official YouTube. Otherwise it hijacks the swipe-down-to-minimize
// gesture on the small/embedded player (and corrupts the shared touchstartY).
if(!document.fullscreenElement) return;

e.preventDefault();
elB.style.opacity="1";

var diff= touchstartY - e.touches[0].pageY;

if(diff > 0){
brt +=sens;
}else{
brt -=sens;
}

if(brt > 1) brt=1;
if(brt < 0) brt =0;

touchstartY=e.touches[0].pageY;

Android.setBrightness(brt);
document.getElementById("brtIS").style.height=brt*100+"%";

},{ passive: false })


//hide the element after touch endas
elB.addEventListener("touchend",(e)=>{
elB.style.opacity="0";
},{ passive: false });

}





if(!document.getElementById("volS")){
document.getElementById("player-container-id").appendChild(el);

el.addEventListener("touchmove",(e)=>{
if(!document.fullscreenElement) return;

e.preventDefault();
el.style.opacity="1";

var diff= touchstartY - e.touches[0].pageY;

if(diff > 0){
vol +=sens;
}else{
vol -=sens;
}

if(vol > 1) vol=1;
if(vol < 0) vol =0;

touchstartY=e.touches[0].pageY;

Android.setVolume(vol);
document.getElementById("volIS").style.height=vol * 100 +"%";

},{ passive: false })



//hide the element after touch endas , yes endas
el.addEventListener("touchend",(e)=>{
el.style.opacity="0";
},{ passive: false });

}

}


  
}catch(e){
  console.log(e)
}











/*Check If Element Already Exists*/
if(document.getElementById("ytproMainDivE") == null){



var ytproMainDivA=document.createElement("div");
ytproMainDivA.setAttribute("id","ytproMainDivE");
ytproMainDivA.setAttribute("style",`
height:50px;width:100%;display:block;overflow:auto;
`);

insertAfter(document.getElementsByClassName('slim-video-action-bar-actions')[0],ytproMainDivA);

var ytproMainDiv=document.createElement("div");
ytproMainDiv.setAttribute("style",`
height:50px;width:100%;display:flex;overflow:auto;
align-items:center;justify-content:center;padding-left:20px;padding-right:10px;
`);
ytproMainDivA.appendChild(ytproMainDiv);

/*Gemini Button*/
var ytproGemini=document.createElement("div");
sty(ytproGemini);
ytproGemini.style.width="115px";
ytproGemini.style.height="calc(65% - 4.5px)";
ytproGemini.style.position="relative";
ytproGemini.style.background=`linear-gradient(${isD ? "#272727,#272727" : "#f2f2f2,#f2f2f2"}) padding-box , linear-gradient(16deg ,#4285f4 ,#9b72cb ,#d96570) border-box`;
ytproGemini.style.border="2px solid transparent";
ytproGemini.innerHTML=`
<svg style="height:16px;width:16px" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M16 8.016A8.522 8.522 0 008.016 16h-.032A8.521 8.521 0 000 8.016v-.032A8.521 8.521 0 007.984 0h.032A8.522 8.522 0 0016 7.984v.032z" fill="url(#prefix__paint0_radial_980_20147)"/><defs><radialGradient id="prefix__paint0_radial_980_20147" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="matrix(16.1326 5.4553 -43.70045 129.2322 1.588 6.503)"><stop offset=".067" stop-color="#9168C0"/><stop offset=".343" stop-color="#5684D1"/><stop offset=".672" stop-color="#1BA1E3"/></radialGradient></defs></svg>
<span style="margin-left:4px">Gemini</span>
<style type="text/css">
#GeminiResponse img{
max-width:90%;
height:auto;
border-radius:10px;
margin-top:5px;
}
#GeminiResponse a{
color:rgb(62,166,255);
}
.geminiLoader,.geminiLoader:before,.geminiLoader:after{
content:'';
height:10px;
width:70%;
position:absolute;
top:15px;
border-radius:5px;
left:10px;
background:${d};
animation: geminiLoad 1s linear infinite alternate;
}
.geminiLoader:before{
top:27px;
left:0;
}
.geminiLoader:after{
top:54px;
left:0;
width:90%;
}
@keyframes geminiLoad{
0% {
opacity:1;
}
100% {
opacity:.4;
}
}
.geminiThoughts{
height:0;
width:calc(100% - 30px);
transition:5s;
float:left;
overflow:hidden;
padding-left:5px;
font-style:italic;
border-left:3px solid ${d};
display:block;
float:none;
clear:both;
}
.geminiAnswer{
height:auto;
width:100%;
display:block;
float:none;
clear:both;
}
#GeminiResponse .think{
background:transparent;
font-size:1.45rem;
width:calc(100% - 20px);
height:20px;
color:${isD ? "#ccc" : "#444"};
margin-top:3px;
text-align:left;
display:flex;
padding-left:5px;
border-left:3px solid ${d};
}
</style>
`;






ytproMainDiv.appendChild(ytproGemini);


ytproGemini.addEventListener("click",
async function(){




geminiInfo();


});











/*Heart Button*/
var ytproFavElem=document.createElement("div");
sty(ytproFavElem);
if(!isHeart()){
ytproFavElem.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none"/><path fill="${c}" d="M19.66 3.99c-2.64-1.8-5.9-.96-7.66 1.1-1.76-2.06-5.02-2.91-7.66-1.1-1.4.96-2.28 2.58-2.34 4.29-.14 3.88 3.3 6.99 8.55 11.76l.1.09c.76.69 1.93.69 2.69-.01l.11-.1c5.25-4.76 8.68-7.87 8.55-11.75-.06-1.7-.94-3.32-2.34-4.28zM12.1 18.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"/></svg><span style="margin-left:8px">Heart<span>`;
}else{
ytproFavElem.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none"/><path fill="${c}" d="M13.35 20.13c-.76.69-1.93.69-2.69-.01l-.11-.1C5.3 15.27 1.87 12.16 2 8.28c.06-1.7.93-3.33 2.34-4.29 2.64-1.8 5.9-.96 7.66 1.1 1.76-2.06 5.02-2.91 7.66-1.1 1.41.96 2.28 2.59 2.34 4.29.14 3.88-3.3 6.99-8.55 11.76l-.1.09z"/></svg><span style="margin-left:8px">Heart<span>`;
}
ytproMainDiv.appendChild(ytproFavElem);
ytproFavElem.addEventListener("click",()=>{ytProHeart(ytproFavElem);});



/*Download Button*/
var ytproDownVidElem=document.createElement("div");
sty(ytproDownVidElem);
ytproDownVidElem.style.width="140px";
ytproDownVidElem.innerHTML=`${downBtn.replace('width="18"','width="24"').replace('height="18"','height="24"')}<span style="margin-left:2px">Download<span>`;
ytproMainDiv.appendChild(ytproDownVidElem);
ytproDownVidElem.addEventListener("click",
function(){
window.location.hash="download";
});

/*PIP Button*/
var ytproPIPVidElem=document.createElement("div");
sty(ytproPIPVidElem);
ytproPIPVidElem.style.width="140px";
ytproPIPVidElem.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" height="22" viewBox="0 0 24 24" width="22"><path fill="${c}" d="M18 7h-6c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V8c0-.55-.45-1-1-1zm3-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 1.98 2 1.98h18c1.1 0 2-.88 2-1.98V5c0-1.1-.9-2-2-2zm-1 16.01H4c-.55 0-1-.45-1-1V5.98c0-.55.45-1 1-1h16c.55 0 1 .45 1 1v12.03c0 .55-.45 1-1 1z"/></svg><span style="margin-left:8px">PIP Mode<span>`;
ytproMainDiv.appendChild(ytproPIPVidElem);
ytproPIPVidElem.addEventListener("click",
function(){
PIPlayer(true);
});





}





}else if(window.location.href.indexOf("youtube.com/shorts") > -1){


let b = document.getElementById("brtS");
let v = document.getElementById("volS");
if (b) b.remove();
if (v) v.remove();


if(document.getElementById("ytproMainSDivE") == null){
var ys=document.createElement("div");
ys.setAttribute("id","ytproMainSDivE");
ys.setAttribute("style",`width:50px;height:auto;position:relative;display:block;`);


/*Download Button*/
ysDown=document.createElement("div");
ysDown.setAttribute("style",`
height:48px;width:48px;display:flex;align-items:center;justify-content:center;
filter:drop-shadow(0 0 1px #0009);
border-radius:50%;
`);
ysDown.innerHTML=downBtn.replaceAll(`${c}`,`#fff`).replace(`width="24"`,`width="30"`).replace(`height="24"`,`height="30"`);


ysDown.addEventListener("click",
function(){
window.location.hash="download";
});


/*Heart Button*/
ysHeart=document.createElement("div");
ysHeart.setAttribute("style",`
height:48px;width:48px;
display:flex;align-items:center;justify-content:center;
filter:drop-shadow(0 0 1px #0009);
border-radius:50%;margin-bottom:0px;
`);


if(!isHeart()){
ysHeart.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none"/><path fill="#fff" d="M19.66 3.99c-2.64-1.8-5.9-.96-7.66 1.1-1.76-2.06-5.02-2.91-7.66-1.1-1.4.96-2.28 2.58-2.34 4.29-.14 3.88 3.3 6.99 8.55 11.76l.1.09c.76.69 1.93.69 2.69-.01l.11-.1c5.25-4.76 8.68-7.87 8.55-11.75-.06-1.7-.94-3.32-2.34-4.28zM12.1 18.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"/></svg>`;
}else{
ysHeart.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none"/><path fill="#fff" d="M13.35 20.13c-.76.69-1.93.69-2.69-.01l-.11-.1C5.3 15.27 1.87 12.16 2 8.28c.06-1.7.93-3.33 2.34-4.29 2.64-1.8 5.9-.96 7.66 1.1 1.76-2.06 5.02-2.91 7.66-1.1 1.41.96 2.28 2.59 2.34 4.29.14 3.88-3.3 6.99-8.55 11.76l-.1.09z"/></svg>`;
}


ysHeart.addEventListener("click",
function(){
ytProHeart(ysHeart);
});





try{
  
  if(document.getElementsByClassName("reel-player-overlay-actions")[0].children[0]){
  
document.getElementsByClassName("reel-player-overlay-actions")[0].insertBefore(ys,document.getElementsByClassName("reel-player-overlay-actions")[0].children[1]);

ys.appendChild(ysDown);
ys.appendChild(ysHeart);
}
}catch{}

}

try{document.querySelectorAll('dislike-button-view-model')[0].children[0].children[0].children[0].children[1].children[0].innerHTML=dislikes;}catch{}





/*Watch The old and New URL*
if(ytoldV != window.location.pathname){
fDislikes();
ytoldV=window.location.pathname;
}*/


}

}


setInterval(pkc,0);





/*SHOW HEARTS*/
async function showHearts(){
var ytproH=document.createElement("div");
var ytproHh=document.createElement("div");
ytproHh.setAttribute("id","heartytprodiv");
ytproH.setAttribute("id","outerheartsdiv");
ytproH.setAttribute("style",`
height:100%;width:100%;position:fixed;top:0;left:0;
display:flex;justify-content:center;
background:rgba(0,0,0,0.4);
z-index:99;
`);

ytproHh.setAttribute("style",`
height:50%;width:85%;overflow:auto;background:${isD ? "#212121" : "#f1f1f1"};
position:absolute;bottom:20px;
z-index:9;padding:20px;text-align:center;border-radius:25px;text-align:center;
`);
ytproHh.innerHTML=`<style>#heartytprodiv a{text-decoration:none;} #heartytprodiv li{list-style:none; display:flex;align-items:center;border-radius:15px;padding:0px;background:${d};margin:5px;}</style>`;
ytproHh.innerHTML+="Liked Videos<ul id='listurl'>";


ytproHh.innerHTML+="<style>.thum{height:70px;border-radius:5px;}.thum img{float:left;height:70px;width:125px;border-radius:15px 0 0 15px;flex-shrink: 0;}</style>";

document.body.appendChild(ytproH);
ytproH.appendChild(ytproHh);

ytproH.addEventListener("click",
function(ev){
if(!event.composedPath().includes(ytproHh)){
history.back();
}
});



if(localStorage.getItem("hearts") == null){
ytproHh.innerHTML+="No Videos Found";
}else{

var v=JSON.parse(localStorage.getItem("hearts"));

if(Object.keys(v).length === 0){
return ytproHh.innerHTML+="No Videos Found";
}

for(var n=Object.keys(v).length - 1; n >  -1 ; n--){
var x=Object.keys(v)[n];
ytproHh.innerHTML+=`<li class="thum" >
<img data-action="navigateInternalYtMweb" data-id="${x}" src="${v[x].thumb}" ><br>
<div style="width:calc(100% - 170px);margin-left:5px;overflow:hidden;display:-webkit-box;-webkit-box-orient:vertical; -webkit-line-clamp:3;overflow:hidden;text-overflow:ellipsis;" data-action="navigateInternalYtMweb" data-id="${x}" >${v[x].title}</div>
<div style="width:calc(100% - (100% - 35px))">
<svg data-action="remHeart" data-id="${x}" xmlns="http://www.w3.org/2000/svg" width="20" height="20" style="margin-left:0px;" fill="#f24" class="bi bi-x-circle-fill" viewBox="0 0 16 16">
<path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>
</svg>
</span>
</div>
</li>`;
await new Promise(r => setTimeout(r, 1));
}


ytproHh.addEventListener("click",(e)=>{
  var el=e.target.closest("[data-action]");
  
  if(!el) return;
  if(el.dataset.action == "navigateInternalYtMweb"){
    navigateInternalYtMweb(el.dataset.id);
  }else if(el.dataset.action == "remHeart"){
    remHeart(el,el.dataset.id);
  }
  
});

}





}


function navigateInternalYtMweb(videoId) {
    window.location.hash="";
    const link = document.createElement('a');
    link.href = `/watch?v=${videoId}`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    link.remove();
}


/*Dil hata diya vro*/
function remHeart(y,x){
if(localStorage.getItem("hearts")?.indexOf(x) > -1){
y.parentElement.parentElement.remove();
var j=JSON.parse(localStorage.getItem("hearts") || "{}");
delete j[x];
localStorage.setItem("hearts",JSON.stringify(j));
}

}

function ytProHeart(x){


var vid=(new URLSearchParams(window.location.search)).get('v') || window.location.pathname.replace("/shorts/","");

var video=document.getElementsByClassName('video-stream')[0];
var canvas = document.createElement('canvas');
canvas.style.width = "1600px"; 
canvas.style.height = "900px";
canvas.style.background="black";
var context = canvas.getContext('2d');

(window.location.pathname.indexOf("shorts") > -1) ? context.drawImage(video,105, 0, 90,160) :  context.drawImage(video,0, 0, 320,180);

var dataURI = canvas.toDataURL('image/jpeg');


if(window.location.pathname.indexOf("shorts") > -1){

var vDetails={
thumb:dataURI,
title:document.getElementsByClassName('ytShortsVideoTitleViewModelShortsVideoTitle')[0].textContent.replaceAll("|","").replaceAll("\\","").replaceAll("?","").replaceAll("*","").replaceAll("<","").replaceAll("/","").replaceAll(":","").replaceAll('"',"").replaceAll(">","")
};

}else{

var vDetails={
thumb:dataURI,
title:document.getElementsByClassName('slim-video-metadata-header')[0].textContent.replaceAll("|","").replaceAll("\\","").replaceAll("?","").replaceAll("*","").replaceAll("<","").replaceAll("/","").replaceAll(":","").replaceAll('"',"").replaceAll(">","")
}

/*
var vDetails={
thumb:[...ytplayer.config.args.raw_player_response?.videoDetails?.thumbnail?.thumbnails].pop().url,
title:ytplayer.config.args.raw_player_response?.videoDetails?.title.replaceAll("|","").replaceAll("\\","").replaceAll("?","").replaceAll("*","").replaceAll("<","").replaceAll("/","").replaceAll(":","").replaceAll('"',"").replaceAll(">","")
};*/

}



var g="16";
var h=`<span style="margin-left:8px">Heart<span>`;
(window.location.href.indexOf('youtube.com/shorts') > -1) ? h=``:h=`<span style="margin-left:8px">Heart<span>`;
(window.location.href.indexOf('youtube.com/shorts') > -1) ? g="24" : g="24" ;



if(localStorage.getItem("hearts")?.indexOf(vid) > -1){
var j=JSON.parse(localStorage.getItem("hearts") || "{}");
delete j[vid];
localStorage.setItem("hearts",JSON.stringify(j));
x.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" width="${g}" height="${g}" fill="${(window.location.href.indexOf('youtube.com/shorts') > -1) ? "#fff" : c }" viewBox="0 0 24 24">
<path d="M0 0h24v24H0V0z" fill="none"/><path fill="${(window.location.href.indexOf('youtube.com/shorts') > -1) ? "#fff" : c }" d="M19.66 3.99c-2.64-1.8-5.9-.96-7.66 1.1-1.76-2.06-5.02-2.91-7.66-1.1-1.4.96-2.28 2.58-2.34 4.29-.14 3.88 3.3 6.99 8.55 11.76l.1.09c.76.69 1.93.69 2.69-.01l.11-.1c5.25-4.76 8.68-7.87 8.55-11.75-.06-1.7-.94-3.32-2.34-4.28zM12.1 18.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"/></svg>${h}`;
}else{
var j=JSON.parse(localStorage.getItem("hearts") || "{}");
j[vid]=vDetails;
localStorage.setItem("hearts",JSON.stringify(j));
x.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" width="${g}" height="${g}" viewBox="0 0 24 24" ><path d="M0 0h24v24H0V0z" fill="none"/><path fill="${(window.location.href.indexOf('youtube.com/shorts') > -1) ? "#fff" : c }" d="M13.35 20.13c-.76.69-1.93.69-2.69-.01l-.11-.1C5.3 15.27 1.87 12.16 2 8.28c.06-1.7.93-3.33 2.34-4.29 2.64-1.8 5.9-.96 7.66 1.1 1.76-2.06 5.02-2.91 7.66-1.1 1.41.96 2.28 2.59 2.34 4.29.14 3.88-3.3 6.99-8.55 11.76l-.1.09z"/></svg>${h}`;
}

}



/*Dil diya hai ya nhi diya!!*/
function isHeart(){

if((localStorage.getItem("hearts")?.indexOf((new URLSearchParams(window.location.search)).get('v'))  > -1)  ||  (localStorage.getItem("hearts")?.indexOf(window.location.pathname.replace("/shorts/",""))  > -1)){
return true;
}else{
return false;

}
}






///PIP MODE CONFIG
var ytproPipOriginalParent = null;
var ytproPipOriginalNextSibling = null;

function removePIP(){

isPIP=false;
pauseAllowed = true;
try{ if(document.fullscreenElement) document.exitFullscreen(); }catch(e){}

var v=document.getElementsByClassName('video-stream')[0];

// Move the video back to exactly where it was in the page before PIP.
if(ytproPipOriginalParent){
  if(ytproPipOriginalNextSibling && ytproPipOriginalNextSibling.parentNode === ytproPipOriginalParent){
    ytproPipOriginalParent.insertBefore(v, ytproPipOriginalNextSibling);
  } else {
    ytproPipOriginalParent.appendChild(v);
  }
  ytproPipOriginalParent = null;
  ytproPipOriginalNextSibling = null;
}

v.style.position = '';
v.style.top = '';
v.style.left = '';
v.style.width = '';
v.style.height = '';
v.style.zIndex = '';
v.style.objectFit = '';
v.style.background = '';

v.pause();
setTimeout(()=>{
v.play();
},5);


}




function PIPlayer(pip = false){
  
var v=document.getElementsByClassName('video-stream')[0];

 
if(pip){

if(v.getBoundingClientRect().height > v.getBoundingClientRect().width){
Android.pipvid("portrait");
}
else{
Android.pipvid("landscape");
}

return;
}


// Move the video element directly under <body>. Several ancestor elements
// in YouTube's own player DOM use CSS transforms, which silently break
// position:fixed (it becomes relative to the transformed ancestor instead
// of the viewport). Re-parenting to <body> guarantees the video actually
// fills the PIP window regardless of what triggered PIP mode.
if(v.parentNode && v.parentNode !== document.body){
  ytproPipOriginalParent = v.parentNode;
  ytproPipOriginalNextSibling = v.nextSibling;
  document.body.appendChild(v);
}

v.style.position = 'fixed';
v.style.top = '0';
v.style.left = '0';
v.style.width = '100vw';
v.style.height = '100vh';
v.style.margin = '0';
v.style.zIndex = '2147483647';
v.style.objectFit = 'contain';
v.style.background = '#000';

try{ v.requestFullscreen().catch(()=>{}); }catch(e){}
v.play();
pauseAllowed = false;
isPIP=true;

}



















// well this is for bypassing the pause function of Youtube when video is in
// PIP mode , its a workaround for now , until i find a proper method
// to allow the pip mode for the video element , like chromium browsers

HTMLMediaElement.prototype.pause = function(){
  
if (pauseAllowed || PIPause) {
return originalPause.apply(this, arguments);
}

if (this.paused) {
this.play().catch(() => {});
}
};









const originalExitFullscreen = document.exitFullscreen;
const originalRequestFullscreen = Element.prototype.requestFullscreen;

//exit full screen
document.exitFullscreen = function (...args) {
 if(!isPIP){ return originalExitFullscreen.apply(this, args);}
};


//request full screen
Element.prototype.requestFullscreen = function (...args) {
var video = document.getElementsByClassName('video-stream')[0];

if(video.getBoundingClientRect().height > video.getBoundingClientRect().width){
Android.fullScreen(true);
}
else{
Android.fullScreen(false);
}

return originalRequestFullscreen.apply(this, args);
};






/*Check The Hash Change*/
window.onhashchange=()=>{
try{document.getElementById("outerdownytprodiv").remove();}catch{}
try{document.getElementById("outerheartsdiv").remove();}catch{}
try{document.getElementById("settingsprodiv").remove();}catch{}
//try{document.querySelector("#ytproDownloadIndicator").remove();}catch{}
//try{document.querySelector("#ytProDownloaderDiv").remove();}catch{}
if(window.location.hash == "#download"){
ytproDownVid();
}else if(window.location.hash == "#settings"){
ytproSettings();
}
else if(window.location.hash == "#hearts"){
showHearts();
}


}



// AdBlocker which removes the ad contents from the fetch requests itself !!
(() => {
const _origFetch = window.fetch;
window.fetch = async function(input, init) {
try {
const url = (typeof input === 'string') ? input : input.url;



//block ad urls
if(url.includes("googleads.g.doubleclick.net") || url.includes("youtube.com/youtubei/v1/player/ad_break") || url.includes("youtube.com/pagead/adview") || url.includes("youtube.com/api/stats/ads")){

//console.log("Blocked",url);
return "";
}else if(url.includes("youtube.com/youtubei/")){


const response = await _origFetch.apply(this, arguments);



try {

const clone = response.clone();
let data = await clone.json();


//older version
if(data?.responseContext?.webResponseContextExtensionData?.webResponseContextPreloadData?.preloadMessageNames?.[0] == "adSlotRenderer" || data?.responseContext?.webResponseContextExtensionData?.webResponseContextPreloadData?.preloadMessageNames?.[0] == "shortsAdsRenderer"){
data={};
}


//remove the ad content
delete data?.adSlots;
delete data?.playerAds;
delete data?.adPlacements;
delete data?.adBreakHeartbeatParams;


//newer version update: 09 Feb , 2026 23:27 IST
delete data?.[0]?.playerResponse?.adSlots;
delete data?.[0]?.playerResponse?.playerAds;
delete data?.[0]?.playerResponse?.adPlacements;
delete data?.[0]?.playerResponse?.adBreakHeartbeatParams;


const newBody = JSON.stringify(data);

// Build new headers (update content-length + content-type)
const newHeaders = new Headers(response.headers);
newHeaders.set("content-length", String(newBody.length));
newHeaders.set("content-type", "application/json");

// Return modified Response
return new Response(newBody, {
status: response.status,
statusText: response.statusText,
headers: newHeaders
});
} catch (e) {
// not JSON, return original
return response;
}



}

return _origFetch.apply(this, arguments);

} catch (e) { /* ignore logging errors */ }

return _origFetch.apply(this, arguments);


};


})();



//modified XHR for the same purpose
const XHR = window.XMLHttpRequest;
const origOpen = XHR.prototype.open;
const origSend = XHR.prototype.send;

XHR.prototype.open = function(method, url, ...rest) {
this._interceptedMethod = method;
this._interceptedUrl = url;
return origOpen.apply(this, [method, url, ...rest]);
};

XHR.prototype.send = function(body) {
// Block certain URLs
if (
this._interceptedUrl.includes("googleads.g.doubleclick.net") ||
this._interceptedUrl.includes("youtube.com/youtubei/v1/player/ad_break") ||
this._interceptedUrl.includes("youtube.com/pagead/adview") ||
this._interceptedUrl.includes("youtube.com/api/stats/ads")
) {
//console.warn("Blocked:", this._interceptedUrl);
return;
}

return origSend.apply(this, arguments);
};












/****** I LOVE YOU <3 *****/
/*YT ADS BLOCKER*/
function adsBlock(){


try{
document.getElementsByClassName('video-stream')[0].removeAttribute('disablepictureinpicture');
}catch{}


/*Block Ads*/
var ads=document.getElementsByTagName("ad-slot-renderer");
for(var x in ads){
try{ads[x].remove();}catch{}
}
try{
document.getElementsByClassName("ad-interrupting")[0].getElementsByTagName("video")[0].currentTime=document.getElementsByClassName("ad-interrupting")[0].getElementsByTagName("video")[0].duration;
document.getElementsByClassName("ytp-ad-skip-button-modern")[0].click();

}catch{}




/*Block Ads*/
try{
document.getElementsByTagName("ytm-promoted-sparkles-web-renderer")[0].remove();
}catch{}
try{
document.getElementsByTagName("ytm-companion-ad-renderer")[0].remove();
}catch{}

/*Remove Open App*/
try{
document.querySelectorAll('a').forEach(a => {
if (a.href.indexOf("intent://") > -1) {
a.style.display = 'none';
}
});
}catch{}
/*Remove Promotion Element*/
try{document.getElementsByTagName("ytm-paid-content-overlay-renderer")[0].style.display="none";}catch{}

/*Hide Shorts*/
if(localStorage.getItem("shorts") == "true"){


for( x in document.getElementsByClassName("big-shorts-singleton")){
try{document.getElementsByClassName("big-shorts-singleton")[x].remove();
}catch{}
}

for( x in document.getElementsByTagName("ytm-reel-shelf-renderer")){
try{document.getElementsByTagName("ytm-reel-shelf-renderer")[x].remove();
}catch{}

for( x in document.getElementsByTagName("ytm-shorts-lockup-view-model")){
try{document.getElementsByTagName("ytm-shorts-lockup-view-model")[x].remove();
}catch{}

}

}
}




}





//Add Maximize Gesture
function addMaxButton(){


var pElem=document.getElementById('player-container-id');
var Ve=document.getElementById('player');
var Vv=document.getElementsByClassName('video-stream')[0];



if(pElem === document.fullscreenElement){


try{
if(zoomIn){
Ve.style.transform=`scale(${scale})`;
}else{
Ve.style.transform="scale(1)";  
}
}catch{}


}else{
try{
Ve.style.transform="scale(1)";
}catch{}
}


}


async function extraSpeed(){
  var el=document.querySelector(".ytwVariableSpeedControllerViewModelButtonContainer");
 if(!el) return;
 
 
const slider = document.getElementById("slider");

if(slider.max==10) return;

slider.max = 10;
slider.ariaValueMax = "10";

slider.addEventListener("input", () => {
  const video = document.querySelector('.video-stream');
  if (video) video.playbackRate = parseFloat(slider.value);
});

if(el.children.length >= 6) el.children[0].remove();

if(!document.getElementById("10xSpeed")){

var elm=document.createElement("ytw-variable-speed-controller-speed-button-view-model");

elm.id="10xSpeed";
elm.className="ytwVariableSpeedControllerSpeedButtonViewModelHost ytwVariableSpeedControllerViewModelPlaybackSpeedButton";


elm.insertAdjacentHTML("beforeend",`<button-view-model class="ytSpecButtonViewModelHost"><button class="ytSpecButtonShapeNextHost ytSpecButtonShapeNextTonal ytSpecButtonShapeNextMono ytSpecButtonShapeNextSizeS ytSpecButtonShapeNextEnableBackdropFilterExperiment" title="" aria-disabled="false" style=""><div class="ytSpecButtonShapeNextButtonTextContent ytSpecButtonShapeNextElevatedContent">10x</div><yt-touch-feedback-shape aria-hidden="true" class="ytSpecTouchFeedbackShapeHost ytSpecTouchFeedbackShapeTouchResponse"><div class="ytSpecTouchFeedbackShapeStroke"></div><div class="ytSpecTouchFeedbackShapeFill"></div></yt-touch-feedback-shape><yt-light-shape aria-hidden="true" class="contribYtLightShapeHost contribYtLightShapeStaticRimLight contribYtLightShapeStaticRimLightTonal" style="--yt-light-wash-opacity: 0; --yt-light-wash-x: 0px; --yt-light-wash-y: 0px; --yt-light-wash-size: 0px;"><div class="contribYtLightShapeStaticWashLight contribYtLightShapeStaticWashLightTonal" style=""></div></yt-light-shape></button></button-view-model>`);

elm.addEventListener("click", () => {
   // document.querySelector('.video-stream').playbackRate = 10;
    slider.value=10;
    slider.dispatchEvent(new Event("input", { bubbles: true }));

});

el.appendChild(elm);


}

}


//https://youtube.com/watch?v=SInH_fP0deQ



/*Mutation Observer*/
//as i have been developing YTPRO for almost 4 years now
//thus it still contains the code which i used when i was a
//totally noob in copy pasting , that time i wasn't aware of
//plenty of things and by which i used `setInterval` instead
//of mutation observer , i shall be optimizing the code in future
//releases but rn only a few code blocks will be in the obesrver

const targetNode = document.body;
const config = { childList: true, subtree: true };

const observer = new MutationObserver(() => {


//speed

extraSpeed(); 
  
//ads Block
adsBlock();


//mE button
addMaxButton();

//settingsTab
addSettingsTab();


try{
var video = document.getElementsByClassName('video-stream')[0];
if(video.getBoundingClientRect().height > video.getBoundingClientRect().width){
Android.fullScreen(true);
}
else{
Android.fullScreen(false);
}}
catch{}


});

// Start observing changes in the body
observer.observe(targetNode, config);





/* updateModel() removed - no more auto-update prompts pointing to original author's repo */





window.onload = function(){ 
/* Auto-update prompt disabled */
};




document.addEventListener('click',(event) => {

let anchor = event.target.closest('a');
if (anchor){


if(anchor.href.includes("www.youtube.com/redirect")){

try{
document.getElementsByClassName('video-stream')[0].pause();
}catch{}

const url=new URL(anchor.href).searchParams.get("q");

setTimeout(()=>{Android.oplink(url)},50);

event.preventDefault();
event.stopPropagation(); 

}


}
},
true);




}
