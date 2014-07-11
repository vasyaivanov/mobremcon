//----------------------------------------------------------------------------80
/* 
 * This script is for moving the laser pointer on the presentation slide
 * based on what the presenter does on the remote control. It will receive
 * X/Y coordinates from the remote via the Backend APP.JS server, and then
 * display the laser pointer in the appropriate place. 
 */

console.log("LASER_RECEIVER script working");

// initially the laser dot is hidden. 
$( "#redDot" ).css("visibility", "hidden");

// Whenever the user is moving the laser on the remote, turn the dot on.
// When they are done, turn it off again
socket.on('laserOn', function() {
    $( "#redDot" ).css("visibility", "visible");
});

socket.on('laserOff', function() {
    $( "#redDot" ).css("visibility", "hidden");
});
 

// currently socket is initialized in the html. 
// This function receives the x/y coordinates from the APP.JS server 
// and moves the laser dot by adjusting the dot's CSS. 
socket.on('moveLaser', function(data) {
    // console.log("Laser Data received");
    // console.log("X: " + data.x + ", " + "Y: " + data.y);
    
    $( "#redDot" ).css({left:data.x, top:data.y});
});

