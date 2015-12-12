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

var www_dir, slitesDir, staticDir, slitesReg;

function onCacheReady(addedFiles){
    cacheReady = true;
    console.log('Cache ready, number of entries=' + addedFiles);
}

function initCache(slidesScheme, callback) {
    cacheReady = false;
    cache.clear(function (err) {
        if (err) {
            console.error('Error clearing cache: ' + err);
            callback(err);
        } else {
			// Cache gets data from DB
			slidesScheme.find({}, function (err, slidesDoc) {
				slidesDoc.forEach(function(doc) {
					cache.set(doc.sid, true, function (err, value) {
						if (err) {
							console.error('Error setting cache: ' + err);
						}
					});				
				});
				onCacheReady(slidesDoc.length);
                callback(null);
			});
            /*var findFileReg = new RegExp('^' + slitesReg + '$');
            var slitesFullPath = path.join(www_dir, slitesDir);
            var todo = 0, done = 0;

            console.log('Scanning "' + slitesFullPath + '" for hash cache');
            fs.readdir(slitesFullPath, function (err, files) {
                if (err) {
                    console.error('Error scanning hash folder: ' + err);
                    callback(err);
                    return;
                }
                console.log(files.length + ' files to scan for hash cache');
                //console.log(files);
                if (files.length === 0) {
                    onCacheReady(0);
                    callback(null);
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
                                callback(null);
                            }
                        });
                    }
                } // for (var f ...
                scanned = true;
                if (todo === 0) {
                    onCacheReady(todo);
                    callback(null);
                }
            });*/ // fs.readdir ...
        } // if (err) {...}else {...
    }); // cache.clear(...
};


exports.setDir = function (new_dir, newSlitesDir, newstaticDir, newSlitesReg, slidesScheme , callback){
    www_dir = new_dir;
    slitesDir = newSlitesDir;
    staticDir = newstaticDir;
    slitesReg = newSlitesReg;
    initCache(slidesScheme, callback);
}

var Slite = function (sliteParams, callback) {
    var self = this;

    this.maxNumTries = 10;
    this.count = 0;
    this.hashValue = null;
    this.params = sliteParams;

    if (!cacheReady) {
        var msg = 'Cache not ready';
        console.log(msg);
        callback(msg);
        throw msg;
    }

    this.reserveHash(function (err) {
        if (err) {
            callback(err);
        } else {
            console.log('SLITE created, found hash: ' + self.hashValue);
            fs.mkdir(path.join(www_dir, slitesDir, self.hashValue), function (err) {
                if (err) {
                    console.error("Error creating hash folder: " + self.hashValue);
                }
                callback(err);
            });
        } // } else {
    });
  }

Slite.prototype.setParams = function (params) {
    this.params = params;
};

Slite.prototype.getParams = function () {
    return this.params;
};

Slite.prototype.setNumSlides = function (num_slides) {
    this.num_slides = num_slides;
};

Slite.prototype.getNumSlides = function () {
    return this.num_slides;
};

Slite.prototype.getHash = function ()
{
	var hashLen = this.params.opt.hashSize;
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

Slite.prototype.generateHtml = function (callback) {
    var self = this;
    fs.readFile(path.join(www_dir, staticDir, "A1/index.html"), "utf8", function (err, data) {
        if (err) {
            callback('Error reading hash_index.html' + err);
        } else {
            var indexHtml = 'index.html';
            var data_replaced1 = data.replace('NUM_SLIDES_TEMPLATE', self.num_slides);
            var data_replaced2 = data_replaced1.replace('HASH_TEMPLATE', self.hashValue);
			// Deleted 05/18/15, Konstantin R. - Now title generates from DB
            //var title_replaced = data_replaced2.replace('TITLE', self.params.origName);
            fs.writeFile(path.join(self.getHashDir(), indexHtml), data_replaced2, function (err) {
                if (err) {
                    callback('Error writing ' + indexHtml + ' '  + err);
                } else {
                    callback(null);
                }
            });
        }
    });
};

Slite.prototype.reserveHash = function (callback) {
    var self = this;
    self.count++;
    self.hashValue = self.getHash();
	// Clear cache online
	initCache(this.params.opt.SlidesScheme, function(){});
    // get the value
    cache.get(self.hashValue, function (err, value) {
        if (self.count > self.maxNumTries) {
            var msg = 'Get Hash maximum tries reached';
            console.error(msg);
            callback(msg);
        } else if (err) {
            console.error('Error while getting hash cache: ' + err);
            callback(err);
        } else if (value != true) {
            cache.set(self.hashValue, true , cacheTimeout, function (err) {
                if (err) {
                    console.error('Error storing hash cache: ' + err);
                 }
                callback(err);
            });
        } else {
            self.reserveHash(callback);
        }
    });
}

Slite.prototype.deleteHash = function (deleteFolder, callback) {
    var self = this;
    var oldHashValue = self.hashValue;
    if (!self.hashValue) {
        callback(null);
    } else {
        cache.set(oldHashValue, false , cacheTimeout, function (err) {
            console.log('Deleted hash cache: ' + oldHashValue);
            self.hashValue = null;      // mark hash as deleted
            if (err) {
                console.error('Error Deleting hash cache: ' + err);
            }
            if (typeof deleteFolder !== "undefined" && deleteFolder) {
                fs.remove(path.join(www_dir, slitesDir, oldHashValue), function (err) {
                    console.log('Deleted hash folder: ' + oldHashValue);
                    if (err) {
                        console.error('Error deleting : ' + oldHashValue + ' hash folder ' + err);
                    }
                    callback(err);
                });
            } else {
                callback(err);
            }
        });
    }
};

Slite.prototype.getHashDir = function () {
    var self = this;
    return path.join(www_dir, slitesDir, self.hashValue);
}

Slite.prototype.getUploadFullFileName = function () {
    var self = this;
    return path.join(self.getHashDir(), self.params.uploadFileName);
}

exports.youTube = function (youtube_hash, slite_hash, curr_slide) {
    fs.readFile(path.join(www_dir, staticDir, "A1/youtube_tmpl.html"), "utf8", function (err, data) {
        if (err) {
            console.error('Error reading hash_index.html' + err);
        } else {
            var currSlideHtml = "img"+curr_slide+".html";
            var data_replaced = data.replace("YOUTUBE_HASH_TEMPLATE", youtube_hash);
            fs.writeFile(path.join(www_dir, slitesDir, slite_hash, currSlideHtml), data_replaced, function (err) {
                if (err) {
                    console.error('Error writing ' + currSlideHtml + ' '  + err);
                } else {
                    socket.emit("slitePrepared", { hash: slite_hash });
                }
            });
        }
    });
};

module.exports.cache = cache;
module.exports.Slite = Slite;
