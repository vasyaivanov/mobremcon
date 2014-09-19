/*
 * This script is for reading the X/Y coordinates of the user touching the
 * remote, so they can be sent to the receiver for displaying a laser pointer
 */

console.log("LASER_CONTROL script is working");

// global variable for controlling if 'draw' or 'laser' 
// message is sent when the mouse is moved
// 0 is no interaction, 1 is laser, 2 is draw.

var NONE  = 0;
var LASER = 1;
var DRAW  = 2;
var interactionType = NONE; 

// variables to deal with offset
var currentSlide = document.getElementById("currentSlide"),
    xOffset = currentSlide.offsetLeft,
    yOffset = currentSlide.offsetTop,
    slideWidth = currentSlide.offsetWidth,
    slideHeight = currentSlide.offsetHeight;

// hardcoded "notes", to show that notes change when a slide changes
var currSlideNum = 0;
var notesArray = [
" 1: Beginning slide, or should I say 'slite'. Get ready to see powerpoint with all the powers of the web",
" 2: Each slide is a webpage, so you don't need any special software. And it works with your existing powerpoint, how convenient!",
" 3: No need to mess around with a projector. Upload or create a presentation and share instantly.",
" 4: People can view your presentation from anywhere in the world.",
" 5: Infinite scrolling means you can fit as much data as you need on any slite",
" 6: scrolling example",
" 7: Lots of built-in features, use your smartphone as a clicker, as a laser pointer, and even things you usually can't do such as drawing and voice commands!",
" 8: Unique features such as live captioning and translation means your presentation can reach a wider audience with no effort on your part",
" 9: Here ask people if they have ever fallen asleep during a presentation. Maybe say your own anecdote about falling asleep at a meeting",
" 10: Live social commentary means your audience is more engaged during the meeting, and afterward a record of the discussion is available",
" 11: We have many competitors, but we do much more than them!",
" 12: Revenue Model",
" 13: Impressive team with over 50 years of combined software experience",
" 14: Our product targets a HUGE market. Everyone uses presentations from businesses to students",
" 15: Redefine what people think of when they hear the word 'presentation'",
" 16: The end! Thank you for your time.",
];

// *********************
// *    Laser    *
// *********************

function moveLaser( event ) {
    // These lines display the coordinates in the remote control, for testing only
    // var laserCoordinates = "( " + event.pageX + ", " + event.pageY + " )";
    // $( "#log" ).text( laserCoordinates);
	
    console.log("moveLaser is happening");
    switch(interactionType) {
        case LASER: {
            console.log('lasering');
            socket.emit('laserCoords', { x:event.pageX - xOffset, y:event.pageY - yOffset, width:slideWidth,
                          height:slideHeight });
            break;
        }
        case DRAW: {
            console.log('drawing');
            socket.emit('drawCoords', { x:event.pageX - xOffset, y:event.pageY - yOffset, width:slideWidth,
                        height:slideHeight });
            break;
        }
        default: {
            break;
        }
    }
};

$( '#currentSlide' ).mousedown(function() {
    console.log("mouse down"); 
    $( "#currentSlide" ).on ("mousemove", moveLaser);
    // Only turn on laser if we are in laser mode
    if(LASER === interactionType)
        socket.emit('laserOn');
});

$( '#currentSlide' ).mouseup(function() {
    console.log("mouse up"); 
    $( "#currentSlide" ).off ("mousemove", moveLaser);
    // Only turn off laser if we are in laser mode
    if(LASER === interactionType)
        socket.emit('laserOff');
});

// *********************
// *    Thumbnails    *
// *********************

function thumbnails() {
    var elements    = document.querySelectorAll('#otherSlides button');
    // add event listener for each button
    for (var i = 0, l = elements.length; i < l; i++) {
        var element = elements[i];
        element.setAttribute('slide_num', i);
        var url = document.getElementById("URLSlides").value;
        element.style.backgroundImage = "url(./" + url + "/thumbnails/img" + (i+1) + ".png)";
        // each event will be logged to the virtual console
        element.addEventListener("mousedown", function(e) {
                                 var slide_num = parseInt(this.getAttribute('slide_num'));
                                 currSlideNum = slide_num;
                                 $("#notes").text(notesArray[currSlideNum]);
                                 socket.emit('mymessage', { my:slide_num+1, slide:slide_num });
                                 }, false);
    }
}

thumbnails();

/* Image dragging was interfering with the laser pointer event listeners
 * So I am disabling image dragging since the presenter probably won't want
 * to drag the powerpoint slide anywhere from inside the remote control. 
 * if we end up needing this one solution would be to make a button that
 * would turn the laser on/off instead of using mousedown events. 
 */
 
// disable image dragging for all images
$('img').on('dragstart', function(event) { event.preventDefault(); });

// *********************
// *    URL Box    *
// *********************

$('#URLBox').change(function() {
	document.getElementById('theIframe').src = "http://slite.us/" + document.getElementById("URLSlides").value;
	if (document.getElementById("URLSlides").value == "A1") socket = io.connect('http://slite.elasticbeanstalk.com:1337');
	else socket = io.connect('http://slite-dev.elasticbeanstalk.com:1337');
	document.getElementById('theIframe').src += '';
    currSlideNum = 0;
    $("#notes").text(notesArray[currSlideNum]);
    socket.emit('mymessage', { my:currSlideNum+1, slide:currSlideNum });
    thumbnails(); // thumbnails have to match the slides
});

// *********************
// *    start timer    *
// *********************
var timeDisplay = document.getElementById("timeDisplay"),
seconds = 0, minutes = 0, hours = 0, timerInit
timerActive = false;

$('#timeDisplay').click(function() {
    if (timerActive) {
        timerActive = false;
        clearTimeout(timerInit);
    }
    else {
        timerActive = true;
        timer();
    }
});

function incrementTime() {
    seconds++;
    if (seconds >= 60) {
        seconds = 0;
        minutes++;
        if (minutes >= 60) {
            minutes = 0;
            hours++;
        }
    }
    timeDisplay.textContent = (hours ? (hours > 9 ? hours : "0" + hours) : "00") + ":" + (minutes ? (minutes > 9 ? minutes : "0" + minutes) : "00") + ":" + (seconds > 9 ? seconds : "0" + seconds);
    
    timer();
}

function timer() {
    timerInit = setTimeout(incrementTime, 1000);
}

// *** end timer ***

$('#prev').click(function() {
    socket.emit('mymessage', { my:102, slide:currSlideNum });
    currSlideNum--;
    $("#notes").text(notesArray[currSlideNum]);
});

$('#next').click(function() {
    console.error("next pressed");
    socket.emit('mymessage', { my:101, slide:currSlideNum });
    currSlideNum++;
    $("#notes").text(notesArray[currSlideNum]);
});

$('#laser').click(function() {
    // calculate offset of interaction area in case window has been resized
    // since the last time laser was used. 
    offset = currentSlide.offset();
    
    // if laser is on, turn it off
    if (LASER === interactionType) {
        interactionType = NONE;
        $('#laser').css("border-color", "black");
        
    // otherwise turn laser on
    } else {
        interactionType = LASER;
        $('#laser').css("border-color", "red");
        $('#draw').css("border-color", "black");
    }
});

$('#draw').click(function() {
    offset = currentSlide.position();

    // if draw is on, turn it off
    if (DRAW === interactionType) {
        interactionType = NONE;
        $('#draw').css("border-color", "black");
        
    // otherwise turn draw on
    } else {
        interactionType = DRAW;
        $('#draw').css("border-color", "red");
        $('#laser').css("border-color", "black");
    }
});

function startup () {
    console.log("startup()");
}
