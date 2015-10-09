$(document).ready(function () {
	var renameSlide = new Object(); 
	// DUPLICATE SOCKET
	//var socket = io.connect(document.location.hostname + ':' + location.port);
	
	$( "[id^=rsid_]" ).keyup(function(event) {
		var elId = event.target.id;
		var hashId = event.target.id.replace("rsid_","");
		var str = $( "#" + elId ).val();
		
		if($( "#" + elId ).val() != '')  {
			var regex = /[^\w\s]/gi;
			if(regex.test(str) == true) {
				$("#rresult_" + hashId).html("<font color='red'>You can't use any special symbols in slide name</font>");
			}
			else {
				socket.emit('renameHash-server', {slideId: hashId, newHashName: str, start: 1});
			}			
		}
		else {
			$("#rresult_" + hashId).html("<font color='red'>Enter a new slide name!</font>");			
		}
	});
	
	$( "[id^=open_]" ).click(function(event) {
		var elId = event.target.id;
		var hashId = event.target.id.replace("open_","");
		var str = $( "#rsid_" + hashId ).val();
		if(str) {
			var loc = location.href.replace("#","");
			window.open(loc + str);
		}
	});	
	
	socket.on('renameHash-client', function (data) {
	console.log(data);
	var domainAvailableMessage = "<font color='lime'>Slide name saved!</font>";
	if(data.available == 1) {
		$("#rresult_" + data.slideId).html(domainAvailableMessage);
	}
	else {
		var domainNotAvailableMessage = "<font color='red'>This name is't available :(. Try another one</font>";
		$("#rresult_" + data.slideId).html(domainNotAvailableMessage);
	}
});
	
});
