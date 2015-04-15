function isMobile() {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        return true;
    } else {
        return false;
    }
}

function showHideComments() {
    $("#comments").slideToggle();
    $("#comments").css('overflow', 'scroll');
    var label = $("#chatOpenCloseLabel");
    if (label.html() == "") {
        $("#chatOpenCloseLabel").html("Close");
    } else {
        $("#chatOpenCloseLabel").html("");
    }
    showHideMenu(true);
}

function showHidePersonalNotes() {
    $("#personalNotes").slideToggle();
    var label = $("#personalNotesOpenCloseLabel");
    if (label.html() == "") {
        $("#personalNotesOpenCloseLabel").html("Close");
    } else {
        $("#personalNotesOpenCloseLabel").html("");
    }
    showHideMenu(true);
}

var isVideoOn = false;
function showHideVideoChat() {
    if (!isVideoOn) {
        if ($("#join-button").length) {
            $("#join-button").trigger("click");
        } else {
            $("#setup-new-room").trigger("click");
        }
        isVideoOn = true;

        //reduce main window
        //$(".rsContainer").animate({"width":"80%"},300);
        $(".rsContainer").css("float", "right");
        $(".rsContainer").css({ "width": "80%", "clear": "both" });
        hideClickAllow();
    } else {
        //put main window back to full size
        //$(".rsContainer").animate({"width":"100%", "clear":"both"},300);
        $(".rsContainer").css({ "width": "100%", "clear": "both" });

        // remove the video window on closing the panel
        var videosContainer = document.getElementById('videos-container');
        if (videosContainer.firstChild) videosContainer.removeChild(videosContainer.firstChild);

        isVideoOn = false;
    }

    var label = $("#videoChatOpenCloseLabel");
    if (label.html() == "") {
        $("#videoChatOpenCloseLabel").html("Close");
    } else {
        $("#videoChatOpenCloseLabel").html("");
    }

    $("#videochat").slideToggle();
    /*
		$("#videochat").css('overflow-x','hidden');
		$("#videochat").css('overflow-y','scroll');
		*/

		showHideMenu(true);
}

var isMenuOn = false;
function showHideMenu(fromItemClick) {
    if (!isMenuOn && !fromItemClick) {
        $('.menuSubmenu').slideDown("slow");
        isMenuOn = true;
    } else {
        if (fromItemClick) {
            $('.menuSubmenu').slideUp("fast");
        } else {
            $('.menuSubmenu').slideUp("medium");
        }
        isMenuOn = false;
    }
}

var isInsertVideoSlideOverlayOn = false;
function showHideInsertVideoSlideOverlay() {
    if (!isInsertVideoSlideOverlayOn) {
        $('#insertVideoSlideOverlay').fadeIn(400);;
        isInsertVideoSlideOverlayOn = true;
    } else {
        $('#insertVideoSlideOverlay').fadeOut(400);
        isInsertVideoSlideOverlayOn = false;
    }
    showHideMenu(true);
}


var isHelpOverlayOn = false;
function showHideHelpOverlay() {
    if (!isHelpOverlayOn) {
        $('#helpOverlay').fadeIn(400);;
        isHelpOverlayOn = true;
    } else {
        $('#helpOverlay').fadeOut(400);
        isHelpOverlayOn = false;
    }
    showHideMenu(true);
}

function deleteAllCookies() {
    var cookies = document.cookie.split(";");

    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var eqPos = cookie.indexOf("=");
        var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
}

function getCookie(name) {
    function escape(s) { return s.replace(/([.*+?\^${}()|\[\]\/\\])/g, '\\$1'); }    ;
    var match = document.cookie.match(RegExp('(?:^|;\\s*)' + escape(name) + '=([^;]*)'));
    return match ? match[1] : null;
}

function needToShowExplanators() {
    var helpShownCookie = getCookie("isHelpAlreadyShown");
    return (helpShownCookie != "true");
}

