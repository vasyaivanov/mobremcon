﻿var fs = require('fs-extra')
  , SocketIOFileUploadServer = require("socketio-file-upload")
  , path = require('path')
  , exec = require('child_process').exec
  , cheerio = require('cheerio')
  , Gaze = require('gaze')
  , prepare_slite = require('./prepare_slite.js')
  , numSlidesParser = require('./num-slides-parser.js')
  , Queue = require('./queue.js');


var XML_PATH = 'xml'
  , NUM_REG_EXP = /\d+\./
  , CONVERSION_FORMAT = 'html'//'jpg'
  , SUPPORTED_EXTENSIONS = ['PPT', 'PPTX']
  , UPLOAD_FILE_TITLE = 'img0'
  , MAX_QUEUE_LENGTH = 10000
  , WIDTH = 1280
  , COMPRESSION = 90
  , DEBUG = false;

var queue = new Queue.Queue(MAX_QUEUE_LENGTH);  // global queue for conversion
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

module.exports.isReservedHashFileName = function (file) {
    var reserved = (file === 'index.html' ||
                    file.match(/img[0-9]*.(html|jpg)$/i) ||
                    file.match(/text[0-9]*.html$/i));
    return reserved;
};

module.exports.isExtentionSupported = function (fileName) {
    var ext = path.extname(fileName).toUpperCase();
    if (ext[0] !== '.') {
        return false;
    }
    ext = ext.substring(1);
    var index = SUPPORTED_EXTENSIONS.indexOf(ext);
    return (index != -1);
}

function sliteError(slite, err, onSliteCompleteCallback) {
    console.error('ERROR WHILE UPLOADING/CONVERTING slite: ' + err);
    if (typeof slite !== 'undefined' && !DEBUG) {
        console.log('deleting hash');
        slite.deleteHash(true, function () {
            console.log('Deleted folder and hash due to an error');
        });
    }
    var data = {};
    data.error = true;
    slite.getParams().socket.emit("sliteConversionError", data);
    onSliteCompleteCallback && onSliteCompleteCallback(err);
}

module.exports.convert = function (pathName, origName, socket, opt, onSliteCompleteCallback, onQueueCompleteCallback) {
    elapsedTime("UPLOAD complete file: " + pathName + " converting...");

    var uploadExtention = path.extname(pathName);
    var uploadFileName = UPLOAD_FILE_TITLE + uploadExtention;
    var initialFileName = path.basename(pathName);

    var sliteParams = {
        socket: socket,
        initialFileName: initialFileName,
        uploadFileName: uploadFileName,
        origName : origName,
        onSliteCompleteCallback: onSliteCompleteCallback,
        opt: opt
    };

    var slite = new prepare_slite.Slite(sliteParams, function (err) {
        var hashDir = slite.getHashDir();
        var convertedFileName = UPLOAD_FILE_TITLE + '.' + CONVERSION_FORMAT;
        var convertedFullFileName = path.join(hashDir, convertedFileName)
        console.log("SLITE file: " + convertedFullFileName);

        if (err) {
            sliteError(slite, err, onSliteCompleteCallback);
            if (DEBUG) console.log('Deleting hash folder');
            fs.unlink(pathName, function (err) {
                if (err) {
                    console.error('Error deleting: ' + pathName + err);
                }
            });
            //callback(2);
			return;
        }
        var uploadFullFileName = slite.getUploadFullFileName();
        fs.rename(pathName, uploadFullFileName, function (err) {
            if (err) {
                console.error('Error renaming file: ' + err);
                sliteError(slite, err, onSliteCompleteCallback);
                if (DEBUG) console.log('Deleting hash folder');
                fs.unlink(pathName, function (err) {
                    if (err) {
                        console.error('Error deleting: ' + pathName + err);
                    }
                });
                return;
            }
            console.log('RENAMED file: ' + pathName + ' to:' + uploadFullFileName);

            // QUEUE START, add slite to the queue
            var priotity = 0; // TODO
            queue.add(slite, convertJob, priotity, onQueueCompleteCallback); // only the first queueCompleteCallback will be remembered and called on completion
        }); // fs.rename ...
    }); // slite = new ...
}; // uploader.on("complete" ...


