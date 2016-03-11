var url = require('url')
  , fs = require('fs')
  , SocketIOFileUploadServer = require("socketio-file-upload")
  , path = require('path')
  , prepare_slite = require('./prepare_slite.js')
  , converter = require('./converter.js')
  , _ = require('underscore')._
  , Room = require('./room.js')
  , uuid = require('node-uuid')
  , SLITE_EXT = '.jpg'
  , SLIDE_REG_EXP = new RegExp('^img\\d+' + SLITE_EXT + '$')
  , session = require('express-session')
  , cookieParser = require('cookie-parser')
  , HTML5_UPLOADER = false
  , supportUplExtensions = [".ppt", ".pptx"]
  , LOG_COORD = true
  , LOG_GENERAL = true;
var start = process.hrtime();

function resetElapsedTime() {
    start = process.hrtime();
}

function elapsedTime(note) {
    var precision = 0; // 0 decimal places
    var elapsed = process.hrtime(start)[1] / 1000000;
                                                           // divide by a million to get nano to milliseconds
    console.log(note + ' in: ' + process.hrtime(start)[0] + " s, " + elapsed.toFixed(precision) + " ms"); // print message + time
    start = process.hrtime(); // reset the timer
    return elapsed;
}

var www_dir, slitesDir, staticDir, slitesReg;
exports.setDir = function (new_dir, newSlitesDir, newstaticDir, newSlitesReg, callback){
    www_dir = new_dir;
    slitesDir = newSlitesDir;
    staticDir = newstaticDir;
    slitesReg = newSlitesReg;
	prepare_slite.setDir(www_dir, slitesDir, staticDir, slitesReg, module.parent.exports.SlideScheme, callback);
}

function pollUpdate () {
	var pollStatisticsString = "";
	var pollAnswersString = "";
	for (i=0; i < pollStatisticsArray.length-1; i++) {
		pollStatisticsString += pollStatisticsArray[i] + "\n"; //construct statistics string. TODO - proper JSON
		pollAnswersString += pollAnswerArray[i] + "\n";
	}
	pollStatisticsString += pollStatisticsArray[i]; // the last element has no '\n"
	pollAnswersString += pollAnswerArray[i]; // the last element has no '\n"
	if(LOG_GENERAL) {
		console.log("MA: pollVote pollUpdate pollAnswerArray: " + JSON.stringify(pollAnswersString));
		console.log("MA: pollVote pollUpdate pollStatisticsArray: " + JSON.stringify(pollStatisticsString));
	}
	module.parent.exports.io.sockets.emit('pollUpdate', { answers : pollAnswersString, statistics : pollStatisticsString });
}

var pollStatisticsArray = new Array();
var pollAnswerArray = new Array();

var people = {};
var rooms = {};
var sockets = [];
var chatHistory = {};
var nofUsers = [];

function purge(s, action) {
    if (people[s.id].inroom) { //user is in a room
    var room = rooms[people[s.id].inroom]; //check which room user is in.
        if (action === "disconnect") {
            //module.parent.exports.io.sockets.emit("update", people[s.id].name + " has disconnected from the server.");
            if (_.contains((room.people), s.id)) {
                var personIndex = room.people.indexOf(s.id);
                room.people.splice(personIndex, 1);
                s.leave(room.name);
            }
            delete people[s.id];
            sizePeople = _.size(people);
            module.parent.exports.io.sockets.emit("update-people", {people: people, count: sizePeople});
            var o = _.findWhere(sockets, {'id': s.id});
            sockets = _.without(sockets, o);
        } else if (action === "removeRoom") {
            s.emit("update", "Only the owner can remove a room.");
        } else if (action === "leaveRoom") {
            if (_.contains((room.people), s.id)) {
                var personIndex = room.people.indexOf(s.id);
                room.people.splice(personIndex, 1);
                people[s.id].inroom = null;
                module.parent.exports.io.sockets.emit("update", people[s.id].name + " has left the room.");
                s.leave(room.name);
            }
        }
    } else {
        //The user isn't in a room, but maybe he just disconnected, handle the scenario:
        if (action === "disconnect") {
            module.parent.exports.io.sockets.emit("update", people[s.id].name + " has disconnected from the server.");
            delete people[s.id];
            sizePeople = _.size(people);
            module.parent.exports.io.sockets.emit("update-people", {people: people, count: sizePeople});
            var o = _.findWhere(sockets, {'id': s.id});
            sockets = _.without(sockets, o);
        }
    }
}

function getHashPresentation(hash, next){
    var hashPath = path.join(www_dir, slitesDir, hash); // www/slites/hash
    fs.readdir(hashPath, function (err, files) {
        if (err) {
            next(err, null);
        } else {
            var presentations = [];
            for (var i in files) {
                var file = files[i];
                if (converter.isReservedHashFileName(file)) continue;
                if (!converter.isExtentionSupported(file)) continue;
                presentations.push(file);
            }
            //console.dir(files);
            //console.dir(presentations);
            if (presentations.length != 1) {
                 next(new Error("Number of presentations in the hash folder: " + presentations.length + "!= 1"), null);
            } else {
                next(null, presentations[0]);
            }
        }
    });
}

