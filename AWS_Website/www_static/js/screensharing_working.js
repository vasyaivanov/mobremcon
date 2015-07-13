// Muaz Khan     - https://github.com/muaz-khan
// MIT License   - https://www.webrtc-experiment.com/licence/
// Documentation - https://github.com/muaz-khan/WebRTC-Experiment/tree/master/Pluginfree-Screen-Sharing

var isWebRTCExperimentsDomain = document.domain.indexOf('webrtc-experiment.com') != -1;

var configScreensharing = {
	openSocket: function(configScreensharing) {
		var channel = configScreensharing.channel || 'screen-capturing-' + location.href.replace( /\/|:|#|%|\.|\[|\]/g , '');
		var socket = new Firebase('https://webrtc.firebaseIO.com/' + channel);
		socket.channel = channel;
		socket.on("child_added", function(data) {
			configScreensharing.onmessage && configScreensharing.onmessage(data.val());
		});
		socket.send = function(data) {
			this.push(data);
		};
		configScreensharing.onopen && setTimeout(configScreensharing.onopen, 1);
		socket.onDisconnect().remove();
		return socket;
	},
	onRemoteStream: function(media) {
		var video = media.video;
		video.setAttribute('controls', true);
		videosContainer.insertBefore(video, videosContainer.firstChild);
		video.play();
		rotateVideo(video);
	},
	onRoomFound: function(room) {
		//alert("JD: room found");
		$("#rooms-list-screensharing").css("display","none");
		$("#shareYourScreen").css("display","none");
		conferenceUI.joinRoom({
				roomToken: room.roomToken,
				joinUser: room.broadcaster
		});
		
		
		if(location.hash.replace('#', '').length) {
			// private rooms should auto be joined.
			conferenceUI.joinRoom({
				roomToken: room.roomToken,
				joinUser: room.broadcaster
			});
			return;
		}
		
		var alreadyExist = document.getElementById(room.broadcaster);
		if (alreadyExist) return;

		if (typeof roomsList === 'undefined') roomsList = document.body;

		var tr = document.createElement('tr');
		tr.setAttribute('id', room.broadcaster);
		tr.innerHTML = '<td>' + room.roomName + '</td>' +
			'<td><button class="join" id="' + room.roomToken + '">Open Screen</button></td>';
		roomsList.insertBefore(tr, roomsList.firstChild);

		var button = tr.querySelector('.join');
		button.onclick = function() {
			var button = this;
			button.disabled = true;
			conferenceUI.joinRoom({
				roomToken: button.id,
				joinUser: button.parentNode.parentNode.id
			});
		};
		//alert("JD: about to click room-token = " + room.roomToken);
		//$("#room-name").trigger("click");
	},
	onNewParticipant: function(numberOfParticipants) {
		document.title = numberOfParticipants + ' users are viewing your screen!';
		var element = document.getElementById('number-of-participants');
		if (element) {
			element.innerHTML = numberOfParticipants + ' users are viewing your screen!';
		}
	},
	oniceconnectionstatechange: function(state) {
		if(state == 'failed') {
			console.log('Failed to bypass Firewall rules. It seems that target user did not receive your screen. Please ask him reload the page and try again.');
		}
		
		if(state == 'connected') {
			console.log('A user successfully received your screen.');
		}
	}
};

function captureUserMedia(callback, extensionAvailable) {
	console.log('captureUserMedia chromeMediaSource', DetectRTC.screen.chromeMediaSource);
	
	var screen_constraints = {
		mandatory: {
			chromeMediaSource: DetectRTC.screen.chromeMediaSource,
			maxWidth: screen.width > 1920 ? screen.width : 1920,
			maxHeight: screen.height > 1080 ? screen.height : 1080
			// minAspectRatio: 1.77
		},
		optional: [{ // non-official Google-only optional constraints
			googTemporalLayeredScreencast: true
		}, {
			googLeakyBucket: true
		}]
	};

	// try to check if extension is installed.
	if(isChrome && isWebRTCExperimentsDomain && typeof extensionAvailable == 'undefined' && DetectRTC.screen.chromeMediaSource != 'desktop') {
		DetectRTC.screen.isChromeExtensionAvailable(function(available) {
			captureUserMedia(callback, available);
		});
		return;
	}
	
	if(isChrome && isWebRTCExperimentsDomain && DetectRTC.screen.chromeMediaSource == 'desktop' && !DetectRTC.screen.sourceId) {
		DetectRTC.screen.getSourceId(function(error) {
			if(error && error == 'PermissionDeniedError') {
				alert('PermissionDeniedError: User denied to share content of his screen.');
			}
			
			captureUserMedia(callback);
		});
		return;
	}
	
	// for non-www.webrtc-experiment.com domains
	if(isChrome && !isWebRTCExperimentsDomain && !DetectRTC.screen.sourceId) {
		window.addEventListener('message', function (event) {
			if (event.data && event.data.chromeMediaSourceId) {
				var sourceId = event.data.chromeMediaSourceId;

				DetectRTC.screen.sourceId = sourceId;
				DetectRTC.screen.chromeMediaSource = 'desktop';

				if (sourceId == 'PermissionDeniedError') {
					return alert('User denied to share content of his screen.');
				}

				captureUserMedia(callback, true);
			}

			if (event.data && event.data.chromeExtensionStatus) {
				warn('Screen capturing extension status is:', event.data.chromeExtensionStatus);
				DetectRTC.screen.chromeMediaSource = 'screen';
				captureUserMedia(callback, true);
			}
		});
		screenFrame.postMessage();
		return;
	}
	
	if(isChrome && DetectRTC.screen.chromeMediaSource == 'desktop') {
		screen_constraints.mandatory.chromeMediaSourceId = DetectRTC.screen.sourceId;
	}
	
	var constraints = {
		audio: false,
		video: screen_constraints
	};
	
	if(!!navigator.mozGetUserMedia) {
		console.warn(Firefox_Screen_Capturing_Warning);
		constraints.video = {
			mozMediaSource: 'window',
			mediaSource: 'window',
			maxWidth: 1920,
			maxHeight: 1080,
			minAspectRatio: 1.77
		};
	}
	
	console.log( JSON.stringify( constraints , null, '\t') );
	
	var video = document.createElement('video');
	video.setAttribute('autoplay', true);
	video.setAttribute('controls', true);
	videosContainer.insertBefore(video, videosContainer.firstChild);
	
	getUserMedia({
		video: video,
		constraints: constraints,
		onsuccess: function(stream) {
			configScreensharing.attachStream = stream;
			callback && callback();

			video.setAttribute('muted', true);
			rotateVideo(video);
		},
		onerror: function() {
			if (isChrome && location.protocol === 'http:') {
				console.log('Please test this WebRTC experiment on HTTPS.');
			} else if(isChrome) {
				console.log('Screen capturing is either denied or not supported. Please install chrome extension for screen capturing or run chrome with command-line flag: --enable-usermedia-screen-capturing');
			}
			else if(!!navigator.mozGetUserMedia) {
				console.log(Firefox_Screen_Capturing_Warning);
			}
		}
	});
}

/* on page load: get public rooms */
var conferenceUI = conferenceScreensharing(configScreensharing);

/* UI specific */
var videosContainer = document.getElementById("videos-container-screensharing") || document.body;
var roomsList = document.getElementById('rooms-list-screensharing-screensharing');

document.getElementById('share-screen-screensharing').onclick = function() {
	var roomName = document.getElementById('room-name') || { };
	roomName.disabled = true;
	captureUserMedia(function() {
		conferenceUI.createRoom({
			roomName: (roomName.value || 'Anonymous') + ' shared his screen with you'
		});
	});
	this.disabled = true;
};

function rotateVideo(video) {
	video.style[navigator.mozGetUserMedia ? 'transform' : '-webkit-transform'] = 'rotate(0deg)';
	setTimeout(function() {
		video.style[navigator.mozGetUserMedia ? 'transform' : '-webkit-transform'] = 'rotate(360deg)';
	}, 1000);
}

(function() {
	var _channelHash = "asdf";
	var uniqueToken = document.getElementById('unique-token-screensharing');
	if (uniqueToken)
		if (location.hash.length > 2) uniqueToken.parentNode.parentNode.parentNode.innerHTML = '<h2 style="text-align:center;"><a href="' + location.href + '" target="_blank">Share this link</a></h2>';
		else uniqueToken.innerHTML = uniqueToken.parentNode.parentNode.href = '#' + "webentations" + _channelHash;
})();

var Firefox_Screen_Capturing_Warning = 'Make sure that you are using Firefox Nightly and you enabled: media.getusermedia.screensharing.enabled flag from about:configScreensharing page. You also need to add your domain in "media.getusermedia.screensharing.allowed_domains" flag.';


var screenFrame, loadedScreenFrame;

function loadScreenFrame(skip) {
	if(loadedScreenFrame) return;
	if(!skip) return loadScreenFrame(true);

	loadedScreenFrame = true;

	var iframe = document.createElement('iframe');
	iframe.onload = function () {
		iframe.isLoaded = true;
		console.log('Screen Capturing frame is loaded.');
		
		document.getElementById('share-screen-screensharing').disabled = false;
		document.getElementById('room-name').disabled = false;
	};
	iframe.src = 'https://www.webrtc-experiment.com/getSourceId/';
	iframe.style.display = 'none';
	(document.body || document.documentElement).appendChild(iframe);

	screenFrame = {
		postMessage: function () {
			if (!iframe.isLoaded) {
				setTimeout(screenFrame.postMessage, 100);
				return;
			}
			console.log('Asking iframe for sourceId.');
			iframe.contentWindow.postMessage({
				captureSourceId: true
			}, '*');
		}
	};
};

if(!isWebRTCExperimentsDomain) {
	loadScreenFrame();
}
else {
	document.getElementById('share-screen-screensharing').disabled = false;
	document.getElementById('room-name').disabled = false;
}

// todo: need to check exact chrome browser because opera also uses chromium framework
var isChrome = !!navigator.webkitGetUserMedia;

// DetectRTC.js - https://github.com/muaz-khan/WebRTC-Experiment/tree/master/DetectRTC
// Below code is taken from RTCMultiConnection-v1.8.js (http://www.rtcmulticonnection.org/changes-log/#v1.8)
var DetectRTC = {};

(function () {
	
	var screenCallback;
	
	DetectRTC.screen = {
		chromeMediaSource: 'screen',
		getSourceId: function(callback) {
			if(!callback) throw '"callback" parameter is mandatory.';
			screenCallback = callback;
			window.postMessage('get-sourceId', '*');
		},
		isChromeExtensionAvailable: function(callback) {
			if(!callback) return;
			
			if(DetectRTC.screen.chromeMediaSource == 'desktop') return callback(true);
			
			// ask extension if it is available
			window.postMessage('are-you-there', '*');
			
			setTimeout(function() {
				if(DetectRTC.screen.chromeMediaSource == 'screen') {
					callback(false);
				}
				else callback(true);
			}, 2000);
		},
		onMessageCallback: function(data) {
			if (!(typeof data == 'string' || !!data.sourceId)) return;
			
			console.log('chrome message', data);
			
			// "cancel" button is clicked
			if(data == 'PermissionDeniedError') {
				DetectRTC.screen.chromeMediaSource = 'PermissionDeniedError';
				if(screenCallback) return screenCallback('PermissionDeniedError');
				else throw new Error('PermissionDeniedError');
			}
			
			// extension notified his presence
			if(data == 'rtcmulticonnection-extension-loaded') {
				if(document.getElementById('install-button')) {
					document.getElementById('install-button').parentNode.innerHTML = '<strong>Great!</strong> <a href="https://chrome.google.com/webstore/detail/screen-capturing/ajhifddimkapgcifgcodmmfdlknahffk" target="_blank">Google chrome extension</a> is installed.';
				}
				DetectRTC.screen.chromeMediaSource = 'desktop';
			}
			
			// extension shared temp sourceId
			if(data.sourceId) {
				DetectRTC.screen.sourceId = data.sourceId;
				if(screenCallback) screenCallback( DetectRTC.screen.sourceId );
			}
		},
		getChromeExtensionStatus: function (callback) {
			if (!!navigator.mozGetUserMedia) return callback('not-chrome');
			
			var extensionid = 'ajhifddimkapgcifgcodmmfdlknahffk';

			var image = document.createElement('img');
			image.src = 'chrome-extension://' + extensionid + '/icon.png';
			image.onload = function () {
				DetectRTC.screen.chromeMediaSource = 'screen';
				window.postMessage('are-you-there', '*');
				setTimeout(function () {
					if (!DetectRTC.screen.notInstalled) {
						callback('installed-enabled');
					}
				}, 2000);
			};
			image.onerror = function () {
				DetectRTC.screen.notInstalled = true;
				callback('not-installed');
			};
		}
	};
	
	// check if desktop-capture extension installed.
	if(window.postMessage && isChrome) {
		DetectRTC.screen.isChromeExtensionAvailable();
	}
})();

DetectRTC.screen.getChromeExtensionStatus(function(status) {
	if(status == 'installed-enabled') {
		if(document.getElementById('install-button')) {
			document.getElementById('install-button').parentNode.innerHTML = '<strong>Great!</strong> <a href="https://chrome.google.com/webstore/detail/screen-capturing/ajhifddimkapgcifgcodmmfdlknahffk" target="_blank">Google chrome extension</a> is installed.';
		}
		DetectRTC.screen.chromeMediaSource = 'desktop';
	}
});

window.addEventListener('message', function (event) {
	if (event.origin != window.location.origin) {
		return;
	}
	
	DetectRTC.screen.onMessageCallback(event.data);
});

console.log('current chromeMediaSource', DetectRTC.screen.chromeMediaSource);

