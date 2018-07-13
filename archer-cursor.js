(function(){
// Stolen from jQuery
var getElemOffset = function(elem) {
  var box = elem.getBoundingClientRect(), doc = elem.ownerDocument, body = doc.body, docElem = doc.documentElement,
    clientTop = docElem.clientTop || body.clientTop || 0, clientLeft = docElem.clientLeft || body.clientLeft || 0,
    top  = box.top  + (docElem.scrollTop  || body.scrollTop ) - clientTop,
    left = box.left + (docElem.scrollLeft || body.scrollLeft) - clientLeft;

  return { top: top, left: left };
};

var pointPointDist = function(x1, y1, x2, y2) {
    var x = x1 - x2;
    var y = y1 - y2;
    return Math.sqrt(x*x + y*y);
};

var pointPointAngle = function(x1, y1, x2, y2) {
	var dx = x1 - x2,
		dy = y1 - y2;
	return Math.atan2(dy,dx) * 180 / Math.PI;
};

var getAngleDistPoint = function(x, y, angle, distance) {
    var result = {};
    result.x = Math.round(Math.cos((angle-180) * Math.PI / 180) * distance + x);
    result.y = Math.round(Math.sin((angle-180) * Math.PI / 180) * distance + y);
    return result;
}

var getScaledDist = function(dist, scale) {
    //return dist*scale;
    return (dist*dist)/100*scale;
}

var isInsideLink = function(x,y,link) {
    //console.log('link check:',x,y,link);
    return (link.left < x && x < link.right) && (link.top < y && y < link.bottom);
}

// Configuration Options
var distance_scale=5;

// Setup
var drawing_elements = ['overlay','center','cursor','line','target','linkbox'];
var els = {}
for (var el in drawing_elements) {
    var name = drawing_elements[el]
    els[name]=document.createElement('div');
    els[name].id='archercursor_d_'+name;
    document.body.appendChild(els[name]);
}

var active = false;
var cursorX=0;
var cursorY=0;
var ctrX=0;
var ctrY=0;
var targetX=0;
var targetY=0;
var angle=0; // angle between center and cursor
var distance=0; // distance between center and cursor

// [{top:0, left:0, right:0, bottom:0, a:<anchor>}, ...]
var links = [];

var as = document.getElementsByTagName('a');
for (var i = 0; i < as.length; i++)
{
    var a = as[i];
    var offset = getElemOffset(a);

    var link = {
        a: a,
        left: offset.left,
        top: offset.top,
        right: offset.left+a.offsetWidth,
        bottom: offset.top+a.offsetHeight
    };
    links.push(link);
}
//console.log('links:',links);

var targetLink = null;

var redraw = function() {

    for (var el in els) {
        if (active) {
            els[el].style.display='block';
        }
        else {
            els[el].style.display='none';
        }
    }
    if (!active) return;

    els['center'].style.left = ctrX;
    els['center'].style.top = ctrY;
    els['cursor'].style.left = cursorX;
    els['cursor'].style.top = cursorY;
    els['target'].style.left = targetX;
    els['target'].style.top = targetY;

    els['line'].style.width=getScaledDist(distance,distance_scale);
    els['line'].style.left = ctrX;
    els['line'].style.top = ctrY;
    els['line'].style.transform = "rotate("+(angle-180)+"deg) translate(0,-50%)";

    if (targetLink) {
        els['linkbox'].style.top=targetLink.top;
        els['linkbox'].style.left=targetLink.left;
        els['linkbox'].style.width=targetLink.right-targetLink.left;
        els['linkbox'].style.height=targetLink.bottom-targetLink.top;
        els['linkbox'].style.display='block';
    }
    else {
        els['linkbox'].style.display='none';
    }
}

var handleKey = function(code, state) {

    // Cmd
    if (code == 91 ) {
        if (state == 'down') {
            active = true; 
            ctrX = cursorX;
            ctrY = cursorY;
            angle = 0;
            distance = 0;
        }
        else {
            active = false;
            ctrX = cursorX;
            ctrY = cursorY;
            angle = 0;
            distance = 0;
        }
        redraw();
    }
}

var handleMouseMove = function(x, y) {

    cursorX = x;
    cursorY = y;

    // don't do expensive calculations if not active
    if (!active) { return false; }

    var targetCoords = {};
    angle = pointPointAngle(ctrX,ctrY,cursorX,cursorY);
    distance = pointPointDist(ctrX,ctrY,cursorX,cursorY);

    targetCoords = getAngleDistPoint(ctrX,ctrY,angle,getScaledDist(distance,distance_scale));
    targetX = targetCoords.x;
    targetY = targetCoords.y;

    console.log('mouse position:',x,y,'target:',targetX, targetY);

    // check for activated links
    targetLink = null;
    for (var i=0; i < links.length; i++) {
        var l = links[i];
        var hit = isInsideLink(targetX,targetY,l);
        if (hit) {
            targetLink = l;
            console.log('link found:',l);
        }
    }

    redraw();
}

var handleMouseClick = function(e) {

    if (!active) { return; }
    //console.log('mousedown:', e);
    if (targetLink) {
        targetLink.a.click();
    }
}


// Event Handlers

// Key handlers
document.addEventListener('keydown', function(e){
    var code = (e.keyCode ? e.keyCode : e.which);
    handleKey(code, 'down');
}, false);
document.addEventListener('keyup', function(e){
    var code = (e.keyCode ? e.keyCode : e.which);
    handleKey(code, 'up');
}, false);

// Mouse handlers
document.addEventListener('mousemove', function(e){
    handleMouseMove(e.pageX, e.pageY);
});
document.addEventListener('mousedown', function(e){
    e.preventDefault();
    handleMouseClick(e);
});

})();
