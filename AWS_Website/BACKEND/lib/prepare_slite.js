var CachemanMongo = require('cacheman-mongo');
//var mongodb = require('mongodb');
var io = require('socket.io-client');
var fs = require('fs');

var options = { 

  port: 27017,
  host: '127.0.0.1',
  db: 'test',
  collection: 'my-collection'
};

var cache = new CachemanMongo(options);

var socket = io.connect('http://localhost:1337');

socket.on('connect', function(){
	console.log("MA connected in hash.js");
});

socket.on('error', function(err){
	console.log("MA: error: " + JSON.stringify(err));
});

function getHash()
{
	
	var time = process.hrtime() // get unique number
	, salt = Math.floor(Math.random() * Math.pow(4, Math.random()*4)) // get variable length prefix
	, hash = salt.toString(36) + time[0].toString(36)// + time[1].toString(36) // construct unique id
	; 


	return hash;
}

var maxNumTries = 10;
var count = 0;
var freeHashValueFound = false;
var hashValue = null;

var dir = null;
var filename = null;
var num_slides = 0;

function renameSliteDir()
{
	console.log("MA found hash " + dir + " " + filename + " " + num_slides);
	fs.rename(dir, "../" + hashValue, function (err){
		fs.rename("../" + hashValue + "/" + filename , "../" + hashValue + "/index.html", function (err){
			socket.emit('slitePrepared', { dir: "../" + hashValue, hash: hashValue, num_slides: num_slides });
			console.log("MA: renamed");
		});
	});

	return;
}

cacheHash: function cacheHash(){
    
	if (freeHashValueFound || count > maxNumTries) {
		console.log("MA found hash " + hashValue);
		renameSliteDir();
		return; 
	}
	console.log("JD: hashValue="+hashValue+" count="+count); 
	//return (  hashValue == true && count < maxNumTries); 
		
	count++;
	//hashValue = getHash();
	hashValue = 'abcd';
	console.log("JD: first generated hash="+hashValue);
	// get the value
	cache.get(hashValue, function (error, value) {
		console.log("JD: error="+error+" hashValue="+value);
		if(value != true){
			console.log("MA: value is " + value);
			cache.set(hashValue, true , 60000, function (error) {
				console.log("JD: set my hash to " + hashValue);
				freeHashValueFound = true;
			});
		}else{
			cacheHash();
		}	
	});

}

prepare_slite: function prepare_slite(dir_input, filename_input, num_slides_input){
	console.log("MA: prepare_slite: " + dir + " " + filename + " " + num_slides);
    dir = dir_input; filename = filename_input; num_slides = num_slides_input;
    console.log("MA: prepare_slite set: " + dir + " " + filename + " " + num_slides);
    cacheHash();
}

//cache.clear();

module.exports.cache = cache;
module.exports.prepare_slite = prepare_slite;
/*async.series([
    cacheHash,
], function (err, results) {
    console.log("JD: -------- FINAL RESULTS HASH=" + hashValue);
    process.exit(1);
});*/