var explanatorsTurnedOff = true;
function showHideExplanators() {
    if (isMobile()) {
        $('.startTemporaryPopup').fadeOut(0);
        explanatorsTurnedOff = true;
    }
    if (explanatorsTurnedOff) {
        $('.startTemporaryPopup').fadeOut(400);
        explanatorsTurnedOff = false;
    } else {
        document.cookie = "isHelpAlreadyShown=true;";
        $('.startTemporaryPopup').fadeIn(400);
        explanatorsTurnedOff = true;
    }
}

function hideClickAllow(delay) {
    $('#clickallow').delay(3000).fadeOut(600);
}

function showRemote() {
    var pathName = document.location.pathname;
    if (pathName) {
        pathName = pathName.replace('/', '');
    }
    var newUrl = "http://" + document.location.hostname + "/remote?presentation=" + pathName;
    window.open(newUrl, "popupWindow", "width=1050,height=700, scrollbars=no"); //,scrollbars=no
	showHideMenu(true);
}

function submitInsertVideoSlide() {
	var result;
	
	var val = $('#insertVideoSlideValue').val();
	if(val){
		if(val.match(/^[a-z0-9]+$/i)){
			result = val;
		}else{
			var video_id = val.split('v=')[1];
			var ampersandPosition = video_id.indexOf('&');
			if(ampersandPosition != -1) {
			  video_id = video_id.substring(0, ampersandPosition);
			}
			result =  video_id;
		}
		
		var slider = $(".royalSlider").data('royalSlider');
		var sendObject = {'youtubeVideoId': result, "currentSlide" : (slider.currSlideId+1)};
		alert(sendObject);
		socket.emit('insertVideoId', sendObject);
	}else{
		alert("Your youtube url or id is wrong. Please see example above");
	}
	
	showHideInsertVideoSlideOverlay();
}


$('#chatPanel').click(function () {
    showHideComments();
});
$('#closeChat').click(function () {
    showHideComments();
});

$('#personalNotesPanel').click(function () {
    showHidePersonalNotes();
});
$('#closePersonalNotes').click(function () {
    showHidePersonalNotes();
});
$('#closeInsertVideoSlideOverlay').click(function () {
    showHideInsertVideoSlideOverlay();
});
$('#closeHelpOverlay').click(function () {
    showHideHelpOverlay();
});
$('#videochatpanel').click(function () {
    showHideVideoChat();
});
$('#closevideo').click(function () {
    showHideVideoChat();
});
$('#submitInsertVideoSlide').click(function () {
    submitInsertVideoSlide();
});
$('#sliteWatermak').click(function () {
    showHideMenu();
});
$('#closeExplanator').click(function () {
    showHideExplanators();
});
if (needToShowExplanators()) {
    showHideExplanators();
}

// Muaz Khan     - https://github.com/muaz-khan
// MIT License   - https://www.webrtc-experiment.com/licence/
// Documentation - https://github.com/muaz-khan/WebRTC-Experiment/tree/master/video-conferencing

