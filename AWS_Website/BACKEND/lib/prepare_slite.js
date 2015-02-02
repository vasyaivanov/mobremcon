var CachemanMongo = require('cacheman-mongo');
var fs = require('fs-extra');
var path = require('path');

var options = {
  port: 27017,
  host: '127.0.0.1',
  db: 'slite_cache',
  collection: 'hash'
};

var cache = new CachemanMongo(options);
var cacheReady = false;
var cacheTimeout = 60000;

var www_dir, slitesDir, slitesReg;
																	
function onCacheReady(addedFiles){
    cacheReady = true;
    console.log('Cache ready, number of entries=' + addedFiles);
}

function initCache() {
    cacheReady = false;
    cache.clear(function (err) {
        if (err) {
            console.error('Error clearing cache: ' + err);
        }
    });
    
    var findFileReg = new RegExp('^' + slitesReg + '$');
    var slitesFullPath = path.join(www_dir, slitesDir);
    var todo = 0, done = 0;
    
    console.log('Scanning "' + slitesFullPath + '" for hash cache');
    fs.readdir(slitesFullPath, function (err, files) {
        if (err) {
            console.error('Error scanning hash folder: ' + err);
        }
        console.log(files.length + ' files to scan for hash cache');
        //console.log(files);
        if (files.length === 0) {
            onCacheReady(0);
            return;
        }
        var scanned = false;
        for (var f in files) {
            if (findFileReg.test(files[f])) {
                todo++;
                //console.log('Hash #' + todo + ' found: "' + files[f] + '"');
                cache.set(files[f], true, function (err, value) {
                    if (err) {
                        console.error('Error setting cache: ' + err);
                    }
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

var Slite = function (socket, onHashReady) {
    var self = this;

    this.maxNumTries = 10;
    this.count = 0;
    this.hashValue = null;
    
    this.socket = socket;
    
    if (!cacheReady) {
        console.log('Cache not ready');
        return false;
    }
    
    this.reserveHash(function () {
        console.log('SLITE created, found hash: ' + self.hashValue);
        fs.mkdir(path.join(www_dir, slitesDir, self.hashValue), function (err) {
            if (err) {
                console.error("Error creating hash folder: " + self.hashValue);
                self.deleteHash(true);
            } else {
                onHashReady();
            }
       });
    });
    
    return true;
}

Slite.prototype.setFilename = function (dir, filename, num_slides) {
    this.dir = dir;
    this.filename = filename;
    this.num_slides = num_slides;
    console.log("SLITE file: " + path.join(this.dir, this.filename) + " Slides:" + this.num_slides);
};

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

Slite.prototype.generateHtml = function () {
    var self = this;
    fs.readFile(path.join(www_dir, "hash_index.html"), "utf8", function (err, data) {
        if (err) {
            console.error('Error reading hash_index.html' + err);
            this.deleteHash(true);
        } else {
            var indexHtml = 'index.html';
            var data_replaced = data.replace("NUM_SLIDES", self.num_slides);
            fs.writeFile(path.join(self.dir, indexHtml), data_replaced, function (err) {
                if (err) {
                    console.error('Error writing ' + indexHtml + ' '  + err);
                    this.deleteHash(true);
                } else {
                    self.socket.emit("slitePrepared", { dir: self.dir, hash: self.hashValue, num_slides: self.num_slides, fileName: self.filename });
                    console.log("INDEX generated: " + path.join(www_dir, self.hashValue, indexHtml));
                    console.log("SUCCESS!");
                }
            });
        }
    });
};

Slite.prototype.reserveHash = function (action) {
    var self = this;
    self.count++;
    self.hashValue = self.getHash();
    //console.log("JD: hashValue=" + self.hashValue + " count=" + self.count);
    // get the value
    cache.get(self.hashValue, function (err, value) {
        if (err) {
            console.error('Error while getting hash cache: ' + err);
        }
        if (value != true || count > maxNumTries) {
            //console.log("MA: found value is " + value);
            cache.set(self.hashValue, true , cacheTimeout, function (err) {
                if (err) {
                    console.error('Error storing hash cache: ' + err);
                    deleteHash(false);
                }
                else {
                    //console.log("JD: set my hash to " + self.hashValue);
                    //console.log('Found hash: ' + self.hashValue);
                    action();
                }
            });
        } else {
            self.reserveHash(action);
        }
    });
}

Slite.prototype.deleteHash = function (deleteFolder) {
    return;
    var self = this;
    var oldHashValue = self.hashValue;
    if (self.hashValue) {
        if (typeof deleteFolder !== "undefined" && deleteFolder) {
            fs.remove(path.join(www_dir, slitesDir, oldHashValue), function (err) {
                console.log('Deleted hash folder: ' + oldHashValue);
                if (err) {
                    console.error('Error deleting : ' + oldHashValue + ' hash folder ' + err);
                }
            });
        }
        cache.set(oldHashValue, false , cacheTimeout, function (err) {
            console.log('Deleted hash cache: ' + oldHashValue);
            self.hashValue = null;      // mark hash as deleted
            if (err) {
                console.error('Error Deleting hash cache: ' + err);
            }
        });
    }
};
               
module.exports.cache = cache;
module.exports.Slite = Slite;
