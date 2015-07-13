
// Muaz Khan     - https://github.com/muaz-khan
// MIT License   - https://www.webrtc-experiment.com/licence/
// Documentation - https://github.com/muaz-khan/WebRTC-Experiment/tree/master/video-conferencing

var config = {
    openSocket: function (config) {
        //var channel = config.channel || location.href.replace(/\/|:|#|%|\.|\[|\]/g , '');
        var channel = currentHash;
        channel += _channelHash;
        var socket = new Firebase('https://webrtc.firebaseIO.com/' + channel);
        socket.channel = channel;
        socket.on("child_added", function (data) {
            config.onmessage && config.onmessage(data.val());
        });
        socket.send = function (data) {
            this.push(data);
        };
        config.onopen && setTimeout(config.onopen, 1);
        socket.onDisconnect().remove();
        return socket;
    },
    onRemoteStream: function (media) { // argument type: RemoteStream 
        var mediaElement = getMediaElement(media.video, {
            width: (videosContainer.clientWidth / 2) - 50,
            buttons: ['mute-audio', 'mute-video', 'full-screen', 'volume-slider']
        });
        mediaElement.id = media.streamid;
        videosContainer.insertBefore(mediaElement, videosContainer.firstChild);
    },
    onRemoteStreamEnded: function (stream, video) {
        if (video.parentNode && video.parentNode.parentNode && video.parentNode.parentNode.parentNode) {
            video.parentNode.parentNode.parentNode.removeChild(video.parentNode.parentNode);
        }
    },
    onRoomFound: function (room) {
        var alreadyExist = document.querySelector('button[data-broadcaster="' + room.broadcaster + '"]');
        if (alreadyExist) {
            return;
        }

        if (typeof roomsList === 'undefined') roomsList = document.body;

        var tr = document.createElement('tr');
        tr.innerHTML = '<td><strong>' + room.roomName + '</strong> shared a conferencing room with you!</td>' +
							'<td><button id="join-button" class="join">Join</button></td>';
        roomsList.insertBefore(tr, roomsList.firstChild);

        var joinRoomButton = tr.querySelector('.join');
        joinRoomButton.setAttribute('data-broadcaster', room.broadcaster);
        joinRoomButton.setAttribute('data-roomToken', room.roomToken);
        joinRoomButton.onclick = function () {
             this.disabled = true;

            var broadcaster = this.getAttribute('data-broadcaster');
            var roomToken = this.getAttribute('data-roomToken');
            captureUserMedia(function () {
                conferenceUI.joinRoom({
                    roomToken: roomToken,
                    joinUser: broadcaster
                });
            }, function () {
                joinRoomButton.disabled = false;
            });
        };
    },
    onRoomClosed: function (room) {
        var joinButton = document.querySelector('button[data-roomToken="' + room.roomToken + '"]');
        if (joinButton) {
            // joinButton.parentNode === <li>
            // joinButton.parentNode.parentNode === <td>
            // joinButton.parentNode.parentNode.parentNode === <tr>
            // joinButton.parentNode.parentNode.parentNode.parentNode === <table>
            joinButton.parentNode.parentNode.parentNode.parentNode.removeChild(joinButton.parentNode.parentNode.parentNode);
        }
    },
    // testing functions:
    onICE: function (rtcIceCandidate) { // argument type: RTCIceCandidate
        // rtcIceCandidate.candidate
        // rtcIceCandidate.sdpMLineIndex
        // etc.
    },
    onOfferSDP: function (offerSDP) { // argument type: RTCSessionDescription
        // offerSDP.type === 'offer'
        // offerSDP.sdp
        // to POST using XHR: JSON.stringify(offerSDP)
    },
    onAnswerSDP: function (answerSDP) { // argument type: RTCSessionDescription 
        // answerSDP.type === 'answer'
        // answerSDP.sdp
        // to POST using XHR: JSON.stringify(answerSDP)
    },
    onChannelMessage: function (event) { //argument type: RTCPeerConnection 
        // to get data: event.data
        // on chrome: JSON.parse(event.data)
    },
    onChannelOpened: function (channel) {
    // channel.send('hi there, data ports are ready to transfer data');
    }
};

