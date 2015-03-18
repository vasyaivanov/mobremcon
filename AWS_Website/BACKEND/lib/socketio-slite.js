var url = require('url')
  , fs = require('fs')
  , SocketIOFileUploadServer = require("socketio-file-upload")
  , path = require('path')
  , prepare_slite = require('./prepare_slite.js')
  , converter = require('./converter.js')
  , watchr = require('watchr')
  , NUM_REG_EXP = /\d+\./
  , SLIDE_REG_EXP = new RegExp('^img\\d+' + SLITE_EXT + '$')
  , SLITE_EXT = '.jpg'
  , HTML5_UPLOADER = false;

var start = process.hrtime();

function resetElapsedTime() {
    start = process.hrtime();
}

function elapsedTime(note) { 
    var precision = 0; // 0 decimal places
    var elapsed = process.hrtime(start)[1] / 1000000;
                                                           // divide by a million to get nano to milliseconds
    console.log(note + ' in: ' + process.hrtime(start)[0] + " s, " + elapsed.toFixed(precision) + " ms"); // print message + time
    start = process.hrtime(); // reset the timer
    return elapsed;
}

var www_dir, slitesDir, staticDir, slitesReg;
exports.setDir = function (new_dir, newSlitesDir, newstaticDir, newSlitesReg, callback){
    www_dir = new_dir;
    slitesDir = newSlitesDir;
    staticDir = newstaticDir;
    slitesReg = newSlitesReg;
	prepare_slite.setDir(www_dir, slitesDir, staticDir, slitesReg, callback);
}

function pollUpdate () {
	var pollStatisticsString = "";
	var pollAnswersString = "";
	for (i=0; i < pollStatisticsArray.length-1; i++) {
		pollStatisticsString += pollStatisticsArray[i] + "\n"; //construct statistics string. TODO - proper JSON
		pollAnswersString += pollAnswerArray[i] + "\n";
	}
	pollStatisticsString += pollStatisticsArray[i]; // the last element has no '\n"
	pollAnswersString += pollAnswerArray[i]; // the last element has no '\n"
	console.log("MA: pollVote pollUpdate pollAnswerArray: " + JSON.stringify(pollAnswersString));
	console.log("MA: pollVote pollUpdate pollStatisticsArray: " + JSON.stringify(pollStatisticsString));
	module.parent.exports.io.sockets.emit('pollUpdate', { answers : pollAnswersString, statistics : pollStatisticsString });
}

var pollStatisticsArray = new Array();
var pollAnswerArray = new Array();

var clients = [];

console.log('in remote control');

