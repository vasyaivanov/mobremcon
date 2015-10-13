$(document).ready(function () {
	var domainRename = new Object(); 
	// DUPLICATE SOCKET
	var socket = io.connect(document.location.hostname + ':' + location.port);

	 $( "#domainNewName" ).keyup(function() {
		if($( "#domainNewName" ).val() == '') {$("#domainNewNameRes").hide();$( "#renameDomainButton" ).prop( "disabled", true );}
		else {$("#domainNewNameRes").show();$( "#renameDomainButton" ).prop( "disabled", false );}
		domainRename.domainCheck($( "#domainNewName" ).val());
	});

	$( "#renameDomainButton" ).click(function() {
		domainRename.renameDomainStart();	
	});

	$( "#deleteDomainButton" ).click(function() {
		if(confirm("You're going to delete your domain.\nAlso we will delete all your custom names for your slides. Are you sure?") == true) {
			socket.emit('deleteDomain-server');
		}
	});
	
	
	socket.on('deleteDomain-client', function (data) {
		if(data.removed == 1) {
			location.reload();
		}
	});
	
	if($("#showDomainData").length) {
		var domain = location.host;
		domain = domain.replace(/^www\./,"");
		domain = protocol + "://" + $( "#domainNewName" ).val() + "." + domain;
		$("#deleteDomainButton").prop( "disabled", false );
		$("#domainNewNameRes").html("<font color='Yellow'>You've set your domain name!<br>You can access and share your slides through this url:  <a href=\"" + domain +  "\">" + domain +  "</a></font>" )
	}
	
	socket.on('renameDomain-client', function (data) {
	console.log(data);
	var domainAvailableMessage = "<font color='lime'>This domain name is available!</font>";
		if(data.available == 1) {
			$( "#renameDomainButton" ).prop( "disabled", false );
			if($("#domainNewNameRes").html() != domainAvailableMessage){
				$("#domainNewNameRes").html(domainAvailableMessage);
			}
			if(data.start == 1) {
				var domain = location.host;
				domain = domain.replace(/^www\./,"");
				domain = protocol + "://" + $( "#domainNewName" ).val() + "." + domain;
				$("#domainNewNameRes").html("<font color='Yellow'>You've set your domain name!<br>You can access and share your slides through this url: <a href=\"" + domain +  "\">" + domain +  "</a></font>" )
			}
		}
		else {
			var domainNotAvailableMessage = "<font color='red'>This domain name is't available :(. Try another one</font>";
			if($("#domainNewNameRes").html() != domainNotAvailableMessage){
				$( "#renameDomainButton" ).prop( "disabled", true );
				$("#domainNewNameRes").html("<font color='red'>This domain name is't available :(. Try another one</font>");	
			}		
		}
	});

	domainRename.domainCheck = function (str) {
		if(str) {
			var regex = /[^\w\s]/gi;

			if(regex.test(str) == true) {
				$("#domainNewNameRes").html("<font color='red'>You can't use any special symbols.</font>");
				$( "#renameDomainButton" ).prop( "disabled", true );
				return 1;
			}
			else {
				socket.emit('renameDomain-server', {newDomainName: str});
				$( "#renameDomainButton" ).prop( "disabled", false );
				return 0;
			}
		}
	}

	domainRename.renameDomainStart = function () {
		var str = $( "#domainNewName" ).val();
		if(str) {
			socket.emit('renameDomain-server', {newDomainName: str, start: 1});
		}
	}
	
});


