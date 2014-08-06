/*
 * This script is for reading the X/Y coordinates of the user touching the
 * remote, so they can be sent to the receiver for displaying a laser pointer
 */

function startup() {
    speechRecognizer = new SpeechRecognizer();
    document.addEventListener("deviceready", onDeviceReady, true);
}

// variables to deal with offset
var currentSlide = document.getElementById("currentSlide"),
    xOffset, yOffset;

// variables to deal with timer
var timeDisplay = document.getElementById("timeDisplay"),
    seconds = 0, minutes = 0, hours = 0, timerInit
    timerActive = false;

function printSpeechResult(resultObject){
    console.log("MA printResult");
    console.log(resultObject);
    console.log(resultObject.indexOf("NEXT"));
    if (resultObject.indexOf("NEXT") > -1)
        socket.emit('mymessage', { my: 101 });
    else if (resultObject.indexOf("PREVIOUS") > -1)
        socket.emit('mymessage', { my: 102 });
};

function onDeviceReady() {
    yOffset = currentSlide.offsetTop;
    xOffset = currentSlide.offsetLeft;
    
    // Adding event handlers to the currentSlide div, the user
    // touches this div to draw or move laser
    currentSlide.addEventListener("touchstart", touchStart, false);
    currentSlide.addEventListener("touchmove", touchMove, false);
    currentSlide.addEventListener("touchend", touchEnd, false);
    /* currentSlide.addEventListener("touchcancel", touchCancel, false); */
    
    // disable image dragging for all images.
    // Image dragging was interfering with the laser pointer event listeners
    $('img').on('dragstart', function(event) { event.preventDefault(); });
    
    $('#prev').click(function() {
        event.preventDefault();
//alert("yOffset: " + yOffset);
        socket.emit('mymessage', { my:102 });
    });
    
    $('#next').click(function() {
        event.preventDefault();
//alert("xOffset: " + xOffset);
        socket.emit('mymessage', { my:101 });
    });
    
    $('#laser').click(function() {
        event.preventDefault();
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
        event.preventDefault();
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
    
    $('#timeDisplay').click(function() {
        event.preventDefault();
        if (timerActive) {
            timerActive = false;
            clearTimeout(timerInit);
        }
        else {
            timerActive = true;
            timer();
        }
    });
    
    $('#speech').click(function() {
       console.log("MA numClicked")
       event.preventDefault();
       if (SPEECH === interactionType) {
           speechRecognizer.cleanup();
           interactionType = NONE;
           $('#speech').css("border-color", "black");
       } else {
           speechRecognizer.initialize( function(r){printSpeechResult(r)}, function(e){printSpeechResult(e)} );
           interactionType = SPEECH;
           $('#speech').css("border-color", "red");
       }
    });
    
};

// interactionType is a global variable for switching between
// 'draw' and 'laser' mode
var NONE = 0, LASER = 1, DRAW = 2, SPEECH = 3;
var interactionType = NONE;

// Touching the control area (the currentSlide div) will turn the
// laser on, making the red dot appear on the presentation.
// But only if we are in laser mode. 
function touchStart() {
    event.preventDefault();
    if(LASER === interactionType)
        socket.emit('laserOn');
}

function touchEnd() {
    if(LASER === interactionType)
        socket.emit('laserOff');
}

// this is the main function handling laser and draw control by sending
// touch coordinates on to the server through socket.emit()
function touchMove(event) {
    event.preventDefault();
    switch(interactionType) {
        case LASER: {
            socket.emit('laserCoords', { x:event.touches[0].pageX - xOffset,
                                         y:event.touches[0].pageY - yOffset });
            break;
        }
        case DRAW: {
            socket.emit('drawCoords', { x:event.touches[0].pageX - xOffset,
                                        y:event.touches[0].pageY - yOffset });
            break;
        }
        default: {
            break;
        }
    }
}

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



