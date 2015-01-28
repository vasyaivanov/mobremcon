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

var Slite = function (dir, filename, num_slides) {
    this.maxNumTries = 10;
    this.count = 0;
    this.hashValue = null;
    
    this.dir = dir;
    this.filename = filename;
    this.num_slides = num_slides;
    
    if (!cacheReady) {
        console.log('Cache not ready');
        return false;
    }
    
    console.log("SLITE created: " + this.dir + " " + this.filename + " " + this.num_slides);
    
    this.cacheHash();
}

Slite.prototype.getHash = function ()
{
    var hashLen = 4;
    var time = process.hrtime()[0] // get unique number
	  , salt = Math.floor(Math.random() * Math.pow(hashLen - 1, Math.random() * (hashLen - 1))) % 36// get variable length prefix
	  , hash = '';
    for (var i = 0; i < hashLen - 1; i++) {
        hash = (time % 36).toString(36) + hash;
        time = Math.floor(time / 36);
    }
    hash = salt.toString(36) + hash;

	return hash;
}

Slite.prototype.renameSliteDir = function () {
    var self = this;
    var wwwSlitesHash = path.join(www_dir, "slites/", self.hashValue);
    console.log("HASH found: " + self.hashValue + ", dir: '" + self.dir + "' filename: '" + self.filename + "' Slides: " + self.num_slides + " wwwSlitesHash: '" + wwwSlitesHash + "'");
    
    fs.rename(self.dir, wwwSlitesHash, function (err) {
        if (err) throw err;
        fs.rename(path.join(wwwSlitesHash, self.filename), path.join(wwwSlitesHash, "img0.html"), function (err) {
            if (err) throw err;
            fs.readFile(path.join(www_dir, "hash_index.html"), "utf8", function (err, data) {
                if (err) throw err;
                var data_replaced = data.replace("NUM_SLIDES", self.num_slides);
                fs.writeFile(path.join(wwwSlitesHash, 'index.html'), data_replaced, function (err) {
                    if (err) throw err;
                    module.parent.exports.socket.emit("slitePrepared", { dir: wwwSlitesHash, hash: self.hashValue, num_slides: self.num_slides, fileName: self.filename });
                    console.log("RENAMED to " + path.join(www_dir, self.hashValue, "index.html"));
                    console.log("SUCCESS!");
                });
            });
        });
    });
}

Slite.prototype.cacheHash = function cacheHash() {
    var self = this;
    self.count++;
    self.hashValue = self.getHash();
    //console.log("JD: hashValue=" + self.hashValue + " count=" + self.count);
    // get the value
    cache.get(self.hashValue, function (error, value) {
        //console.log("JD: error=" + error + " hashValue=" + value);
        if (value != true || count > maxNumTries) {
            //console.log("MA: found value is " + value);
            cache.set(self.hashValue, true , 60000, function (error) {
                //console.log("JD: set my hash to " + self.hashValue);
                //console.log('Found hash: ' + self.hashValue);
                self.renameSliteDir();
            });
        } else {
            self.cacheHash();
        }
    });
}

module.exports.cache = cache;
module.exports.Slite = Slite;
