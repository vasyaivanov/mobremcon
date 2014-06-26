var app = require('http').createServer(handler)
  , url = require('url')
  , io = require('socket.io').listen(app, { log: false })
  , fs = require('fs')
  , cheerio = require('cheerio')
  , exec = require('child_process').exec
  , http = require('http')
  , formidable = require('formidable')
  , SocketIOFileUploadServer = require("socketio-file-upload");

app.listen(1337);//80

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


var clients = [];

console.log('in remote control');
		
io.sockets.on('connection', function (socket) {
		console.log('started socket');
		
		var imageCount = 1;
		//var dirname = "/Users/mac/Documents/REMOTECONTROL3/BACKEND/UPLOADS";
		
		var uploader = new SocketIOFileUploadServer();
    	uploader.listen(socket);

    	//uploader.dir = "C:\\Users\\marov\\Documents\\GitHub\\mobremcon\\BACKEND\\TEST\\MA\\";
    	uploader.dir = "/Users/marov/mobremcon/BACKEND/TEST/MA/";
    	
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
        	
		console.log("MA: uploader.dir: " + uploader.dir + " fullFileName: " + fullFileName);
		//var unoconv_cmd = "C:\\Python27\\python.exe C:\\Users\\marov\\Documents\\GitHub\\mobremcon\\unoconv-master\\unoconv";
		var unoconv_cmd = "python ../unoconv-master/unoconv";
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
			  socket.broadcast.emit('fileConverted', { dir: uploader.dir, filename: fullFileName, num_slides: $('a').next().attr('href').slice(3,5) });
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
			socket.broadcast.emit('news',{ hello: data.my});
			//io.sockets.emit('news',clients);
			socket.emit('news', { hello: 1 });
			
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
