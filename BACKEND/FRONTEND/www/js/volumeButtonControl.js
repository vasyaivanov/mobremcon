var VolumeButtonControl = function() {
};

// **Initialize speech recognition**
//
// `successCallback`  The callback function for success
// `failureCallback`  The callback function for error  
VolumeButtonControl.prototype.initialize = function(successCallback, failureCallback) {
    return Cordova.exec( successCallback,
                         failureCallback,
                         "VolumeButtonControl",
                         "init",
                         []);
};
