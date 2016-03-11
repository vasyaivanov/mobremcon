window.getExternalIceServers = false;

var webrtcScalable = function(params) {

  var connection = new RTCMultiConnection();

  connection.enableScalableBroadcast = true;
  connection.maxRelayLimitPerUser = 1;
  connection.autoCloseEntireSession = true;
  connection.socketURL = '/';

  connection.connectSocket(function(socket) {
      socket.on('logs', function(log) {
          document.querySelector('h1').innerHTML = log.replace(/</g, '----').replace(/>/g, '___').replace(/----/g, '(<span style="color:red;">').replace(/___/g, '</span>)');
      });

      socket.on('join-broadcaster', function(hintsToJoinBroadcast) {
          console.log('join-broadcaster', hintsToJoinBroadcast);

          connection.session = hintsToJoinBroadcast.typeOfStreams;
          connection.sdpConstraints.mandatory = {
              OfferToReceiveVideo: !!connection.session.video,
              OfferToReceiveAudio: !!connection.session.audio
          };
          connection.join(hintsToJoinBroadcast.userid);
      });

      socket.on('rejoin-broadcast', function(broadcastId) {
          console.log('rejoin-broadcast', broadcastId);

          connection.attachStreams = [];
          socket.emit('check-broadcast-presence', broadcastId, function(isBroadcastExists) {
              if(!isBroadcastExists) {
                  // the first person (i.e. real-broadcaster) MUST set his user-id
                  connection.userid = broadcastId;
              }

              socket.emit('join-broadcast', {
                  broadcastId: broadcastId,
                  userid: connection.userid,
                  typeOfStreams: connection.session
              });
          });
      });

      socket.on('broadcast-stopped', function(broadcastId) {
          // alert('Broadcast has been stopped.');
          // location.reload();
          console.error('broadcast-stopped', broadcastId);
          //alert('This broadcast has been stopped.');
      });

      // this event is emitted when a broadcast is absent.
      socket.on('start-broadcasting', function(typeOfStreams) {
          console.log('start-broadcasting', typeOfStreams);

          // host i.e. sender should always use this!
          connection.sdpConstraints.mandatory = {
              OfferToReceiveVideo: false,
              OfferToReceiveAudio: false
          };
          connection.session = typeOfStreams;

          // "open" method here will capture media-stream
          // we can skip this function always; it is totally optional here.
          // we can use "connection.getUserMediaHandler" instead
          connection.open(connection.userid);
      });
  });

  var videoPreview = document.getElementById(params.div);

  connection.onstream = function(event) {
      if(connection.isInitiator && event.type !== 'local') {
          return;
      }

      if(event.mediaElement) {
          event.mediaElement.pause();
          delete event.mediaElement;
      }

      connection.isUpperUserLeft = false;
      videoPreview.src = URL.createObjectURL(event.stream);
      videoPreview.play();

      videoPreview.userid = event.userid;

      if(event.type === 'local') {
          videoPreview.muted = true;
      }

      if (connection.isInitiator == false && event.type === 'remote') {
          // he is merely relaying the media
          connection.dontCaptureUserMedia = true;
          connection.attachStreams = [event.stream];
          connection.sdpConstraints.mandatory = {
              OfferToReceiveAudio: false,
              OfferToReceiveVideo: false
          };

          var socket = connection.getSocket();
          socket.emit('can-relay-broadcast');

          if(connection.DetectRTC.browser.name === 'Chrome') {
              connection.getAllParticipants().forEach(function(p) {
                  if(p + '' != event.userid + '') {
                      var peer = connection.peers[p].peer;
                      peer.getLocalStreams().forEach(function(localStream) {
                          peer.removeStream(localStream);
                      });
                      peer.addStream(event.stream);
                      connection.dontAttachStream = true;
                      connection.renegotiate(p);
                      connection.dontAttachStream = false;
                  }
              });
          }

          if(connection.DetectRTC.browser.name === 'Firefox') {
              // Firefox is NOT supporting removeStream method
              // that's why using alternative hack.
              // NOTE: Firefox seems unable to replace-tracks of the remote-media-stream
              // need to ask all deeper nodes to rejoin
              connection.getAllParticipants().forEach(function(p) {
                  if(p + '' != event.userid + '') {
                      connection.replaceTrack(event.stream, p);
                  }
              });
          }

          if(connection.DetectRTC.browser.name === 'Chrome') {
              //repeatedlyRecordStream(event.stream);
          }
      }
  };

  // Start session
  this.startWebrtcSession = function() {
      var broadcastId = params.roomId;

      connection.session = {
          audio: true,
          video: true,
          oneway: true
      };

      var socket = connection.getSocket();

      socket.emit('start-webrtc-session', broadcastId, function(res){
        console.log("Return-code: "+res.code)
      });

      socket.emit('check-broadcast-presence', broadcastId, function(isBroadcastExists) {
          if(!isBroadcastExists) {
              connection.userid = broadcastId;
          }

          socket.emit('join-broadcast', {
              broadcastId: broadcastId,
              userid: connection.userid,
              typeOfStreams: connection.session
          });
      });
  };

  connection.onstreamended = function() {};

  connection.onleave = function(event) {
      if(event.userid !== videoPreview.userid) return;

      var socket = connection.getSocket();
      socket.emit('can-not-relay-broadcast');

      connection.isUpperUserLeft = true;

      if(allRecordedBlobs.length) {
          // playing lats recorded blob
          var lastBlob = allRecordedBlobs[allRecordedBlobs.length - 1];
          videoPreview.src = URL.createObjectURL(lastBlob);
          videoPreview.play();
          allRecordedBlobs = [];
      }
      else if(connection.currentRecorder) {
          var recorder = connection.currentRecorder;
          connection.currentRecorder = null;
          recorder.stopRecording(function() {
              if(!connection.isUpperUserLeft) return;

              videoPreview.src = URL.createObjectURL(recorder.blob);
              videoPreview.play();
          });
      }

      if(connection.currentRecorder) {
          connection.currentRecorder.stopRecording();
          connection.currentRecorder = null;
      }
  };

  var allRecordedBlobs = [];

  function repeatedlyRecordStream(stream) {
      connection.currentRecorder = RecordRTC(stream, {
          type: 'video'
      });

      connection.currentRecorder.startRecording();

      setTimeout(function() {
          if(connection.isUpperUserLeft || !connection.currentRecorder) {
              return;
          }

          connection.currentRecorder.stopRecording(function() {
              allRecordedBlobs.push(connection.currentRecorder.blob);

              if(connection.isUpperUserLeft) {
                  return;
              }

              connection.currentRecorder = null;
              repeatedlyRecordStream(stream);
          });
      }, 30 * 1000); // 30-seconds
  };

}
