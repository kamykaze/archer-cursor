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
    result.x = Math.round(Math.cos(angle * Math.PI / 180) * distance + x);
    result.y = Math.round(Math.sin(angle * Math.PI / 180) * distance + y);
    return result;
}

// Setup
var drawing_elements = ['overlay','center','cursor','line','target'];
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
var angle=0;

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

var prevClosest = links[0];

var redraw = function() {
    if (active) {
        els['overlay'].style.display = 'block';
        els['center'].style.display = 'block';
        els['cursor'].style.display = 'block';
        els['line'].style.display = 'block';
    }
    if (!active) {
        els['overlay'].style.display = 'none';
        els['center'].style.display = 'none';
        els['cursor'].style.display = 'none';
        els['line'].style.display = 'none';
    }

    els['center'].style.left = ctrX;
    els['center'].style.top = ctrY;
    els['cursor'].style.left = cursorX;
    els['cursor'].style.top = cursorY;

    els['line'].style.width=pointPointDist(ctrX,ctrY,cursorX,cursorY)*5;
    els['line'].style.left = ctrX;
    els['line'].style.top = ctrY;
    els['line'].style.transform = "rotate("+(angle-180)+"deg) translate(0,-50%)";
}

var handleKey = function(code, state) {

    // Cmd
    if (code == 91 ) {
        if (state == 'down') {
            active = true; 
            ctrX = cursorX;
            ctrY = cursorY;
        }
        else {
            active = false;
        }
        redraw();
    }
}

var handleMouse = function(x, y) {
    cursorX = x;
    cursorY = y;
    angle = pointPointAngle(ctrX,ctrY,cursorX,cursorY);
    redraw();
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
    //console.log('cursor position:', e.pageX, e.pageY, angle);
    handleMouse(e.pageX, e.pageY);
});

})();
