$(document).ready(function () {
    function getClearUrl() {
        var url = [location.protocol, '//', location.host, location.pathname].join('');
        return url;
    }
    
    function getClearHost() {
        var url = [location.protocol, '//', location.host].join('');
        return url;
    }
    
    function getCurrentHash() {
        var hash = document.location.href;
        if (hash[hash.length - 1] === '/') {
            hash = hash.slice(0, -1);
        }
        var slashPos = hash.lastIndexOf('/');
        hash = hash.slice(slashPos + 1);
        hash = hash.toUpperCase();
        return hash;
    }

    var url = document.location.href;
    var hashPos = url.lastIndexOf('#');
    var localUrl = url.slice(hashPos + 1);
    if (localUrl === 'upload_presentation') {
        document.location = getClearUrl();
    }

    var HTML5_UPLOADER = false;
    var socket = io.connect(document.location.hostname + ':' + location.port);
     
    function setUploadMessage(title) {
        progressLabel.text(title);
    }

    var uploadButton  = $('#uploadPresentation'),
        progressbar   = $('#progressbar'),
        progressLabel = $('#uploadLabel');

    progressbar.progressbar({
        value:  false
    });
                
    function openUploadDialog(msg) {
        var url = getClearUrl();
        document.location = url + "#upload_presentation";
        setUploadMessage(msg);
    };
	
	// Delete user slide	
	
	$(".deleteSlide").click(function(){
		var slideId = $(this).attr('slideId');
		if(slideId) {
			socket.emit('server-deleteSlide', { sid: slideId });
		}
	});
	
	socket.on("client-deleteSlide", function (data) {
		//alert(data.sid);
		$( "#slide_" + data.sid).hide();
	});
    
    function updateProgress(data) {
        var printMsg = false, newLine = false;
        var finalMsg = data.percentage == 100 && typeof data.msg !== 'undefined';
        var msg = '';
        if (data.percentage >= 0 && !data.error && !finalMsg) {
            msg += "Progress: " + data.percentage + "%";
            newLine = true;
        } else if(data.slide > 0 && !data.error) {
            msg += "Loaded slides: " + data.slide + ' ';
            newLine = true;
        } else {
            printMsg = true;
        }
        if (printMsg || finalMsg) {
            if (newLine) {
                msg += '\n';
            }
            msg += data.msg;
        }
        progressLabel.text(msg);
        if (data.percentage >= 0 || data.error) {
            var n = data.error ? 100 :  parseInt(data.percentage, 10);
            progressbar.progressbar("value", n);
        }
    } 
      
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

			// Check if user possible to upload ppt 

			siofu.chunkSize = 100 * 1024;
			siofu.listenOnInput(document.getElementById("uploadPresentation"));		
			//siofu.listenOnDrop(document.getElementById("file_drop"));

			siofu.addEventListener("choose", function(event){
				console.log("Upload file(s) chosen: " + event.files[0].name);
				openUploadDialog('Uploading: ' + event.files[0].name);
			});
				
			// Do something when a file upload started:
			siofu.addEventListener("start", function(event){
				console.log("Upload started: " + event.file.name);
			});

			// Do something when a file upload is finished:
			siofu.addEventListener("complete", function(event){
				console.log("Upload successful: " + event.file.name);
				setUploadMessage('Converting presentation...');
			});
			
			
			siofu.addEventListener("error", function(event){
				console.log("Upload failed: " + event.file.pathName);
				var data;
				data.msg = 'Server error!\nPlease try uploading again. If fails again contact support.';
				data.error = true;
				data.percentage = 100;
				updateProgress(data);
				setTimeout(function(){ window.location = getClearUrl(); }, 10000); // reload after 10 sec
			});	

					// Do something when a file upload fails:

    } // if(HTML5_UPLOADER) .. else ..
    
	socket.on("uploadProgress", function (data) {
        var msg = "Upload Progress";
        if (data.percentage >= 0) {
            msg += ': ' + data.percentage + '%'
        }
        if (data.slite > 0) {
            msg += ' slide: ' + data.slide;
        }
        console.log(msg);
        if (data.percentage >= 0 || data.slide > 0) {
          data.error = false;
          updateProgress(data);
        }
    });

    socket.on('slitePrepared', function (data) {
        console.log('File converted: ' + JSON.stringify(data));
        data.msg = 'Converted successfully!\nYOU WILL BE FORWARDED TO THE URL TO SHARE.';
        data.percentage = 100;
        updateProgress(data);
        setTimeout(function () {
            var url = getClearHost() + '/' + data.hash;
            window.location = url;
        }, 1000); // forward after 1 sec
    });

    socket.on('sliteConversionError', function (rdata) {
		var data = {};
		if(rdata.limit == 1) {
			data.msg = "You've reached the maximum limit of slides per user";
		}
		else if(rdata.limit == 2) {
			data.msg = "The file is too big";
		}
		else {
	        data.msg = 'Server error!\nPlease try uploading again. If fails again contact support.';
		}
	    console.log("File conversion failed! " + JSON.stringify(data));
        data.error = true;
        data.percentage = 100;
		updateProgress(data);
		setTimeout(function(){ window.location = getClearUrl(); }, 10000); // reload after 10 sec


    });
	
    $('#createPresentation').click(function(){
		window.location = window.location + "editor";
    });
	
	replaceDomainName();

    if(navigator.userAgent.match(/(iPhone|iPad)/i)) {
		//$('.uploadfile').css('display', 'none');
   };
});

function replaceDomainName() {
	var hostname = window.location.hostname;
	if( hostname.indexOf("www") == 0){
		hostname = hostname.substring(4);
	}
	var element = $("#aboutOurProduct");
	var htmlBody = element.html();
	htmlBody = htmlBody.replace(/Slite/g, hostname);
	element.html(htmlBody);
	//str = str.replace(/Slite&#8482;/g, hostname);
}

function delSlide(slideId) {
	deleteSlide(slideId);
}
