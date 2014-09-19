/*
 * This script is for reading the X/Y coordinates of the user touching the
 * remote, so they can be sent to the receiver for displaying a laser pointer
 */

function startup() {
    speechRecognizer = new SpeechRecognizer();
    volumeButtonControl = new VolumeButtonControl();
    document.addEventListener("deviceready", onDeviceReady, true);
};

function printSpeechResult(resultObject){
    console.log("MA printResult");
    console.log(resultObject);
    console.log(resultObject.indexOf("NEXT"));
    if (resultObject.indexOf("NEXT") > -1) {
        nextSlide();
    }
    else if (resultObject.indexOf("PREVIOUS") > -1) {
        prevSlide();
    }
};

function volumeButtonCallback(resultObject) {
    if (resultObject == 102) {
        prevSlide();
    } else if (resultObject == 101) {
        nextSlide();
    }
};

function clearDrawing() {
    socket.emit('shake');
};

function onDeviceReady() {
    // Adding event handlers to the currentSlide div, the user
    // touches this div to draw or move laser
    currentSlide.addEventListener('touchstart', touchStart, false);
    currentSlide.addEventListener('touchmove', touchMove, false);
    currentSlide.addEventListener('touchend', touchEnd, false);
    /* currentSlide.addEventListener("touchcancel", touchCancel, false); */
    
    $('#prev').click(function() {
        event.preventDefault();
        prevSlide();
    });
    
    $('#next').click(function() {
        event.preventDefault();
        nextSlide()
    });
    
    $('#laser').click(function() {
        event.preventDefault();
        // if laser is on, turn it off
        if (LASER === interactionType) {
            interactionType = NONE;
            $('#laser').css("background-image", "url(./img/buttonLaser.png)");
            $('#overlay').css("z-index", "0");
        // otherwise turn laser on
        } else {
            interactionType = LASER;
            $('#laser').css("background-image", "url(./img/buttonLaser_inverse.png)");
            $('#draw').css("background-image", "url(./img/buttonDraw.png)");
            $('#overlay').css("z-index", "3");
        }
    });
    
    $('#draw').click(function() {
        event.preventDefault();
        // if draw is on, turn it off
        if (DRAW === interactionType) {
            interactionType = NONE;
            $('#draw').css("background-image", "url(./img/buttonDraw.png)");
            $('#overlay').css("z-index", "0");
        // otherwise turn draw on
        } else {
            interactionType = DRAW;
            $('#draw').css("background-image", "url(./img/buttonDraw_inverse.png)");
            $('#laser').css("background-image", "url(./img/buttonLaser.png)");
            $('#overlay').css("z-index", "3");
        }
    });
    
    $('#speech').click(function() {
       console.log("MA numClicked")
       event.preventDefault();
       if (SPEECH === interactionType) {
           speechRecognizer.cleanup();
           interactionType = NONE;
           $('#speech').css("background-image", "url(./img/buttonSpeech.png)");
       } else {
           speechRecognizer.initialize( function(r){printSpeechResult(r)}, function(e){printSpeechResult(e)} );
           interactionType = SPEECH;
           $('#speech').css("background-image", "url(./img/buttonSpeech_inverse.png)");
       }
    });
    
    volumeButtonControl.initialize(function(r){volumeButtonCallback(r)}, function(e){volumeButtonCallback(e)} );
    
    // This starts watching for a shake gesture.
    // clearDrawing() will be called on shake.
    shake.startWatch(clearDrawing);
};

// Touching the control area (the currentSlide div) will turn the
// laser on, making the red dot appear on the presentation.
// But only if we are in laser mode. 
function touchStart() {
    event.preventDefault();
    if(LASER === interactionType) {
        socket.emit('laserOn');
    } else if (DRAW === interactionType) {
        socket.emit('drawStart',{x:event.touches[0].pageX - xOffset,
                                 y:event.touches[0].pageY - yOffset});
    }
};

function touchEnd() {
    event.preventDefault();
    if (LASER === interactionType) {
        socket.emit('laserOff');
    } else if (DRAW === interactionType) {
        socket.emit('drawStop');
    }
};





