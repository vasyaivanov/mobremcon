var webrtc = new Object();
$( document ).ready(function() {
  webrtc.appendElement = function(data) {
    data.element.controls = false;
    $("#" + data.append).append(data.element);
    if(typeof data.buttons == "undefined") {
      data.buttons = {audio: 0, video: 0};
    }
    if(data.buttons.audio == 1) {
      $("#" + data.append).append("<div class=\"muteButton\" id=\""+ data.element.id  +"\" muted=\"0\"></div>");
    }
  }

  $(document).on('click', '.muteButton', function() {
    console.log($(this).attr('muted'));
    //connection.streamEvents['streamid'].stream;
  });

});
