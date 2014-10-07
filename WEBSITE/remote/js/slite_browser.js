/*
 * This script is for controlling browser specific functions 
 * of the remote control.
 */

thumbnails();

$('#URLBox').change(function() {
	changeURL();
});

$( '#currentSlide' ).mousedown(function(event) {
    //console.log("mousedown at x = " + event.pageX);
    $( "#currentSlide" ).on ("mousemove", touchMove);
    console.log("touchmove bound (probably)");
    // Only turn on laser if we are in laser mode
    if(LASER === interactionType) {
        socket.emit('laserOn');
    } else if(DRAW === interactionType) {
        // recalculate offsets in case window size has changed
        xOffset = currentSlide.offsetLeft;
        yOffset = currentSlide.offsetTop;
        slideWidth = currentSlide.offsetWidth,
        slideHeight = currentSlide.offsetHeight;
        var xPercent = calcOffset(event.pageX, xOffset, slideWidth);
        var yPercent = calcOffset(event.pageY, yOffset, slideHeight);
        //console.log("xPercent: " + xPercent);
        //console.log("yPercent: " + yPercent);
        socket.emit('drawStart',{x:xPercent,
                                 y:yPercent});
    }
});

$( '#currentSlide' ).mouseup(function() {
    $( "#currentSlide" ).off ("mousemove", touchMove);
    // Only turn off laser if we are in laser mode
    if(LASER === interactionType) {
        socket.emit('laserOff');
    } else if(DRAW === interactionType) {
        socket.emit('drawStop');
    }
});

$('#prev').click(function() {
    prevSlide();
});

$('#next').click(function() {
    nextSlide();
});

$('#laser').click(function() {
    // calculate offset of interaction area in case window has been resized
    // since the last time laser was used. 
    xOffset = currentSlide.offsetLeft;
    yOffset = currentSlide.offsetTop;
    slideWidth = currentSlide.offsetWidth;
    slideHeight = currentSlide.offsetHeight;
    
    // if laser is on, turn it off
    if (LASER === interactionType) {
        interactionType = NONE;
        $('#laser').css("background-image", "url(./img/buttonLaser.png)");
        $('#overlay').css("z-index", 0);
        
    // otherwise turn laser on
    } else {
        interactionType = LASER;
        $('#laser').css("background-image", "url(./img/buttonLaser_inverse.png)");
        $('#draw').css("background-image", "url(./img/buttonDraw.png)");
        $('#overlay').css("z-index", 3);
    }
});

$('#draw').click(function() {
    xOffset = currentSlide.offsetLeft;
    yOffset = currentSlide.offsetTop;
    slideWidth = currentSlide.offsetWidth;
    slideHeight = currentSlide.offsetHeight;

    // if draw is on, turn it off
    if (DRAW === interactionType) {
        interactionType = NONE;
        $('#draw').css("background-image", "url(./img/buttonDraw.png)");
        $('#overlay').css("z-index", 0);
        
    // otherwise turn draw on
    } else {
        interactionType = DRAW;
        $('#draw').css("background-image", "url(./img/buttonDraw_inverse.png)");
        $('#laser').css("background-image", "url(./img/buttonLaser.png)");
        $('#overlay').css("z-index", 3);
    }
});

