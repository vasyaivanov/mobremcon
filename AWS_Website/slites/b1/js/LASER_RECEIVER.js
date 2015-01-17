//----------------------------------------------------------------------------80
/* 
 * This script is for moving the laser pointer on the presentation slide
 * based on what the presenter does on the remote control. It will receive
 * X/Y coordinates from the remote via the Backend APP.JS server, and then
 * display the laser pointer in the appropriate place. 
 */

var canvas, ctx, flag = false,
    prevX = 0,
    currX = 0,
    prevY = 0,
    currY = 0,
    dot_flag = false;
    
var paintColor = "red",
    lineThickness = 2;

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
    var slider = $(".royalSlider").data('royalSlider');
    var receiverHeight = slider.currSlide.content.height();
    var receiverWidth = slider.currSlide.content.width();
    var xScale = receiverHeight / data.height;
    var yScale = receiverWidth / data.width;
    var scaledX = data.x * xScale;
    var scaledY = data.y * yScale;
    $( "#redDot" ).css({left:scaledX, top:scaledY});
});

var canvas = $("#myCanvas");
var ctx = canvas[0].getContext('2d');

$( window ).load(function() {
    // get offset of slides to position canvas properly
    // console.log("setting slider variable");
    var slider = $(".royalSlider").data('royalSlider');
    var slideOffset = slider.currSlide.content.offset();
    canvas.offset({ top: slideOffset.top, left: slideOffset.left });
    resizeCanvas();
});

function resizeCanvas() {
    var slider = $(".royalSlider").data('royalSlider');
    var newHeight = slider.currSlide.content.height();
    var newWidth = slider.currSlide.content.width();
    canvas[0].height = newHeight;
    canvas[0].width = newWidth;
};

// Converts percent offset received from server into XY coords
// (this mirrors calcOffset in slite.js)
function calcCoords(percent, offset, dim) {
    return (offset + (percent * dim));
};

socket.on('drawStart', function(data) {
    var canvOffset = canvas.offset();
    var x = calcCoords(data.x, canvOffset.left, canvas[0].width);
    var y = calcCoords(data.y, canvOffset.top, canvas[0].height);
    findxy('down', x, y);
});

socket.on('drawStop', function() {
    findxy('up');
});

socket.on('drawCoords', function(data) {
    var canvOffset = canvas.offset();
    var x = calcCoords(data.x, canvOffset.left, canvas[0].width);
    var y = calcCoords(data.y, canvOffset.top, canvas[0].height);
    findxy('move', x, y);
});

socket.on('shake', function() {
    clearCanvas();
});

function clearCanvas () {
    console.log("clearCanvas() called");
    ctx.clearRect(0, 0, canvas[0].width, canvas[0].height);
};

// Draw code written by user1083202 on StackOverflow
// http://stackoverflow.com/questions/2368784/draw-by-mouse-with-html5-canvas
  
function draw() {
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(currX, currY);
    ctx.strokeStyle = paintColor;
    ctx.lineWidth = lineThickness;
    ctx.stroke();
    ctx.closePath();
};  

function findxy(res, x, y) {
    if (res == 'down') {
        prevX = currX;
        prevY = currY;
        currX = x - canvas[0].offsetLeft;
        currY = y - canvas[0].offsetTop;
        console.log("findxy down. prevX = " + prevX + " currX = " + currX);
        
        flag = true;
        dot_flag = true;
        if (dot_flag) {
            ctx.beginPath();
            ctx.fillStyle = paintColor;
            ctx.fillRect(currX, currY, 2, 2);
            ctx.closePath();
            dot_flag = false;
        }
    }
    if (res == 'up' || res == "out") {
        flag = false;
    }
    if (res == 'move') {
        if (flag) {
            console.log("findxy move. prevX = " + prevX + " currX = " + currX);
            prevX = currX;
            prevY = currY;
            currX = x - canvas[0].offsetLeft;
            currY = y - canvas[0].offsetTop;
            draw();
        }
    }
};

