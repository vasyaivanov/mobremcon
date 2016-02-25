var conversationsClient;
var activeConversation;
var previewMedia;

// check for WebRTC
if (!navigator.webkitGetUserMedia && !navigator.mozGetUserMedia) {
  alert('WebRTC is not available in your browser.');
}

// generate an AccessToken in the Twilio Account Portal - https://www.twilio.com/user/account/video/testing-tools
// use our AccessToken to generate an AccessManager object
var accessManager = new Twilio.AccessManager(accessToken);

// create a Conversations Client and connect to Twilio
conversationsClient = new Twilio.Conversations.Client(accessManager);
conversationsClient.listen().then(
  clientConnected,
  function (error) {
    log('Could not connect to Twilio: ' + error.message);
  }
);

// successfully connected!
function clientConnected() {
  document.getElementById('invite-controls').style.display = 'block';
  log("Connected to Twilio. Listening for incoming Invites as '" + conversationsClient.identity + "'");

	if(presenter == 0) {
		$("#invite-to").val("presenter");
		runTwilio();
	}
	else {
    presenterView();
    videoPresenterSocket.emit("presenterVideoChat", {open: 1, hash: hash});
		$("#invite-to").hide();
		$("#button-invite").hide();
	}

  conversationsClient.on('invite', function (invite) {
    log('Incoming invite from: ' + invite.from);
    invite.accept().then(conversationStarted);
  });

   function runTwilio() {
    var inviteTo = document.getElementById('invite-to').value;

    if (activeConversation) {
      // add a participant
      activeConversation.invite(inviteTo);
    } else {
      // create a conversation
      var options = {};
      if (previewMedia) {
        options.localMedia = previewMedia;
      }
      conversationsClient.createConversation(inviteTo, options).then(
        conversationStarted,
        function (error) {
          log('Unable to create conversation');
		  if(error.name == 'CONVERSATION_CREATE_FAILED') {
			  log('Unable to create conversation....Reconnecting...' + new Date());
			  setTimeout(function(){ runTwilio() }, 5000);
		  }
          console.error('Unable to create conversation', error);
        }
      );
    }
  };
};

// conversation is live
function conversationStarted(conversation) {
  log('In an active Conversation');
  activeConversation = conversation;
  // draw local video, if not already previewing
  if (!previewMedia) {
    conversation.localMedia.attach('#local-media');
  }
  // when a participant joins, draw their video on screen
  conversation.on('participantConnected', function (participant) {
    log("Participant '" + participant.identity + "' connected");
    participant.media.attach('#remote-media');
  });
  // when a participant disconnects, note in log
  conversation.on('participantDisconnected', function (participant) {
    log("Participant '" + participant.identity + "' disconnected");
  });
  // when the conversation ends, stop capturing local video
  conversation.on('ended', function (conversation) {
    log("Connected to Twilio. Listening for incoming Invites as '" + conversationsClient.identity + "'");
    conversation.localMedia.stop();
    conversation.disconnect();
    activeConversation = null;
  });
};

//  local video preview
presenterView = function () {
  if (!previewMedia) {
    previewMedia = new Twilio.Conversations.LocalMedia();
    Twilio.Conversations.getUserMedia().then(
      function (mediaStream) {
        previewMedia.addStream(mediaStream);
        previewMedia.attach('#local-media');
      },
      function (error) {
        console.error('Unable to access local media', error);
        log('Unable to access Camera and Microphone');
      }
    );
  };
};

// activity log
function log(message) {
  document.getElementById('log-content').innerHTML = message;
};
