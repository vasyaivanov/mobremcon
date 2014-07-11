//----------------------------------------------------------------------------80
/* 
 * This script is for reading the X/Y coordinates of the user touching the
 * remote, so they can be sent to the receiver for displaying a laser pointer
 */

console.log("LASER_CONTROL script is working");

function moveLaser( event ) {
    // These lines display the coordinates in the remote control, for testing only
    //var laserCoordinates = "( " + event.pageX + ", " + event.pageY + " )";
    //$( "#log" ).text( laserCoordinates);
    
    // Sends coordinates to the backend server
    socket.emit('laserCoords', { x:event.pageX, y:event.pageY })
};

// changed so mouseup/mousedown are now attached to body instead of laserPointer
// not sure which way is better 
$( "body" ).mousedown(function() { 
    console.log("mouse down"); 
    $( "#laserPointer" ).on ("mousemove", moveLaser);
    socket.emit('mouseDown');
});

$( "body" ).mouseup(function() { 
    console.log("mouse up"); 
    $( "#laserPointer" ).off ("mousemove", moveLaser);
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

