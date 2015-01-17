var CachemanMongo = require('cacheman-mongo');
var fs = require('fs');
var path = require('path');

var options = {
  port: 27017,
  host: '127.0.0.1',
  db: 'slite_cache',
  collection: 'hash'
};

var cache = new CachemanMongo(options);
var cacheReady = false;

var www_dir, slitesDir, slitesReg;
																	
function onCacheReady(addedFiles){
    cacheReady = true;
    console.log('Cache ready, number of entries=' + addedFiles);
}

function initCache() {
    cacheReady = false;
    cache.clear(function (err) {
        if (err) throw err;
    });
    
    var findFileReg = new RegExp('^' + slitesReg + '$');
    var slitesFullPath = path.join(www_dir, slitesDir);
    var todo = 0, done = 0;
    
    console.log('Scanning "' + slitesFullPath + '" for hash cache');
    fs.readdir(slitesFullPath, function (err, files) {
        if (err) throw err;
        console.log(files.length + ' files to scan for hash cache');
        //console.log(files);
        if (files.length === 0) {
            onCacheReady(0);
        }
        var scanned = false;
        for (var f in files) {
            if (findFileReg.test(files[f])) {
                todo++;
                //console.log('Hash #' + todo + ' found: "' + files[f] + '"');
                cache.set(files[f], true, function (err, value) {
                    if (err) throw err;
                    done++;
                    //console.log('Hash #' + done + ' set to: ' + value);
                    if (scanned && done >= todo) {
                        onCacheReady(todo);
                    }
                });
            }
        }
        scanned = true;
        if (todo === 0) {
            onCacheReady(todo);
        }
    });
};


exports.setDir = function (new_dir, newSlitesDir, newSlitesReg){
    www_dir = new_dir;
    slitesDir = newSlitesDir;
    slitesReg = newSlitesReg;
    initCache();													
}																				

function getHash()
{
    var time = process.hrtime()[0]// get unique number
	, salt = Math.floor(Math.random() * Math.pow(4, Math.random() * 4)) % 36// get variable length prefix
	, hash = '';
    for (var i = 0; i < 4; i++) {
        hash = (time % 36).toString(36) + hash;
        time = Math.floor(time / 36);
    }
    hash = salt.toString(36) + hash

	return hash;
}

var maxNumTries = 10;
var count = 0;
var hashValue = null;

var dir = null;
var filename = null;
var num_slides = 0;

function renameSliteDir(){
    var wwwSlitesHash = path.join(www_dir, "slites/", hashValue);
    console.log("MA found hash, dir: '" + dir + "' filename: '" + filename + "' Slides: " + num_slides + " wwwSlitesHash: '" + wwwSlitesHash + "'");
    
    fs.rename(dir, wwwSlitesHash, function (err){
        if (err) throw err;
        fs.rename(path.join(wwwSlitesHash, filename), path.join(wwwSlitesHash, "img0.html"), function (err){
            if (err) throw err;
            fs.readFile(path.join(www_dir, "hash_index.html"), "utf8", function(err, data) {
                if (err) throw err;
                var data_replaced = data.replace("NUM_SLIDES", num_slides);
                fs.writeFile(path.join(wwwSlitesHash, 'index.html'), data_replaced, function(err) {
                    if (err) throw err;
                    module.parent.exports.socket.emit("slitePrepared", { dir: wwwSlitesHash, hash: hashValue, num_slides: num_slides });
    			    console.log("MA: renamed to " + path.join(www_dir, hashValue, "index.html"));
                    console.log("success!");
                });
            });
		});
	});
}

cacheHash: function cacheHash(){

    count++;
    hashValue = getHash();
	console.log("JD: hashValue="+hashValue+" count="+count);
 	// get the value
	cache.get(hashValue, function (error, value) {
		console.log("JD: error="+error+" hashValue="+value);
        if (value != true || count > maxNumTries) {
            console.log("MA: found value is " + value);
            cache.set(hashValue, true , 60000, function (error) {
                console.log("JD: set my hash to " + hashValue);
                renameSliteDir();
            });
        } else {
            cacheHash();
        }
	});
}

prepare_slite: function prepare_slite(dir_input, filename_input, num_slides_input){
    if (!cacheReady) {
        console.log('Cache not ready');
        return false;
    }
    count = 0;
	console.log("MA: prepare_slite: " + dir + " " + filename + " " + num_slides);
    dir = dir_input; filename = filename_input; num_slides = num_slides_input;
    console.log("MA: prepare_slite set: " + dir + " " + filename + " " + num_slides);
    cacheHash();
    return true;
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
