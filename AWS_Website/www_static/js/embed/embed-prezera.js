var Prezera = function(params) {
  var Main = this;
  this.params = params;
  this.hostUrl = "https://www.prezera.com"
  this.SocketUrl  = "https://www.prezera.com";
  this.include = {
    io: { url: "https://www.prezera.com/socket.io/socket.io.js", type: "js"},
    siofu: { url: "https://www.prezera.com/js/client.min.js", type: "js"},
    jqeury: { url:  "https://www.prezera.com/js/jquery-2.1.3.min.js", type: "js"},
    jqeuryui: { url: "https://www.prezera.com/js/jquery-ui.min.js", type: "js"},
    jqueryuicss: {url: "//code.jquery.com/ui/1.11.4/themes/smoothness/jquery-ui.css", tupe: "css"}
  }

  document.getElementById(this.params.visualElement).className = this.params.style;

  this.div = document.getElementById(this.params.visualElement);

  if(this.div == null) {
    alert("Can't find Prezera element, check manual or contact support")
  }
  else {
    this.includeFile = function(file, onload) {
      if(file.type == "js") {
        var script = document.createElement('script');
        script.src = file.url;
        this.div.appendChild(script);
        script.onload = function() {
            if (onload) onload();
        };
      }
      else if(file.type = "css") {
        var link = document.createElement( "link" );
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = file.url;
        this.div.appendChild(link);
        link.onload = function() {
            if (onload) onload();
        };
      }
    }

    // Include CSSs
    Main.includeFile(Main.include.jqueryuicss);
    Main.includeFile({ url: Main.params.styleUrl, type: "css"});

    this.setUploadMessage = function(title) {
      console.log("We have new title" + title);
      Main.progressLabel.text(title);
    }

    this.openUploadDialog = function(msg) {
      Main.setUploadMessage(msg);
    };

    this.updateProgress = function(data) {
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
        Main.progressLabel.text(msg);
        if (data.percentage >= 0 || data.error) {
            var n = data.error ? 100 :  parseInt(data.percentage, 10);
            Main.progressBar.progressbar("value", n);
        }
    }

    //Settings
    Main.randomName = "prezera-" + Math.floor(Math.random() * (9999999 - 1)) + 1;
    Main.includeFile(Main.include.jqeury, function() {
      // Jquery upload
      Main.includeFile(Main.include.jqeuryui, function() {
          // Adding elements
          // File input
          var presFileInput = document.createElement("input");
          presFileInput.setAttribute("type", "file");
          presFileInput.setAttribute("id", "file-" + Main.randomName);
          Main.div.appendChild(presFileInput);
          Main.fileInput = $("#file-" + Main.randomName);
          // Button
          var presButtonUpload = document.createElement("input");
          presButtonUpload.setAttribute("type", "button");
          presButtonUpload.setAttribute("id", "button-" + Main.randomName);
          presButtonUpload.setAttribute("value", Main.params.buttonText);
          presButtonUpload.setAttribute("onclick", "fireClick('file-" + Main.randomName +"')");
          Main.div.appendChild(presButtonUpload);
          Main.presButtonUpload = $("#button-" + Main.randomName);
          // Upload label
          var progressLabel = document.createElement("h3");
          progressLabel.setAttribute("id", "progressLabel-" + Main.randomName);
          // Upload bar
          var progressBar = document.createElement("div");
          progressBar.setAttribute("id", "progressBar-" + Main.randomName);
          // Dialog Box
          var dialogBox = document.createElement("div");
          dialogBox.setAttribute("id", "dialogBox-" + Main.randomName);
          Main.div.appendChild(dialogBox);
          Main.dialogBox = $("#dialogBox-" + Main.randomName);
          dialogBox.appendChild(progressLabel);
          dialogBox.appendChild(progressBar);
          Main.progressLabel = $("#progressLabel-" + Main.randomName);
          Main.progressBar = $("#progressBar-" + Main.randomName);
          Main.progressBar.progressbar({});
          // Iframe
          var iframe = document.createElement('iframe');
          iframe.setAttribute("id", "iframe-" + Main.randomName);
          Main.div.appendChild(iframe);
          Main.iframe = $("#iframe-" + Main.randomName);

          // SockedIO upload
          Main.includeFile(Main.include.siofu);
          // Loading socket IO
          Main.includeFile(Main.include.io, function(t) {
            console.log("IO Loaded");
            Main.mainSocket = io.connect(this.SocketUrl);
            Main.mainSocket.emit("server-userRestrictions");

            Main.mainSocket.on("uploadProgress", function (data) {
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
                  Main.updateProgress(data);
                }
            });

            Main.mainSocket.on('sliteConversionError', function (rdata) {
              var data = {};

              if(rdata.limit == 1) {
                data.msg = "You've reached the maximum limit of slides per user";
              }
              else if(rdata.limit == 2) {
                data.msg = "The file is too big";
              }
              else if(rdata.limit == 3) {
                data.msg = "We only support ppt & pptx files"
              }
              else {
                data.msg = 'Server error!\nPlease try uploading again. If fails again contact support.';
              }
              data.error = true;
              data.percentage = 100;
            	Main.updateProgress(data);
            	setTimeout(function(){ window.location = getClearUrl(); }, 10000); // reload after 10 sec
            });

            Main.mainSocket.on('slitePrepared', function (data) {
                console.log('File converted: ' + JSON.stringify(data));
                data.msg = 'Presentation uploaded.';
                data.percentage = 100;
                Main.updateProgress(data);
                Main.dialogBox.hide();
                Main.iframe.attr('src', Main.hostUrl + "/" + data.hash + "/");
                Main.iframe.show();
            });

          	Main.mainSocket.on("client-userRestrictions", function (loadData) {
              var siofu = new SocketIOFileUpload(this);
        			siofu.chunkSize = 0;
        			siofu.maxFileSize = loadData.maxFileSize;
        			siofu.listenOnInput(document.getElementById("file-" + Main.randomName));

        			siofu.addEventListener("choose", function(event){
                Main.dialogBox.show();
                Main.presButtonUpload.hide();
        				console.log("Upload file(s) chosen: " + event.files[0].name);
        				Main.openUploadDialog('Uploading: ' + event.files[0].name);
        			});

        			siofu.addEventListener("start", function(event){
        				console.log("Upload started: " + event.file.name);
        			});

        			siofu.addEventListener("complete", function(event){
        				console.log("Upload successful: " + event.file.name);
        				Main.setUploadMessage('Converting presentation...');
        			});

        			siofu.addEventListener("error", function(event){
        				var data = [];
        				data.msg = 'Server error!\nPlease try uploading again. If fails again contact support.';
        				if(event.code == 1) {
        					data.msg = "File is too big for upload."
        				}
        				data.error = true;
        				data.percentage = 100;
        				Main.updateProgress(data);
        				setTimeout(function(){ location.reload() }, 2000); // reload after 10 sec
        			});
            });
          })
        });
      });
  }

