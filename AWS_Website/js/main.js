$(document).ready(function(){

		var socket = io.connect('http://slite-dev.elasticbeanstalk.com:1337');

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
			$('body').append('<div class="overlay"><div class="upload-text">Uploading...<br>YOU WILL GET A UNIQUE URL TO SHARE.</div><div class="progress"><div class="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="45" aria-valuemin="0" aria-valuemax="100" style="width: 100%"></div></div></div>');
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

		socket.on('slitePrepared', function (data) {
			console.log("MA fileConverted: " + JSON.stringify(data));
			window.location = "http://www.slite.us/" + data.hash;
	  	});
		
		$('#createPresentation').click(function(){
				window.location = "http://www.slite.us/editor";
		});

		if(navigator.userAgent.match(/(iPhone|iPad)/i)) {
				$('.uploadfile').css('display', 'none');
				$('.b-list-presentation').css('display', 'block');
		};
});
