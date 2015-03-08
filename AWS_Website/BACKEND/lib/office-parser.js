var OfficeParser = (function () {

    var fs     = require("fs-extra"),
        xml2js = require("xml2js"),
        parser = xml2js.Parser({ xmlns: "w" }),
        zip    = require("adm-zip"),
        path   = require("path");


  var EXTRACT_FOLDER = "./xml",
      ext            = ['.docx', '.xlsx', '.pptx'];
    
    function setExtractFolder(v) { 
        EXTRACT_FOLDER = v;
    };
    
    function getExtractFolder() {
        return EXTRACT_FOLDER;
    };


    //reads file and returns of the file
    var readFile = function (file, xml, next) {
        //console.log('readFile(' + file + ')');
        //extract content of file, first test for supported extensions
        fs.exists(file, function (exist) {
            if (exist) {
                //console.log('File: ' + file + ' exists');
                if (HasSupportedExtension(file)) {
                    //console.log('File: ' + file + ' has supported extensions');
                    var zipFile = new zip(file);
                    //console.log('unzipped file: ' + file + ', ENTRIES:');
                    var entries = zipFile.getEntries();
                    //entries.forEach(function (e) {
                        //console.log(e.entryName);
                    //});
                    var dir = path.dirname(file);
                    var exrtactFolder = path.join(dir, EXTRACT_FOLDER);
                    //console.log('extracting to folder: ' + exrtactFolder);
                    zipFile.extractAllTo(exrtactFolder, true);
                    var rawXmlPath = path.join(dir, EXTRACT_FOLDER, xml);
                    //console.log('extracted All, starting parsing xml: ' + rawXmlPath);
                    parseDocument(rawXmlPath, next);
                    //console.log('exiting parseDocument(), file: ' + file);
                }
            } else {
                var err = new Error('cannot find file: ' + file);
                next(err, null);
            }
        });
    };
    
    function deleteXML(file, next){
        var dir = path.dirname(file);
        var deleteFolder = path.join(dir, EXTRACT_FOLDER);
        //console.log('Deleting XML folder: ' + deleteFolder);
        fs.remove(deleteFolder, next);
    };

    //parse content xml document
    var parseDocument = function (rel, next) {
        //console.log('parseDocument(' + rel + ')');
        fs.exists(rel, function (exist) {
            //console.log('exist executed, file: ' + rel);
            if (exist) {
                //console.log('Exists, Starting reading File: ' + rel);
                fs.readFile(rel, function (err, data) {
                    if (err) {
                        next(err, null);
                    } else {
                        //console.log('Started to read file: ', rel);
                        var parser = new xml2js.Parser();
                        parser.parseString(data, function (err, result) {
                            //console.log('Done parsing, result: ');
                            //console.dir(result);
                            next(null, result);
                        });
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
        //console.log('HasSupportedExtension(' + file + ')');
        var extension = path.extname(file);
        //console.log('EXTENSION: ' + extension);
        for (var key in ext) {
           if (ext[key] === extension) {
                return true;
            }
        }
        console.error("Unsupported File format, Must be an Open office XML format of either .docx,.xlsx or .pptx");
        return false;
    }

     return {
        readFile             : readFile,
        parseDocument        : parseDocument,
        getExtractFolder     : getExtractFolder,
        setExtractFolder     : setExtractFolder,
        HasSupportedExtension: HasSupportedExtension,
        deleteXML            : deleteXML
    };

})();

module.exports = OfficeParser;
