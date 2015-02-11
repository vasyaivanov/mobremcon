/* This script is intended to detect whether or not
the program is opened in a mobile browser, and load
the correct .js file. */

var scriptSrc = './js/LASER_CONTROL.js';
if (/mobile/i.test(navigator.userAgent)) {
    scriptSrc = './js/LASER_CONTROL_mobile.js';
} else {
    scriptSrc = './js/LASER_CONTROL.js';
}
var script = document.createElement('script');
script.src = scriptSrc;
var head = document.getElementsByTagName('head')[0];
head.appendChild(script);