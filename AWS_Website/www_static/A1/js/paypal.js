var paypal = new Object(); 

if(payed == 1) {
	$("#renameHashButton").hide();
	$("#renameHashButtonPayed").show();
	$("#paypalNewHash").val(customurl);
	$("#paypalRenameNotice").hide();
}

 $( "#paypalNewHash" ).keyup(function() {
	paypal.renamePresCheck($( "#paypalNewHash" ).val());
});

socket.on('renameHash-client', function (data) {
	console.log(data);
	var domainAvailableMessage = "<font color='green'>This name is available!</font>";
	if(currentHash == data.slideId) {
		if(data.available == 1) {
			if($("#newHashRes").html() != domainAvailableMessage){
				$("#newHashRes").html(domainAvailableMessage);
			}
			if(data.start == 1) {
				if(data.newHashName) {
					if(data.payed == 0) {
						$("#paypalRenameOn1").val(currentHash);
						$("#paypalRenameOn2").val(data.newHashName);
						$("#paypalNewHashForm").submit();
					}
					else {
						if(isInIFrame() == true) {
							parent.window.location.href="/" + data.newHashName;							
						}
						else {
							window.location.href="/" + data.newHashName;	
						}

					}
					showHideRenamePresentationOverlay();
				}
			}
		}
		else {
			var domainNotAvailableMessage = "<font color='red'>This name is't available :(. Try another one</font>";
			if($("#newHashRes").html() != domainNotAvailableMessage){
				$("#newHashRes").html("<font color='red'>This name is't available :(. Try another one</font>");	
			}		
		}
	}
});

paypal.renamePresCheck = function (str) {
	if(str) {
		var regex = /[^\w\s]/gi;

		if(regex.test(str) == true) {
			$("#newHashRes").html("<font color='red'>You can't use any special symbols.</font>");
			return 1;
		}
		else {
			socket.emit('renameHash-server', {slideId: currentHash, newHashName: str});
			return 0;
		}
	}
}

paypal.renameHashStart = function () {
	var str = $( "#paypalNewHash" ).val();
	if(str) {
		socket.emit('renameHash-server', {slideId: currentHash, newHashName: str, start: 1});
	}
}