function convertJob(err, slite, onSliteCompleteCallback) { // start of queue itemCallback
    if(DEBUG) {console.log("Executing convertJob");}
    var hashDir = slite.getHashDir();
    var uploadFullFileName = slite.getUploadFullFileName();
    var opt = slite.getParams().opt;
    if (err) {
        console.error(err + "Adding a new file: " + uploadFullFileName + " to the QUEUE");
        return;
    }
    resetElapsedTime();
    var conversionStartTime = start;
    var numSlides = 0,
        curSlide = -1,
        curSlideRepeats = 0,
        parseDone = false,
        readDone = false,
        finalDone = false,
        slideTimeSum = 0,
        parseTime, readTime, finalTime, averageSlideTime,
        PARSE_COEFF = 1.4,
        READ_COEFF = 2.5,
        FINAL_COEFF = 0.9,
        proc = -1;

    function deleteUploadFile(deletedFile) {
        fs.unlink(deletedFile, function (err) {
            console.log('DELETED presentation: ' + deletedFile);
            if (err) {
                console.error('Error deleting : ' + deletedFile);
            }
        });
    }

    function reportProgress(msg, noTime) {
        if (numSlides > 0) {
            var sum = 0;
            sum += parseDone ? PARSE_COEFF : 0;
            sum += readDone  ?  READ_COEFF : 0;
            sum += finalDone ? FINAL_COEFF : 0;
            sum += (curSlide + 1);
            var max = numSlides + PARSE_COEFF + READ_COEFF + FINAL_COEFF;
            if (DEBUG) console.log('sum=' + sum + ' max=' + max);
            var frac = (100 * sum / max);
            proc = frac;// + 0.5;
            proc = proc.toFixed(0);//Math.round
            var timeSpent = process.hrtime(conversionStartTime)[1] / 1000000;
            msg += ' PROGRESS: ' + proc + '%';
        }
        slite.getParams().socket.emit("uploadProgress", {
            slide: curSlide + 1,
            slides: numSlides,
            percentage: proc,
            message: msg,
            name: slite.getParams().initialFileName,
            time: timeSpent
        });
        if (noTime) {
            console.log(msg);
            return -1;
        } else {
            return elapsedTime(msg);
        }
    };

    reportProgress('STARTED conversion', true); //     display 0%

    console.log('PARSING: ' + uploadFullFileName);
    var xmlDeleter = numSlidesParser(uploadFullFileName, { xmlPath: XML_PATH, leaveXML: true }, function (err, data) {
        if (err) {
            console.error('Cannot parse: ' + uploadFullFileName + ' ', err);
        } else {
            numSlides = data;
            parseDone = true;
            parseTime = reportProgress('PARSED NUM SLIDES: ' + numSlides);
        }
    });
    if (DEBUG) console.log(xmlDeleter);

    // Watch all .js files/dirs in process.cwd()
    console.log('GAZE Starting with: ' + hashDir);
    var gaze;
    function unwatchGaze() {
        if (typeof gaze !== 'undefined') {
            gaze.close();
            console.log('Unwatched gaze');
        }
    }
    gaze = new Gaze('*', { cwd: hashDir, interval: 100 }, function (err, watcher) {
        if (err) {
            console.error(error);
        }
        this.on('error', function (error) {
            console.error(error);
        });
        // On file added
        this.on('added', function (filepath) {
            var basename = path.basename(filepath);
            if (DEBUG) console.log('File: ' + basename + ' added');
            if (basename.match(slite.getParams().opt.sliteRegExp)) {
                if (DEBUG) console.log('File: ' + basename + ' matched regexp: ' + slite.getParams().opt.sliteRegExp);
                var num = parseInt(NUM_REG_EXP.exec(basename), 10);
                if (DEBUG) console.log('Matched img' + num);
                if (num > curSlide) {
                    curSlide = num;
                    readDone = true;
                    var msg = 'CONVERTION';
                    //if(numSlides === 0)
                    msg += ' Slide:' + (curSlide + 1);
                    slideTimeSum += reportProgress(msg);
                } else {
                    console.log("Misplased order of slite upload, Slide:" + (num + 1));
                }
            }
        });
    });
    console.log('GAZE Started');

    var unoconvPathname = path.join(__dirname, 'unoconv'),

                // CONVERSION
                //unoconv_cmd = "python " + unoconvPathname + ' -f ' + CONVERSION_FORMAT + ' -o ' + hashDir + ' ' + uploadFullFileName;
                //unoconv_cmd = "python " + unoconvPathname + ' -e PageRange=1-1' + ' -f ' + CONVERSION_FORMAT + ' -o ' + hashDir + ' ' + uploadFullFileName;                 // milti-platform version
        unoconv_cmd = "python " + unoconvPathname + ' -e Width=' + WIDTH + ' -e Compression=' + COMPRESSION + '%' + ' -f ' + CONVERSION_FORMAT + ' -o ' + hashDir + ' ' + uploadFullFileName;   // milti-platform version
    //unoconv_cmd = "python " + unoconvPathname + ' -e PixelWidth=1024 -e Compression=75%' + ' -f ' + CONVERSION_FORMAT + ' -o ' + hashDir + ' ' + uploadFullFileName;   // milti-platform version
    //unoconv_cmd = '/opt/libreoffice4.2/program/soffice.bin --headless --convert-to html:impress_html_Export --outdir ' + hashDir + ' ' + uploadFullFileName; // not a mutli-platform version
    console.log(unoconv_cmd);

    exec(unoconv_cmd, function (err, stdout, stderr) {
        //err = 'UNOCONV ERROR TEST';
        if (err !== null) {
            console.error('UNOCONV Error: ');
            sliteError(slite, err, onSliteCompleteCallback);
            unwatchGaze();
            return;
        }
        finalDone = true;
        finalTime = reportProgress('FINAL stage: ' + slite.hashValue);
        var convertedHtml = path.join(hashDir, UPLOAD_FILE_TITLE + '.' + CONVERSION_FORMAT);

        function finish() {
            if(DEBUG) {console.log("finish()");}
            unwatchGaze();
            slite.setNumSlides(numSlides);
            console.log("SLITE file: " + uploadFullFileName + " Slides:" + slite.num_slides);

            // Saving slide to DB
            var titleS = slite.getParams().origName;
            titleS = titleS.replace(/\.[^/.]+$/, "");
            titleS = titleS.replace(/\_/, " ");
            if (opt.stitle) {
                titleS = opt.stitle;
            }

            module.parent.exports.readSlideSize(hashDir, function (sizec) {
                if(DEBUG) {console.log("Read slite size: " + sizec);}
				var domainSet = (opt.domain == 1 && opt.domainSet == 1) ? 1 : 0;
                var addSlide = new opt.SlidesScheme({ uid: opt.userSessionId, sid: slite.hashValue, tmp: ((opt.userAuth) ? 0 : 1), title: titleS, size: ((sizec > 0) ? sizec : 0), desc: opt.sdesc, url: opt.surl, crawled: opt.scrawled, site: opt.ssite, keywords: opt.skeywords, slidesNum: numSlides, domainSet: domainSet });
                if(DEBUG) {
                    console.log("OTP: ");
                    console.log(opt);
                    console.log("Starting new SlidesScheme: ");
                    console.log(addSlide);
                }
                addSlide.save(function (err, saved) {
                    if(DEBUG) {
                        console.log("Saved Scheme: ");
                        console.log(saved);
                    }
                    if (err) {
                        console.error('Can\'t insert a new Slide ' + err);
                    }

					// Move files to S3
					moveFilesToS3(function() {
						// Remove hash dir
						opt.removeDirFunc(hashDir);
						if (slite.getParams().opt.noSocketRet !== 1) {
							if(DEBUG) {console.log("Socket emitting: slitePrepared");}
							slite.getParams().socket.emit("slitePrepared", { dir: hashDir, hash: slite.hashValue, slides: slite.num_slides, fileName: slite.getParams().initialFileName });
							if(DEBUG) {console.log("Socket emitted: slitePrepared");}
						}

						if(DEBUG){console.log("Executing onSliteCompleteCallback");}
							onSliteCompleteCallback && onSliteCompleteCallback(err);
						if(DEBUG){console.log("onQueueCompleteCallback is executed");}
					});
                });
            });

                        /*slite.generateHtml(function (err) {
                            if (err) {
                                sliteError(err, hashDir, onSliteCompleteCallback);
                                unwatchGaze();
                                return;
                            }
                            elapsedTime("INDEX generated: " + path.join(slite.getParams().opt.www_dir, slite.hashValue, 'index.html'));
                            start = conversionStartTime;
                            elapsedTime("\nSUCCESS! CONVERTED PRESENTATION");
                            averageSlideTime = slideTimeSum / numSlides;
                            if (numSlides >= 1) console.log('Average time per slide: ' + Math.round(averageSlideTime) + ' ms');
                            if (numSlides >= 1 && averageSlideTime) {
                                console.log('P:%d(%d) R:%d(%d) F:%d(%d)',
                                        (parseTime / averageSlideTime).toFixed(2), PARSE_COEFF,
                                        (readTime / averageSlideTime).toFixed(2), READ_COEFF,
                                        (finalTime / averageSlideTime).toFixed(2), FINAL_COEFF);
                            }
                            console.log('\n');


                            // Do not return finish callback if crawler uploads
                            if(slite.getParams().opt.noSocketRet != 1) {
                                slite.getParams().socket.emit("slitePrepared", { dir: hashDir, hash: slite.hashValue, slides: slite.num_slides, fileName: slite.getParams().initialFileName });
                            }
                            else {
                                onConvertCallback(1);
                            }

                            // delete XML
                            if (typeof xmlDeleter != 'undefined') {
                                xmlDeleter.deleteXML(xmlDeleter);
                            }

                            // rename presentation to the original name
                            var origFullFileName = path.join(hashDir, slite.getParams().origName);
                            fs.rename(uploadFullFileName, origFullFileName, function (err) {
                                if (err) {
                                    console.error('Error renaming file: ' + err);
                                    deleteUploadFile(uploadFullFileName);
                                    return;
                                }
                                console.log('RENAMED file: ' + uploadFullFileName + ' to:' + origFullFileName);
                            });
                        });*/
        }; // function finish() {

		function moveFilesToS3(callback) {
			var extExpToS3 = ['.jpeg','.jpg','.ppt', '.pptx'];
			fs.readdirSync(hashDir).forEach(function(file,index){
			  if(extExpToS3.indexOf(path.extname(file)) != -1) {
				var fileBuffer = fs.readFileSync(hashDir + '/' + file);
				opt.AWS_S3.putObject({Bucket: opt.AWS_S3_BUCKET, Key: slite.hashValue + '/' + file, Body: fileBuffer}, function(err, data) {
					if (err) console.log(err)
				 });
			  }
			});
			callback();
		} 
		
        if (numSlides === 0 || isNaN(numSlides) || !numSlides) {
            fs.readFile(convertedHtml, 'utf8', function (err, data) {
                if (err) {
                    console.error('Error reading file: ' + err);
                    sliteError(slite, err, onSliteCompleteCallback);
                    unwatchGaze();
                    numSlides = 1;
                } else {
                    $ = cheerio.load(data); // parse the converted presentation HTML header in order to find out how many slides there is
                    // The second link in this HTML file is to the last slide image,
                    // like this: <a href="img14.html">
                    // characters 3-5 of "img14.html" is "14", the number of slides
                    var lastSliteFile = $('a').next().attr('href');
                    console.log('lastSliteFile: ' + lastSliteFile);
                    var lastFileName = NUM_REG_EXP.exec(lastSliteFile);
                    try {
                        numSlides = parseInt(lastFileName, 10) + 1;
                    } catch (err) {
                        console.error('Error reading num slides from HTML: ', err);
                        numSlides = null;
                    }
                    if (isNaN(numSlides) || numSlides <= 0) {
                        console.log("Number of Slides not determined!");
                        numSlides = 1;
                    }
                }
                console.log('NUM SLIDES from html: ' + numSlides);

                finish();
            }); // fs.readFile ...
        } else {
            finish();
        }
                    //return;


                    // delete presentation in UPLOAD dir
    }); // exec ...
};
