/* HTML5 magic
- GeoLocation
- WebSpeech
*/

//WebSpeech API
var final_transcript = '';
var recognizing = false;
var last10messages = []; //to be populated later

if (!('webkitSpeechRecognition' in window)) {
  console.log("webkitSpeechRecognition is not available");
} else {
  var recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onstart = function() {
    recognizing = true;
  };

  recognition.onresult = function(event) {
    var interim_transcript = '';
    for (var i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        final_transcript += event.results[i][0].transcript;
        $('#msg').addClass("final");
        $('#msg').removeClass("interim");
      } else {
        interim_transcript += event.results[i][0].transcript;
        $("#msg").val(interim_transcript);
        $('#msg').addClass("interim");
        $('#msg').removeClass("final");
      }
    }
    $("#msg").val(final_transcript);
    };
  }

  function startButton(event) {
    if (recognizing) {
      recognition.stop();
      recognizing = false;
      $("#start_button").prop("value", "Record");
      return;
    }
    final_transcript = '';
    recognition.lang = "en-GB"
    recognition.start();
    $("#start_button").prop("value", "Recording ... Click to stop.");
    $("#msg").val();
  }
//end of WebSpeech

/*
Functions
*/
function toggleNameForm() {
   $("#login-screen").toggle();
}

function toggleChatWindow() {
  $("#main-chat-screen").toggle();
}

function getUrlParam(sParam)
{
  var sPageURL = window.location.search.substring(1); // get query string without ?
  var sURLVariables = sPageURL.split('&');
  for (var i = 0; i < sURLVariables.length; i++)
  {
    var sParameterName = sURLVariables[i].split('=');
    if (sParameterName[0] == sParam)
    {
      return sParameterName[1];
    }
  }
}

