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
  , HTML5_UPLOADER = false;

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
	prepare_slite.setDir(www_dir, slitesDir, staticDir, slitesReg, callback);
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
	console.log("MA: pollVote pollUpdate pollAnswerArray: " + JSON.stringify(pollAnswersString));
	console.log("MA: pollVote pollUpdate pollStatisticsArray: " + JSON.stringify(pollStatisticsString));
	module.parent.exports.io.sockets.emit('pollUpdate', { answers : pollAnswersString, statistics : pollStatisticsString });
}

var pollStatisticsArray = new Array();
var pollAnswerArray = new Array();

var people = {};
var rooms = {};
var sockets = [];
var chatHistory = {};

function purge(s, action) {
    if (people[s.id].inroom) { //user is in a room
    var room = rooms[people[s.id].inroom]; //check which room user is in.
        if (action === "disconnect") {
            module.parent.exports.io.sockets.emit("update", people[s.id].name + " has disconnected from the server.");
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

console.log('in remote control');

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


module.parent.exports.io.sockets.on('connection', function (socket) {
    if (pollAnswerArray.length > 0) {
        pollUpdate();
    }
    console.log('CONNECTION on', new Date().toLocaleTimeString() + ' Addr: ' + socket.handshake.headers.host + ' Socket: ' + socket.id);
    socket.on('disconnect', function () {
        console.log('DISCONNECT on', new Date().toLocaleTimeString() + ' Addr: ' + socket.handshake.headers.host + ' Socket: ' + socket.id);
    });
        
    var uploadDir = path.join(www_dir, "UPLOAD/");
    function uploadStarted(name){
        resetElapsedTime();
        console.log("UPLOAD started  file: " + name);
    }
    function uploadProgress(name){
        console.log("UPLOAD progress file: " + name);
    }
    function uploadError(name) {
        console.error("UPLOAD error: " + name);
        var data = {};
        data.error = true;
        socket.emit("sliteConversionError", data);
    }
    function uploadComplete(name, origName) {
        converter.convert(name, origName, socket, {www_dir: www_dir, slitesDir: slitesDir, sliteRegExp: SLIDE_REG_EXP, uploadDir: uploadDir, userSessionId: module.parent.exports.currentUserId, SlidesScheme: module.parent.exports.SlideScheme,  userAuth: module.parent.exports.userAuth});
    }
    
    if (HTML5_UPLOADER) {
        socket.on('uploadStarted', function (data) {
            console.log('uploadStarted event', data);
         });
        socket.on('uploadFile', function (data) {
            console.log('uploadFile event', data);
        });
    } else {
        var uploader = new SocketIOFileUploadServer();
        uploader.dir = uploadDir;
        uploader.listen(socket);

        uploader.on("start", function (event) {
            uploadStarted(event.file.name);
         });

        uploader.on("progress", function (event) {
            uploadProgress(event.file.pathName);
        });

        uploader.on("error", function (event) {
            uploadError(JSON.stringify(event));
        });

        uploader.on("complete", function (event) {
            uploadComplete(event.file.pathName, event.file.name);
        });
    }
        

    socket.on('pollStarted', function (data) {
        console.log("JD: received from remote this data: " + JSON.stringify(data));
        pollStatisticsArray = new Array();
        pollAnswerArray = new Array();
        pollAnswerArray = data.answers.split("\n");
        var pollStatisticsString = "";
        var pollAnswersString = "";
        for (i = 0; i < pollAnswerArray.length; i++) {
            pollStatisticsArray[i] = 0; //initialize statistics to 0
            pollAnswersString += pollAnswerArray[i] + "\n";
        }
        console.log("MA: pollStarted pollAnswerArray: " + JSON.stringify(pollStatisticsArray));
        console.log("MA: pollStarted pollStatisticsArray: " + JSON.stringify(pollAnswerArray));
        module.parent.exports.io.sockets.emit('pollUpdate', { answers : pollAnswersString, statistics : pollStatisticsString });
    });

    socket.on('pollVote', function (data) {
        console.log("JD: received from remote this data: " + JSON.stringify(data));
        console.log("MA: pollStatisticsArray on current vote: " + JSON.stringify(pollStatisticsArray));
        if (pollStatisticsArray.length == 0) // empty statistics, let the voting commence!
        {
            pollAnswerArray = data.answers.split("\n");
            for (i = 0; i < pollAnswerArray.length; i++) {
                pollStatisticsArray[i] = 0; //initialize statistics to 0
            }
            console.log("MA: pollVote pollAnswerArray: " + JSON.stringify(pollAnswerArray));
            console.log("MA: pollVote pollStatisticsArray: " + JSON.stringify(pollStatisticsArray));
        }
        pollStatisticsArray[data.vote - 1] += 1;
        pollUpdate();
    });

    //socket.emit('news', { hello: 0 });
    socket.on('mymessage', function (data) {
        console.log("JD received data: " + data);
        console.log(data.my);
        module.parent.exports.io.sockets.emit('news', { hello: data.my, slide: data.slide, slideID: data.slideID });
		//module.parent.exports.io.sockets.emit('news',clients);
		//socket.emit('news', { hello: 1 });

    });
	
	socket.on('notes-server', function (data) {
		
		//module.exports.userAuth
		var slideId = data.slideId.replace(/[^a-zA-Z0-9]/g,"");
		var slidePath = www_dir + slitesDir + '/' + slideId + '/';
		var tmpNote = module.exports.userAuth ? 0 : 1;
		if(slideId == "A1") {
			slidePath = www_dir + module.parent.exports.www_static_dir + '/' + slideId;
		}
		var currentUserId = module.parent.exports.currentUserId;

	    if(fs.existsSync(slidePath) == true) {
			//console.log('Slide was found');
			if(currentUserId && data.slideId) {
				module.parent.exports.NoteScheme.find({uid : currentUserId, sid: slideId }, function (err, docs) {
					if (!docs.length){
						console.log('Inserting new note...');
						// Adding new note
						console.log("Current user" + currentUserId);
						var note = new module.parent.exports.NoteScheme({uid: currentUserId,sid: slideId, note: data.noteText, tmp: tmpNote});
						note.save(function(err, saved) {
								if(err) console.error('Can\'t insert a new note: ' + err);
							});
					}
					else {
						module.parent.exports.NoteScheme.update({ uid : currentUserId, sid: slideId }, {$set: { note: data.noteText, tmp: tmpNote}}, {upsert: true},
							function (err, numAffected) {
								if(numAffected > 0) {console.log("Updated rows: " + numAffected)}
							}
						);
					}
					if(data.init == 1 && docs.length) {
						console.log("Notes initializing, returning note...");
						socket.emit('notes-client', {slideId: slideId, noteText: docs[0].note});
					}					
				});
			
				
				/*else {
					console.log("Note socket received data: " + data.noteText);
				}*/
			}
		}
    });

    //socket.emit('cc', { hello: 0 });
    socket.on('cc', function (data) {
        console.log("-------------- JD: received CLOSED CAPTIONING: " + data);
        console.log(data.my);
        module.parent.exports.io.sockets.emit('ccBroadcast', { hello: data.my });
		//module.parent.exports.io.sockets.emit('news',clients);
		//socket.emit('news', { hello: 1 });
    });

    // receive laser coordinates from the remote
    socket.on('laserCoords', function (data) {
        // 2 next lines are logs for testing
        console.log("Laser Coordinates Received");
        console.log("X: " + data.x + ", " + "Y: " + data.y);

        // send coordinates on to the display (RECEIVER_POWERPOINT.html)
        socket.broadcast.emit('moveLaser', data);
    });

    socket.on('drawCoords', function (data) {
        console.log("draw coords received");
        console.log("X: " + data.x + ", " + "Y: " + data.y);
        socket.broadcast.emit('drawCoords', data);
    });

    socket.on('laserOn', function (data) {
        console.log("laser on");
        socket.broadcast.emit('laserOn', data);
    });

    socket.on('laserOff', function () {
        console.log("laser off");
        socket.broadcast.emit('laserOff');
    });

    socket.on('shake', function () {
        socket.broadcast.emit('shake');
    });

    socket.on('drawStart', function (data) {
        console.log("drawstart");
        socket.broadcast.emit('drawStart', data);
    });

    socket.on('drawStop', function () {
        console.log("drawstop");
        socket.broadcast.emit('drawStop');
    });

    socket.on('insertVideoId', function (data) {
        console.log("insertVideoId, youtube hash: " + data.video_hash + " into the slite: " + data.slite_hash 
            + " slide number " + data.curr_slide);
        prepare_slite.youTube(data.video_hash, data.slite_hash, data.curr_slide);
    });


    socket.on("joinserver", function(name, device) {
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
            socket.emit("update", "You have connected to the server.");
            module.parent.exports.io.sockets.emit("update", people[socket.id].name + " is online.")
            sizePeople = _.size(people);
            sizeRooms = _.size(rooms);
            module.parent.exports.io.sockets.emit("update-people", {people: people, count: sizePeople});
            socket.emit("roomList", {rooms: rooms, count: sizeRooms});
            socket.emit("joined"); //extra emit for GeoLocation
            sockets.push(socket);
        }
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
        //process.exit(1);
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
                module.parent.exports.io.sockets.socket(whisperId).emit("whisper", people[socket.id], whisperMsg);
            } else {
                socket.emit("update", "Can't find " + whisperTo);
            }
        } else {
            module.parent.exports.io.sockets.in(socket.room).emit("chat", people[socket.id], msg);
            socket.emit("isTyping", false);
            if (_.size(chatHistory[socket.room]) > 10) {
                chatHistory[socket.room].splice(0,1);
            } else {
                chatHistory[socket.room].push(people[socket.id].name + ": " + msg);
            }
        }
    });

    socket.on("disconnect", function() {
        if (typeof people[socket.id] !== "undefined") { //this handles the refresh of the name screen
            purge(socket, "disconnect");
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
            room.addPerson(socket.id);
            //socket.emit("update", "Welcome to " + room.name + ".");
            socket.emit("sendRoomID", {id: id});
            chatHistory[socket.room] = [];
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
                        module.parent.exports.io.sockets.in(socket.room).emit("update", user.name + " has connected to " + room.name + " room.");
                        //socket.emit("update", "Welcome to " + room.name + ".");
                        socket.emit("sendRoomID", {id: id});
                        var keys = _.keys(chatHistory);
                        if (_.contains(keys, socket.room)) {
                            socket.emit("history", chatHistory[socket.room]);
                        }
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

    socket.on('requestDownloadPresentation', function (data) {
        console.log('Recieved Request to Dowloading presentation, hash:', data.hash);
        getHashPresentation(data.hash, function (err, fileName) {
            if (err) {
                console.error(err);
            } else {
                console.log('Sending Response to Download Presentation: ', fileName);
                socket.emit('responseDownloadPresentation', { 'fileName': fileName });
            }
        });
    });
}); // module.parent.exports.io.sockets.on('connection' ...
