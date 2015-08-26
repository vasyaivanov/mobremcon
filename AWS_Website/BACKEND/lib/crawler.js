// Google crawler v0.1
// Written by Konstantin R.
// konrasko@gmail.com
var Bing = require('node-bing-api')({ accKey: "1UrRmnNJw+zdJprF+uz9FY5JOhKvcV7NX6+XqlgfyjE" })
  , path = require('path')
  , converter = require('./converter.js')
  , fs = require('fs')
  , request = require('request')
  , SLITE_EXT = '.jpg'
  , SLIDE_REG_EXP = new RegExp('^img\\d+' + SLITE_EXT + '$')
  , recordsPerRequest = 50
  ;

 // Slite bing api key 1UrRmnNJw+zdJprF+uz9FY5JOhKvcV7NX6+XqlgfyjE
 
var domainArray = [];

domainArray["slite.loc"] = "slides";
domainArray["www.truthstage.com"] = 'conspiracy theorists presidential representative campaign';
domainArray["www.writerstage.com"] = 'writers';
domainArray["www.productsstage.com"] = 'salesman';
domainArray["www.girlstage.com"] = "women in tech";


var addSuffixToSearch = "filetype:ppt";

 exports.crawl = function(host,maxresults,dbSchema, www_dir, slitesDir) {
	var uploadDir = path.join(www_dir, "UPLOAD");
	if(domainArray[host]) {
		googleSquery = domainArray[host] + " " + addSuffixToSearch;
		var i = 0;
		function bingSearch(i) {
			if( i < maxresults) {
				Bing.web(googleSquery, {
						top: recordsPerRequest, 
						skip: i*recordsPerRequest,
						market: 'en-US',
					}, function(error, res, body){
						if(error) {
							console.log(error);
						}
						else {
							var a = 0;
							function uploader(a) {
							  if( a < body.d.results.length) {
								var file = body.d.results[a].Url;
								var fileName = file.match('(.*)\/(.*)$');
								var fileNameSend = fileName[2];
								fileNameSend = fileNameSend.replace(/[^\w\s\.]/gi, '');
								getFile({uploadDir: uploadDir, url: body.d.results[a].Url, filename: fileNameSend,title: body.d.results[a].Title, desc: body.d.results[a].Description, host: host, dbSchema: dbSchema, keywords: domainArray[host]}, function(error,data) {
									try {
										if(error == 1) {throw "Can't download file"}
										if(error == 2) {throw "File exists in DB"}
										if(error == 3) {throw "Wrong file format"}										
									}
									catch(err) {
										console.log(err + " " + data.filename)
										uploader(a+1)
									}
									if(!error) {
										console.log("+++++++++++++++++++++++++++++++++++++++\nUploaded: " + data.filename);
										converter.convert(path.join(uploadDir,data.filename), data.filename, module.parent.exports.io, {www_dir: www_dir, slitesDir: slitesDir, sliteRegExp: SLIDE_REG_EXP, uploadDir: uploadDir, SlidesScheme: dbSchema,  userAuth: 1, stitle: data.title, sdesc: data.desc, surl: data.url, scrawled: 1, noSocketRet: 1, ssite: data.host, skeywords: data.keywords},
										function (err) { // onSliteCompleteCallback callback
											uploader(a+1)
											if(!err) {
												console.log("File converted\n+++++++++++++++++++++++++++++++++++++++++++");
											}
											else {
												console.log("File is not converted\n+++++++++++++++++++++++++++++++++++++++++++");										
											}
										});
									}

								})
							  }
							  else {
								  bingSearch(i+1);
							  }
							}
							uploader(0);
						}
					}
				);
			}
		}
		bingSearch(0);
	}
 
 }

function getFile (data, callback) {
	data.dbSchema.find({url: data.url }, function (err, docs) {
			if (!docs.length){
				if(data.filename.match(/\.(ppt|pptx)$/i)) {
					var fileWrite = fs.createWriteStream(path.join(data.uploadDir,data.filename));
					request({ url: data.url},
							function(error, response, body) {
								if (error) {
									fs.unlinkSync(path.join(data.uploadDir,data.filename));
									callback("1", data);
								}	
							}
					).on('response', function(response) {
						console.log(response.statusCode) // 200
						console.log(response.headers['content-type']) // 'image/png'
					})
					.on('end',
						function(file) {
							callback(null, data);
						}
					).pipe(fileWrite);
				}
				else {
					callback(3, data);
				}
			}
			else {
				console.log("This file found in DB, skipping it..." + data.url);							
				callback("2", data);
			}

	});
}