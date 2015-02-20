var url = require('url')
  , fs = require('fs')
  , cheerio = require('cheerio')
  , exec = require('child_process').exec
  , SocketIOFileUploadServer = require("socketio-file-upload")
  , prepare_slite = require('./prepare_slite.js')
  , path = require('path');

var www_dir, slitesDir, slitesReg;
exports.setDir = function (new_dir, newSlitesDir, newSlitesReg, callback){
    www_dir = new_dir;
    slitesDir = newSlitesDir;
    slitesReg = newSlitesReg;
	prepare_slite.setDir(www_dir, slitesDir, slitesReg, callback);
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
    //console.log(socket);
    socket.on('disconnect', function () {
        console.log('DISCONNECT on', new Date().toLocaleTimeString() + ' Addr: ' + socket.handshake.headers.host + ' Socket: ' + socket.id);
    });

    var uploader = new SocketIOFileUploadServer();
    uploader.dir = path.join(www_dir, "UPLOAD/");
    uploader.listen(socket);
    var imageCount = 1;
    var slite;

    sliteError = function (err){
        console.error('ERROR WHILE UPLOADING/CONVERTING slite: ' + err);
        if (typeof slite !== 'undefined') {
            slite.deleteHash(true, function () {
                console.log('Deleted folder and hash due to an error');
            });
        }
        socket.emit("sliteConversionError");
    }

    uploader.on("start", function (event) {
        console.log("UPLOAD started  file: " + event.file.name);
    });

    uploader.on("progress", function (event) {
        console.log("UPLOAD progress file: " + event.file.pathName);
    });

    uploader.on("error", function (event) {
        console.error("UPLOAD error: " + JSON.stringify(event));
        sliteError();
     });

    uploader.on("complete", function (event) {
        console.log("UPLOAD complete file: " + event.file.pathName);
        var extention = path.extname(event.file.pathName);
        var fullFileName = event.file.pathName;

        slite = new prepare_slite.Slite(socket, function (err) {
            if (err) {
                sliteError(err);
                fs.unlink(fullFileName, function (err) {
                    if (err) {
                        console.error('Error deleting: ' + fullFileName + err);
                    }
                });
                return;
            }
            var uploadFileTitle = 'img0';
            var uploadFileName = uploadFileTitle + extention;
            var hashDir = path.join(www_dir, slitesDir, slite.hashValue);
            var uploadFullFileName = path.join(hashDir, uploadFileName);

            fs.rename(fullFileName, uploadFullFileName, function (err) {
               if (err) {
                    console.error('Error renaming file: ' + err);
                    sliteError(err);
                    fs.unlink(fullFileName, function (err) {
                        if (err) {
                            console.error('Error deleting: ' + fullFileName + err);
                        }
                    });
                    return;
                } else {
                    console.log('RENAMED file: ' + fullFileName + ' to:' + uploadFullFileName);
                    var conversionFormat = 'html';
                    var unoconvPathname = path.join(__dirname, 'unoconv'),

                    // CONVERSION
                    //unoconv_cmd = "python " + unoconvPathname + ' -f ' + conversionFormat + ' -o ' + hashDir + ' ' + uploadFullFileName;
                    //unoconv_cmd = "python " + unoconvPathname + ' -e PageRange=1-1' + ' -f ' + conversionFormat + ' -o ' + hashDir + ' ' + uploadFullFileName;                 // milti-platform version
                    unoconv_cmd = "python " + unoconvPathname + ' -e Width=1920 -e Compression=100%' + ' -f ' + conversionFormat + ' -o ' + hashDir + ' ' + uploadFullFileName;                 // milti-platform version
					//unoconv_cmd = '/opt/libreoffice4.2/program/soffice.bin --headless --convert-to html:impress_html_Export --outdir ' + hashDir + ' ' + uploadFullFileName; // not a mutli-platform version
                    console.log(unoconv_cmd);

                    try {
                        exec(unoconv_cmd, function (err, stdout, stderr) {
                           if (err !== null) {
                                console.error('unoconv stderr: ', stderr);
                                sliteError(err);
                                return;
                            }
                            console.log('CONVERTED presentation: ', slite.hashValue);
                            var convertedHtml = path.join(hashDir, uploadFileTitle + '.' + conversionFormat);
                            fs.readFile(convertedHtml, 'utf8', function (err, data) {
                                if (err) {
                                    console.error('Error reading file: ' + err);
                                    sliteError(err);
                                    return;
                                }
                                $ = cheerio.load(data); // parse the converted presentation HTML header in order to find out how many slides there is
                                // The second link in this HTML file is to the last slide image,
                                // like this: <a href="img14.html">
                                // characters 3-5 of "img14.html" is "14", the number of slides
                                var lastSliteFile = $('a').next().attr('href');
                                var numRegExp = /\d+\./;
                                var lastFileName = numRegExp.exec(lastSliteFile);
                                var numSlites = parseInt(lastFileName, 10);
                                if (isNaN(numSlites)) {
                                    console.log("Number of Slites not determined!");
                                    numSlites = 1;
                                }
                                slite.setFilename(hashDir, uploadFileTitle + '.' + conversionFormat, numSlites);
                                slite.generateHtml(function (err) {
                                    if (err) {
                                        sliteError(err);
                                        return;
                                    }
                                    socket.emit("slitePrepared", { dir: slite.dir, hash: slite.hashValue, num_slides: slite.num_slides, fileName: slite.filename });
                                });
                            }); // fs.readFile ...
                            // delete presentation in UPLOAD dir
                            //return;
                            fs.unlink(uploadFullFileName, function (err) {
                                console.log('DELETED presentation: ' + uploadFullFileName);
                                if (err) {
                                    console.error('Error deleting : ' + fullFileName);
                                }
                            });
                        }); // exec ...
                    } // try {
                    catch (err) {
                        console.error(err);
                        console.error('Stack: ' + err.stack);
                        console.error('JSON.stringify: ' + JSON.stringify(err, null, 2));
                        sliteError(err);
                    }
                } // if (err) ... else ...
            }); // fs.rename ...
        }); // slite = new ...
    }); // uploader.on("complete" ...

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
