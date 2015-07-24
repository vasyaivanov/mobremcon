var paypal = new Object(); 

 $( "#paypalNewHash" ).keyup(function() {
	paypal.renamePresCheck($( "#paypalNewHash" ).val());
});

socket.on('renameHash-client', function (data) {
	if(currentHash == data.slideId) {
		if(data.available == 1) {
			$("#newHashRes").html("<font color='green'>This name is available!</font>");
			if(data.start == 1) {
				if(data.newHashName) {
					console.log("Redirect to paypal");
					$("#paypalRenameOn1").val(currentHash);
					$("#paypalRenameOn2").val(data.newHashName);
					$("#paypalNewHashForm").submit();
					showHideRenamePresentationOverlay();
				}
			}
		}
		else {
			$("#newHashRes").html("<font color='red'>This name is't available :(. Try another one</font>");			
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
			$("#newHashRes").html("");
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


