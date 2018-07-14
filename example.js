(function() {

    var numlinks=20; //number of points
    var cont = document.getElementById('link_generator');

    var random = function(min,max) {
        return min + Math.floor(Math.random() * Math.floor(max-min));
    }

    var hasCollision = function(t,l,w,h) {
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

