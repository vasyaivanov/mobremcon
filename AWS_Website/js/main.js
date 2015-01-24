$(document).ready(function(){

		var url;
		if (document.location.hostname == 'localhost' || document.location.hostname == '127.0.0.1'){
			url = 'http://localhost';
		} else {
			url = 'http://slite-dev.elasticbeanstalk.com';
		}
		url += ':1337';
		var socket = io.connect(url);

		// Initialize instances:
		var siofu = new SocketIOFileUpload(socket);

		// Configure the three ways that SocketIOFileUpload can read files:
		//document.getElementById("upload_btn").addEventListener("click", siofu.prompt, false);
		//siofu.listenOnSubmit(document.getElementById("upload_btn"), document.getElementById("upload_input"));
		siofu.listenOnInput(document.getElementById("uploadPresentation"));
		//siofu.listenOnDrop(document.getElementById("file_drop"));


		// Do something when a file upload started:
		siofu.addEventListener("start", function(event){
			console.log("Upload started");
			console.log(event.file);
			$('body').append('<div class="overlay"><div class="upload-text">Uploading the file...</div><div class="progress"><div class="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="45" aria-valuemin="0" aria-valuemax="100" style="width: 100%"></div></div></div>');
		});

		// Do something when a file upload is finished:
		siofu.addEventListener("complete", function(event){
			console.log("Upload successful");
			console.log(event.file);
			$(".overlay").remove();
			$('body').append('<div class="overlay"><div class="upload-text">Converting to HTML...<br>YOU WILL GET A UNIQUE URL TO SHARE.</div><div class="progress"><div class="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%"></div></div></div>');
		});

		// Do something when a file upload fails:
		siofu.addEventListener("error", function(event){
			console.log("Upload failed");
			console.log(event.file);
			$(".overlay").remove();
			$('body').append('<div class="overlay"><div class="upload-text">Server error!<br>Please try uploading again. If fails again contact support.</div><div class="progress"><div class="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%"></div></div></div>');
			setTimeout(function(){ window.location = window.location; }, 10000); // reload after 10 sec
		});

		socket.on('slitePrepared', function (data) {
			console.log("MA fileConverted: " + JSON.stringify(data));
			//window.location = "http://www.slite.us/" + data.hash;
			$(".overlay").remove();
			$('body').append('<div class="overlay"><div class="upload-text">Converted successfully!<br>YOU WILL BE FORWARDED TO THE URL TO SHARE.</div><div class="progress"><div class="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%"></div></div></div>');
			setTimeout(function(){ window.location = window.location + data.hash; }, 3000); // forward after 3 sec
	  });

		socket.on('sliteConversionError', function (data) {
			console.log("MA file conversion failed!");
			//window.location = "http://www.slite.us/" + data.hash;
			$(".overlay").remove();
			$('body').append('<div class="overlay"><div class="upload-text">Server error!<br>Please try uploading again. If fails again contact support.</div><div class="progress"><div class="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%"></div></div></div>');
			setTimeout(function(){ window.location = window.location; }, 10000); // reload after 10 sec
		});

		$('#createPresentation').click(function(){
				//window.location = "http://www.slite.us/editor";
				window.location = window.location + "editor";
		});

		if(navigator.userAgent.match(/(iPhone|iPad)/i)) {
				$('.uploadfile').css('display', 'none');
				$('.b-list-presentation').css('display', 'block');
		};
});
