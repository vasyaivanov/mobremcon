/*var webrtc = new Object();
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

});*/

var webrtc = function(params) {
  this.params = params;
  this.appendElement = function(data) {
    var self = {};
    self.connection = this.params.connection;
    self.data = data;
    self.data.element.controls = false;
    $("#" + self.data.append).append(self.data.element);
    if(typeof self.data.buttons != "undefined") {
      var start = 0;
      for(var key in self.data.buttons){
        if(self.data.buttons[key] == 1) {
          var butName = key + '_' + self.data.element.id;
          $("#" + self.data.append).append('<div class="'+ key +'But" id="' + butName  + '" type="'+key+'" muted="0" clientId="'+self.data.element.id+'"></div>');
          $("#" + butName).css("left",  start + "px");
          start = start + $("#" + butName).width();
          document.getElementById(butName).addEventListener("click", this.switch, false);
        }
      }
    }
  }

  this.switch = function() {
    if($(this).attr('muted') == 0) {
      var type = {
        audio: {audio: true},
        video: {video: true}
      };
      $(this).attr('muted',1);
      $(this).toggleClass($(this).attr('type') + "But");
      $(this).toggleClass($(this).attr('type') + "MuteBut");
      params.connection.streamEvents[$(this).attr('clientId')].stream.mute($(this).attr('type'));
    }
    else {
      var type = {
        audio: {audio: true},
        video: {video: true}
      };
      $(this).attr('muted',0);
      $(this).toggleClass($(this).attr('type') + "But");
      $(this).toggleClass($(this).attr('type') + "MuteBut");
      $(this).prop("volume", 0.1);
      params.connection.streamEvents[$(this).attr('clientId')].stream.unmute($(this).attr('type'));
    }
  }

  /*$(document).on('click', '.muteButton', function() {
    var self = this;
    console.log(params)
  });*/

}
