(function(){

var debug = true;
// http://paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
window.log = function(){
  log.history = log.history || [];   // store logs to an array for reference
  log.history.push(arguments);
  if(this.console && debug){
    console.log( Array.prototype.slice.call(arguments) );
  }
};

// Stolen from jQuery
var getElemOffset = function(elem) {
  var box = elem.getBoundingClientRect(), doc = elem.ownerDocument, body = doc.body, docElem = doc.documentElement,
    clientTop = docElem.clientTop || body.clientTop || 0, clientLeft = docElem.clientLeft || body.clientLeft || 0,
    top  = box.top  + (docElem.scrollTop  || body.scrollTop ) - clientTop,
    left = box.left + (docElem.scrollLeft || body.scrollLeft) - clientLeft;

  return { top: top, left: left };
};

// checks if an element is in viewport
var boxInPartialView = function(box) {
    var winH = (window.innerHeight || document.documentElement.clientHeight);
    var winW = (window.innerWidth || document.documentElement.clientWidth);
    var winTop = window.scrollY;
    var winLeft = window.scrollX;

    return (
        box.bottom >= winTop &&
        box.right >= winLeft &&
        box.top <= (winTop + winH) &&
        box.left <= (winLeft + winW)
    );
}

// get the distance between two points
var pointPointDist = function(x1, y1, x2, y2) {
    var x = x1 - x2;
    var y = y1 - y2;
    return Math.sqrt(x*x + y*y);
};

// get the distance between a point and a box
var pointBoxDist = function(x, y, box) {
  var dx = 0;
  var dy = 0;

  //Compute distance to elem in X
  if (x < box.left)
     dx = box.left - x;
  else if (x > box.right)
      dx = box.right - x;

  //Compute distance to elem in Y
  if (y < box.top)
     dy = box.top - y;
  else if (y > box.bottom)
     dy = box.bottom - y;

  return Math.floor(Math.sqrt(dx * dx + dy * dy));
}

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
    //return (dist*dist)/100*scale;
    return (dist)?9999:0;
}

// returns true if a point is inside a link (box)
var isInsideLink = function(x,y,link) {
    //log('link check:',x,y,link);
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

    var l_x1 = link.left,  l_y1 = link.top,
        l_x2 = link.right, l_y2 = link.top,
        l_x3 = link.right, l_y3 = link.bottom,
        l_x4 = link.left,  l_y4 = link.bottom;

    // box top side
    if (lineLineIntersect(x1,y1, x2,y2, l_x1,l_y1, l_x2,l_y2)) return true;
    // box bottom side
    if (lineLineIntersect(x1,y1, x2,y2, l_x4,l_y4, l_x3,l_y3)) return true;
    // box left side
    if (lineLineIntersect(x1,y1, x2,y2, l_x1,l_y1, l_x4,l_y4)) return true;
    // box right side
    if (lineLineIntersect(x1,y1, x2,y2, l_x2,l_y2, l_x3,l_y3)) return true;
    return false;
}

// Configuration Options
var distance_scale=99;

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
var activeDist = false;
var sleep = false;
var cursorX=0;
var cursorY=0;
var ctrX=0;
var ctrY=0;
var targetX=0;
var targetY=0;
var angle=0; // angle between center and cursor
var distance=0; // distance between center and cursor
var selectedIndex=0;
var screenX = window.screenX;
var screenY = window.screenY;
var scroll = false;
var scrollXPos = 0;
var scrollYPos = 0;

// [{top:0, left:0, right:0, bottom:0, a:<anchor>}, ...]
var links = [];

var getLinkPositions = function() {

    var pageLinks = []
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
        }; pageLinks.push(link);
    }
    //log('pageLinks:',pageLinks);
    return pageLinks
}
links = getLinkPositions();
log('links:',links);

var targetLink = null;
var eligibleLinks = []; // list of links that meet criteria

