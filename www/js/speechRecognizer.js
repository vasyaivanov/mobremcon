
var SpeechRecognizer = function() {
};

// **Initialize speech recognition**
//
// `successCallback`  The callback function for success
// `failureCallback`  The callback function for error  
SpeechRecognizer.prototype.initialize = function(successCallback, failureCallback) {
    return Cordova.exec( successCallback,
                         failureCallback,
                         "SpeechRecognizer",
                         "init",
                         []);
};

// **Clean up speech recognition**
//
// `successCallback` The callback function for success  
// `failureCallback` The callback function for error  
SpeechRecognizer.prototype.cleanup = function(successCallback, failureCallback) {
    return Cordova.exec(successCallback,
                         failureCallback,
                         "SpeechRecognizer",
                         "cleanup",
                         []);
};

// **Starts speech recognition**
//
// `recoType`  Type of recognition (dictation or websearch)  
// `language`  Language code for recognition  
// `successCallback`  The callback function for success  
// `failureCallback`  The callback function for error  
SpeechRecognizer.prototype.startRecognition = function(recoType, language,
                                                            successCallback, failureCallback) {
    return Cordova.exec(successCallback,
                         failureCallback,
                         "SpeechRecognizer",
                         "startRecognition",
                         [recoType, language]);
};

// **Stops speech recognition**
//
// `successCallback`  The callback function for success  
// `failureCallback`  The callback function for error  
SpeechRecognizer.prototype.stopRecognition = function(successCallback, failureCallback) {
    return Cordova.exec(successCallback,
                         failureCallback,
                         "SpeechRecognizer",
                         "stopRecognition",
                         []);
};

// **Gets the last set of results from speech recognition**
//
// `successCallback` The callback function for success  
// `failureCallback` The callback function for error  
SpeechRecognizer.prototype.getResults = function(successCallback, failureCallback) {
    return Cordova.exec(successCallback,
                         failureCallback,
                         "SpeechRecognizer",
                         "getResult",
                         []);
};



	