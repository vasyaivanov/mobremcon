 $( document ).ready(function() {

var noteSaveTimeout = 0;

// Initialize
$.ajax({
	type: "POST",
	dataType: "json",
	url: "../notes.html",
	data: {slideId: document.location.pathname, initialize: 1},
	success: function(data){
		if(data.code == 2 || data.code == 1) {
			if(data.note) {
				$(".paper").html(data.note);
			}
		}
	 }
 });


$( ".paper" ).keypress(function() {
	clearTimeout(noteSaveTimeout);
	noteSaveTimeout = setTimeout(saveNoteData,3000);

});

var saveNoteData = function () {
	$.ajax({
		type: "POST",
		dataType: "json",
		url: "../notes.html",
		data: {slideId: document.location.pathname, noteText: $( ".paper" ).html()},
		success: function(data){
			// Future functions. Possible data.code - 3 - saved, 10 - slide was not found
		 }
 	});
}

});