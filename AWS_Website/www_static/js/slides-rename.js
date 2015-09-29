$(document).ready(function () {
	var renameSlide = new Object(); 
	var socket = io.connect(document.location.hostname + ':' + location.port);
	
	$( "[id^=rsid_]" ).keyup(function(event) {
		var elId = event.target.id;
		var hashId = event.target.id.replace("rsid_","");
		var str = $( "#" + elId ).val();
		
		if($( "#" + elId ).val() != '')  {
			var regex = /[^\w\s]/gi;
			if(regex.test(str) == true) {
				//alert("You can't use any special symbols in slide name");
			}
			else {
				socket.emit('renameHash-server', {slideId: hashId, newHashName: str});
				//alert("Slide renamed");
			}			
		}
	});
});
