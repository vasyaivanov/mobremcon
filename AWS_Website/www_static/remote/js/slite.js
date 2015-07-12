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

currentSlide.addEventListener('touchstart', touchStart, false);
currentSlide.addEventListener('touchmove', touchMove, false);
currentSlide.addEventListener('touchend', touchEnd, false);

function touchStart(event) {
    event.preventDefault();
    if(LASER === interactionType) {
        socket.emit('laserOn', {slideID: getUrlParam("presentation")});
    } else if (DRAW === interactionType) {
        // recalculate offsets in case window size has changed
        xOffset = currentSlide.offsetLeft;
        yOffset = currentSlide.offsetTop;
        slideWidth = currentSlide.offsetWidth,
        slideHeight = currentSlide.offsetHeight;
        var xPercent = calcOffset(event.pageX, xOffset, slideWidth);
        var yPercent = calcOffset(event.pageY, yOffset, slideHeight);
        //console.log("xPercent: " + xPercent);
        //console.log("yPercent: " + yPercent);
        socket.emit('drawStart',{x:xPercent,
                                 y:yPercent , slideID: getUrlParam("presentation")});
    }
};

function touchEnd(event) {
    event.preventDefault();
    if (LASER === interactionType) {
        socket.emit('laserOff');
    } else if (DRAW === interactionType) {
        socket.emit('drawStop');
    }
};


// Functions that handle moving to the next slide and updating notes
function prevSlide() {
    socket.emit('mymessage', { my:102, slide:currSlideNum, slideID: getUrlParam("presentation") });
    currSlideNum--;
    $("#notes").text(notesArray[currSlideNum]);
};
function nextSlide() {
    socket.emit('mymessage', { my:101, slide:currSlideNum, slideID: getUrlParam("presentation") });
    currSlideNum++;
    $("#notes").text(notesArray[currSlideNum]);
};

function thumbnails() {
    var elements    = document.querySelectorAll('#navButtons div');
    /*
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
    }*/
}

function changeURL() {
	alert(location.port);
    var newUrl = 'https://' + document.location.hostname + ':' + location.port + '/remote/index.html?presentation=' + document.getElementById("URLSlides").value;
    //location.href = newUrl; // redirect to a new url with ?presentation= query string
    location.replace(newUrl);
}

function isLocalhost() {
	var location = document.location + "";
	return (location && location.indexOf("file") === 0);
}

function setIFrameUrl(hash){

      var protocolUrl = (location.protocol == 'https:') ? 'https://' : 'http://';

      var newUrl = protocolUrl + document.location.hostname + ':' + location.port + '/' + hash;

    var iFrame = document.getElementById('theIframe');
	iFrame.src = newUrl;
	if(isLocalhost()){
		iFrame.src = "www.slite.us/A1";
	}
    iFrame.addEventListener("load", onSlideLoaded);
}

function onSlideLoaded() {
    currSlideNum = 0;
    $("#notes").text(notesArray[currSlideNum]);
    socket = io.connect(document.location.hostname);
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
                          height:slideHeight , slideID: getUrlParam("presentation") });
            break;
        }
        case DRAW: {
            socket.emit('drawCoords',
                        { x:xPercent,
                          y:yPercent , slideID: getUrlParam("presentation")});
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


function getUrlParam(sParam)
{
	var sPageURL = window.location.search.substring(1); // get query string without ?
	var sURLVariables = sPageURL.split('&');
	for (var i = 0; i < sURLVariables.length; i++)
	{
		var sParameterName = sURLVariables[i].split('=');
		if (sParameterName[0] == sParam)
		{
			return sParameterName[1];
		}
	}
}

function populateHash(){
	var presentationHash = getUrlParam("presentation");
	if(presentationHash){
        $("#URLSlides").val(presentationHash);
        setIFrameUrl(presentationHash);
	}
}

$(function() {
    console.log( "ready!" );
	populateHash();
});
