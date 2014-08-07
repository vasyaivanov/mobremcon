/*
 * This script is for reading the X/Y coordinates of the user touching the
 * remote, so they can be sent to the receiver for displaying a laser pointer
 */

console.log("LASER_CONTROL script is working");

// global variable for controlling if 'draw' or 'laser' 
// message is sent when the mouse is moved
// 0 is no interaction, 1 is laser, 2 is draw.

var NONE  = 0;
var LASER = 1;
var DRAW  = 2;
var interactionType = NONE; 

// offset is used to calculate laser coords
// it is recalculated upon the user pressing 'laser' or 'draw'
var currentSlide = $("#currentSlide");
var offset;

function moveLaser( event ) {
    // These lines display the coordinates in the remote control, for testing only
    // var laserCoordinates = "( " + event.pageX + ", " + event.pageY + " )";
    // $( "#log" ).text( laserCoordinates);
    
    var xOffset = offset.left;
    var yOffset = offset.top;
    
	var slideWidth = currentSlide.width();
    var slideHeight = currentSlide.height();
	
    console.log("moveLaser is happening");
    switch(interactionType) {
        case LASER: {
            console.log('lasering');
            socket.emit('laserCoords', { x:event.pageX - xOffset, y:event.pageY - yOffset, width:slideWidth,
                          height:slideHeight });
            break;
        }
        case DRAW: {
            console.log('drawing');
            socket.emit('drawCoords', { x:event.pageX - xOffset, y:event.pageY - yOffset });
            break;
        }
        default: {
            break;
        }
    }
};

$( '#currentSlide' ).mousedown(function() {
    console.log("mouse down"); 
    $( "#currentSlide" ).on ("mousemove", moveLaser);
    // Only turn on laser if we are in laser mode
    if(LASER === interactionType)
        socket.emit('laserOn');
});

$( '#currentSlide' ).mouseup(function() {
    console.log("mouse up"); 
    $( "#currentSlide" ).off ("mousemove", moveLaser);
    // Only turn off laser if we are in laser mode
    if(LASER === interactionType)
        socket.emit('laserOff');
});

/* Image dragging was interfering with the laser pointer event listeners
 * So I am disabling image dragging since the presenter probably won't want
 * to drag the powerpoint slide anywhere from inside the remote control. 
 * if we end up needing this one solution would be to make a button that
 * would turn the laser on/off instead of using mousedown events. 
 */
 
// disable image dragging for all images
$('img').on('dragstart', function(event) { event.preventDefault(); });

// *********************
// *    start timer    *
// *********************
var timeDisplay = document.getElementById("timeDisplay"),
seconds = 0, minutes = 0, hours = 0, timerInit
timerActive = false;

$('#timeDisplay').click(function() {
    if (timerActive) {
        timerActive = false;
        clearTimeout(timerInit);
    }
    else {
        timerActive = true;
        timer();
    }
});

function incrementTime() {
    seconds++;
    if (seconds >= 60) {
        seconds = 0;
        minutes++;
        if (minutes >= 60) {
            minutes = 0;
            hours++;
        }
    }
    timeDisplay.textContent = (hours ? (hours > 9 ? hours : "0" + hours) : "00") + ":" + (minutes ? (minutes > 9 ? minutes : "0" + minutes) : "00") + ":" + (seconds > 9 ? seconds : "0" + seconds);
    
    timer();
}

function timer() {
    timerInit = setTimeout(incrementTime, 1000);
}

// *** end timer ***

$('#prev').click(function() {
    socket.emit('mymessage', { my:102 });
});

$('#next').click(function() {
    console.error("next pressed");
    socket.emit('mymessage', { my:101 });
});

$('#laser').click(function() {
    // calculate offset of interaction area in case window has been resized
    // since the last time laser was used. 
    offset = currentSlide.offset();
    
    // if laser is on, turn it off
    if (LASER === interactionType) {
        interactionType = NONE;
        $('#laser').css("border-color", "black");
        
    // otherwise turn laser on
    } else {
        interactionType = LASER;
        $('#laser').css("border-color", "red");
        $('#draw').css("border-color", "black");
    }
});

$('#draw').click(function() {
    offset = currentSlide.position();

    // if draw is on, turn it off
    if (DRAW === interactionType) {
        interactionType = NONE;
        $('#draw').css("border-color", "black");
        
    // otherwise turn draw on
    } else {
        interactionType = DRAW;
        $('#draw').css("border-color", "red");
        $('#laser').css("border-color", "black");
    }
});

function startup () {
    console.log("startup()");
}
