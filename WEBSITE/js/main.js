$(document).ready(function(){

		$('#uploadPresentation').change(function(){
				$('body').append('<div class="overlay"><div class="upload-text">Uploading...<br>YOU WILL GET A UNIQUE URL TO SHARE.</div><div class="progress"><div class="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="45" aria-valuemin="0" aria-valuemax="100" style="width: 100%"></div></div></div>');
				setTimeout(function() {
							window.location = "http://slite.us/A1";
					}, 3000);
		});
		
		$('#createPresentation').click(function(){
				window.location = "http://slite.us/editor";
		});

		if(navigator.userAgent.match(/(iPhone|iPad)/i)) {
				$('.uploadfile').css('display', 'none');
				$('.b-list-presentation').css('display', 'block');
		};
});