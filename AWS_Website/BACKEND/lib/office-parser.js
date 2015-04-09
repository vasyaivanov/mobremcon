    var fs     = require("fs-extra"),
        xml2js = require("xml2js"),
        parser = xml2js.Parser({ xmlns: "w" }),//
        zip    = require("adm-zip"),
        path   = require("path"),
        wrench = require('wrench');


    var XML_PATH = "./xml",
        EXT      = ['.docx', '.xlsx', '.pptx'];
        DEBUG    = false;


var OfficeParser = (function () {
    //reads file and returns of the file
    var readFile = function (file, openXml, opt, next) {
        if (DEBUG) console.log('readFile(' + file + ')');
        if (!opt.xmlPath) {
            opt.xmlPath = XML_PATH;
        }
        //extract content of file, first test for supported extensions
        fs.exists(file, function (exist) {
            if (exist) {
                if (DEBUG) console.log('File: ' + file + ' exists');
                if (HasSupportedExtension(file)) {
                    if (DEBUG) console.log('File: ' + file + ' has supported extensions');
                    var zipFile = new zip(file);
                    if (DEBUG) {
                        console.log('unzipped file: ' + file + ', ENTRIES:');
                        var entries = zipFile.getEntries();
                        entries.forEach(function (e) {
                            console.log(e.entryName);
                        });
                    }
                    var dir = path.dirname(file);
                    var exrtactFolder = path.join(dir, opt.xmlPath);
                    if (DEBUG) console.log('extracting to folder: ' + exrtactFolder);
                    zipFile.extractAllTo(exrtactFolder, true/*overwrite*/);
                    var rawXmlPath = path.join(dir, opt.xmlPath, openXml);
                    if (DEBUG) console.log('extracted All, starting parsing xml: ' + rawXmlPath);
                    parseDocument(rawXmlPath, next);
                    if (DEBUG) console.log('exiting parseDocument(), file: ' + file);
                } else {
                    next(new Error('Extension not supported'), null);
                }
            } else {
                next(new Error('cannot find file: ' + file), null);
            }
        });
    };
    
    function deleteXML(file, xmlPath, next){
        var dir = path.dirname(file);
        if (DEBUG) console.log('Deleting XML folder, dir:' + dir + ' xmlPath:' + xmlPath);
        var deleteFolder = path.join(dir, xmlPath);
        if (DEBUG) console.log('Deleting XML floder: ' + deleteFolder);
        var failSilent = false;
        wrench.rmdirRecursive(deleteFolder, failSilent, function (err) {
            if (err) {
                if (DEBUG) console.error('Error while deleting XML: ', err);
                next(err);
            } else {
                if (DEBUG) console.log('xml deleted');
                next(null);
            }
        });
    };

    //parse content xml document
    var parseDocument = function (rel, next) {
        if (DEBUG) console.log('parseDocument(' + rel + ')');
        fs.exists(rel, function (exist) {
            if (DEBUG) console.log('exist executed, file: ' + rel);
            if (exist) {
                if (DEBUG) console.log('Exists, Starting reading File: ' + rel);
                fs.readFile(rel, function (err, data) {
                    if (err) {
                        next(err, null);
                    } else {
                        if (DEBUG) console.log('Started to read file: ', rel);
                        var parser = new xml2js.Parser();
                        parser.parseString(data, function (err, result) {
                            if (DEBUG) console.log('Done parsing, result: ');
                            if (DEBUG) console.dir(result);
                            next(null, result);
                        });
                        //console.log(Object.getOwnPropertyNames(parser));
                    }
                });
            } else {
                var err = new Error("File not found at specified path: " + rel);
                next(err, null);
            }
        });
    };


    //Utility functions
    var HasSupportedExtension = function (file) {
        if (DEBUG) console.log('HasSupportedExtension(' + file + ')');
        var extension = path.extname(file);
        if (DEBUG) console.log('EXTENSION: ' + extension);
        for (var key in EXT) {
           if (EXT[key] === extension) {
                return true;
            }
        }
        console.error("Unsupported File format, Must be an Open office XML format of either .docx,.xlsx or .pptx");
        return false;
    }

     return {
        readFile             : readFile,
        parseDocument        : parseDocument,
        HasSupportedExtension: HasSupportedExtension,
        deleteXML            : deleteXML
    };

})();

module.exports = OfficeParser;
