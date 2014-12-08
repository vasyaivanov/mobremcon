$(document).ready(function(){

		var socket = io.connect('http://localhost:1337');

		// Initialize instances:
		var siofu = new SocketIOFileUpload(socket);

		// Configure the three ways that SocketIOFileUpload can read files:
		//document.getElementById("upload_btn").addEventListener("click", siofu.prompt, false);
		//siofu.listenOnSubmit(document.getElementById("upload_btn"), document.getElementById("upload_input"));
		siofu.listenOnInput(document.getElementById("uploadPresentation"));
		//siofu.listenOnDrop(document.getElementById("file_drop"));


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

		socket.on('fileConverted', function (data) {
			console.log("MA fileConverted: " + JSON.stringify(data));
			window.location = "http://localhost:8081/" + data.hash;
	  	});
		
		$('#createPresentation').click(function(){
				window.location = "http://slite.us/editor";
		});

		if(navigator.userAgent.match(/(iPhone|iPad)/i)) {
				$('.uploadfile').css('display', 'none');
				$('.b-list-presentation').css('display', 'block');
		};
});