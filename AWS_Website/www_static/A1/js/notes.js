 $( document ).ready(function() {

var noteSaveTimeout = 0;

// Initialize
socket.emit('notes-server', {slideId: getCurrentHash(), init: 1});

socket.on('notes-client', function (data) {
	if(getCurrentHash() == data.slideId) {
		$(".paper").html(data.noteText);
	}
});

$( ".paper" ).keypress(function() {
	clearTimeout(noteSaveTimeout);
	noteSaveTimeout = setTimeout(saveNoteData,3000);
});

var saveNoteData = function () {
	socket.emit('notes-server', {slideId: getCurrentHash(), noteText: $( ".paper" ).html()});
}

});