function setupNewRoomButtonClickHandler() {
    btnSetupNewRoom.disabled = true;
    document.getElementById('conference-name').disabled = true;
    captureUserMedia(function () {
        conferenceUI.createRoom({
            roomName: (document.getElementById('conference-name') || {}).value || 'Anonymous'
        });
    }, function () {
        btnSetupNewRoom.disabled = document.getElementById('conference-name').disabled = false;
    });
}

function captureUserMedia(callback, failure_callback) {
    if (false && !isAPresenter) {
        callback && callback();
        return;
    }
    
    var video = document.createElement('video');
    getUserMedia({
        video: video,
        onsuccess: function (stream) {
            config.attachStream = stream;
            callback && callback();

            video.setAttribute('muted', true);

            var mediaElement = getMediaElement(video, {
                width: (videosContainer.clientWidth / 2) - 50,
                buttons: ['mute-audio', 'mute-video', 'full-screen', 'volume-slider'],
                onStopped: function () {
                    mediaElement.toggle('stop');
                },
            });
            mediaElement.toggle('mute-audio');
            videosContainer.insertBefore(mediaElement, videosContainer.firstChild);
        },
        onerror: function () {
            alert('unable to get access to your webcam');
            failure_callback && failure_callback();
        }
    });
}

var conferenceUI;
if(!isFile) conferenceUI = conference(config);

/* UI specific */
var videosContainer = document.getElementById('videos-container') || document.body;
var btnSetupNewRoom = document.getElementById('setup-new-room');
var roomsList = document.getElementById('rooms-list');

if (btnSetupNewRoom) btnSetupNewRoom.onclick = setupNewRoomButtonClickHandler;

function rotateVideo(video) {
    video.style[navigator.mozGetUserMedia ? 'transform' : '-webkit-transform'] = 'rotate(0deg)';
    setTimeout(function () {
        video.style[navigator.mozGetUserMedia ? 'transform' : '-webkit-transform'] = 'rotate(360deg)';
    }, 1000);
}

(function () {
    var uniqueToken = document.getElementById('unique-token');
    if (uniqueToken)
        //if (location.hash.length > 2)
        uniqueToken.parentNode.parentNode.parentNode.innerHTML = '<h2 style="text-align:center;"><a href="' + location.href + "#" + _channelHash + '" target="_blank">Share this link</a></h2>';
						//else uniqueToken.innerHTML = uniqueToken.parentNode.parentNode.href = '#' + (Math.random() * new Date().getTime()).toString(36).toUpperCase().replace( /\./g , '-');
})();

function scaleVideos() {
    var videos = document.querySelectorAll('video'),
        length = videos.length, video;

    var minus = 130;
    var windowHeight = $( window ).height();//700;
    var windowWidth = $( window ).width();//600;
    var windowAspectRatio = windowWidth / windowHeight;
    var videoAspectRatio = 4 / 3;
    var blockAspectRatio;
    var tempVideoWidth = 0;
    var maxVideoWidth = 0;

    for (var i = length; i > 0; i--) {
        blockAspectRatio = i * videoAspectRatio / Math.ceil(length / i);
        if (blockAspectRatio <= windowAspectRatio) {
            tempVideoWidth = videoAspectRatio * windowHeight / Math.ceil(length / i);
        } else {
            tempVideoWidth = windowWidth / i;
        }
        if (tempVideoWidth > maxVideoWidth)
            maxVideoWidth = tempVideoWidth;
    }
    for (var i = 0; i < length; i++) {
        video = videos[i];
        if (video)
            video.width = maxVideoWidth - minus;
    }
}