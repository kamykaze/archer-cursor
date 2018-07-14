(function(){
// Stolen from jQuery
var getElemOffset = function(elem) {
  var box = elem.getBoundingClientRect(), doc = elem.ownerDocument, body = doc.body, docElem = doc.documentElement,
    clientTop = docElem.clientTop || body.clientTop || 0, clientLeft = docElem.clientLeft || body.clientLeft || 0,
    top  = box.top  + (docElem.scrollTop  || body.scrollTop ) - clientTop,
    left = box.left + (docElem.scrollLeft || body.scrollLeft) - clientLeft;

  return { top: top, left: left };
};

// get the distance between two points
var pointPointDist = function(x1, y1, x2, y2) {
    var x = x1 - x2;
    var y = y1 - y2;
    return Math.sqrt(x*x + y*y);
};

// calculate the andle (in degrees) between two points
var pointPointAngle = function(x1, y1, x2, y2) {
	var dx = x1 - x2,
		dy = y1 - y2;
	return Math.atan2(dy,dx) * 180 / Math.PI;
};

// get a new point coordinates based on angle and distance of original
// source: https://stackoverflow.com/questions/17456783/javascript-figure-out-point-y-by-angle-and-distance
var getAngleDistPoint = function(x, y, angle, distance) {
    var result = {};
    result.x = Math.round(Math.cos((angle-180) * Math.PI / 180) * distance + x);
    result.y = Math.round(Math.sin((angle-180) * Math.PI / 180) * distance + y);
    return result;
}

// gives a modified distance based on a formula (linear or exponential
var getScaledDist = function(dist, scale) {
    //return dist*scale;
    return (dist*dist)/100*scale;
}

// returns true if a point is inside a link (box)
var isInsideLink = function(x,y,link) {
    //console.log('link check:',x,y,link);
    return (link.left < x && x < link.right) && (link.top < y && y < link.bottom);
}

// returns true if the line from (a,b)->(c,d) intersects with (p,q)->(r,s)
// source: https://stackoverflow.com/questions/9043805/test-if-two-lines-intersect-javascript-function
var lineLineIntersect = function(a,b,c,d,p,q,r,s) {
	var det, gamma, lambda;
	det = (c - a) * (s - q) - (r - p) * (d - b);
	if (det === 0) {
		return false;
	} else {
		lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
		gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
		return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
	}
};

// returns true if line intersects a link (box)
var lineLinkIntersect = function(x1,y1,x2,y2,link) {

    // box top side
    if (lineLineIntersect(x1,y1,x2,y2,link.left,link.top,link.right,link.top)) return true;
    // box bottom side
    if (lineLineIntersect(x1,y1,x2,y2,link.left,link.bottom,link.right,link.bottom)) return true;
    // box left side
    if (lineLineIntersect(x1,y1,x2,y2,link.left,link.top,link.left,link.bottom)) return true;
    // box right side
    if (lineLineIntersect(x1,y1,x2,y2,link.right,link.top,link.right,link.bottom)) return true;
}

// Configuration Options
var distance_scale=7;

// Setup
var drawing_elements = ['overlay','center','cursor','line','target','linkbox','eligiblelinks'];
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
    }; links.push(link);
}
//console.log('links:',links);

var targetLink = null;
var eligibleLinks = []; // list of links that meet criteria

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

    els['center'].style.left = ctrX+'px';
    els['center'].style.top = ctrY+'px';
    els['cursor'].style.left = cursorX+'px';
    els['cursor'].style.top = cursorY+'px';
    els['target'].style.left = targetX+'px';
    els['target'].style.top = targetY+'px';

    els['line'].style.width=getScaledDist(distance,distance_scale)+'px';
    els['line'].style.left = ctrX+'px';
    els['line'].style.top = ctrY+'px';
    els['line'].style.transform = "rotate("+(angle-180)+"deg) translate(0,-50%)";

    if (targetLink) {
        els['linkbox'].style.top=targetLink.top+'px';
        els['linkbox'].style.left=targetLink.left+'px';
        els['linkbox'].style.width=targetLink.right-targetLink.left+'px';
        els['linkbox'].style.height=targetLink.bottom-targetLink.top+'px';
        els['linkbox'].style.display='block';
    }
    else {
        els['linkbox'].style.display='none';
    }
    redrawEligibleLinks();
}

var redrawEligibleLinks = function() {
    // quickly cleanup existing link boxes
    var elinks = els['eligiblelinks'];
    while(elinks.firstChild) { elinks.removeChild(elinks.firstChild); }

    // we use the eligiblelinks div as an overlay to insert boxes representing each link
    if (eligibleLinks.length) {
        elinks.style.display='block';
        var i=0;
        for (l in eligibleLinks) {
            var curlink=eligibleLinks[l];
            var drawb = curlink.drawbox=document.createElement('div');
            drawb.className='target_box';
            drawb.innerHTML=i++;
            drawb.style.top=curlink.top+'px';
            drawb.style.left=curlink.left+'px';
            drawb.style.width=curlink.right-curlink.left+'px';
            drawb.style.height=curlink.bottom-curlink.top+'px';
            drawb.style.lineHeight=curlink.bottom-curlink.top+'px';
            elinks.appendChild(drawb);
        }
    }
    else {
        elinks.style.display='none';
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
    eligibleLinks = [];
    for (var i=0; i < links.length; i++) {
        var l = links[i];
        var hit = isInsideLink(targetX,targetY,l);
        if (hit) {
            targetLink = l;
            console.log('link found:',l);
        }
        var intersects = lineLinkIntersect(ctrX,ctrY,targetX,targetY,l);
        if (intersects) {
            eligibleLinks.push(l);
        }
    }
    console.log('eligibleLinks:',eligibleLinks);

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
