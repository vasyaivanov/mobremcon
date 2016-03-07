/*
 * This script is for controlling browser specific functions
 * of the remote control.
 */

thumbnails();

function turnLaser(on){
    // if laser is on, turn it off
    if (!on) {
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
}

$('#laser').click(function() {
     // calculate offset of interaction area in case window has been resized
    // since the last time laser was used.
    turnLaser(LASER !== interactionType);
});

function turnDraw(on){
     // if draw is on, turn it off
    if (!on) {
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
}

$('#draw').click(function() {
    turnDraw(DRAW !== interactionType);
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
    //console.log("onMouseMove is happening");

    updateSlideMetrics(event.pageX, event.pageY);
    var per = offsetToPercentage(event.pageX, event.pageY);

    switch(interactionType) {
        case LASER: {
            //console.log('lasering');
            moveLaserTo(per.x, per.y);
            socket.emit('laserCoords', { x: per.x,
                                         y: per.y,
                                         slideID: currentHash , presPass: presentPassword});
            break;
        }
        case DRAW: {
            //console.log('drawing');
            drawTo('move', per.x, per.y);
            socket.emit('drawCoords', { x: per.x,
                                        y: per.y,
                                        slideID: currentHash , presPass: presentPassword});
            break;
        }
        default: {
            break;
        }
    }
};


 $( '#currentSlide' ).mousedown(function(event) {
    //console.log("mouse down");
    //console.log(event);
    updateSlideMetrics(event.pageX, event.pageY);
    var per = offsetToPercentage(event.pageX, event.pageY);

    $( "#currentSlide" ).on ("mousemove", onMouseMove);
    // Only turn on laser if we are in laser mode
    if(interactionType === LASER) {
        $( "#redDot" ).css("visibility", "visible");
        moveLaserTo(per.x, per.y);
        socket.emit('laserOn', {x: per.x,
                                y: per.y,
                                slideID: currentHash, presPass: presentPassword});
    } else if(interactionType === DRAW) {
        drawTo('down', per.x, per.y);
        socket.emit('drawStart',{x: per.x,
                                 y: per.y,
                                 slideID: currentHash, presPass: presentPassword});
    }
});

$( '#currentSlide' ).mouseup(function(event) {
    //console.log("mouse up");
    $( "#currentSlide" ).off ("mousemove", onMouseMove);
    // Only turn off laser if we are in laser mode
    if(interactionType === LASER) {
        $( "#redDot" ).css("visibility", "hidden");
        socket.emit('laserOff', {slideID: currentHash, presPass: presentPassword});
    } else if(interactionType === DRAW) {
        drawTo('up');
        socket.emit('drawStop', {slideID: currentHash, presPass: presentPassword});
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
