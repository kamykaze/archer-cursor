(function(){
var bookmarklet_js = 'javascript:'+
'var d=document;'+
'var s=d.createElement("script");'+
's.src="'+location.href+'archer-cursor.js";'+
'd.body.appendChild(s);'+
'var l=d.createElement("link");'+
'l.type="text/css";'+
'l.rel="stylesheet";'+
'l.href="'+location.href+'archer-cursor.css";'+
'd.head.appendChild(l);'+
'void(0);';
document.getElementById("bookmarklet").href=bookmarklet_js
})();
