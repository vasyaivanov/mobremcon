// Start new webrtc session
var webrtc = function(params) {
  this.params = params;
  params.clients = {};
  this.connection = new RTCMultiConnection();

  if(typeof this.params.webrtc != "undefined") {
    for(var key in this.params.webrtc){
      this.connection[key] = this.params.webrtc[key];
    }
  }

  this.runWebrtc = function() {
    if(this.params.type == 1) {
      this.connection.open(this.params.roomId, false);
    }
    else {
      this.connection.join(this.params.roomId);
    }

    this.connection.onstream = function(event) {
        var addClient = new newClient(this);
        if(event.type == "local") {
          addClient.appendElement({element: event.mediaElement, append: params.localDiv, buttons: params.buttons.local});
          if(typeof params.socketRun != "undefined") {
            this.getSocket().emit(params.socketRun , {open: 1, hash: params.hashId});
          }
        }
        else {
          params.clients[event.userid] = event.streamid;
          console.log(params.clients);
          addClient.appendElement({element: event.mediaElement, append: params.remoteDiv, buttons: params.buttons.remote});
        }
    }

    this.connection.onmute = function(e) {};

    this.connection.onunmute = function(e) {};

    // On disconnect - remove old sessions and element on the page
    this.connection.onleave = this.connection.streamended = this.connection.onclose = function(event) {
      var userId = params.clients[event.userid];
      userId = userId.replace(/(\{|\})/gi,"");
      $('[id*="'+userId+'"]').remove();
    };

  }
}
// Append new client
var newClient = function(connection) {
  this.appendElement = function(data) {
    var self = {};
    self.data = data;
    self.data.element.controls = false;
    self.elId = 'el_' + self.data.element.id;
    self.elId = self.elId.replace(/(\{|\})/gi,"");
    $("#" + self.data.append).append("<div class=\"videoEl\" id=\""+ self.elId +"\"></div>");
    document.getElementById(self.elId).appendChild(self.data.element);
    if(typeof self.data.buttons != "undefined") {
      var start = 0;
      for(var key in self.data.buttons){
        if(self.data.buttons[key] == 1) {
          var butName = key + '_' + self.data.element.id;
          butName = butName.replace(/(\{|\})/gi,"");
          $("#" + self.elId).append('<div class="'+ key +'But" id="' + butName  + '" type="'+key+'" muted="0" clientId="'+self.data.element.id+'"></div>');
          $("#" + butName).css("left",  start + "px");
          start = start + $("#" + butName).width();
          document.getElementById(butName).addEventListener("click", this.switch, false);
        }
      }
    }
  }

  this.switch = function() {
    if($(this).attr('muted') == 0) {
      $(this).attr('muted',1);
      $(this).toggleClass($(this).attr('type') + "But");
      $(this).toggleClass($(this).attr('type') + "MuteBut");
      connection.streamEvents[$(this).attr('clientId')].stream.mute($(this).attr('type'));
    }
    else {
      $(this).attr('muted',0);
      $(this).toggleClass($(this).attr('type') + "But");
      $(this).toggleClass($(this).attr('type') + "MuteBut");
      connection.streamEvents[$(this).attr('clientId')].stream.unmute($(this).attr('type'));
      // Mute local stream inside browser (Chrome bug)
      if(connection.streamEvents[$(this).attr('clientId')].type == "local") {
        document.getElementById($(this).attr('clientId')).muted = true;
      }
    }
  }

}
