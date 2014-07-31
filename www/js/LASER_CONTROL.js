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


function moveLaser( event ) {
    // These lines display the coordinates in the remote control, for testing only
    // var laserCoordinates = "( " + event.pageX + ", " + event.pageY + " )";
    // $( "#log" ).text( laserCoordinates);
    
    console.log("moveLaser is happening");
    switch(interactionType) {
        case LASER: {
            console.log('lasering');
            socket.emit('laserCoords', { x:event.pageX, y:event.pageY });
            break;
        }
        case DRAW: {
            console.log('drawing');
            socket.emit('drawCoords', { x:event.pageX, y:event.pageY });
            break;
        }
        default: {
            break;
        }
    }
};

// code from https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Touch_events
/*
function startup() {
    var el = document.getElementById("currentSlide");
    el.addEventListener("touchstart", handleStart, false);
    el.addEventListener("touchend", handleEnd, false);
    el.addEventListener("touchcancel", handleCancel, false);
    el.addEventListener("touchleave", handleEnd, false);
    el.addEventListener("touchmove", handleMove, false);
}

var ongoingTouches = new Array();

function handleStart(evt) {
    evt.preventDefault();
    log("touchstart.");
    var el = document.getElementsById("currentSlide");
    var touches = evt.changedTouches;
    
    for (var i=0; i < touches.length; i++) {
        log("touchstart:"+i+"...");
        ongoingTouches.push(copyTouch(touches[i]));
        log("touchstart:"+i+".");
    }
}
*/

// end mozilla code

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

$('#prev').click(function() {
    socket.emit('mymessage', { my:102 });
});

$('#next').click(function() {
    console.error("next pressed");
    socket.emit('mymessage', { my:101 });
});

$('#laser').click(function() {
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
