//----------------------------------------------------------------------------80
/* 
 * This script is for moving the laser pointer on the presentation slide
 * based on what the presenter does on the remote control. It will receive
 * X/Y coordinates from the remote via the Backend APP.JS server, and then
 * display the laser pointer in the appropriate place. 
 */

console.log("LASER_RECEIVER script working");

// initially the laser dot is hidden. 
$( "#redDot" ).css("display", "none");

// Whenever the user is moving the laser on the remote, turn the dot on.
// When they are done, turn it off again
socket.on('laserOn', function() {
    $( "#redDot" ).css("display", "inline");
});

socket.on('laserOff', function() {
    $( "#redDot" ).css("display", "none");
});
 

// currently socket is initialized in the html. 
// This function receives the x/y coordinates from the APP.JS server 
// and moves the laser dot by adjusting the dot's CSS. 
socket.on('moveLaser', function(data) {
    // console.log("Laser Data received");
    // console.log("X: " + data.x + ", " + "Y: " + data.y);
    var slider = $(".royalSlider").data('royalSlider');
    var receiverHeight = slider.currSlide.content.height();
    var receiverWidth = slider.currSlide.content.width();
    var xScale = receiverHeight / data.height;
    var yScale = receiverWidth / data.width;
    var scaledX = data.x * xScale;
    var scaledY = data.y * yScale;
    $( "#redDot" ).css({left:scaledX, top:scaledY});
});

// ================================= canvas =========================

// <basic draw program> [Lev]

// var myCanvas = document.getElementById("myCanvas");
var myCanvas = $("#myCanvas");
var myContext = myCanvas[0].getContext('2d');

$( window ).load(function() {
    // get offset of slides to position canvas properly
    // console.log("setting slider variable");
    var slider = $(".royalSlider").data('royalSlider');
    var slideOffset = slider.currSlide.content.offset();
    myCanvas.offset({ top: slideOffset.top, left: slideOffset.left });
    resizeCanvas();
});

function resizeCanvas() {
    var slider = $(".royalSlider").data('royalSlider');
    var newHeight = slider.currSlide.content.height();
    var newWidth = slider.currSlide.content.width();
    myCanvas.height(newHeight);
    myCanvas.width(newWidth);
};

socket.on('drawCoords', function(data) {
    myContext.fillStyle = '#FF0000'; 
    myContext.fillRect(data.x, data.y, 3, 3);
});

function clearCanvas () {
    console.log("clearCanvas() called");
    myContext.clearRect(0, 0, myCanvas[0].width, myCanvas[0].height);
};
  
// </basic draw program>
