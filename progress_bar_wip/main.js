$(document).ready(function (){

    var progressbar, progressLabel;

    function openProgressBar() {
        $('body').append('<div id="progressbar"><div class="progress-label">Loading...</div></div>');
 
        progressbar = $( "#progressbar" );
        progressLabel = $( ".progress-label" );

        progressbar.progressbar({
            value: false,
            change: function() {
                progressLabel.text( progressbar.progressbar( "value" ) + "%" );
            },
            complete: function() {
                progressLabel.text( "Complete!" );
            }
        });
    }

    function progress(data) {
        if(data.percentage < 0) return;
        progressbar.progressbar( "value", data.percentage );
    }

    var HTML5_UPLOADER = false;
    var socket = io.connect(document.location.hostname + ':1337');
    
    if (HTML5_UPLOADER) {
        function fileChosen(event){
            var files = document.getElementById('uploadPresentation').files;
            //alert(JSON.stringify(files.item(0).name));
            //alert(JSON.stringify(files.item(0)));
            //alert(JSON.stringify(event.target.files[0]));
           // alert(files[0].toSourse());
            var selectedFile = event.target.files[0];
            var fileName = selectedFile.name;
            if (fileName != "") {
                fileReader = new FileReader();
                fileReader.onload = function (ev) {
                    //alert(ev.target.result);
                    socket.emit('uploadFile', { 'name': fileName, data: ev.target.result });
                    //alert('loaded' + fileName);
                }
                //fileReader.readAsBinaryString(selectedFile);
                fileReader.readAsArrayBuffer(selectedFile);
                socket.emit('uploadStarted', { 'name' : fileName, 'size' : selectedFile.size });
            }
            else {
                alert("Please Select a File");
            }
        }

        if (window.File && window.FileReader) { //These are the relevant HTML5 objects that we are going to use 
            //document.getElementById('uploadPresentation').addEventListener('click', function () { alert('click');});
            document.getElementById('uploadPresentation').addEventListener('change', fileChosen);
        }
        else {
            //document.getElementById('UploadArea').innerHTML = "Your Browser Doesn't Support The File API Please Update Your Browser";
            alert("Your Browser Doesn't Support The File API Please Update Your Browser");
        }
    } else {
        // Initialize instances:
        var siofu = new SocketIOFileUpload(socket);
 
        // Configure the three ways that SocketIOFileUpload can read files:
        //document.getElementById("upload_btn").addEventListener("click", siofu.prompt, false);
        //siofu.listenOnSubmit(document.getElementById("upload_btn"), document.getElementById("upload_input"));
        siofu.listenOnInput(document.getElementById("uploadPresentation"));
        //siofu.listenOnDrop(document.getElementById("file_drop"));

        siofu.addEventListener("choose", function(event){
	        console.log("Upload file(s) chosen: " + event.files[0].name);
            openProgressBar();
        });

        // Do something when a file upload started:
        siofu.addEventListener("start", function(event){
            console.log("Upload started: " + event.file.name);
 	        //$('body').append('<div class="overlay"><div class="upload-text">Uploading the file...</div><div class="progress"><div class="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="45" aria-valuemin="0" aria-valuemax="100" style="width: 100%"></div></div></div>');
        });

        // Do something when a file upload is finished:
        siofu.addEventListener("complete", function(event){
            console.log("Upload successful: " + event.file.name);
	        //$(".overlay").remove();
	        //$('body').append('<div class="overlay"><div class="upload-text">Converting to HTML...<br>YOU WILL GET A UNIQUE URL TO SHARE.</div><div class="progress"><div class="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%"></div></div></div>');
        });

        // Do something when a file upload fails:
        siofu.addEventListener("error", function(event){
	        console.log("Upload failed: " + event.file.pathName);
	        $(".overlay").remove();
	        $('body').append('<div class="overlay"><div class="upload-text">Server error!<br>Please try uploading again. If fails again contact support.</div><div class="progress"><div class="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%"></div></div></div>');
	        setTimeout(function(){ window.location = window.location; }, 10000); // reload after 10 sec
        });
    } // if(HTML5_UPLOADER) .. else ..
    
    socket.on("uploadProgress", function (data) {
        console.log("Upload progress: " + data.percentage + '%');
        var msg = '<div class="overlay"><div class="upload-text">Converting to HTML, slide:' + data.slide;
        if (data.percentage > 0) {
            msg += ' Progress:' + data.percentage + '%'
        }
        progress(data);
    });

    socket.on('slitePrepared', function (data) {
        console.log('File converted: ' + JSON.stringify(data));
 	    //$(".overlay").remove();
	    //$('body').append('<div class="overlay"><div class="upload-text">Converted successfully!<br>YOU WILL BE FORWARDED TO THE URL TO SHARE.</div><div class="progress"><div class="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%"></div></div></div>');
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
