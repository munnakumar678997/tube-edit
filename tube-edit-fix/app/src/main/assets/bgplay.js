/*****YTPRO*******
Version: 3.9.2
Bugfixes: #3 (img onerror hang), #18 (play/pause race), #19 (bgStop logic),
          #20 (handlers called unconditionally in PIP)
*/

if (typeof MediaMetadata === 'undefined') {
window.MediaMetadata = class {
constructor(data = {}) {
this.title = data.title || '';
this.artist = data.artist || '';
this.album = data.album || '';
this.artwork = data.artwork || [];
}
};

}



if (!('mediaSession' in navigator)) {

window.handlers = {};
window.serviceRunning=false;




let _state = 'none';
let _metadata = null;

Object.defineProperty(navigator, 'mediaSession', {
value: {},
configurable: true
});

Object.defineProperty(navigator.mediaSession, 'metadata', {
get() {
return _metadata;
},
set(value) {
bgPlay(value);
_metadata = value;
},
configurable: true
});




navigator.mediaSession.setActionHandler = (action, handler) => {

if (typeof handler === 'function') {
handlers[action] = handler;
}

};




Object.defineProperty(navigator.mediaSession, 'playbackState', {
get() {
return _state;
},
set(value) {

_state = value;

var ytproAud = document.getElementsByClassName('video-stream')[0];
if (!ytproAud) return; // FIX #18: null guard before accessing currentTime

// FIX #18: removed 100ms setTimeout — direct call eliminates race condition
// where rapid play/pause toggles put notification in wrong state
if (value === 'playing') {
Android.bgPlay(ytproAud.currentTime*1000);
} else if (value === 'paused' && (pauseAllowed || PIPause)) {
Android.bgPause(ytproAud.currentTime*1000);
} else if (value === "none") {
// FIX #19: stop service whenever playbackState hits "none", not just off-page
// onPageFinished already handles service stop on navigation, but this covers
// edge cases like YouTube explicitly clearing the media session on its own
if (!(window.location.href.indexOf("youtube.com/watch") > -1 ||
      window.location.href.indexOf("youtube.com/shorts") > -1)) {
Android.bgStop();
window.serviceRunning = false;
}
}

},
configurable: true
});



}




async function bgPlay(info){


if(!(window.location.href.indexOf("youtube.com/watch") > -1 || window.location.href.indexOf("youtube.com/shorts") > -1 )) return;


if(!info) return;


var ytproAud = document.getElementsByClassName('video-stream')[0];


if(!ytproAud) return;


var iconBase64="iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";


var img = new Image();
img.crossOrigin="anonymous";
img.src=info?.artwork?.[0]?.src;


var canvas = document.createElement('canvas');
canvas.style.width = "1600px"; 
canvas.style.height = "900px";
canvas.style.background="black";
var context = canvas.getContext('2d');

canvas.width = 160;
canvas.height  = 90;


// FIX #3: Added img.onerror handler — previously if thumbnail failed to load
// (CORS block, network error), the Promise never resolved and bgPlay hung forever,
// so the notification was never shown. Now we resolve on error using the 1x1 fallback icon.
await new Promise((res,rej)=>{
img.onload=()=>res();
img.onerror=()=>res(); // resolve on error, keep fallback iconBase64
});


try{
context.drawImage(img, 0,0 ,160,90);
iconBase64 = canvas.toDataURL('image/png',1.0);
}catch{}


// FIX #18: removed setTimeout wrappers from bgUpdate/bgStart calls too —
// same race condition risk removed
if(window.serviceRunning){
Android.bgUpdate(iconBase64.replace("data:image/png;base64,", ""),info.title,info.artist,ytproAud.duration*1000);
Android.bgPlay(ytproAud.currentTime*1000);
}
else{
window.serviceRunning=true;
Android.bgStart(iconBase64.replace("data:image/png;base64,", ""),info.title,info.artist,ytproAud.duration*1000);
Android.bgPlay(ytproAud.currentTime*1000);
}


}




/*When user hits the notification*/
function seekTo(t){
// FIX #20: guard — only call handler if it's registered
if(typeof handlers.seekto === 'function') handlers.seekto({ seekTime: t/1000 });
}

/*Daamm , its play*/
function playVideo(){
// FIX #20: in PIP mode (pauseAllowed=false), update state then call handler
// so video actually plays; this is intentional and correct behaviour
if(!pauseAllowed){
window.PIPause = false;
navigator.mediaSession.playbackState = 'playing';
}
// FIX #20: guard — only call if handler registered (prevents crash on race)
if(typeof handlers.play === 'function') handlers.play();
}

/*Daamm , its pause*/
function pauseVideo(){
if(!pauseAllowed){
window.PIPause=true;
navigator.mediaSession.playbackState = 'paused';
}
// FIX #20: guard — only call if handler registered
if(typeof handlers.pause === 'function') handlers.pause();
}



/*Alexa , play da next song*/
async function playNext(){
// FIX #20: guard
if(typeof handlers.nexttrack === 'function') handlers.nexttrack();
}




/*Alexa , play the f**ng song once again */
function playPrev(){
// FIX #20: guard
if(typeof handlers.previoustrack === 'function') handlers.previoustrack();
}
