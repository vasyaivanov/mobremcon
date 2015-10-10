/* 
 * This script is for moving the laser pointer on the presentation slide
 * based on what the presenter does on the remote control. It will receive
 * X/Y coordinates from the remote via the Backend APP.JS server, and then
 * display the laser pointer in the appropriate place. 
 */
//console.log('LASER_RECIEVER.js');

var canvas, ctx, flag = false,
    prevX = 0,
    currX = 0,
    prevY = 0,
    currY = 0,
    dot_flag = false;

var paintColor = "red",
    lineThickness = 2;

function isThisHash(hash) {
    return ( (document.location.pathname === "/"+ hash) || (document.location.pathname === "/"+ hash + "/") );
}

 function moveLaserTo(x, y) {
    updateSlideMetrics();
    var res = percentageToOffset(x, y);
    //console.log('moveLaser: x: ' + x + ' y: ' + y + ' pos: X: ' + res.x + ' Y: ' + res.y);
    var redDot = $( "#redDot" );
    var dotWidth = redDot.width();
    var dotHeight = redDot.height();
    redDot.css({left: res.x - dotWidth/2, top: res.y - dotHeight/2});
}

function drawTo(res, x, y) {
    updateSlideMetrics();
    var off = percentageToOffset(x, y);
    //console.log('drawTo: x: ' + x + ' y: ' + y + ' off: X: ' + off.x + ' Y: ' + off.y);
    findxy(res, off.x, off.y);
}

var canvas = $("#drawCanvas");
var ctx = canvas[0].getContext('2d');

$( window ).load(function() {
    // get offset of slides to position canvas properly
    // console.log("setting slider variable");
    var slider = $(".royalSlider").data('royalSlider');
    var slideOffset = slider.currSlide.content.offset();
    canvas.offset({ top: slideOffset.top, left: slideOffset.left });
    resizeCanvas();

    // Whenever the user is moving the laser on the remote, turn the dot on.
    // When they are done, turn it off again
    socket.on('laserOn', function(data) {
        if (isThisHash(data.slideID)) {
            $( "#redDot" ).css("visibility", "visible");
            moveLaserTo(data.x, data.y);
        }
    });

    socket.on('laserOff', function(data) {
        if (isThisHash(data.slideID)) {
            $( "#redDot" ).css("visibility", "hidden");
        }
    });

    // currently socket is initialized in the html. 
    // This function receives the x/y coordinates from the APP.JS server 
    // and moves the laser dot by adjusting the dot's CSS. 
    socket.on('moveLaser', function(data) {
         if (isThisHash(data.slideID)) {
            moveLaserTo(data.x, data.y);
        }
    });

    socket.on('drawStart', function(data) {
        if (isThisHash(data.slideID)) {
            drawTo('down', data.x, data.y);
        }
    });

    socket.on('drawStop', function(data) {
        if (isThisHash(data.slideID)) {
            drawTo('up', data.x, data.y);
        }
    });

     socket.on('drawCoords', function(data) {
        if (isThisHash(data.slideID)) {
            drawTo('move', data.x, data.y);
         }
    });

    socket.on('shake', function(data) {
       if (isThisHash(data.slideID)) {
           clearCanvas();
       }
    });
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

function clearCanvas () {
    console.log("clearCanvas() called");
    ctx.clearRect(0, 0, canvas[0].width, canvas[0].height);
};

$(window).resize(function () {
  //resize just happened, pixels changed
    clearCanvas();
});

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
        //console.log("findxy down. prevX = " + prevX + " currX = " + currX);
        
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
            //console.log("findxy move. prevX = " + prevX + " currX = " + currX);
            //console.log("findxy move. prevY = " + prevY + " currY = " + currY);
            prevX = currX;
            prevY = currY;
            currX = x - canvas[0].offsetLeft;
            currY = y - canvas[0].offsetTop;
            draw();
        }
    }
};

