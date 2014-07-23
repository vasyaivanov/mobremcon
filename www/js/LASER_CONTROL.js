//----------------------------------------------------------------------------80
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
    
    /* delete this if the switch case above is working
    if(1 == drawMode) {
        console.log('drawing');
        socket.emit('drawCoords', { x:event.pageX, y:event.pageY })
    } else if () {
        // Sends coordinates to the backend server
        console.log('lasering');
        socket.emit('laserCoords', { x:event.pageX, y:event.pageY })
    }
    */
};

// changed so mouseup/mousedown are now attached to body instead of currentSlide
// not sure which way is better 
$( "body" ).mousedown(function() { 
    console.log("mouse down"); 
    $( "#currentSlide" ).on ("mousemove", moveLaser);
    // Only turn on laser if we are in laser mode
    if(LASER === interactionType)
        socket.emit('mouseDown'); 
});

$( "body" ).mouseup(function() { 
    console.log("mouse up"); 
    $( "#currentSlide" ).off ("mousemove", moveLaser);
    // Only turn on laser if we are in laser mode
    if(LASER === interactionType)
        socket.emit('mouseUp');
});

/* Image dragging was interfering with the laser pointer event listeners
 * So I am disabling image dragging since the presenter probably won't want
 * to drag the powerpoint slide anywhere from inside the remote control. 
 * if we end up needing this one solution would be to make a button that
 * would turn the laser on/off instead of using mousedown events. 
 */
 
// disable image dragging for all images. 
$('img').on('dragstart', function(event) { event.preventDefault(); });

$('#prevButton').click(function() {
    socket.emit('mymessage', { my:102 });
});

$('#nextButton').click(function() {
    console.log("next pressed");
    socket.emit('mymessage', { my:101 });
});

$('#laserButton').click(function() {
    // if laser is on, turn it off
    if (LASER === interactionType) {
        interactionType = NONE;
        $('#laserButton').css("color", "black");
        
    // otherwise turn laser on
    } else {
        interactionType = LASER;
        $('#laserButton').css("color", "red");
        $('#drawButton').css("color", "black");
    }
});

$('#drawButton').click(function() {
    // if draw is on, turn it off
    if (DRAW === interactionType) {
        interactionType = NONE;
        $('#drawButton').css("color", "black");
        
    // otherwise turn draw on
    } else {
        interactionType = DRAW;
        $('#drawButton').css("color", "red");
        $('#laserButton').css("color", "black");
    }
});