module.parent.exports.io.sockets.on('connection', function (socket) {
    if (pollAnswerArray.length > 0) {
        pollUpdate();
    }
    console.log('CONNECTION on', new Date().toLocaleTimeString() + ' Addr: ' + socket.handshake.headers.host + ' Socket: ' + socket.id);
    socket.on('disconnect', function () {
        console.log('DISCONNECT on', new Date().toLocaleTimeString() + ' Addr: ' + socket.handshake.headers.host + ' Socket: ' + socket.id);
    });
    
    var slite;          // currently loaded Slite

    function sliteError(err) {
        console.error('ERROR WHILE UPLOADING/CONVERTING slite: ' + err);
        if (typeof slite !== 'undefined') {
            slite.deleteHash(true, function () {
                console.log('Deleted folder and hash due to an error');
            });
        }
        socket.emit("sliteConversionError");
    }
    
    var uploaderDir = path.join(www_dir, "UPLOAD/");
    function uploadStarted(name){
        resetElapsedTime();
        console.log("UPLOAD started  file: " + name);
    }
    function uploadProgress(name){
        console.log("UPLOAD progress file: " + name);
    }
    function uploadError(name) {
        console.error("UPLOAD error: " + name);
        sliteError();
    }
    function uploadComplete(name) {
        converter(name, socket, {www_dir: www_dir, slitesDir: slitesDir, sliteRegExp: SLIDE_REG_EXP});
    }
    
    if (HTML5_UPLOADER) {
        socket.on('uploadStarted', function (data) {
            console.log('uploadStarted event', data);
         });
        socket.on('uploadFile', function (data) {
            console.log('uploadFile event', data);
        });
    } else {
        var uploader = new SocketIOFileUploadServer();
        uploader.dir = uploaderDir;
        uploader.listen(socket);

        uploader.on("start", function (event) {
            uploadStarted(event.file.name);
         });

        uploader.on("progress", function (event) {
            uploadProgress(event.file.pathName);
        });

        uploader.on("error", function (event) {
            uploadError(JSON.stringify(event));
        });

        uploader.on("complete", function (event) {
            uploadComplete(event.file.pathName);
        });
    }
        

    socket.on('pollStarted', function (data) {
        console.log("JD: received from remote this data: " + JSON.stringify(data));
        pollStatisticsArray = new Array();
        pollAnswerArray = new Array();
        pollAnswerArray = data.answers.split("\n");
        var pollStatisticsString = "";
        var pollAnswersString = "";
        for (i = 0; i < pollAnswerArray.length; i++) {
            pollStatisticsArray[i] = 0; //initialize statistics to 0
            pollAnswersString += pollAnswerArray[i] + "\n";
        }
        console.log("MA: pollStarted pollAnswerArray: " + JSON.stringify(pollStatisticsArray));
        console.log("MA: pollStarted pollStatisticsArray: " + JSON.stringify(pollAnswerArray));
        module.parent.exports.io.sockets.emit('pollUpdate', { answers : pollAnswersString, statistics : pollStatisticsString });
    });

    socket.on('pollVote', function (data) {
        console.log("JD: received from remote this data: " + JSON.stringify(data));
        console.log("MA: pollStatisticsArray on current vote: " + JSON.stringify(pollStatisticsArray));
        if (pollStatisticsArray.length == 0) // empty statistics, let the voting commence!
        {
            pollAnswerArray = data.answers.split("\n");
            for (i = 0; i < pollAnswerArray.length; i++) {
                pollStatisticsArray[i] = 0; //initialize statistics to 0
            }
            console.log("MA: pollVote pollAnswerArray: " + JSON.stringify(pollAnswerArray));
            console.log("MA: pollVote pollStatisticsArray: " + JSON.stringify(pollStatisticsArray));
        }
        pollStatisticsArray[data.vote - 1] += 1;
        pollUpdate();
    });

    //socket.emit('news', { hello: 0 });
    socket.on('mymessage', function (data) {
        console.log("JD received data: " + data);
        console.log(data.my);
        module.parent.exports.io.sockets.emit('news', { hello: data.my, slide: data.slide, slideID: data.slideID });
		//module.parent.exports.io.sockets.emit('news',clients);
		//socket.emit('news', { hello: 1 });

    });

    //socket.emit('cc', { hello: 0 });
    socket.on('cc', function (data) {
        console.log("-------------- JD: received CLOSED CAPTIONING: " + data);
        console.log(data.my);
        module.parent.exports.io.sockets.emit('ccBroadcast', { hello: data.my });
		//module.parent.exports.io.sockets.emit('news',clients);
		//socket.emit('news', { hello: 1 });
    });

    // receive laser coordinates from the remote
    socket.on('laserCoords', function (data) {
        // 2 next lines are logs for testing
        console.log("Laser Coordinates Received");
        console.log("X: " + data.x + ", " + "Y: " + data.y);

        // send coordinates on to the display (RECEIVER_POWERPOINT.html)
        socket.broadcast.emit('moveLaser', data);
    });

    socket.on('drawCoords', function (data) {
        console.log("draw coords received");
        console.log("X: " + data.x + ", " + "Y: " + data.y);
        socket.broadcast.emit('drawCoords', data);
    });

    socket.on('laserOn', function (data) {
        console.log("laser on");
        socket.broadcast.emit('laserOn', data);
    });

    socket.on('laserOff', function () {
        console.log("laser off");
        socket.broadcast.emit('laserOff');
    });

    socket.on('shake', function () {
        socket.broadcast.emit('shake');
    });

    socket.on('drawStart', function (data) {
        console.log("drawstart");
        socket.broadcast.emit('drawStart', data);
    });

    socket.on('drawStop', function () {
        console.log("drawstop");
        socket.broadcast.emit('drawStop');
    });

/*
	for(var i=0;i<5;i++){

			console.log('test=' + i);
			sleep.sleep(5);

			db.get('name', function (err, value) {
				if (err) return console.log('Ooops!', err) // likely the key was not found
				// ta da!
				console.log('name2=' + value)
			})



			socket.emit('news', { hello: i });
			socket.on('my other event', function (data) {
				console.log(data);
			});
	  } */
    //});
}); // module.parent.exports.io.sockets.on('connection' ...
