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

// Setup
var d_ctr = document.createElement('div');
var d_cursor = document.createElement('div');
var d_line = document.createElement('div');
d_ctr.id='archercursor_d_center';
d_cursor.id='archercursor_d_cursor';
d_line.id='archercursor_d_line';
document.body.appendChild(d_ctr);
document.body.appendChild(d_cursor);
document.body.appendChild(d_line);

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
        d_ctr.style.display = 'block';
        d_cursor.style.display = 'block';
        d_line.style.display = 'block';
    }
    if (!active) {
        d_ctr.style.display = 'none';
        d_cursor.style.display = 'none';
        d_line.style.display = 'none';
    }

    d_ctr.style.left = ctrX;
    d_ctr.style.top = ctrY;
    d_cursor.style.left = cursorX;
    d_cursor.style.top = cursorY;

    d_line.style.width=pointPointDist(ctrX,ctrY,cursorX,cursorY)*pointPointDist(ctrX,ctrY,cursorX,cursorY)/2;
    d_line.style.left = ctrX;
    d_line.style.top = ctrY;
    d_line.style.transform = "rotate("+angle+"deg)";
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