/*    function getClearUrl() {
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

    if(typeof mainSocket !== 'undefined') {
        alert('mainSocket is already defined!');
    }

    var mainSocket = io.connect(document.location.hostname + ':' + location.port);

    mainSocket.emit("server-userRestrictions");

    function setUploadMessage(title) {
        progressLabel.text(title);
    }

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

    // ???
	checkUploadStatus();


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


		mainSocket.on("client-userRestrictions", function (loadData) {
			var siofu = new SocketIOFileUpload(mainSocket);
			siofu.chunkSize = 0;
			siofu.maxFileSize = loadData.maxFileSize;
			siofu.listenOnInput(document.getElementById("uploadPresentation"));

			siofu.addEventListener("choose", function(event){
				console.log("Upload file(s) chosen: " + event.files[0].name);
				openUploadDialog('Uploading: ' + event.files[0].name);
			});

			siofu.addEventListener("start", function(event){
				console.log("Upload started: " + event.file.name);
			});

			siofu.addEventListener("complete", function(event){
				console.log("Upload successful: " + event.file.name);
				setUploadMessage('Converting presentation...');
			});

			siofu.addEventListener("error", function(event){
				var data = [];
				data.msg = 'Server error!\nPlease try uploading again. If fails again contact support.';
				if(event.code == 1) {
					data.msg = "File is too big for upload."
				}
				data.error = true;
				data.percentage = 100;
				updateProgress(data);
				setTimeout(function(){ window.location = getClearUrl(); }, 10000); // reload after 10 sec
			});
		});

    mainSocket.on("uploadProgress", function (data) {
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

    mainSocket.on('slitePrepared', function (data) {
      console.log(data);
        console.log('File converted: ' + JSON.stringify(data));
        data.msg = 'Converted successfully!\nYOU WILL BE FORWARDED TO THE URL TO SHARE.';
        data.percentage = 100;
        updateProgress(data);
        var urlRedirect;

        if(typeof data.domain != "undefined") {
          var urlRedirect = "//" + data.domain + "." + location.hostname.split('.').reverse()[1] + '.' + location.hostname.split('.').reverse()[0] + "/" + data.hash;
        }
        else {
          urlRedirect = getClearHost() + '/' + data.hash;
        }
        window.location = urlRedirect;

    });

    mainSocket.on('sliteConversionError', function (rdata) {
      var data = {};

      if(rdata.limit == 1) {
      data.msg = "You've reached the maximum limit of slides per user";
      }
      else if(rdata.limit == 2) {
      data.msg = "The file is too big";
      }
      else if(rdata.limit == 3) {
      data.msg = "We only support ppt & pptx files"
      }
      else {
      data.msg = 'Server error!\nPlease try uploading again. If fails again contact support.';
      }
      //console.log("File conversion failed! " + JSON.stringify(data));
      data.error = true;
      data.percentage = 100;
    	updateProgress(data);
    	setTimeout(function(){ window.location = getClearUrl(); }, 10000); // reload after 10 sec
    });*/
}

function fireClick(el) {
  $( "#" + el ).trigger( "click" );
    /*var evObj = document.createEvent('MouseEvents');
    evObj.initMouseEvent('click', true, true, window);
    setTimeout(function() {
      document.getElementById(el).dispatchEvent(evObj);
    },100);*/
}
