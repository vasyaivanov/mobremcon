var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs');

app.listen(80);//80

SocketIOFileUploadServer.listen(app);


function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}


var clients = [];

console.log('in remote control');
		
io.sockets.on('connection', function (socket) {
		console.log('started sockettt');
		

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