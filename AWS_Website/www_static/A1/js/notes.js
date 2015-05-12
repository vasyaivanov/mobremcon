 $( document ).ready(function() {

var noteSaveTimeout = 0;

// Initialize
socket.emit('notes-server', {slideId: document.location.pathname, init: 1});

var currSlide = document.location.pathname.replace(/[^a-zA-Z0-9]/g,"");

socket.on('notes-client', function (data) {
	if(currSlide == data.slideId) {
		$(".paper").html(data.noteText);
	}
});

$( ".paper" ).keypress(function() {
	clearTimeout(noteSaveTimeout);
	noteSaveTimeout = setTimeout(saveNoteData,3000);
});

var saveNoteData = function () {
	socket.emit('notes-server', {slideId: document.location.pathname, noteText: $( ".paper" ).html()});
}

});