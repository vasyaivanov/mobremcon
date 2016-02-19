var path = require('path')
  , fs = require("fs-extra")
  , xml2js = require("xml2js")
  , SLIDES_PATH = 'ppt/slides/'
  , SLIDES_REG_EXP = /slide[0-9]*.xml$/i
  , PAR_REG_EXP = /<a:t>[^<>]*?<\/a:t>/gi
  , DEBUG = false;


module.exports = function (xmlDir, htmlFile, next) {
    if(DEBUG) console.log('PARSING TEXT FROM: ' + xmlDir + ' TO HTML FILE: ' + htmlFile);
    var scanDir = path.join(xmlDir, SLIDES_PATH);
    if (DEBUG) console.log('Scan dir:' + scanDir);
    var files = fs.readdir(scanDir, function (err, files) {
        if (DEBUG) console.log('XML Slides dir:\n', files);
        if (err) {
            if (DEBUG) console.log('Error reading XML Slides dir: ', err);
            next(err);
            return;
        } 
        if (DEBUG) console.log('Number of slides in XML Slides dir: ' + files.length);
        var text = ''; // accumulator of all text in all pages
 
        function slideLoader(f) {
            if( f < files.length ) {    
                var filename = files[f];
                if(filename.match(SLIDES_REG_EXP)) // if file is a slide
                {
                    var filePathName = path.join(scanDir, filename);
                    if(DEBUG) console.log("PARSING TEXT IN FILE: " + filePathName);

                    fs.readFile(filePathName, function (err, data) {
                        if (err) {
                            if (DEBUG) console.error('Parsed text with error', err);
                            next(err);
                            return;
                        } else {
                            if(DEBUG) console.log('FILE #' + f + ' READ');
                            // quick and dirty parser - expode prone
                            //if (DEBUG) console.log('Parsing text complete, Object:');                     
                            //if (DEBUG) console.log(data);
                            var strData = data.toString();
                            //if (DEBUG) console.log('String: ');
                            //if (DEBUG) console.log(strData);
                            // convert all xml text fields to an array of strings
                            var pars = strData.match(PAR_REG_EXP); // avoid angle backets
                            //if (DEBUG) console.log("string match:");
                            //if (DEBUG) console.dir(pars);
                            if(pars)
                            {
                                var page = '';
                                // replace <p:t> tags with <p>
                                for(var i in pars)
                                {
                                    var par = pars[i].slice(5, -6);
                                    if(par)
                                    {
                                        par = '<p>' + par + '</p>';
                                        page += par;
                                        //if(DEBUG) console.log(par);
                                     }
                                }
                                if(DEBUG) console.log("PAGE #" + f + ' TEXT:\n' + page);
                                text += page; // append page to total text
                            } // if(pars)
                            slideLoader(f+1); //  next file
                        } // if(err) .. else ...
                    }); // fs.readFile(filePathName ...
                } else { // if(filename.match ...
                    slideLoader(f+1); //  not a slide - next file    
                }
            } else { // if( f < files.length ...
                // reached the end of files array
                // append an invisible text to html file
                if(text.length === 0) 
                {
                    next(null);
                    return;
                }
                if(DEBUG) console.log('TOTAL TEXT:\n' + text);
                fs.readFile(htmlFile, "utf8", function (err, data) {
                    if (err) {
                        if (DEBUG) console.error('Error reading html file', err);
                        next(err);
                        return;
                    } else {
                        var data_replaced = data.replace('</body>', 
                                                         '<div id="content" style="position: absolute; left: -99999px;">' + text + '</div></body>');
                        if(DEBUG) console.log("READY HTML FILE:\n" + data_replaced); 
                        fs.writeFile(htmlFile, data_replaced, function (err) {
                            if (err) {
                                if (DEBUG) console.error('Error writing html file', err);
                                next(err);
                             } else {
                                if(DEBUG) console.log('TEXT APPENDED TO HTML:');
                                next(null);
                            }
                        });
                    }
                });
            }
        } // function loader(i) ...

        slideLoader(0);
 
    }); // var files = fs.readdir ...
}; // module.exports =



                    // PROPER PARSER - TODO
                    /*
                    var xmlParser = new xml2js.Parser();
                    xmlParser.parseString(data, function (err, result) {
                        if(err)
                        {
                            console.error("Error initializing parser: " + err);
                            error = err;
                        } else {

                            //var obj = JSON.parse(result);
                            //error = "No p.sld field in XML file";
                            //console.error(error);
                        
                            if (DEBUG) console.log('Done parsing, result.length=' + result.length + ' result: ');
                            if (DEBUG) console.dir(result);
                            if (DEBUG) console.log('Done parsing, result[p:sld]: ');
                            console.dir(result['p:sld']);
                            if (DEBUG) console.log('Done parsing, result[$]: ');
                            console.dir(result['p:sld']['$']);

                            //if (DEBUG) console.log('Done parsing, object: ');
                            //if (DEBUG) console.dir(obj);
                        }
                        next(error, result);
                    });
                    */