function notifyNofUsersChanged(socket, hash, local) {
    var data = { hash: hash,
                 nof_users: nofUsers[hash]};
    if (isNaN(data.nof_users) || data.nof_users < 0) {
        nofUsers[data.hash] = 0;
        data.nof_users = 0;
    }
    if (typeof local !== "undefined" && local === true) {
        socket.emit("nof-users", data);
    } else {
        socket.broadcast.emit("nof-users", data);
    }
	if(LOG_GENERAL) {
		console.log("nof-users emitted Users: " + data.nof_users + " for hash: " + data.hash);
	}
}

module.parent.exports.io.use(function (socket, next) {
    if (socket.handshake.query.type == "user" && typeof socket.handshake.query.hash !== 'undefined') {
        if (isNaN(nofUsers[socket.handshake.query.hash]) || nofUsers[socket.handshake.query.hash] < 0) {
            nofUsers[socket.handshake.query.hash] = 0;
        }
        nofUsers[socket.handshake.query.hash]++;
		notifyNofUsersChanged(socket, socket.handshake.query.hash);
		if(LOG_GENERAL) {
			console.log('Users in ' + socket.handshake.query.hash + ': ' + nofUsers[socket.handshake.query.hash]);
		}
        return next();
    }
    // call next() with an Error if you need to reject the connection.
    return next();
    //next(new Error('Authentication error'));
});