var redraw = function() {

    for (var el in els) {
        if (active && !sleep) {
            els[el].style.display='block';
        }
        else {
            els[el].style.display='none';
        }
    }
    if (!active) return;

    els['center'].style.left = ctrX+'px';
    els['center'].style.top = ctrY+'px';
    els['center'].style.display = 'block';
    els['cursor'].style.left = cursorX+'px';
    els['cursor'].style.top = cursorY+'px';
    els['cursor'].style.display = 'block';
    els['target'].style.left = targetX+'px';
    els['target'].style.top = targetY+'px';
    els['target'].style.display = 'block';

    if (!sleep) {

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
            var curlink=eligibleLinks[l].link;
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

var getTargetLink = function() {

    targetLink = null;
    var numElinks = eligibleLinks.length

    // contain index within available array of eligiblelinks (primarily when using keys to cycle)
    if (selectedIndex >= numElinks) { selectedIndex = 0; }
    if (selectedIndex < 0) { selectedIndex = numElinks - 1; }

    if (numElinks) {
        targetLink = eligibleLinks[selectedIndex].link;
    }
}
var getDistTargetLink = function() {

    targetLink = null;
    var numElinks = eligibleLinks.length

    var distSteps = Math.floor(distance/20); // for every few pixels, we jump to a new link

    if (numElinks) {
        selectedIndex = distSteps%numElinks;
        targetLink = eligibleLinks[selectedIndex].link;
    }
}

var deactivate = function() {

    active = false;
    ctrX = cursorX;
    ctrY = cursorY;
    angle = 0;
    distance = 0;
    screenX = window.screenX;
    screenY = window.screenY;
    redraw();
}

var triggerLink = function() {

    if (targetLink) {
        targetLink.a.click();
    }
}

var activateScroll = function() {
    scroll = true;
    log('scroll mode activated')
}

var deactivateScroll = function() {
    scroll = false;
    log('scroll mode deactivated')
}

var handleKey = function(keycode, state, code) {

    switch(keycode) {
        case 91: // Cmd
            if (state == 'down') {

                // Pressing both CMD keys at the same time deactivates
                if (active) { deactivate(); }

                active = true;
                activeDist = false;
                angle = 0;
                distance = 0;
                eligibleLinks = [];
                selectedIndex = 0;
            }
            else {
                if (!active) { return; }
                deactivate();
                if (!sleep) {
                    triggerLink();
                }
            }
            break;

        case 16: // Shift
            if (state == 'down') {
                if (active) {
                    if (code == 'ShiftLeft') {
                        selectedIndex--;
                    }
                    if (code == 'ShiftRight') {
                        selectedIndex++;
                    }
                    getTargetLink();
                    redraw();
                }
                else {
                    activateScroll();
                }
            }
            else {
                if (scroll) {
                    deactivateScroll();
                }
            }
            break;

        case 13: // ENTER
            if (state == 'down') {
                deactivate();
                triggerLink();
            }
            break;
        case 27: // ESC
        case 32: // SPACE (most likely mapped to default spotlight shortcut in mac)
            deactivate();
            break;

        default:
            // If not a recognized key, deactivate to prevent a sticky cursor
            deactivate();
    }

}

var handleMouseMove = function(x, y, e) {

    cursorX = x;
    cursorY = y;

    // don't do expensive calculations if not active
    if (!active && !scroll) { 
        scrollXPos = x;
        scrollYPos = y;
        return false; 
    }

    // checks if window has moved since starting activation
    if (window.screenX !== screenX || window.screenY != screenY) {
        deactivate();
    }

    var targetCoords = {};
    angle = pointPointAngle(ctrX,ctrY,cursorX,cursorY);
    distance = pointPointDist(ctrX,ctrY,cursorX,cursorY);

    if (!activeDist && distance > 1) {
        activeDist = true;
        ctrX = cursorX;
        ctrY = cursorY;
    }
    if (distance < 50) {
        sleep = true; // sleep avoids computing when the mouse is too near to be precise
        redraw();
        return false;
    }
    else {
        sleep = false;
    }

    targetCoords = getAngleDistPoint(ctrX,ctrY,angle,getScaledDist(distance,distance_scale));
    targetX = targetCoords.x;
    targetY = targetCoords.y;

    log('mouse position:',x,y,'target:',targetX, targetY);

    // link target (default) mode
    if (active) {

        // check for activated links
        eligibleLinks = [];
        for (var i=0; i < links.length; i++) {
            var l = links[i];
            var intersects = lineLinkIntersect(cursorX,cursorY,targetX,targetY,l);
            var inView = boxInPartialView(l);
            if (intersects && inView) {

                // get ctr to link distance
                var dist = pointBoxDist(ctrX, ctrY, l);
                //log('link dist:', dist);
                var elink = {
                    distance: dist,
                    link: l
                }
                //  then insert the link in proper sorted order
                var inserted = false;
                for (var j = 0, len = eligibleLinks.length; j < len; j++) {
                    if (dist < eligibleLinks[j].distance) {
                        eligibleLinks.splice(j, 0, elink);
                        inserted=true;
                        break;
                    }
                }
                if (!inserted) {
                    eligibleLinks.push(elink);
                }

            }
        }
        getDistTargetLink();
        //log('eligibleLinks:',eligibleLinks);

        redraw();
    }

    // Scrolling mode
    if (scroll) {
        // original click and scroll code from https://codepen.io/JTParrett/pen/uzGvy
        var offsetX = scrollXPos - x;
        var offsetY = scrollYPos - y;
        log('scrolling:', scrollXPos, scrollYPos, offsetX, offsetY);
         $(window).scrollTop($(window).scrollTop() + offsetY); 
         $(window).scrollLeft($(window).scrollLeft() + offsetX);
        redraw();
    }
}

var handleMouseClick = function(e) {

    if (!active) { return; }
    log('mousedown:', e);
    if (targetLink) {
        e.preventDefault();
        triggerLink();
    }
}

var handleWindowResize = function(e) {
    log('window resized', e);
    deactivate();
    links=getLinkPositions();
}

var handleWindowBlur = function(e) {
    log('window out of focus, deactivating', e);
    deactivate();
}

// Event Handlers

// Key handlers
document.addEventListener('keydown', function(e){
    var keycode = (e.keyCode ? e.keyCode : e.which);
    handleKey(keycode, 'down', e.code);
}, false);
document.addEventListener('keyup', function(e){
    var keycode = (e.keyCode ? e.keyCode : e.which);
    handleKey(keycode, 'up', e.code);
}, false);

// Mouse handlers
document.addEventListener('mousemove', function(e){
    handleMouseMove(e.pageX, e.pageY, e);
});
document.addEventListener('mousedown', function(e){
    handleMouseClick(e);
});

window.addEventListener('resize', function(e){
    handleWindowResize(e);
});

window.addEventListener('blur', function(e) {
    handleWindowBlur(e);
});

})();
