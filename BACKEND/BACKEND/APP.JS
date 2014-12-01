var app = require('http').createServer(handler)
  , url = require('url')
  , io = require('socket.io').listen(app, { log: true })

  , fs = require('fs')
  , cheerio = require('cheerio')
  , exec = require('child_process').exec
  , http = require('http') 
  , SocketIOFileUploadServer = require("socketio-file-upload")
  , hash = require('./hash.js'); 

//hash.cache.clear();
//hash.cacheHash();

app.listen(1337);// change to port 80 for use with nodejitsu

io.set('log level', 1);

SocketIOFileUploadServer.listen(app);

function handler (req, res) {
  var url_parts = url.parse(req.url, true);
  fs.readFile(__dirname + url_parts.pathname,
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading ' + url_parts.pathname);
    }

    res.writeHead(200);
    res.end(data);
  });
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
	io.sockets.emit('pollUpdate', { answers : pollAnswersString, statistics : pollStatisticsString });
}

var pollStatisticsArray = new Array();
var pollAnswerArray = new Array();

var clients = [];

console.log('in remote control');
		
io.sockets.on('connection', function (socket) {
		console.log('started socket');
		
		if (pollAnswerArray.length > 0) pollUpdate();
		
		var imageCount = 1;
		//var dirname = "/Users/mac/Documents/REMOTECONTROL3/BACKEND/UPLOADS";
		
		var uploader = new SocketIOFileUploadServer();
    	uploader.listen(socket);

    	//uploader.dir = "C:\\Users\\marov\\Documents\\GitHub\\mobremcon\\BACKEND\\TEST\\MA\\";
    	//uploader.dir = "/Users/marov/mobremcon/BACKEND/TEST/MA/";
		uploader.dir = "../TEST/MA/";
    	
    	uploader.on("start", function(event){
        	//console.log("JD: started file: " + event.file);
    	});

    	uploader.on("progress", function(event){
        	//console.log("JD: progress: " + JSON.stringify(event));
    	});

		uploader.on("complete", function(event){
			console.log("JD: complete: " + JSON.stringify(event));
        	console.log("JD: saved: " + event.file.name + " file extension=" + event.file.name.split(".")[1]);
        	var extention = event.file.name.split(".")[1];
			var shortFileName = event.file.name.split(".")[0];
        	var fullFileName = uploader.dir + event.file.name;
			//var shortFileName = "SliteShow_PitchDeck";
			//var fullFileName = uploader.dir + "SliteShow_PitchDeck.pptx";
        	
		console.log("MA: uploader.dir: " + uploader.dir + " fullFileName: " + fullFileName);
		//var unoconv_cmd = "C:\\Python27\\python.exe C:\\Users\\marov\\Documents\\GitHub\\mobremcon\\unoconv-master\\unoconv";
		var unoconv_cmd = "python ../FRONTEND/unoconv-master/unoconv";
		console.log(unoconv_cmd + ' -f html -o ' + fullFileName + '.html ' + fullFileName);	
        	
        exec(unoconv_cmd + ' -f html -o ' + fullFileName + '.html ' + fullFileName, 
		  function( error, stdout, stderr) {
			//console.log('unoconv stdout: ', stdout);
			console.log('Converted presentation: ', fullFileName + '.html/' + shortFileName + '.html');
			fs.readFile(fullFileName + '.html/' + shortFileName + '.html', 'utf8', function (err, data) {
			  if (err) throw err;
			  //console.log(data);
			  //console.log('\n\n');
			  $ = cheerio.load(data); // parse the convertex presentation HTML header in order to find out how many slides there is
			  //console.log($('a').next().attr('href').slice(3,5));
			  // The second link in this HTML file is to the last slide image, 
			  // like this: <a href="img14.html">
			  // characters 3-5 of "img14.html" is "14", the number of slides
			  io.sockets.emit('fileConverted', { dir: uploader.dir, filename: fullFileName, num_slides: $('a').next().attr('href').slice(3,5) });
			  hash.cacheHash();			  
			});
			if (error !== null) {
			  console.log('unoconv stderr: ', stderr);
			}
		  });
        	
        	/*fs.rename(dirname + "/" + event.file.name , dirname + "/" + imageCount + "." + extention, function (err){
        		console.log("JD: renamed");
        		imageCount++;
        	}); */
    	});

		socket.on('hash', function (data) {
			console.log("MA APP.JS received hash: " + JSON.stringify(data));

		});

		var toggle = 2;

		clients.push(socket.id);
		/*var level = require('level');
		var db = level('./mydb');
		db.put('name', 'Level', function (err) {
		  if (err) return console.log('Ooops!', err)
		  db.get('name', function (err, value) {
			if (err) return console.log('Ooops!', err)
			console.log('name=' + value)
		  })
		}); */
		
		// socket.on('fileConverted', function (data) {
			// console.log("JD: received from remote this data: " + JSON.stringify(data));
		// });

		socket.on('pollStarted', function (data) {
			console.log("JD: received from remote this data: " + JSON.stringify(data));	
			pollStatisticsArray = new Array();
			pollAnswerArray = new Array();
			pollAnswerArray = data.answers.split("\n");
			var pollStatisticsString = "";
			var pollAnswersString = "";
			for (i=0; i < pollAnswerArray.length; i++) {
				pollStatisticsArray[i] = 0; //initialize statistics to 0
				pollAnswersString += pollAnswerArray[i] + "\n";
			}
			console.log("MA: pollStarted pollAnswerArray: " + JSON.stringify(pollStatisticsArray));
			console.log("MA: pollStarted pollStatisticsArray: " + JSON.stringify(pollAnswerArray));
			io.sockets.emit('pollUpdate', { answers : pollAnswersString, statistics : pollStatisticsString });
		});
		
		socket.on('pollVote', function (data) {
			console.log("JD: received from remote this data: " + JSON.stringify(data));
			console.log("MA: pollStatisticsArray on current vote: " + JSON.stringify(pollStatisticsArray));
			if (pollStatisticsArray.length == 0) // empty statistics, let the voting commence!
			{
				pollAnswerArray = data.answers.split("\n");
				for (i=0; i < pollAnswerArray.length; i++) {
					pollStatisticsArray[i] = 0; //initialize statistics to 0
				}
				console.log("MA: pollVote pollAnswerArray: " + JSON.stringify(pollAnswerArray));
				console.log("MA: pollVote pollStatisticsArray: " + JSON.stringify(pollStatisticsArray));
			}
			pollStatisticsArray[data.vote-1] += 1;
			pollUpdate();
		});
		
		//socket.emit('news', { hello: 0 });
		socket.on('mymessage', function (data) {
			console.log("JD received data: "+data);
			console.log(data.my);
			if(toggle == 2) { 
				toggle = 1; 
			} 
			else{ 
				toggle =2; 
			}
			io.sockets.emit('news',{ hello: data.my, slide: data.slide});
			//io.sockets.emit('news',clients);
			//socket.emit('news', { hello: 1 });

		});

		//socket.emit('cc', { hello: 0 });
		socket.on('cc', function (data) {
			console.log("-------------- JD: received CLOSED CAPTIONING: "+data);
			console.log(data.my);
			io.sockets.emit('ccBroadcast',{ hello: data.my});
			//io.sockets.emit('news',clients);
			//socket.emit('news', { hello: 1 });

		});
        
        // receive laser coordinates from the remote
        socket.on('laserCoords', function(data) {
            // 2 next lines are logs for testing
            console.log("Laser Coordinates Received");
            console.log("X: " + data.x + ", " + "Y: " + data.y);
            
            // send coordinates on to the display (RECEIVER_POWERPOINT.html)
            socket.broadcast.emit('moveLaser', data);
        });
        
        socket.on('drawCoords', function(data) {
            console.log("draw coords received");
            console.log("X: " + data.x + ", " + "Y: " + data.y);
            socket.broadcast.emit('drawCoords', data);
        });
        
        socket.on('laserOn', function() {
            console.log("laser on");
            socket.broadcast.emit('laserOn');
        });
        
        socket.on('laserOff', function() {
            console.log("laser off");
            socket.broadcast.emit('laserOff');
        });
        
        socket.on('shake', function() {
            socket.broadcast.emit('shake');
        });
        
        socket.on('drawStart', function(data) {
            console.log("drawstart");
            socket.broadcast.emit('drawStart', data);
        });
        
        socket.on('drawStop', function() {
            console.log("drawstop");
            socket.broadcast.emit('drawStop');
        });
            
/*
	for(var i=0;i<5;i++){
			
			console.log('test=' + i);
			sleep.sleep(5);
			
			db.get('name', function (err, value) {
				if (err) return console.log('Ooops!', err) // likely the key was not found
				// ta da!
				console.log('name2=' + value)
			})
			
			
			
			socket.emit('news', { hello: i });
			socket.on('my other event', function (data) {
				console.log(data);
			});
	  } */
});
