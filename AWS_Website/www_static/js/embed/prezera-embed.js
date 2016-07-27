	//Add Prezera css

	var prezeraOpened = false;
	var prezeraStarted = false;

	function loadjscssfile(filename, filetype){
		if (filetype=="js"){ //if filename is a external JavaScript file
			var fileref=document.createElement('script')
			fileref.setAttribute("type","text/javascript")
			fileref.setAttribute("src", filename)
		}
		else if (filetype=="css"){ //if filename is an external CSS file
			var fileref=document.createElement("link")
			fileref.setAttribute("rel", "stylesheet")
			fileref.setAttribute("type", "text/css")
			fileref.setAttribute("href", filename)
		}
		if (typeof fileref!="undefined")
			document.getElementsByTagName("head")[0].appendChild(fileref)
	}
	loadjscssfile("https://www.prezera.com/js/embed/prezera-embed.css", "css")

	//Add Prezera button
	var prezeraButton = document.createElement('input');
	prezeraButton.setAttribute("type", "button");
	prezeraButton.setAttribute("value", "Go live");
	prezeraButton.setAttribute("onclick", "openPrezera()");
	prezeraButton.setAttribute("class", "prezera-button");
	document.body.appendChild(prezeraButton);

	function openPrezera(){
		if(!prezeraStarted) {
			prezeraStarted = true;
			var hash = getParameter('prezera');
			var iframe = document.createElement('iframe');
			iframe.setAttribute("id", "iframe-prezera");
			iframe.setAttribute("src", "https://www.prezera.com/"+hash);
			iframe.setAttribute("class", "prezera-iframe");
			document.body.appendChild(iframe);
		}
		animateShowPrezera();
	}

	function animateShowPrezera() {
		var elem = document.getElementById("iframe-prezera");
		if(!prezeraOpened) {
			prezeraOpened = true;
		  var pos = 0;
			elem.style.opacity = 1;
		  //var id = setInterval(frame, 20);
		  function frame() {
				if (pos == 1) {
				  clearInterval(id);
				} else {
				  pos=pos + 0.01;
				  elem.style.opacity = pos;
				}
		  }
		}
		else {
			prezeraOpened = false;
			elem.style.opacity = "0";
		}
	}

	function getParameter(theParameter) {
	  var params = window.location.search.substr(1).split('&');

	  for (var i = 0; i < params.length; i++) {
		var p=params[i].split('=');
		if (p[0] == theParameter) {
		  return decodeURIComponent(p[1]);
		}
	  }
	  return false;
	}
