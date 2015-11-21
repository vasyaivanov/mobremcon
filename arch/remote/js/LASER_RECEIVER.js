/*
 * This script is for moving the laser pointer on the presentation slide
 * based on what the presenter does on the remote control. It will receive
 * X/Y coordinates from the remote via the Backend APP.JS server, and then
 * display the laser pointer in the appropriate place. 
 */
console.error('DEPRICATED! remote\\LASER_RECEIVER.js');

var canvas, ctx, flag = false,
    prevX = 0,
    currX = 0,
    prevY = 0,
    currY = 0,
    dot_flag = false;

var paintColor = "red",
    lineThickness = 2;

var canvas = $("#drawCanvas");
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
    canvas.height(newHeight);
    canvas.width(newWidth);
};

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

socket.on('drawStart', function(data) {
    findxy('down', data.x, data.y);
});

socket.on('drawStop', function() {
    findxy('up');
});

socket.on('drawCoords', function(data) {
    findxy('move', data.x, data.y);
});

socket.on('shake', function() {
    clearCanvas();
});

function clearCanvas () {
    console.log("clearCanvas() called");
    ctx.clearRect(0, 0, canvas[0].width, canvas[0].height);
};

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
            console.log("findxy move. prevY = " + prevY + " currY = " + currY);
            prevX = currX;
            prevY = currY;
            currX = x - canvas[0].offsetLeft;
            currY = y - canvas[0].offsetTop;
            draw();
        }
    }
};

