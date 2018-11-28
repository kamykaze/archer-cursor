(function() {

    var numlinks=20; //number of points
    var cont = document.getElementById('link_generator');

    var random = function(min,max) {
        return min + Math.floor(Math.random() * Math.floor(max-min));
    }

    var hasCollision = function(t,l,w,h) {
        // TODO: this doesn't work perfectly
        // If a skinny box crosses through another, but no points end up in the 2nd box, this returns false

        // define 4 points of the box. 
        // If any of them is inside another box, then we have collision
        var x1=l,   y1=t,   // TL
            x2=l+w, y2=t,   // TR
            x3=l+w, y3=t+h, // BR
            x4=l,   y4=t+h; // BL

        if (cont.childNodes.length) {
            for (c in cont.childNodes) {
                var child = cont.childNodes[c];
                var c_x1=child.offsetLeft,                   c_y1=child.offsetTop,                    // TL
                    c_x2=child.offsetLeft+child.offsetWidth, c_y2=child.offsetTop,                    // TR
                    c_x3=child.offsetLeft+child.offsetWidth, c_y3=child.offsetTop+child.offsetHeight, // BR
                    c_x4=child.offsetLeft,                   c_y4=child.offsetTop+child.offsetHeight; // BL

                // we check the four points of the new box against existing child
                if ((c_x1 < x1 && x1 < c_x3) && (c_y1 < y1 && y1 < c_y3)) return true;
                if ((c_x1 < x2 && x2 < c_x3) && (c_y1 < y2 && y2 < c_y3)) return true;
                if ((c_x1 < x3 && x3 < c_x3) && (c_y1 < y3 && y3 < c_y3)) return true;
                if ((c_x1 < x4 && x4 < c_x3) && (c_y1 < y4 && y4 < c_y3)) return true;

                // then the four points of the child against the new box
                if ((x1 < c_x1 && c_x1 < x3) && (y1 < c_y1 && c_y1 < y3)) return true;
                if ((x1 < c_x2 && c_x2 < x3) && (y1 < c_y2 && c_y2 < y3)) return true;
                if ((x1 < c_x3 && c_x3 < x3) && (y1 < c_y3 && c_y3 < y3)) return true;
                if ((x1 < c_x4 && c_x4 < x3) && (y1 < c_y4 && c_y4 < y3)) return true;
            }
        }
        return false;
    }

    var setup = function() {

        var i=0;
        var max_w = cont.offsetWidth;
        var max_h = cont.offsetHeight;
        console.log(max_w);
        while(cont.childNodes.length < numlinks) {
            var random_w = random(60, 200);
            var random_h = random(10, 100);
            var random_t = random(0,max_h-random_h);
            var random_l = random(0,max_w-random_w);
            if (hasCollision(random_t,random_l,random_w,random_h)) {
                continue;
            }
            var link = document.createElement('a');
            link.className='floating_link';
            link.style.width=random_w+'px';
            link.style.height=random_h+'px';
            link.style.lineHeight=random_h+'px';
            link.style.top=random_t+'px';
            link.style.left=random_l+'px';
            link.innerHTML='link '+i;
            link.href='#random'+i;
            i++;
            cont.appendChild(link);
        }
    }

    setup();
})();

