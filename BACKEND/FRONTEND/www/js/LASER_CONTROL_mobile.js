/*
 * This script is for reading the X/Y coordinates of the user touching the
 * remote, so they can be sent to the receiver for displaying a laser pointer
 */

function startup() {
    document.addEventListener("deviceready", onDeviceReady, true);
}

function onDeviceReady() {
    // Adding event handlers to the currentSlide div, the user
    // touches this div to draw or move laser
    var currentSlide = document.getElementById("currentSlide");
    currentSlide.addEventListener("touchstart", touchStart, false);
    currentSlide.addEventListener("touchmove", touchMove, false);
    currentSlide.addEventListener("touchend", touchEnd, false);
    /* currentSlide.addEventListener("touchcancel", touchCancel, false); */
    
    // disable image dragging for all images.
    // Image dragging was interfering with the laser pointer event listeners
    $('img').on('dragstart', function(event) { event.preventDefault(); });
    
    $('#prev').click(function() {
        event.preventDefault();             
        socket.emit('mymessage', { my:102 });
    });
    
    $('#next').click(function() {
        event.preventDefault();
        socket.emit('mymessage', { my:101 });
    });
    
    $('#laser').click(function() {
        event.preventDefault();
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
        event.preventDefault();
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
};

// interactionType is a global variable for switching between
// 'draw' and 'laser' mode

var NONE  = 0;
var LASER = 1;
var DRAW  = 2;
var interactionType = NONE;

// Touching the control area (the currentSlide div) will turn the
// laser on, making the red dot appear on the presentation.
// But only if we are in laser mode. 
function touchStart() {
    event.preventDefault();
    if(LASER === interactionType)
        socket.emit('laserOn');
}

function touchEnd() {
    if(LASER === interactionType)
        socket.emit('laserOff');
}

// this is the main function handling laser and draw control by sending
// touch coordinates on to the server through socket.emit()
function touchMove(event) {
    event.preventDefault();
    switch(interactionType) {
        case LASER: {
            socket.emit('laserCoords', { x:event.touches[0].pageX,
                                         y:event.touches[0].pageY });
            break;
        }
        case DRAW: {
            socket.emit('drawCoords', { x:event.touches[0].pageX,
                                        y:event.touches[0].pageY });
            break;
        }
        default: {
            break;
        }
    }
}


