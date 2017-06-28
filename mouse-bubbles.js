function MouseBubbles(selector) {
    var canvas_el = document.querySelector(selector),
        context = canvas_el.getContext("2d"),
        trigger = canvas_el.parentNode;

    var canvas = {
        w: 0,
        h: 0,
        mouse: {
            x: 0,
            y: 0
        }
    };

    var bubbles_arr = [],
        raf = 0,
        interval;

    var opts = {
        fill: '#4dd6fd',
        speed: {
            min: 4,
            max: 8,
        },
        x_deviation: 2,
        interval_delay: 70,
        lifetime: 1000,     // in milliseconds
        size: {
            min: 1.8,
            max: 40
        }
    };

    /**
     * Sets the canvas
     */
    function setCanvas() {
        canvas.w = canvas_el.parentNode.clientWidth;
        canvas.h = canvas_el.parentNode.clientHeight;

        canvas_el.width = canvas.w;
        canvas_el.height = canvas.h;

        /* bubbles max size */
        opts.size.max = Math.round(Math.sqrt(canvas_el.width));
    }

    /**
     * Start animation
     */
    function startAnimation(event){
        cancelRequestAnimFrame(raf);
        raf = requestAnimFrame(moveBubbles);

        interval = window.setInterval(createBubble, opts.interval_delay);
    }

    /**
     * Stop animation
     */
    function stopAnimation(event){
        // clear canvas
        context.clearRect(0, 0, canvas.w, canvas.h);

        /* clear interval */
        window.clearInterval(interval);

        /**
         *  We must wait for all the bubbles to disapear
         *  before we fully stop the animation frame
         */
        var stop_interval = window.setInterval(function(){
            if(bubbles_arr.length == 0){
                cancelRequestAnimFrame(raf);

                window.clearInterval(stop_interval);

                context.clearRect(0, 0, canvas.w, canvas.h);
            }
        }, opts.interval_delay)
    }

    /**
     * Keep track of mouse coordinates
     */
    function recMouseCoords(event) {
        canvas.mouse = {
            x: event.pageX - trigger.offsetLeft,
            y: event.pageY - trigger.offsetTop
        }
    }

    /**
     * Creates the bubbles
     */
    function createBubble() {
        bubbles_arr.push(bubble());
    }

    /**
     * Create a bubble
     */
    function bubble(){
        return {
            created_at: new Date().getTime(),
            updated_at: new Date().getTime(),
            coords: {
                x: canvas.mouse.x,
                y: canvas.mouse.y,
            },
            x_move: randInt(opts.x_deviation * -1, opts.x_deviation),
            fill: opts.fill,
            size: opts.size.max,
            alpha: 1
        }
    }

    /**
     * Draws the bubbles
     */
    function draw() {
        // clear canvas
        context.clearRect(0, 0, canvas.w, canvas.h);

        var bubble,
            bubbles = [];

        for (var b in bubbles_arr) {
            bubble = bubbles_arr[b];

            context.beginPath();
            context.arc(bubble.coords.x, bubble.coords.y, bubble.size, 0, 2 * Math.PI, false);
            context.fillStyle = bubble.fill;
            context.globalAlpha = bubble.alpha;
            context.fill();
            context.closePath()
        }
    }

    function moveBubbles() {
        raf = requestAnimationFrame(moveBubbles);

        var bubble,
            elapsed_time,
            size,
            velocity,
            opacity;


        for (var b in bubbles_arr) {
            bubble = bubbles_arr[b];

            /* update timestamp */
            bubble.updated_at = new Date().getTime();

            elapsed_time = bubble.updated_at - bubble.created_at;

            if(elapsed_time < opts.lifetime){
                size = opts.size.min + (opts.size.max - opts.size.min) * (elapsed_time / opts.lifetime);
                velocity = opts.speed.min + (opts.speed.max - opts.speed.min) * (elapsed_time / opts.lifetime);
                opacity = (elapsed_time * 2) / opts.lifetime;

                if(opacity > 1){
                    opacity = 1 - (opacity - 1);
                }

                bubble.size = size;
                bubble.coords.y -= velocity;
                bubble.coords.x -= bubble.x_move;
                bubble.alpha = opacity.toFixed(3);
            }else{
                /* remove bubble */
                bubbles_arr.splice(b, 1);
            }
        }

        draw();
    }

    /**
     * Generate a random int within an interval
     */
    randInt = function(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    }

    /**
     * Initializes the application
     */
    function init() {
        setCanvas();

        window.addEventListener('load', function() {
            setCanvas();
        }, false);
        window.addEventListener('resize', function() {
            setCanvas();
        }, false);

        trigger.addEventListener('mouseenter', function(e) {
            startAnimation(e);
        }, false);

        trigger.addEventListener('mouseleave', function(e) {
            stopAnimation(e);
        }, false);

        trigger.addEventListener('mousemove', function(e) {
            recMouseCoords(e);
        }, false);
    }

    init();
}


/*-------------------------- Request Animation Frame -------------------------*/

window.requestAnimFrame = (function() {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

window.cancelRequestAnimFrame = (function() {
    return window.cancelAnimationFrame ||
        window.webkitCancelRequestAnimationFrame ||
        window.mozCancelRequestAnimationFrame ||
        window.oCancelRequestAnimationFrame ||
        window.msCancelRequestAnimationFrame ||
        clearTimeout
})();