$( window ).load(function() {
  //setup "global" variables first
  var chatSocket;
  if(typeof parent.socket != "undefined") {
    chatSocket = parent.socket
  }
  else {
    chatSocket = io.connect(document.location.hostname + ':' + location.port);
  }

  //var chatSocket = io.connect(document.location.hostname + ':' + location.port);
  var myRoomID = null;

  $("form").submit(function(event) {
    event.preventDefault();
  });

$('#msg').keypress(function(event){

var keycode = (event.keyCode ? event.keyCode : event.which);
  if(keycode == '13'){
    $("#conversation").animate({
      scrollTop: $("#conversation")[0].scrollHeight
    });
  }
});

  $("#main-chat-screen").hide();
  $("#errors").hide();
  //$("#name").focus();
  //$("#join").attr('disabled', 'disabled');

  if ($("#name").val() === "") {
    //$("#join").attr('disabled', 'disabled');
  }

function submitLoginForm(userName) {
    var name = userName;
    if(!userName) {
      name = $("#name").val();
    }

    var device = "desktop";
    if (navigator.userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile/i)) {
      device = "mobile";
    }
    if (name === "" || name.length < 2) {
      $("#errors").empty();
      $("#errors").append("Please enter a name");
      $("#errors").show();
    } else {
      toggleNameForm();
      toggleChatWindow();
      $("#msg").focus();
      chatSocket.emit("joinserver", name, device, function(data) {
        var roomName = getUrlParam("presentation");
        chatSocket.emit("check", roomName, function(data) {
          roomExists = data.result;
          if (!roomExists)
            chatSocket.emit("createRoom", roomName);
          else
            chatSocket.emit("joinRoom", roomName);
        });
      });
    }
  }

  // login user right away
  submitLoginForm((new Date().getTime()).toString(32));

  //enter screen
  $("#nameForm").submit(submitLoginForm);

  $("#name").keypress(function(e){
    var name = $("#name").val();
    if(name.length < 2) {
      $("#join").attr('disabled', 'disabled');
    } else {
      $("#errors").empty();
      $("#errors").hide();
      $("#join").removeAttr('disabled');
    }
  });

  //main chat screen
  $("#chatForm").submit(function() {
    var msg = $("#msg").val();
    if (msg !== "") {
      chatSocket.emit("send", msg);
      $("#msg").val("");
    }
  });

  //'is typing' message
  var typing = false;
  var timeout = undefined;

  function timeoutFunction() {
    typing = false;
    chatSocket.emit("typing", false);
  }

  $("#msg").keypress(function(e){
    if (e.which !== 13) {
      if (typing === false && myRoomID !== null && $("#msg").is(":focus")) {
        typing = true;
        //chatSocket.emit("typing", true);
      } else {
        clearTimeout(timeout);
        timeout = setTimeout(timeoutFunction, 5000);
      }
    }
  });

  chatSocket.on("isTyping", function(data) {
    if (data.isTyping) {
      if ($("#"+data.person+"").length === 0) {
        $("#updates").append("<li id='"+ data.person +"'><span class='text-muted'><small><i class='fa fa-keyboard-o'></i> " + data.person + " is typing.</small></li>");
        timeout = setTimeout(timeoutFunction, 5000);
      }
    } else {
      $("#"+data.person+"").remove();
    }
  });


/*
  $("#msg").keypress(function(){
    if ($("#msg").is(":focus")) {
      if (myRoomID !== null) {
        chatSocket.emit("isTyping");
      }
    } else {
      $("#keyboard").remove();
    }
  });

  chatSocket.on("isTyping", function(data) {
    if (data.typing) {
      if ($("#keyboard").length === 0)
        $("#updates").append("<li id='keyboard'><span class='text-muted'><i class='fa fa-keyboard-o'></i>" + data.person + " is typing.</li>");
    } else {
      chatSocket.emit("clearMessage");
      $("#keyboard").remove();
    }
    console.log(data);
  });
*/

  $("#showCreateRoom").click(function() {
    $("#createRoomForm").toggle();
  });

  $("#createRoomBtn").click(function() {
    var roomExists = false;
    var roomName = $("#createRoomName").val();
    chatSocket.emit("check", roomName, function(data) {
      roomExists = data.result;
       if (roomExists) {
          $("#errors").empty();
          $("#errors").show();
          $("#errors").append("Room <i>" + roomName + "</i> already exists");
        } else {
        if (roomName.length > 0) { //also check for roomname
          chatSocket.emit("createRoom", roomName);
          $("#errors").empty();
          $("#errors").hide();
          }
        }
    });
  });

  $("#rooms").on('click', '.joinRoomBtn', function() {
    var roomName = $(this).siblings("span").text();
    var roomID = $(this).attr("id");
    chatSocket.emit("joinRoom", roomID);
  });

  $("#rooms").on('click', '.removeRoomBtn', function() {
    var roomName = $(this).siblings("span").text();
    var roomID = $(this).attr("id");
    chatSocket.emit("removeRoom", roomID);
    $("#createRoom").show();
  });

  $("#leave").click(function() {
    var roomID = myRoomID;
    chatSocket.emit("leaveRoom", roomID);
    $("#createRoom").show();
  });

  $("#people").on('click', '.whisper', function() {
    var name = $(this).siblings("span").text();
    $("#msg").val("w:"+name+":");
    $("#msg").focus();
  });
/*
  $("#whisper").change(function() {
    var peopleOnline = [];
    if ($("#whisper").prop('checked')) {
      console.log("checked, going to get the peeps");
      //peopleOnline = ["Tamas", "Steve", "George"];
      chatSocket.emit("getOnlinePeople", function(data) {
        $.each(data.people, function(clientid, obj) {
          console.log(obj.name);
          peopleOnline.push(obj.name);
        });
        console.log("adding typeahead")
        $("#msg").typeahead({
            local: peopleOnline
          }).each(function() {
            if ($(this).hasClass('input-lg'))
              $(this).prev('.tt-hint').addClass('hint-lg');
        });
      });

      console.log(peopleOnline);
    } else {
      console.log('remove typeahead');
      $('#msg').typeahead('destroy');
    }
  });
  // $( "#whisper" ).change(function() {
  //   var peopleOnline = [];
  //   console.log($("#whisper").prop('checked'));
  //   if ($("#whisper").prop('checked')) {
  //     console.log("checked, going to get the peeps");
  //     peopleOnline = ["Tamas", "Steve", "George"];
  //     // chatSocket.emit("getOnlinePeople", function(data) {
  //     //   $.each(data.people, function(clientid, obj) {
  //     //     console.log(obj.name);
  //     //     peopleOnline.push(obj.name);
  //     //   });
  //     // });
  //     //console.log(peopleOnline);
  //   }
  //   $("#msg").typeahead({
  //         local: peopleOnline
  //       }).each(function() {
  //         if ($(this).hasClass('input-lg'))
  //           $(this).prev('.tt-hint').addClass('hint-lg');
  //       });
  // });
*/

//chatSocket-y stuff
chatSocket.on("exists", function(data) {
  $("#errors").empty();
  $("#errors").show();
  $("#errors").append(data.msg + " Try <strong>" + data.proposedName + "</strong>");
    toggleNameForm();
    toggleChatWindow();
});

chatSocket.on("joined", function() {
  $("#errors").hide();
});

chatSocket.on("history", function(data) {
  if (data.length !== 0) {
    $.each(data, function(data, msg) {
      $("#msgs").append("<li><span class='text-warning'>" + msg.name + ': ' + msg.msg + "</span></li>");
    });
  } else {
    $("#msgs").append("<li><strong><span class='text-warning'>No past messages in this room.</li>");
  }

$( "#conversation" ).scrollTop($("#conversation")[0].scrollHeight);

});

  chatSocket.on("update", function(msg) {
    $("#msgs").append("<li>" + msg + "</li>");
  });

  chatSocket.on("update-people", function(data){
    var peopleOnline = 0;
    $.each(data.people, function(a, obj) {
      if (obj.roomName === getUrlParam("presentation")) peopleOnline++; // count people in this room
    });
    $("#people").empty();
    //$('#people').append("<li class=\"list-group-item active\">People online <span class=\"badge\">"+peopleOnline+"</span></li>");
    $.each(data.people, function(a, obj) {
      if (!("country" in obj)) {
        html = "";
      } else {
        html = "<img class=\"flag flag-"+obj.country+"\"/>";
      }
      if (obj.roomName === getUrlParam("presentation"))
      {
        if (obj.socketId === "/#" + chatSocket.id) {
          s = "<li class=\"list-group-item\"><span class='text-danger'>"
        } else {
          s = "<li class=\"list-group-item\"><span class='text-success'>"
        }
        $('#people').append(s + obj.name + "</span> <i class=\"fa fa-"+obj.device+"\"></i> " + html /* + " <a href=\"#\" class=\"whisper btn btn-xs\">whisper</a></li>"*/);
      }
    });

    /*var whisper = $("#whisper").prop('checked');
    if (whisper) {
      $("#msg").typeahead({
          local: peopleOnline
      }).each(function() {
         if ($(this).hasClass('input-lg'))
              $(this).prev('.tt-hint').addClass('hint-lg');
      });
    }*/
  });

  chatSocket.on("chat", function(person, msg) {
    if ( person.socketId == "/#" + chatSocket.id) {
      s = "<li><strong><span class='text-danger'>"
    } else {
      s = "<li><strong><span class='text-success'>"
    }
    $("#msgs").append(s + person.name + "</span></strong>: " + msg + "</li>");
    //clear typing field
     $("#"+person.name+"").remove();
     clearTimeout(timeout);
     timeout = setTimeout(timeoutFunction, 0);
   $( "#conversation" ).scrollTop($("#conversation")[0].scrollHeight);
  });

  chatSocket.on("whisper", function(person, msg) {
    if (person.name === "You") {
      s = "whisper"
    } else {
      s = "whispers"
    }
    $("#msgs").append("<li><strong><span class='text-muted'>" + person.name + "</span></strong> "+s+": " + msg + "</li>");
  });

  chatSocket.on("roomList", function(data) {
    $("#rooms").text("");
    $("#rooms").append("<li class=\"list-group-item active\">List of rooms <span class=\"badge\">"+data.count+"</span></li>");
     if (!jQuery.isEmptyObject(data.rooms)) {
      $.each(data.rooms, function(id, room) {
        var html = "<button id="+id+" class='joinRoomBtn btn btn-default btn-xs' >Join</button>" + " " + "<button id="+id+" class='removeRoomBtn btn btn-default btn-xs'>Remove</button>";
        $('#rooms').append("<li id="+id+" class=\"list-group-item\"><span>" + room.name + "</span> " + html + "</li>");
      });
    } else {
      $("#rooms").append("<li class=\"list-group-item\">There are no rooms yet.</li>");
    }
  });

  chatSocket.on("sendRoomID", function(data) {
    myRoomID = data.id;
  });

  chatSocket.on("reconnect", function(data) {
  setTimeout(function() {
    toggleChatWindow();
    toggleNameForm();
    $("#msgs").empty();
    $("#msg").removeAttr('disabled');
    $("#send").removeAttr('disabled');
    $("#nameForm").submit();
  }, 60000);
  });

  chatSocket.on("disconnect", function(){
    $("#msgs").append("<li><strong><span class='text-warning'>Our chat server is not available. Reconnecting...</span></strong></li>");

  $( "#conversation" ).scrollTop($("#conversation")[0].scrollHeight);
    $("#msg").attr("disabled", "true");
    $("#send").attr("disabled", "true");
  });

});
