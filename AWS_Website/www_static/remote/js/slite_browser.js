/* 
 * This script is for controlling browser specific functions 
 * of the remote control.
 */

thumbnails();

$('#URLBox').keypress(function (e) {
	if(e.which == 13) {	
		changeURL();
	}
});

// Adding event handlers to the currentSlide div, the user
// touches this div to draw or move laser
currentSlide.addEventListener('touchstart', touchStart, false);
currentSlide.addEventListener('touchmove', touchMove, false);
currentSlide.addEventListener('touchend', touchEnd, false);

// Touching the control area (the currentSlide div) will turn the
// laser on, making the red dot appear on the presentation.
// But only if we are in laser mode. 
function touchStart(event) {
    event.preventDefault();
    if(LASER === interactionType) {
        socket.emit('laserOn', {slideID: $('#URLSlides').val()});
    } else if (DRAW === interactionType) {
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
                                 y:yPercent , slideID: $('#URLSlides').val()});
    }
};

function touchEnd(event) {
    event.preventDefault();
    if (LASER === interactionType) {
        socket.emit('laserOff');
    } else if (DRAW === interactionType) {
        socket.emit('drawStop');
    }
};

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
        $('#laser').css("background-color", "white");
        $('#overlay').css("z-index", 0);
        
    // otherwise turn laser on
    } else {
        interactionType = LASER;
        $('#laser').css("background-color", "black");
        $('#draw').css("background-color", "white");
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
        $('#draw').css("background-color", "white");
        $('#overlay').css("z-index", 0);
        
    // otherwise turn draw on
    } else {
        interactionType = DRAW;
        $('#draw').css("background-color", "black");
        $('#laser').css("background-color", "white");
        $('#overlay').css("z-index", 3);
    }
});


	
	function getUrlParameter(sParam)
	{
		var sPageURL = window.location.search.substring(1);
		var sURLVariables = sPageURL.split('&');
		for (var i = 0; i < sURLVariables.length; i++) 
		{
			var sParameterName = sURLVariables[i].split('=');
			if (sParameterName[0] == sParam) 
			{
				return sParameterName[1];
			}
		}
	} 

