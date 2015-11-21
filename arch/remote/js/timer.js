/* This script handles the timer. The HTML <script> tag for it
 * must have the 'defer' attribute to make sure timeDisplay doesn't
 * try to grab the display DOM element before it exists
 */

var timeDisplay = document.getElementById("timeDisplay"),
    initialTimeText = timeDisplay.textContent,
    seconds = 0, minutes = 0, hours = 0, timerInit
    timerActive = false;

$('#timeDisplay').click(function() {
    if (timeDisplay.textContent === initialTimeText) {
        timeDisplay.textContent = "00:00:00";
    }
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
};

function timer() {
    timerInit = setTimeout(incrementTime, 1000);
};