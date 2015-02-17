require("./js/client.js");
var socket = io.connect(document.location.hostname + ':1337');

document.addEventListener("DOMContentLoaded", function(){

	// Initialize instances:
	var siofu = new SocketIOFileUpload(socket);

	// Configure the three ways that SocketIOFileUpload can read files:
	//document.getElementById("upload_btn").addEventListener("click", siofu.prompt, false);
	siofu.listenOnSubmit(document.getElementById("upload_btn"), document.getElementById("upload_input"));
	//siofu.listenOnInput(document.getElementById("upload_input"));
	siofu.listenOnDrop(document.getElementById("file_drop"));


	// Do something when a file is uploaded:
	siofu.addEventListener("start", function(event){
		console.log(event.success);
		console.log(event.file);
		socket.emit('fileStarted', { myStart: "start=" });
	});

	// Do something when a file is uploaded:
	siofu.addEventListener("load", function(event){
		console.log(event.success);
		console.log(event.file);
		socket.emit('fileLoaded', { myLoad: "load=" });
	});

	// Do something when a file is uploaded:
	siofu.addEventListener("complete", function(event){
		console.log(event.success);
		console.log(event.file);
		socket.emit('newSlides', { myComplete: "complete", myFile: event.file});
	});

}, false);

socket.on('fileConverted', function (data) {
	console.log("MA fileConverted: " + JSON.stringify(data));
	//cacheHash();
	});

	socket.on('news', function (data) {
	var button = data.hello-1;
console.log(button);


socket.emit('my other event', { my: 'data' });
});
