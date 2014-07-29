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

// ================================= canvas =========================

// <basic draw program> [Lev]

var myCanvas = document.getElementById("myCanvas");
var myContext = myCanvas.getContext('2d');

socket.on('drawCoords', function(data) {
    myContext.fillStyle = '#FF0000'; 
    myContext.fillRect(data.x, data.y, 10, 10);
});

function clearCanvas () {
    myContext.clearRect(0,0,myCanvas.width, myCanvas.height);
};

/* I don't think I'll need to start and stop drawing since
 * the draw event should only fire when drawCoords are being
 * transmitted
socket.on('drawStart', function () {
    drawMode = true;
});

socket.on('drawStop', function () {
    drawMode = false;
});
*/  
  
// </basic draw program>