module.parent.exports.io.sockets.on('connection', function (socket) {
    if(typeof module.parent.exports.UserData  !== "undefined") {
      var userSession = module.parent.exports.UserData[module.parent.exports.getCookie(socket.handshake.headers.cookie,module.parent.exports.sessionIdCookie)];
      if(typeof userSession !== "undefined") {
          if (pollAnswerArray.length > 0) {
              pollUpdate();
          }
          console.log('SOCKET CONNECTION on', new Date().toLocaleTimeString() + ' Addr: ' + socket.handshake.headers.host + ' Socket: ' + socket.id + ' UserAgent:' + socket.handshake.headers['user-agent']);
          console.log('--------------');
            socket.on('disconnect', function () {
                if (socket.handshake.query.type === 'user' && typeof socket.handshake.query.hash !== 'undefined') {
                    if (isNaN(nofUsers[socket.handshake.query.hash])) {
                        nofUsers[socket.handshake.query.hash] = 0;
                    }
                    nofUsers[socket.handshake.query.hash]--;
                    if (nofUsers[socket.handshake.query.hash] < 0) {
                        nofUsers[socket.handshake.query.hash] = 0;
                    }
                    // Remove users if 0 in room;
                    if(nofUsers[socket.handshake.query.hash] == 0) {
                      module.parent.exports.slideCheckPresenter({ hashId: socket.handshake.query.hash, currentUserId: userSession.currentUserId } , function(retData) {
                        if (retData.found == 1 && retData.meeting == 1) {
                          /*module.parent.exports.deletePresentation(socket.handshake.query.hash, function(ddd){
                            console.log(ddd);
                          });*/
                        }

                      });
                    }
					notifyNofUsersChanged(socket, socket.handshake.query.hash);
					if(LOG_GENERAL) {
						console.log("User disconnected");
						console.log('Users in ' + socket.handshake.query.hash + ': ' + nofUsers[socket.handshake.query.hash]);
					}
                }
              if (typeof people[socket.id] !== "undefined") { //this handles the refresh of the name screen
                  purge(socket, "disconnect");
              }
              console.log('SOCKET DISCONNECT on', new Date().toLocaleTimeString() + ' Addr: ' + socket.handshake.headers.host + ' Socket: ' + socket.id);
              console.log('--------------');

          });

          var uploadDir = path.join(www_dir, "UPLOAD/");
          function uploadStarted(name){
              resetElapsedTime();
			  if(LOG_GENERAL) {
				console.log("UPLOAD started  file: " + name);
			  }
          }
          function uploadProgress(name){
			  if(LOG_GENERAL) {
				console.log("UPLOAD progress file: " + name);
			  }
          }
          function uploadError(type,name) {
              var data = {};
      		if(type > 0) {
      			data.limit = type;
      		}
      		else {
      			data.limit = 0;
      			console.error("UPLOAD error: " + name);
      		}
              data.error = true;
              socket.emit("sliteConversionError", data);
          }
          function uploadComplete(name, origName) {
              converter.convert(name, origName, socket, {www_dir: www_dir, slitesDir: slitesDir, sliteRegExp: SLIDE_REG_EXP, uploadDir: uploadDir, userSessionId: userSession.currentUserId, SlidesScheme: module.parent.exports.SlideScheme,  userAuth: userSession.userAuth, ssite: socket.handshake.headers.host, hashSize: module.parent.exports.slitesHashLen, domainName: userSession.domain , domain: userSession.restrictions.domain, domainSet: userSession.domainSet, AWS_S3: module.parent.exports.AWS_S3, AWS_S3_BUCKET: module.parent.exports.AWS_S3_BUCKET, removeDirFunc: module.parent.exports.deleteFolderRecursive});
          }

          if (HTML5_UPLOADER) {
              socket.on('uploadStarted', function (data) {
				  if(LOG_GENERAL) {
					console.log('uploadStarted event', data);
				  }
               });
              socket.on('uploadFile', function (data) {
				  if(LOG_GENERAL) {
					console.log('uploadFile event', data);
				  }
              });
          } else {
              var uploader = new SocketIOFileUploadServer();
      		uploader.dir = uploadDir;
      		uploader.listen(socket);
          uploader.maxFileSize = userSession.restrictions.maxSlideSize;

          uploader.on("start", function (event) {
  				      uploadStarted(event.file.name);
          });

      		uploader.on("progress", function (event) {
      			uploadProgress(event.file.pathName);
      		});

      		uploader.on("complete", function (event) {
      			if(userSession.noUploadForUser == 1) {
      				fs.unlink(event.file.pathName, function (err) {
      					uploadError(1, "");
      				});
      			}
      			else {
      				fs.exists(event.file.pathName, function (exists) {
						if(supportUplExtensions.indexOf(path.extname(event.file.pathName)) == -1) {
							fs.unlinkSync(event.file.pathName);
							uploadError(3, "");
						}
						else {
							if((fs.statSync(event.file.pathName)["size"] > 0)) {
								uploadComplete(event.file.pathName, event.file.name);
							}
							else {
								fs.unlinkSync(event.file.pathName);
								uploadError(2, "");
							}
						}
      				});

				}

      		});


      		uploader.on("error", function (event) {
      			uploadError(0, JSON.stringify(event));
      		});

          }

          socket.on('error', function (data){
            console.error(data);
          });

          socket.on('server-deleteSlide', function (data) {
        		var hashPath = path.join(www_dir, slitesDir, data.sid);
        		module.parent.exports.slideCheckPresenter({ hashId: data.sid, currentUserId: userSession.currentUserId } , function(retData) {
      				//if(retData.isPresenter == 1 && retData.found == 1) {
              if(retData.found == 1 && (retData.isPresenter == 1 || data.presPass == retData.presentationKey)) {
                module.parent.exports.deletePresentation(data.sid, function(ret){
                  if(ret == 1) {
                    socket.emit("client-deleteSlide", {sid: data.sid});
                  }
                  else {
                    if(LOG_GENERAL) {
      								console.log("Can't delete the slide" + data.sid);
      							}
                  }
                });
      					/*module.parent.exports.SlideScheme.remove({ sid: data.sid }, function(err,delData) {
      						if (!err && delData.result.ok == 1) {
                      if(LOG_GENERAL) {
                        console.log("Presentation " + data.sid + " deleted");
                      }
      								module.parent.exports.deleteS3path(data.sid);
                      // Removing videos
                      module.parent.exports.VideoUploads.find({sid : data.sid }, function (err, docs) {
                        for(i=0;i<docs.length;i++) {
                          var pathToVideo = docs[i].opentokId + "/" + docs[i].archid + "/";
                          module.parent.exports.deleteS3path(pathToVideo,1);
                          docs[i].remove();
                        }
                      });
      								module.parent.exports.NoteScheme.remove({ sid: data.sid }, function(err1) {
      									if(LOG_GENERAL) {
      										console.log('Deleting notes.....' + data.sid);
      									}
      									module.parent.exports.chatSchema.remove({ sid: data.sid }, function(err2) {
      										if(LOG_GENERAL) {
      											console.log('Deleting chats...' + data.sid);
      										}
      									});
      								});
      						}
      						else {
      							if(LOG_GENERAL) {
      								console.log("Can't delete the slide" + data.sid);
      							}
      						}
      					});*/
      				}
      			});
      	  });

          socket.on('pollStarted', function (data) {
    			  if(LOG_COORD) {
    				console.log("JD: received from remote this data: " + JSON.stringify(data));
    			  }
              pollStatisticsArray = new Array();
              pollAnswerArray = new Array();
              pollAnswerArray = data.answers.split("\n");
              var pollStatisticsString = "";
              var pollAnswersString = "";
              for (i = 0; i < pollAnswerArray.length; i++) {
                  pollStatisticsArray[i] = 0; //initialize statistics to 0
                  pollAnswersString += pollAnswerArray[i] + "\n";
              }
              module.parent.exports.io.sockets.emit('pollUpdate', { answers : pollAnswersString, statistics : pollStatisticsString });
          });

          socket.on('pollVote', function (data) {
      			  if(LOG_COORD) {
      				console.log("JD: received from remote this data: " + JSON.stringify(data));
      				console.log("MA: pollStatisticsArray on current vote: " + JSON.stringify(pollStatisticsArray));
      			  }
              if (pollStatisticsArray.length == 0) // empty statistics, let the voting commence!
              {
                  pollAnswerArray = data.answers.split("\n");
                  for (i = 0; i < pollAnswerArray.length; i++) {
                      pollStatisticsArray[i] = 0; //initialize statistics to 0
                  }
              }
              pollStatisticsArray[data.vote - 1] += 1;
              pollUpdate();
          });

          socket.on('changeSlideRequest', function (data) {
      			module.parent.exports.slideCheckPresenter({ hashId: data.slideID, currentUserId: userSession.currentUserId } , function(retData) {
      				if(retData.found == 1 && (retData.isPresenter == 1 || data.presPass == retData.presentationKey)) {
      					if(LOG_COORD) {
      						console.log("JD: received changeSlideRequest from remote. data.my= "+data.my + " slide="+data.slide+" slideID="+data.slideID);
      					}
      					module.parent.exports.io.sockets.emit('changeSlideBroadcast', { hello: data.my, slide: data.slide, slideID: data.slideID});
      				}
      			});
          });

      	socket.on('notes-server', function (data) {
          console.log(data);
      		var slideId = data.slideId.replace(/[^a-zA-Z0-9]/g,"");
      		var slidePath = www_dir + slitesDir + '/' + slideId + '/';
      		var tmpNote = userSession.userAuth ? 0 : 1;
      		if(slideId == "A1") {
      			slidePath = www_dir + module.parent.exports.www_static_dir + '/' + slideId;
      		}
      		var currentUserId = userSession.currentUserId;

          module.parent.exports.slideCheckPresenter({ hashId: data.slideId, currentUserId: userSession.currentUserId }  , function(retData) {
      	    if(retData.found == 1) {
      				module.parent.exports.NoteScheme.find({uid : userSession.currentUserId, sid: slideId }, function (err, docs) {
    					if (!docs.length) {
  							if(LOG_GENERAL) {
  								console.log('Inserting new note...');
  								console.log("Current user" + userSession.currentUserId);
  							}

    						var note = new module.parent.exports.NoteScheme({uid: userSession.currentUserId,sid: slideId, note: data.noteText, tmp: tmpNote});
    						note.save(function(err, saved) {
    								if(err) console.error('Can\'t insert a new note: ' + err);
    						});
        				}
        				else {
        						module.parent.exports.NoteScheme.update({ uid : userSession.currentUserId, sid: slideId }, {$set: { note: data.noteText, tmp: tmpNote, updated: Date.now()}}, {upsert: false},
          						function (err, numAffected) {
    									  if(LOG_GENERAL) {
    										  if(numAffected.nModified == 1) {console.log("Updated rows: " + numAffected)}
    									  }
          					});
        				}
        				if(data.init == 1 && docs.length) {
    							if(LOG_GENERAL) {
    								console.log("Notes initializing, returning note...");
    							}
        					socket.emit('notes-client', {slideId: slideId, noteText: docs[0].note});
        				}
              });
      		   }
           });
          });

          socket.on('renameHash-server', function (data) {
        		var delPaypalTimeoutDate = new Date(new Date() - 10*60000).toISOString();
        		module.parent.exports.SlideScheme.update({scid: {$ne: null} , paypalPayed: "0", paypalTmpExp: {$lt: delPaypalTimeoutDate } }, { $set: { scid: null, paypalTmpExp: null, paypalPayed: 0 }}).exec();
        		module.parent.exports.slideCheckPresenter({ hashId: data.slideId, currentUserId: userSession.currentUserId } , function(retData) {
        				if(retData.isPresenter == 1 && retData.found == 1) {
                  data.newHashName = data.newHashName.replace(/[^\w]/,"");
        					if(data.newHashName.length > 30 || data.newHashName.length <= module.parent.exports.slitesHashLen) {
        						socket.emit('renameHash-client', {slideId: data.slideId, available : 0});
        					}
        					else {
      							var domainClear = 'www.' + socket.handshake.headers.host.split('.').reverse()[1] + '.' + socket.handshake.headers.host.split('.').reverse()[0];
      							var searchParams = {};
      							searchParams.scid = { $regex : new RegExp("^" + data.newHashName + "$" , "i") };
      							searchParams.site = domainClear;

      							if(userSession.restrictions.domain == 1 && userSession.domainSet == 1) {
      								searchParams.uid = userSession.currentUserId;
      							}
      							else {
      								searchParams.domainSet = 0;
      							}

        						module.parent.exports.SlideScheme.findOne( searchParams , function (err, doc) {
        							if (!doc) {
        								if(data.start == 1 && retData.payed == 1) {
        									module.parent.exports.SlideScheme.update({  sid : data.slideId }, { $set: { scid: data.newHashName, paypalTmpExp: Date.now(), paypalPayed: retData.payed }}, function(errU,docsU) {
        										if (!err) {
        											socket.emit('renameHash-client', {slideId: data.slideId, available : 1, start: (data.start == 1) ? 1:0, newHashName: data.newHashName, payed: retData.payed, site: (userSession.domain) ? userSession.domain + "."  + socket.handshake.headers.host.split('.').reverse()[1] + '.' + socket.handshake.headers.host.split('.').reverse()[0] : ""});
        										}
        									});
        								}
      									else {
      										socket.emit('renameHash-client', {slideId: data.slideId, available : 1, start: (data.start == 1) ? 1:0, newHashName: data.newHashName, payed: retData.payed});
      									}
        							}
        							else {
        								var available = 0;
        								if(doc.sid == data.slideId) {available = 1;}
        								socket.emit('renameHash-client', {slideId: data.slideId, available : available,  newHashName: data.newHashName});
        							}
        						});
        					}
        				}
        		});
          });

          socket.on('deleteDomain-server', function (data) {
      			module.parent.exports.UserScheme.update({  _id : userSession.currentUserId }, { $unset: { domain: ""}}, function(errU,docsU) {
      				module.parent.exports.SlideScheme.update({ uid: userSession.currentUserId }, {$set: { domainSet: 0, scid: null }}, {multi: true, upsert: false},
      					function (err, numAffected) {
      						if(LOG_GENERAL) {
      							console.log(numAffected);
      						}
      					}
      				);
      				socket.emit('deleteDomain-client', {removed : 1 });
      			});
		      });

          socket.on('renameDomain-server', function (data) {
      			// WWW is not allowed to rename
      			if(data.newDomainName.toLowerCase() == 'www') {
      				socket.emit('renameDomain-client', {available: 0,  newDomainName: data.newDomainName});
      			}
      			else {
      				if(userSession.restrictions.domain == 1) {
      					if(data.newDomainName.length > 30) {
      						socket.emit('renameDomain-client', {available : 0});
      					}
      					else {
      						module.parent.exports.UserScheme.findOne({ domain : { $regex : new RegExp("^" + data.newDomainName + "$" , "i") } },
      							function (err, docs) {
      								if (!docs){
      									if(data.start == 1) {
      										module.parent.exports.UserScheme.update({  _id : userSession.currentUserId }, { $set: { domain: data.newDomainName}}, function(errU,docsU) {
      											module.parent.exports.SlideScheme.update({ uid: userSession.currentUserId, domainSet: 0 }, {$set: { domainSet: 1 }}, {multi: true, upsert: false},
      												function (err, numAffected) {
      													if(LOG_GENERAL) {
      														console.log(numAffected);
      														console.log(err);
      													}
      												}
      											);
      											socket.emit('renameDomain-client', {available : 1, start: (data.start == 1) ? 1:0, newDomainName: data.newDomainName, err: err});
      										});
      									}
      									else {
      										socket.emit('renameDomain-client', {available : 1, start: (data.start == 1) ? 1:0, newDomainName: data.newDomainName, err: err});
      									}
      								}
      								else {
      									var available = 0;
      									if(docs._id == userSession.currentUserId) {available = 1;}
      									else {
      										if(LOG_GENERAL) {
      											console.log('Domain is not available...');
      										}
      									}
      									socket.emit('renameDomain-client', {available : available,  newDomainName: data.newDomainName});
      								}
      							}
      						);
      					}
      				}
      			}
          });

          socket.on('cc', function (data) {
    			  if(LOG_COORD) {
    				console.log("-------------- JD: received CLOSED CAPTIONING: " + data);
    				console.log(data.my);
    			  }
            module.parent.exports.io.sockets.emit('ccBroadcast', { hello: data.my });
          });

          // receive laser coordinates from the remote
          socket.on('laserCoords', function (data) {
    				module.parent.exports.slideCheckPresenter({ hashId: data.slideID, currentUserId: userSession.currentUserId } , function(retData) {
    					if(retData.found == 1 && (retData.isPresenter == 1 || data.presPass == retData.presentationKey)) {
    						if (LOG_COORD) {
    							console.log("Laser coords Received: X: " + data.x + ", " + "Y: " + data.y);
    						}
    						socket.broadcast.emit('moveLaser', data);
    						socket.emit('moveLaser', data);
    					}
    				});
          });

          socket.on('drawCoords', function (data) {
      			module.parent.exports.slideCheckPresenter({ hashId: data.slideID, currentUserId: userSession.currentUserId } , function(retData) {
      				if(retData.found == 1 && (retData.isPresenter == 1 || data.presPass == retData.presentationKey)) {
      					if (LOG_COORD) {
      						console.log("drawCoords received: " + data.slideID);
      						console.log("X: " + data.x + ", " + "Y: " + data.y);
      					}
      					socket.broadcast.emit('drawCoords', data);
      					socket.emit('drawCoords', data);
      				}
      			});
          });

          socket.on('laserOn', function (data) {
      			module.parent.exports.slideCheckPresenter({ hashId: data.slideID, currentUserId: userSession.currentUserId } , function(retData) {
      				if(retData.found == 1 && (retData.isPresenter == 1 || data.presPass == retData.presentationKey)) {
      					if (LOG_COORD) {
      						console.log("laserOn received: " + data.slideID);
      						console.log("X: " + data.x + ", " + "Y: " + data.y);
      					}
      					socket.broadcast.emit('laserOn', data);
      					socket.emit('laserOn', data);
      				}
      			});
          });

          socket.on('laserOff', function (data) {
    				module.parent.exports.slideCheckPresenter({ hashId: data.slideID, currentUserId: userSession.currentUserId } , function(retData) {
    					if(retData.found == 1 && (retData.isPresenter == 1 || data.presPass == retData.presentationKey)) {
    						if (LOG_COORD) {
    							console.log("laser off: " + data);
    						}
    						socket.broadcast.emit('laserOff', data);
    						socket.emit('laserOff', data);
    					}
    				});
          });

          socket.on('shake', function (data) {
              socket.broadcast.emit('shake', data);
              socket.emit('shake', data);
          });

          socket.on('drawStart', function (data) {
    				module.parent.exports.slideCheckPresenter({ hashId: data.slideID, currentUserId: userSession.currentUserId } , function(retData) {
    					if(retData.found == 1 && (retData.isPresenter == 1 || data.presPass == retData.presentationKey)) {
    						if (LOG_COORD) {
    							console.log("drawstart: " + data.slideID);
    						}
    						socket.broadcast.emit('drawStart', data);
    						socket.emit('drawStart', data);
    					}
    				});
          });

          socket.on('drawStop', function (data) {
    				module.parent.exports.slideCheckPresenter({ hashId: data.slideID, currentUserId: userSession.currentUserId } , function(retData) {
    					if(retData.found == 1 && (retData.isPresenter == 1 || data.presPass == retData.presentationKey)) {
    						if (LOG_COORD) {
    							console.log("drawstop: " + data);
    						}
    						socket.broadcast.emit('drawStop', data);
    						socket.emit('drawStop', data);
    					}
    				});
          });

          socket.on('insertVideoId', function (data) {
              //console.log("insertVideoId, youtube hash: " + data.video_hash + " into the slite: " + data.slite_hash
                  //+ " slide number " + data.curr_slide);
              //prepare_slite.youTube(data.video_hash, data.slite_hash, data.curr_slide);
          });

          socket.on('updatePassword', function (data) {
            if(LOG_GENERAL) {
              console.log("updatePassword to: " + data.password + " currentHash=" + data.currentHash);
            }
        		module.parent.exports.slideCheckPresenter({ hashId: data.currentHash, currentUserId: userSession.currentUserId } , function(retData) {
        				if(retData.isPresenter == 1 && retData.found == 1) {
        					module.parent.exports.SlideScheme.find({ sid: data.currentHash }, function (err, docs) {
        						if(docs && docs.length){
        							module.parent.exports.SlideScheme.update({ sid: data.currentHash }, {$set: { password: data.password}}, {upsert: false},
        								function (err, numAffected) {
      										if(LOG_GENERAL) {
      											if(numAffected) {console.log("Password set: " + numAffected)}
      										}
        								}
        							);
        						}
        					});
        				}
        			}
        		);
          });

        	socket.on('checkSlidePassword-server', function (data) {
        		module.parent.exports.slideCheckPresenter({ hashId: data.hash, currentUserId: userSession.currentUserId } ,function(retData) {
        			if(retData.found == 1 && data.password == retData.password) {
        				socket.emit('checkSlidePassword-client',{result: 1});
      					if(LOG_GENERAL) {
      						console.log('Password is correct');
      					}
        			}
              else {
                socket.emit('checkSlidePassword-client',{result: 2});
    					  if(LOG_GENERAL) {
    						    console.log('Password is not correct');
    					  }
              }
        		});
        	});

          socket.on("joinserver", function(name, device, fn) {
              var exists = false;
              var ownerRoomID = inRoomID = null;

              _.find(people, function(key,value) {
                  if (key.name.toLowerCase() === name.toLowerCase())
                      return exists = true;
              });
              if (exists) {//provide unique username:
                  var randomNumber=Math.floor(Math.random()*1001)
                  do {
                      proposedName = name+randomNumber;
                      _.find(people, function(key,value) {
                          if (key.name.toLowerCase() === proposedName.toLowerCase())
                              return exists = true;
                      });
                  } while (!exists);
                  socket.emit("exists", {msg: "The username already exists, please pick another one.", proposedName: proposedName});
              } else {
                  people[socket.id] = {"name" : name, "owns" : ownerRoomID, "inroom": inRoomID, "device": device};
                  //socket.emit("update", "You have connected to the server.");
                  //module.parent.exports.io.sockets.emit("update", people[socket.id].name + " is online.")
                  sizePeople = _.size(people);
                  sizeRooms = _.size(rooms);
                  //module.parent.exports.io.sockets.emit("update-people", {people: people, count: sizePeople});
                  socket.emit("roomList", {rooms: rooms, count: sizeRooms});
                  socket.emit("joined"); //extra emit for GeoLocation
                  sockets.push(socket);
              }
              fn({});
          });

          socket.on("getOnlinePeople", function(fn) {
                      fn({people: people});
              });

          socket.on("countryUpdate", function(data) { //we know which country the user is from
              country = data.country.toLowerCase();
              people[socket.id].country = country;
              module.parent.exports.io.sockets.emit("update-people", {people: people, count: sizePeople});
          });

          socket.on("typing", function(data) {
              if (typeof people[socket.id] !== "undefined")
                  module.parent.exports.io.sockets.in(socket.room).emit("isTyping", {isTyping: data, person: people[socket.id].name});
          });

          socket.on("send", function(msg) {
              var re = /^[w]:.*:/;
              var whisper = re.test(msg);
              var whisperStr = msg.split(":");
              var found = false;

              if (whisper) {
                  var whisperTo = whisperStr[1];
                  var keys = Object.keys(people);
                  if (keys.length != 0) {
                      for (var i = 0; i<keys.length; i++) {
                          if (people[keys[i]].name === whisperTo) {
                              var whisperId = keys[i];
                              found = true;
                              if (socket.id === whisperId) { //can't whisper to ourselves
                                  socket.emit("update", "You can't whisper to yourself.");
                              }
                              break;
                          }
                      }
                  }
                  if (found && socket.id !== whisperId) {
                      var whisperTo = whisperStr[1];
                      var whisperMsg = whisperStr[2];
                      socket.emit("whisper", {name: "You"}, whisperMsg);
                      module.parent.exports.io.to(whisperId).emit("whisper", people[socket.id], whisperMsg);
                  } else {
                      socket.emit("update", "Can't find " + whisperTo);
                  }
              } else {
      			if (typeof socket !== "undefined") {
      				var newMsg = new module.parent.exports.chatSchema({uid: userSession.currentUserId,sid: socket.room.toLowerCase(), msg: msg, name: people[socket.id].name});
      				newMsg.save(function(err, saved) {
      					if(err) console.error('Can\'t insert a new chat: ' + err);
      				});
      			}
                  module.parent.exports.io.sockets.in(socket.room).emit("chat", people[socket.id], msg);
                  socket.emit("isTyping", false);
              }
          });

         //Room functions
          socket.on("createRoom", function(name) {
              if (people[socket.id].inroom) {
                  //socket.emit("update", "You are in a room. Please leave it first to create your own.");
              } else if (!people[socket.id].owns) {
                  var id = uuid.v4();
                  var room = new Room(name, id, socket.id);
                  rooms[id] = room;
                  sizeRooms = _.size(rooms);
                  module.parent.exports.io.sockets.emit("roomList", {rooms: rooms, count: sizeRooms});
                  //add room to socket, and auto join the creator of the room
                  socket.room = name;
                  socket.join(socket.room);
                  people[socket.id].owns = id;
                  people[socket.id].inroom = id;
                  people[socket.id].roomName = name;
                  people[socket.id].socketId = socket.id;
                  room.addPerson(socket.id);
                  //socket.emit("update", "Welcome to " + room.name + ".");
                  socket.emit("sendRoomID", {id: id});
                  //chatHistory[socket.room] = [];
                  module.parent.exports.io.sockets.emit("update-people", {people: people, count: sizePeople});

      			//module.parent.exports.chatSchema.count({sid: socket.room.toLowerCase()}, function (err, totaldocs) {
      				module.parent.exports.chatSchema.find({sid: socket.room.toLowerCase() }, 'name msg' , function (err, docs) {
      					if (docs){
      						socket.emit("history", docs);
      					}
      				});//.sort({created: 1}).skip(totaldocs - 10);
      			//});

              } else {
                  socket.emit("update", "You have already created a room.");
              }
          });

          socket.on("check", function(name, fn) {
              var match = false;
              _.find(rooms, function(key,value) {
                  if (key.name === name)
                      return match = true;
              });
              fn({result: match});
          });

          socket.on("removeRoom", function(id) {
               var room = rooms[id];
               if (socket.id === room.owner) {
                  purge(socket, "removeRoom");
              } else {
                  socket.emit("update", "Only the owner can remove a room.");
              }
          });

          socket.on("joinRoom", function(roomName) {
              if (typeof people[socket.id] !== "undefined") {
                  var room = _.find(rooms, function(room) {return (room.name === roomName)} );
      			var id = room.id;
                  if (socket.id === room.owner) {
                      socket.emit("update", "You are the owner of this room and you have already been joined.");
                  } else {
                      if (_.contains((room.people), socket.id)) {
                          socket.emit("update", "You have already joined this room.");
                      } else {
                          if (people[socket.id].inroom !== null) {
                                  //socket.emit("update", "You are already in a room ("+rooms[people[socket.id].inroom].name+"), please leave it first to join another room.");
                              } else {
                              room.addPerson(socket.id);
                              people[socket.id].inroom = id;
                              socket.room = room.name;
                              socket.join(socket.room);
                              user = people[socket.id];
                              people[socket.id].roomName = room.name;
                              people[socket.id].socketId = socket.id;
                              //module.parent.exports.io.sockets.in(socket.room).emit("update", user.name + " has connected to " + room.name + " room.");
                              module.parent.exports.io.sockets.emit("update-people", {people: people, count: sizePeople});
                              //socket.emit("update", "Welcome to " + room.name + ".");
                              socket.emit("sendRoomID", {id: id});

      						//module.parent.exports.chatSchema.count({sid: socket.room.toLowerCase()}, function (err, totaldocs) {
      							module.parent.exports.chatSchema.find({sid: socket.room.toLowerCase() }, 'name msg' , function (err, docs) {
      								if (docs){
      									socket.emit("history", docs);
      								}
      							});//.sort({created: 1}).skip(totaldocs - 10);
      						//});

                              /*var keys = _.keys(chatHistory);
                              if (_.contains(keys, socket.room)) {
                                  socket.emit("history", chatHistory[socket.room]);
                              }*/

                          }
                      }
                  }
              } else {
                  socket.emit("update", "Please enter a valid name first.");
              }
          });

          socket.on("leaveRoom", function(id) {
              var room = rooms[id];
              if (room)
                  purge(socket, "leaveRoom");
          });

          socket.on('presenterVideoChat', function (data) {
              if(LOG_COORD) {
                    console.log('Recieved request from presenter to ' + (data.open ? 'open' : 'close') + 'data.open=' + data.open + ' videoChat in ' + data.hash);
              }
              module.parent.exports.slideCheckPresenter({ hashId: data.hash, currentUserId: userSession.currentUserId } ,function(retData) {
                if(retData.isPresenter == 1 && retData.found == 1) {
                  module.parent.exports.SlideScheme.update({ sid: data.hash }, {$set: { isVideoChatOpen: data.open}}, {upsert: false},
                    function (err, numAffected) {
                      if(!err) {
                        if(data.open == 0) {
                          module.parent.exports.openTokStopRecording(retData.lastArchiveId, function(ret) {});
                        }
                        module.parent.exports.io.sockets.emit('broadcastVideoChat', data );
                      }
                    }
                  );
                }
              });
          });

          socket.on('videoRecording', function(data,callback) {
            module.parent.exports.slideCheckPresenter({ hashId: data.hash, currentUserId: userSession.currentUserId } , function(retData) {
                if(retData.isPresenter == 1 && retData.found == 1) {
                    if(data.type == 1) {
                      module.parent.exports.openTokStartRecording(retData.sid,retData.videoSession, function(ret) {
                        if(ret == 1) {
                          callback({code: 1});
                        }
                      });
                    }
                    else {
                      module.parent.exports.openTokStopRecording(retData.lastArchiveId, function(ret) {
                        if(ret == 1) {
                          callback({code: 1});
                        }
                      });
                    }
                }
            });
          });

          socket.on('deleteVideo', function(data,callback){
            var splitVideo = data.videoId.split('/');
            module.parent.exports.VideoUploads.findOne({opentokId : splitVideo[1], archid:  splitVideo[2] }).exec(function (err, doc) {
              if(doc) {
                module.parent.exports.slideCheckPresenter({ hashId: doc.sid, currentUserId: userSession.currentUserId } , function(retData) {
                    if(retData.isPresenter == 1 && retData.found == 1) {
                      module.parent.exports.deleteS3path(data.videoId,1);
                      doc.remove();
                      callback(1);
                    }
                });
              }
            });
          });

          socket.on('presenterScreensharing', function (data) {
              if(LOG_COORD) {
                console.log('Recieved request from presenter to ' + (data.open ? 'open' : 'close') + ' screensharing in ' + data.hash);
              }
              module.parent.exports.slideCheckPresenter({ hashId: data.hash, currentUserId: userSession.currentUserId } , function(retData) {
          				if(retData.isPresenter == 1 && retData.found == 1) {
                    module.parent.exports.SlideScheme.update({ sid: data.hash }, {$set: { isScreensharingOpen: data.open}}, {upsert: false},
                        function (err, numAffected) {
                            if(!err) {module.parent.exports.io.sockets.emit('broadcastScreensharing', { open: data.open, hash: data.hash});}
                        }
                    );
                  }
              });
          });


      	socket.on('sharing-server', function (data) {
      		module.parent.exports.SlideScheme.findOne({sid : data.hash }).exec(function (err, doc) {
      			if( doc ) {
      				socket.emit('sharing-client', {moderatorId: doc.uid, chatMode: doc.isVideoChatOpen})
      			}
      		});
        });

        socket.on('start-webrtc-session', function(data,callback) {
          module.parent.exports.slideCheckPresenter({ hashId: data.hash, currentUserId: userSession.currentUserId } , function(retData) {
              if(retData.isPresenter == 1 && retData.found == 1) {
                callback({code: 1});
              }
              else {
                callback({code: 0});
              }
          });
        });

      	socket.on('server-userRestrictions', function (data) {
      		socket.emit('client-userRestrictions',{maxFileSize: userSession.restrictions.maxSlideSize});
        });

    		socket.on("get-nof-users", function (data) {
    			if (typeof data === "undefined" || data.hash === "undefined" || data.hash === null) return;
    			notifyNofUsersChanged(socket, data.hash, true);
    		});

    		socket.on('checkUserUploadStatus', function(data, callback){
    			module.parent.exports.getUserUploadStatus(userSession.currentUserId, function(uplStatus) {
    				module.parent.exports.UserData[module.parent.exports.getCookie(socket.handshake.headers.cookie,module.parent.exports.sessionIdCookie)].noUploadForUser = uplStatus;
    				callback(uplStatus);
    			});
    		});

    		socket.on('get-presentation-key', function(data, callback){
          		module.parent.exports.slideCheckPresenter({ hashId: data.sid, currentUserId: userSession.currentUserId } , function(retData) {
    				if(retData.found == 1 && retData.isPresenter == 1) {
    					if(retData.presentationKey == 0) {
    						var genKey = Math.floor(Math.random() * (9999 - 1111) + 1111);
    						module.parent.exports.SlideScheme.update({  sid : data.sid }, { $set: { presentationKey: genKey }}, function(errU,docsU) {
    							if(docsU.nModified > 0) {
    								callback({id: data.sid, key: genKey});
    							}
    						});
    					}
    					else {
    						callback({id: data.sid, key: retData.presentationKey});
    					}
    				}
    			});
    		});

    		socket.on('check-presentation-key', function(data, callback){
    			// Errors: 1 - prese not found, 2 - wrong key, 3 - access granted
          if(LOG_GENERAL) {
            console.log('Checking pres key:');
            console.log(data);
          }
    			module.parent.exports.slideCheckPresenter({ hashId: data.id, currentUserId: userSession.currentUserId } , function(retData) {
            if(LOG_GENERAL) {
              console.log('Returned data for pres: ');
              console.log(retData);
            }
    				var ret = {};
            if(retData.found == 1 && data.key == retData.presentationKey) {
              ret.code = 3;
    					if(data.check == 1) {
    						ret.title = retData.title;
    					}
    					callback(ret);
    				}
    				else if(retData.found == 0) {
    					ret.code = 1;
    					callback(ret);
    				}
    				else {
    					ret.code = 2;
    					callback(ret);
    				}
     			});
    		});


      }
    }

});
