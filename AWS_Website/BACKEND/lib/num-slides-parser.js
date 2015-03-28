var path = require('path')
  , fs = require("fs-extra")
  , ppt = require('ppt')
  , officeParser = require("./office-parser")
  , APP_XML = '/docProps/app.xml'
  , DEBUG = false;


module.exports = function (parsedFile, opt, next) {
    function deleteXML(params, next) {
        _deleteXML(params.parsedFile, params.xmlPath, next);
    }

    function _deleteXML(parsedFile, xmlPath, next) {
        officeParser.deleteXML(parsedFile, xmlPath, function (err) {
            if (err) {
                console.error('Error while deleting XML: ', err);
            } else {
                console.log('XML files deleted');
            }
            if (typeof next != 'undefined') next();
        });
    }

    var parsedNumSlides = 0;
    if(DEBUG) console.log('PARSING: ' + parsedFile);
    var parsedExt = path.extname(parsedFile);
    if (DEBUG) console.log('parsedExt=' + parsedExt);
    if (parsedExt === '.ppt') {
        var opts = {};
        if (DEBUG) {
            opts.WTF = 1;
            opts.dump = 1;
        }
        
        try {
            if(DEBUG) console.log('Starting readFile(' + parsedFile + ')');
            var w = ppt.readFile(parsedFile, opts);
            if (DEBUG) console.log('PPT:');
            if (DEBUG) console.log(w);
            parsedNumSlides = w.slides.length;
            if (DEBUG) console.log(ppt.utils.to_text(w));//.join("\n"));
            next(null, parsedNumSlides);
        } catch (err) {
            if (DEBUG) console.error('Error while using ppt.readFile():', err);
            next(err, 0);
        }
    } else {
        if (DEBUG) console.log('starting XML officeParser...');
        officeParser.readFile(parsedFile, APP_XML, {xmlPath: opt.xmlPath }, function (err, data) {
            var error = null;
            if (err) {
                if (DEBUG) console.error('Parsed with error', err);
                parsedNumSlides = 0;
                error = err;
            } else {
                if (DEBUG) console.log('Parsing complete, Object:');
                if (DEBUG) console.log(data);
                try {
                    parsedNumSlides = parseInt(data['Properties']['Slides'][0]);
                } catch (err) {
                    if (DEBUG) console.error('Error parsing' + APP_XML + ' ', err);
                    parsedNumSlides = 0;
                    error = err;
                }
            }
            
            if (!(parsedNumSlides > 0)) {
                if (DEBUG) console.log('Cannot parse ' + APP_XML, ' ', error);
                error = null;
                var dir = path.dirname(parsedFile);
                var exrtactFolder = path.join(dir, opt.xmlPath);
                var scanDir = path.join(exrtactFolder, '/ppt/slides/');
                if (DEBUG) console.log(scanDir);
                var files = fs.readdir(scanDir, function (err, files) {
                    if (DEBUG) console.log('XML Slides dir:\n', files);
                    if (err) {
                        error = err;
                        if (DEBUG) console.log('Error reading XML Slides dir: ', err);
                    } else {
                        if (files.length) {
                            parsedNumSlides = files.length - 1;
                            if (DEBUG) console.log('Number if slides in XML Slides dir: ' + parsedNumSlides);
                        } else {
                            error = new Error('Number of files in slides folder not detemined');
                        }
                        next(error, parsedNumSlides);
                        if (!DEBUG && !opt.leaveXML) deleteXML(parsedFile, opt.xmlPath);
                    }
                });
            } else {
                next(error, parsedNumSlides);
                if (!DEBUG && !opt.leaveXML) _deleteXML(parsedFile, opt.xmlPath);
            }               
         }); // officeParser.readFile ..
         return {
            deleteXML:  deleteXML, 
            parsedFile: parsedFile, 
            xmlPath:    opt.xmlPath
         };
    } // if (parsedExt === '.ppt') {} else ..
}; // module.exports =
