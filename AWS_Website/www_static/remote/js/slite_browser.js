/* 
 * This script is for controlling browser specific functions 
 * of the remote control.
 */

thumbnails();

//$('#URLBox').keypress(function (e) {
//	if(e.which == 13) {	
//		changeURL();
//	}
//});

/*
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
        socket.emit('laserOn', {slideID: currentHash});
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
                                 y:yPercent , slideID: currentHash});
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
*/

$('#prev').click(function() {
    prevSlideLocal();
});

$('#next').click(function() {
    nextSlideLocal();
});

$('#laser').click(function() {
     // calculate offset of interaction area in case window has been resized
    // since the last time laser was used. 
    // if laser is on, turn it off
    if (LASER === interactionType) {
        interactionType = NONE;
		$('#laser').removeClass("button_pressed");
        $('#laser').addClass("button_unpressed");
        $('#overlay').css("z-index", 0);

    // otherwise turn laser on
    } else {
        interactionType = LASER;
		$('#laser').removeClass("button_unpressed");
        $('#laser').addClass("button_pressed");
        $('#draw').removeClass("button_pressed");
		$('#draw').addClass("button_unpressed");
        $('#overlay').css("z-index", 1);
     }
});

$('#draw').click(function() {
     // if draw is on, turn it off
    if (DRAW === interactionType) {
        interactionType = NONE;
		$('#draw').removeClass("button_pressed");
        $('#draw').addClass("button_unpressed");
        $('#overlay').css("z-index", 0);
        
    // otherwise turn draw on
    } else {
        interactionType = DRAW;
		$('#draw').removeClass("button_unpressed");
        $('#draw').addClass("button_pressed");
        $('#laser').removeClass("button_pressed");
		$('#laser').addClass("button_unpressed");
        $('#overlay').css("z-index", 1);
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

// LASER HANDLING

// offset is used to calculate laser coords
// it is recalculated upon the user pressing 'laser' or 'draw'
//var offset;

function onMouseMove(event) {
    // These lines display the coordinates in the remote control, for testing only
    // var laserCoordinates = "( " + event.pageX + ", " + event.pageY + " )";
    // $( "#log" ).text( laserCoordinates);
    //console.log(event.pageX + ' ' + event.pageY);
    //return;
    console.log("onMouseMove is happening");
    
    updateSlideMetrics();
    var per = offsetToPercentage(event.pageX, event.pageY);
    
    switch(interactionType) {
        case LASER: {
            //console.log('lasering');
            socket.emit('laserCoords', { x: per.x, 
                                         y: per.y, 
                                         slideID: currentHash });
            break;
        }
        case DRAW: {
            //console.log('drawing');
            socket.emit('drawCoords', { x: per.x, 
                                        y: per.y, 
                                        slideID: currentHash });
            break;
        }
        default: {
            break;
        }
    }
};

 $( '#currentSlide' ).mousedown(function(event) {
    console.log("mouse down");
    //console.log(event);
    updateSlideMetrics();
    var per = offsetToPercentage(event.pageX, event.pageY);

    $( "#currentSlide" ).on ("mousemove", onMouseMove);
    // Only turn on laser if we are in laser mode
    if(interactionType === LASER) {
        socket.emit('laserOn', {x: per.x, 
                                y: per.y, 
                                slideID: currentHash});
    } else if(interactionType === DRAW) {

        socket.emit('drawStart',{x: per.x, 
                                 y: per.y, 
                                 slideID: currentHash});
    }
});

$( '#currentSlide' ).mouseup(function(event) {
    console.log("mouse up"); 
    $( "#currentSlide" ).off ("mousemove", onMouseMove);
    // Only turn off laser if we are in laser mode
    if(interactionType === LASER) {
        socket.emit('laserOff', {slideID: currentHash});
    } else if(interactionType === DRAW) {
        socket.emit('drawStop', {slideID: currentHash});
    }
});

/* Image dragging was interfering with the laser pointer event listeners
 * So I am disabling image dragging since the presenter probably won't want
 * to drag the powerpoint slide anywhere from inside the remote control. 
 * if we end up needing this one solution would be to make a button that
 * would turn the laser on/off instead of using mousedown events. 
 */
 
// disable image dragging for all images
$('img').on('dragstart', function(event) { event.preventDefault(); });