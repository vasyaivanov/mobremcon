var fs = require('fs-extra')
  , SocketIOFileUploadServer = require("socketio-file-upload")
  , path = require('path')
  , exec = require('child_process').exec
  , cheerio = require('cheerio')
  , Gaze = require('gaze')
  , prepare_slite = require('./prepare_slite.js')
  , numSlidesParser = require('./num-slides-parser.js');

var XML_PATH = 'xml'
  , NUM_REG_EXP = /\d+\./
  , CONVERSION_FORMAT = 'html'//'jpg'
  , WIDTH = 1024
  , COMPRESSION = 80
  , DEBUG = false;

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

module.exports.convert = function (pathName, socket, opt) {
    elapsedTime("UPLOAD complete file: " + pathName);
    
    var extention = path.extname(pathName);
    var slite;          // currently loaded Slite
    var initialFileName = path.basename(pathName);
    var gaze;
    var xmlDeleter;
    
    function sliteError(err, hashDir) {
        console.error('ERROR WHILE UPLOADING/CONVERTING slite: ' + err);
        if (typeof gaze !== 'undefined') {
            gaze.close();
            console.log('Unwatched gaze');
        }
        if (typeof slite !== 'undefined' && !DEBUG) {
            console.log('deleting hash'); 
            slite.deleteHash(true, function () {
                console.log('Deleted folder and hash due to an error');
            });
        }
        var data = {};
        data.error = true;
        socket.emit("sliteConversionError", data);
    }
    
    slite = new prepare_slite.Slite(socket, function (err) {
        var hashDir = path.join(opt.www_dir, opt.slitesDir, slite.hashValue);
        if (err) {
            sliteError(err, hashDir);
            if (DEBUG) console.log('Deleting hash folder');
            fs.unlink(pathName, function (err) {
                if (err) {
                    console.error('Error deleting: ' + pathName + err);
                }
            });
            return;
        }
        var uploadFileTitle = 'img0';
        var uploadFileName = uploadFileTitle + extention;
        var uploadFullFileName = path.join(hashDir, uploadFileName);
        
        
        fs.rename(pathName, uploadFullFileName, function (err) {
            if (err) {
                console.error('Error renaming file: ' + err);
                sliteError(err, hashDir);
                if (DEBUG) console.log('Deleting hash folder');
                fs.unlink(pathName, function (err) {
                    if (err) {
                        console.error('Error deleting: ' + pathName + err);
                    }
                });
                return;
            } else {
                console.log('RENAMED file: ' + pathName + ' to:' + uploadFullFileName);
                
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
                    READ_COEFF = 2.5
                    FINAL_COEFF = 0.9,
                    proc = -1;
                
                function reportProgress(msg, noTime) {
                     if (numSlides > 0) {
                        var sum = 0;
                        sum += parseDone ? PARSE_COEFF : 0;
                        sum += readDone  ?  READ_COEFF : 0;
                        sum += finalDone ? FINAL_COEFF : 0;
                        sum += (curSlide + 1);
                        var max = numSlides + PARSE_COEFF + READ_COEFF + FINAL_COEFF;
                        if(DEBUG) console.log('sum=' + sum + ' max=' + max);
                        var frac = (100 * sum / max);
                        proc = frac;// + 0.5;
                        proc = proc.toFixed(0);//Math.round
                        var timeSpent = process.hrtime(conversionStartTime)[1] / 1000000;
                        msg += ' PROGRESS: ' + proc + '%';
                    }
                    socket.emit("uploadProgress", {
                        slide: curSlide + 1, 
                        slides: numSlides, 
                        percentage: proc, 
                        message: msg, 
                        name: initialFileName, 
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
                xmlDeleter = numSlidesParser(uploadFullFileName, { xmlPath: XML_PATH, leaveXML: true }, function (err, data) {
                    if (err) {
                        console.error('Cannot parse: ' + uploadFullFileName + ' ', err);
                    } else {
                        numSlides = data;
                        parseDone = true;
                        parseTime = reportProgress('PARSED NUM SLIDES: ' + numSlides);
                    }
                });
                if(DEBUG) console.log(xmlDeleter);               
                
                // Watch all .js files/dirs in process.cwd()
                console.log('GAZE Starting with: ' + hashDir);
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
                        if (basename.match(opt.sliteRegExp)) {
                            if (DEBUG) console.log('File: ' + basename + ' matched regexp: ' + opt.sliteRegExp);
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
                        sliteError(err, hashDir);
                        return;
                    }
                    finalDone = true;
                    finalTime = reportProgress('FINAL stage: ' + slite.hashValue);
                    var convertedHtml = path.join(hashDir, uploadFileTitle + '.' + CONVERSION_FORMAT);
                    
                    function finish() {
                        if (typeof gaze !== 'undefined') {
                            gaze.close();
                            console.log('Unwatched gaze');
                        }
                        slite.setFilename(hashDir, uploadFileTitle + '.' + CONVERSION_FORMAT, numSlides);
                        slite.generateHtml(function (err) {
                            if (err) {
                                sliteError(err, hashDir);
                                return;
                            }
                            elapsedTime("INDEX generated: " + path.join(opt.www_dir, slite.hashValue, 'index.html'));
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
                            
                            socket.emit("slitePrepared", { dir: slite.dir, hash: slite.hashValue, slides: slite.num_slides, fileName: initialFileName });
                            
                            if (typeof xmlDeleter != 'undefined') {
                                xmlDeleter.deleteXML(xmlDeleter);
                            }
                        });
                    };
                    
                    if (numSlides === 0 || isNaN(numSlides) || !numSlides) {
                        fs.readFile(convertedHtml, 'utf8', function (err, data) {
                            if (err) {
                                console.error('Error reading file: ' + err);
                                sliteError(err, hashDir);
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
                    // delete presentation in UPLOAD dir
                    //return;
                    if (!DEBUG) {
                        fs.unlink(uploadFullFileName, function (err) {
                            console.log('DELETED presentation: ' + uploadFullFileName);
                            if (err) {
                                console.error('Error deleting : ' + pathName);
                            }
                        });
                    }
                }); // exec ...
            } // if (err) ... else ...
        }); // fs.rename ...
    }); // slite = new ...
}; // uploader.on("complete" ...
