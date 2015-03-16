/*  This is the main JS file for index.html, our remote control app */

// variables to deal with offset
var currentSlide = document.getElementById("currentSlide"),
    xOffset = currentSlide.offsetLeft,
    yOffset = currentSlide.offsetTop,
    slideWidth = currentSlide.offsetWidth,
    slideHeight = currentSlide.offsetHeight;

// This function is for getting the offset given coordinate relative to document
// It needs to be run once for X and once for Y
// coord = coordinate of touch relative to document
// offset = X or Y offset of the element inside the doc
// dim = width or height of the element
function calcOffset(coord, offset, dim) {
    return ((coord - offset)/dim);
};

// interactionType is a global variable for switching between different modes
var NONE = 0, LASER = 1, DRAW = 2, SPEECH = 3;
var interactionType = NONE;

// disable image dragging for all images
$('img').on('dragstart', function(event) { event.preventDefault(); });

// Functions that handle moving to the next slide and updating notes
function prevSlide() {
    socket.emit('mymessage', { my:102, slide:currSlideNum, slideID: $('#URLSlides').val() });
    currSlideNum--;
    $("#notes").text(notesArray[currSlideNum]);
};
function nextSlide() {
    socket.emit('mymessage', { my:101, slide:currSlideNum, slideID: $('#URLSlides').val() });
    currSlideNum++;
    $("#notes").text(notesArray[currSlideNum]);
};

function thumbnails() {
    var elements    = document.querySelectorAll('#otherSlides button');
    // add event listener for each button
    for (var i = 0, l = elements.length; i < l; i++) {
        var element = elements[i];
        element.setAttribute('slide_num', i);
        var url = document.getElementById("URLSlides").value;
        //element.style.backgroundImage = "url(./" + url + "/thumbnails/img" + (i+1) + ".png)";
        if (url === '' || url.length != 2) {
            element.style.backgroundImage = '';
        } else {
            element.style.backgroundImage = "url(../" + url + "/thumbnails/img" + (i+1) + ".png)";
        }
        // each event will be logged to the virtual console
        element.addEventListener("mousedown", function(e) {
                                 var slide_num = parseInt(this.getAttribute('slide_num'));
                                 currSlideNum = slide_num;
                                 $("#notes").text(notesArray[currSlideNum]);
                                 socket.emit('mymessage', { my:slide_num+1, slide:slide_num });
                                 }, false);
    }
}

function changeURL() {
    socket = io.connect(document.location.hostname + ':1337');
    var iFrameUrl = 'http://' + document.location.hostname + ':8081/' + document.getElementById("URLSlides").value;
    document.getElementById('theIframe').src = iFrameUrl;
    currSlideNum = 0;
    $("#notes").text(notesArray[currSlideNum]);
    socket.emit('mymessage', { my:currSlideNum+1, slide:currSlideNum });
    thumbnails(); // thumbnails have to match the slides
}

function clearURLSlides(){
	$("#URLSlides").val("");
}

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

    var xPercent = calcOffset(xTouch, xOffset, slideWidth);
    var yPercent = calcOffset(yTouch, yOffset, slideHeight);

    switch(interactionType) {
        case LASER: {
            socket.emit('laserCoords',
                        { x:xTouch - xOffset,
                          y:yTouch - yOffset,
                          width:slideWidth,
                          height:slideHeight , slideID: $('#URLSlides').val() });
            break;
        }
        case DRAW: {
            socket.emit('drawCoords',
                        { x:xPercent,
                          y:yPercent , slideID: $('#URLSlides').val()});
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
/* if (/mobile/i.test(navigator.userAgent)) {
    scriptSrc = './js/slite_iphone.js';
} else {
    scriptSrc = './js/slite_browser.js';
} */
var script = document.createElement('script');
script.src = scriptSrc;
var head = document.getElementsByTagName('head')[0];
head.appendChild(script);
