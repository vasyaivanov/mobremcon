var path = require('path')
  , fs   = require("fs-extra")
  , officeParser = require("./office-parser");


module.exports = function (parsedFile, opt, next) {
    var parsedNumSlides = 0;
    //console.log('PARSING: ' + parsedFile);
    var parsedExt = require('path').extname(parsedFile);
    //console.log('parsedExt=' + parsedExt);
    if (parsedExt === '.ppt') {
        var opts = {
            //WTF: 1,
            //dump: 1
        };
        
        try {
            var w = ppt.readFile(parsedFile, opts);
            //console.log('PPT:');
            //console.log(w);
            parsedNumSlides = w.slides.length;
            //console.log(ppt.utils.to_text(w));//.join("\n"));
            next(null, parsedNumSlides);
        } catch (err) {
            next(err, -1);
        }
    } else {
        //console.log('starting officeParser...');
        officeParser.readFile(parsedFile, opt.xml, function (err, data) {
            if (err) {
                next(err, -1);
            } else {
                //console.log('Parsing complete, Object:');
                //console.log(data);
                try {
                    parsedNumSlides = parseInt(data['Properties']['Slides'][0]);
                    next(null, parsedNumSlides);
                    deleteXML();
                } catch (err) {
                    //console.log('Cannot parse ' + XML, 'Error:', err);
                    var dir = path.dirname(parsedFile);
                    var exrtactFolder = path.join(dir, officeParser.getExtractFolder());
                    var scanDir = path.join(exrtactFolder, '/ppt/slides/');
                    //console.log(scanDir);
                    var files = fs.readdir(scanDir, function (err, files) {
                        //console.log(files);
                        parsedNumSlides = files.length - 1;
                        if (err || isNaN(parsedNumSlides) || typeof parsedNumSlides === 'undefined') {
                            next((err ? err : new Error('Illegal number of slides')), -1);
                        } else {
                            next(null, parsedNumSlides);
                        }
                        deleteXML();
                    });
                }
                
                function deleteXML() {
                    officeParser.deleteXML(parsedFile, function (err) {
                        if (err) {
                            console.error(err);
                        } else {
                            console.log('XML files deleted');
                        }
                    });
                }
            }
        });
    }
};