var _channelHash = "9WDXH6OH-6K73NMI";
var config = {
    openSocket: function (config) {
        var channel = config.channel || location.href.replace(/\/|:|#|%|\.|\[|\]/g , '');
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
    onRemoteStream: function (media) {
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
    var video = document.createElement('video');

    getUserMedia({
        video: video,
        onsuccess: function (stream) {
            config.attachStream = stream;
            callback && callback();

            video.setAttribute('muted', true);

            var mediaElement = getMediaElement(video, {
                width: (videosContainer.clientWidth / 2) - 50,
                buttons: ['mute-audio', 'mute-video', 'full-screen', 'volume-slider']
            });
            mediaElement.toggle('mute-audio');
            videosContainer.insertBefore(mediaElement, videosContainer.firstChild);
        },
        onerror: function () {
            alert('unable to get access to your webcam');
            callback && callback();
        }
    });
}

var conferenceUI = conference(config);

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
    var windowHeight = 700;
    var windowWidth = 600;
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

window.onresize = function () {
    scaleVideos();
    resizeCanvas();
};

jQuery(document).ready(function ($) {
    $('#video-gallery').royalSlider({
        arrowsNav: false,
        fadeinLoadedSlide: true,
        controlNavigationSpacing: 0,
        controlNavigation: 'none',

        thumbs: {
            autoCenter: false,
            fitInViewport: true,
            orientation: 'vertical',
            spacing: 0,
            paddingBottom: 0
        },
        keyboardNavEnabled: true,
        imageScaleMode: 'fill',
        imageAlignCenter: true,
        slidesSpacing: 0,
        loop: false,
        loopRewind: true,
        numImagesToPreload: 1,
        video: {
            autoHideArrows: true,
            autoHideControlNav: false,
            autoHideBlocks: true
        },
        autoScaleSlider: true,
        autoScaleSliderWidth: 200,
        autoScaleSliderHeight: 100,
        visibleNearby: {
            enabled: false,
            centerArea: 0.5,
            center: true,
            breakpoint: 650,
            breakpointCenterArea: 0.64,
            navigateByCenterClick: true
        }
    });
    var staticSlite = (slite === '/HASH_TEMPLATE/');
    if (staticSlite) {
        slite = '';
        number_of_slides = staticSlides;
    }
    for (var slide = 1; slide <= number_of_slides; ++slide) {
        var slide_html_path = slite + "img" + (slide - 1) + ".jpg" + "?ts=" + (new Date().getTime()); //slide url with added time stamp to stop caching
        var slider = $(".royalSlider").data('royalSlider');
        if (staticSlite) // we did not do any replacement!
        {
            slide_html_path = "PPT/SliteShow_PitchDeck.pptx";
            if (slide == 1) {
                slide_html_path += ".html/SliteShow_PitchDeck.html";
            } else {
                slide_html_path += ".html/img" + slide + ".html" + "?ts=" + (new Date().getTime()); //slide url with added time stamp to stop caching
            }
            var slide_html = "<div style='text-align:center' id=slide class='rsContent'>"
						   + "<iframe src='" + slide_html_path + "' width='100%' height='100%' seamless> </iframe>"
						   + "<div class='rsTmb'>"
					       + "<h5>SLIDE" + slide + "</h5>"
					       + "     <span>Slide " + slide + " here</span>"
					       + "</div> </div>";
            slider.appendSlide(slide_html);
        } else { // !staticSlite
            var slide_html = "<div style='text-align:center;overflow:scroll' id=slide class='rsContent'>"
						           + "<img src='" + slide_html_path + "' height='100%'>"
					               + "<div class='rsTmb'>"
					               + "<h5>SLIDE" + slide + "</h5>"
						           + "     <span>Slide " + slide + " here</span>"
						           + "</div> </div>";
            slider.appendSlide(slide_html);
        }
    }

    $("#video-gallery").css("height", "100%");
    $(".rsOverflow").css("height", "100%");
});

var socket = io.connect(document.location.hostname + ':1337');

socket.on('ccBroadcast', function (data) {
    //alert("JD: ccBroadcast text="+data.hello);
    $('#closedCaptioningPanel').hide();
    $('#closedCaptioningPanel').html(data.hello);
    $('#closedCaptioningPanel').show(400).delay(2000).fadeOut(400);
});

socket.on('news', function (data) {
    if ((document.location.pathname == "/" + data.slideID) || (document.location.pathname == "/" + data.slideID + "/")) {
        var button = data.hello - 1;

        console.log(button);

        var slider = $(".royalSlider").data('royalSlider');

        slider.goTo(data.slide);

        switch (button) {
            case -102: {
                slider.goTo(0);
                break;
            }
            case -1: {
                slider.toggleVideo();
                break;
            }
            case 100: {
                slider.next();
                clearCanvas();
                break;
            }
            case 101: {
                slider.prev();
                clearCanvas();
                break;
            }
            default: {
                slider.stopVideo();
                slider.goTo(button);
                slider.playVideo();
            }
        }

        socket.emit('my other event', { my: 'data' });
    }
});
