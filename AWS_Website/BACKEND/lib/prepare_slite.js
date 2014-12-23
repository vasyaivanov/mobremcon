var CachemanMongo = require('cacheman-mongo');
var fs = require('fs');

var options = {

  port: 27017,
  host: '127.0.0.1',
  db: 'test',
  collection: 'my-collection'
};

var cache = new CachemanMongo(options);

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

// find path www_dir to index.html							// OL
var indexHtml = 'index.html';								// OL
var awsDir = '/home/ec2-user/www/';							// OL
var localDir = __dirname + "/www/";							// OL

var www_dir;												// OL
if (fs.existsSync(localDir + indexHtml)) {					// OL
  www_dir = localDir;										// OL
} else {													// OL
  www_dir = awsDir;											// OL
}															// OL

function renameSliteDir()
{
	console.log("MA found hash " + dir + " " + filename + " " + num_slides);
	fs.rename(dir, www_dir + "slites/" + hashValue, function (err){
		fs.rename(www_dir + "slites/" + hashValue + "/" + filename , www_dir + "slites/" + hashValue + "/img0.html", function (err){
      fs.readFile(www_dir + "hash_index.html", "utf8", function(err, data) {
        if (err) throw err;
        var data_replaced = data.replace("NUM_SLIDES", num_slides);
        fs.writeFile(www_dir + "slites/" + hashValue + "/index.html", data_replaced, function(err) {
          if (err) throw err;
          module.parent.exports.socket.emit("slitePrepared", { dir: www_dir + "slites/" + hashValue, hash: hashValue, num_slides: num_slides });
    			console.log("MA: renamed to " + www_dir + hashValue + "/index.html");
          console.log("success!");
        });
      });
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
	hashValue = getHash();
	//hashValue = 'abcd';
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
		}
		cacheHash();
	});

}

prepare_slite: function prepare_slite(dir_input, filename_input, num_slides_input){
    count = 0;
    freeHashValueFound = false;
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
