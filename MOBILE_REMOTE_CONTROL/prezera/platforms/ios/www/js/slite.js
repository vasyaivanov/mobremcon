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

function getNumSlides() {
	var windowjQuery = $('#theIframe')[0].contentWindow.$;
	var f = $('#theIframe').contents().find('.royalSlider');
	var slider = windowjQuery.data(f[0], 'royalSlider');
    return slider.numSlides;
};

// Functions that handle moving to the next slide and updating notes
function prevSlide() {
    currSlideNum--;
    if (currSlideNum < 0) {
        currSlideNum = getNumSlides() - 1;
    }
    socket.emit('changeSlideRequest', { my:102, slide:currSlideNum, slideID: $('#URLSlides').val() });
    $("#notes").text(notesArray[currSlideNum]);
};
function nextSlide() {
    currSlideNum++;
    if (currSlideNum >= getNumSlides()) {
        currSlideNum = 0;
    }
    socket.emit('changeSlideRequest', { my:101, slide:currSlideNum, slideID: $('#URLSlides').val() });
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
        element.style.backgroundImage = "url(../slites/" + url + "/thumbnails/img" + (i+1) + ".png)";

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
    var url;
    if (document.location.hostname == 'localhost' || document.location.hostname == '127.0.0.1') {
        url = 'http://localhost';
    } else {
        url = 'http://www.slite.loc';
    }
	//if (document.getElementById("URLSlides").value == "A1") socket = io.connect('http://slite.elasticbeanstalk.com:1337');
    //else socket = io.connect('http://slite.elasticbeanstalk.com:1337');
    socket = io.connect(url);
    var iFrameUrl = url + '/' + document.getElementById("URLSlides").value;
    document.getElementById('theIframe').src = iFrameUrl;
    currSlideNum = 0;
    $("#notes").text(notesArray[currSlideNum]);
    socket.emit('mymessage', { my:currSlideNum+1, slide:currSlideNum });
    thumbnails(); // thumbnails have to match the slides
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

	console.log(xPercent);
	
    switch(interactionType) {
        case LASER: {
            socket.emit('laserCoords',
                        { x:xPercent,
                          y:yPercent,
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

$("#URLSlides").click(function(){
    $("#URLSlides").val("");
});

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
