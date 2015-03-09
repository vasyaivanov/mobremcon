$(document).ready(function(){
    var socket = io.connect(document.location.hostname + ':1337');

    // Initialize instances:
    var siofu = new SocketIOFileUpload(socket);
 
    // Configure the three ways that SocketIOFileUpload can read files:
    //document.getElementById("upload_btn").addEventListener("click", siofu.prompt, false);
    //siofu.listenOnSubmit(document.getElementById("upload_btn"), document.getElementById("upload_input"));
    siofu.listenOnInput(document.getElementById("uploadPresentation"));
    //siofu.listenOnDrop(document.getElementById("file_drop"));

    siofu.addEventListener("choose", function(event){
	    console.log("Upload file(s) chosen: " + event.files[0].name);
        $('body').append('<div class="overlay"><div class="upload-text">Uploading the file...</div><div class="progress"><div class="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="45" aria-valuemin="0" aria-valuemax="100" style="width: 100%"></div></div></div>');
    });

    // Do something when a file upload started:
    siofu.addEventListener("start", function(event){
        console.log("Upload started: " + event.file.name);
 	    //$('body').append('<div class="overlay"><div class="upload-text">Uploading the file...</div><div class="progress"><div class="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="45" aria-valuemin="0" aria-valuemax="100" style="width: 100%"></div></div></div>');
    });

    // Do something when a file upload is finished:
    siofu.addEventListener("complete", function(event){
        console.log("Upload successful: " + event.file.name);
	    $(".overlay").remove();
	    $('body').append('<div class="overlay"><div class="upload-text">Converting to HTML...<br>YOU WILL GET A UNIQUE URL TO SHARE.</div><div class="progress"><div class="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%"></div></div></div>');
    });
    

    // Do something when a file upload fails:
    siofu.addEventListener("error", function(event){
	    console.log("Upload failed: " + event.file.pathName);
	    $(".overlay").remove();
	    $('body').append('<div class="overlay"><div class="upload-text">Server error!<br>Please try uploading again. If fails again contact support.</div><div class="progress"><div class="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%"></div></div></div>');
	    setTimeout(function(){ window.location = window.location; }, 10000); // reload after 10 sec
    });
    
    socket.on("uploadProgress", function (data) {
        console.log("Upload progress: " + data.procentage + '%');
        var msg = '<div class="overlay"><div class="upload-text">Converting to HTML, slide:' + data.slide;
        if (data.procentage > 0) {
            msg += ' Progress:' + data.procentage + '%'
        }
        msg += '<br>YOU WILL GET A UNIQUE URL TO SHARE.</div><div class="progress"><div class="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%"></div></div></div>';
        $(".overlay").remove();
        $('body').append(msg);
    });

    socket.on('slitePrepared', function (data) {
        console.log('File converted: ' + JSON.stringify(data));
 	    $(".overlay").remove();
	    $('body').append('<div class="overlay"><div class="upload-text">Converted successfully!<br>YOU WILL BE FORWARDED TO THE URL TO SHARE.</div><div class="progress"><div class="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%"></div></div></div>');
	    setTimeout(function(){ window.location = window.location + data.hash; }, 1000); // forward after 1 sec
    });

    socket.on('sliteConversionError', function (data) {
	    console.log("File conversion failed! " + JSON.stringify(data));
	    $(".overlay").remove();
	    $('body').append('<div class="overlay"><div class="upload-text">Server error!<br>Please try uploading again. If fails again contact support.</div><div class="progress"><div class="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%"></div></div></div>');
	    setTimeout(function(){ window.location = window.location; }, 10000); // reload after 10 sec
    });

    $('#createPresentation').click(function(){
		    window.location = window.location + "editor";
    });

    if(navigator.userAgent.match(/(iPhone|iPad)/i)) {
		    $('.uploadfile').css('display', 'none');
		    $('.b-list-presentation').css('display', 'block');
    };
});
