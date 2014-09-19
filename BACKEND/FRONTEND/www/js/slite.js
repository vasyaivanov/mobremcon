/* This is the main JS file for index.html, our remote control app */

// variables to deal with offset
var currentSlide = document.getElementById("currentSlide"),
    xOffset = currentSlide.offsetLeft,
    yOffset = currentSlide.offsetTop,
    slideWidth = currentSlide.offsetWidth,
    slideHeight = currentSlide.offsetHeight;

// interactionType is a global variable for switching between different modes
var NONE = 0, LASER = 1, DRAW = 2, SPEECH = 3;
var interactionType = NONE;

// disable image dragging for all images
$('img').on('dragstart', function(event) { event.preventDefault(); });

// Functions that handle moving to the next slide and updating notes
function prevSlide() {
    socket.emit('mymessage', { my:102, slide:currSlideNum });
    currSlideNum--;
    $("#notes").text(notesArray[currSlideNum]);
};
function nextSlide() {
    socket.emit('mymessage', { my:101, slide:currSlideNum });
    currSlideNum++;
    $("#notes").text(notesArray[currSlideNum]);
};

// this is the main function handling laser and draw control by sending
// touch coordinates on to the server through socket.emit()
function touchMove(event) {
    event.preventDefault();
    console.log("touchMove called");
    
    // This code is needed because the touch event is different on mobile vs browser
    var xTouch, yTouch;
    if (/mobile/i.test(navigator.userAgent)) {
        xTouch = event.touches[0].pageX;
        yTouch = event.touches[0].pageY;
    } else {
        xTouch = event.pageX;
        yTouch = event.pageY;
    }
    
    switch(interactionType) {
        case LASER: {
            socket.emit('laserCoords',
                        { x:xTouch - xOffset,
                          y:yTouch - yOffset,
                          width:slideWidth,
                          height:slideHeight });
            break;
        }
        case DRAW: {
            socket.emit('drawCoords',
                        { x:xTouch - xOffset,
                          y:yTouch - yOffset,
                          width: slideWidth,
                          height: slideHeight});
            break;
        }
        default: {
            break;
        }
    }
};

// Cause Repaint makes the font resize when
// the browser window is resized.
causeRepaintsOn = $("#URLBox");
$(window).resize(function() {
  causeRepaintsOn.css("z-index", 1);
});

// This script is intended to detect whether or not
// the program is opened in a mobile browser, and load
// the correct .js file.
var scriptSrc = './js/slite_browser.js';
if (/mobile/i.test(navigator.userAgent)) {
    scriptSrc = './js/slite_iphone.js';
} else {
    scriptSrc = './js/slite_browser.js';
}
var script = document.createElement('script');
script.src = scriptSrc;
var head = document.getElementsByTagName('head')[0];
head.appendChild(script);