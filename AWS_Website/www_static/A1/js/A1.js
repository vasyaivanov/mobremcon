var socket;
var isFile = RegExp(/^file:.*/i).test(document.location.href);
if (!isFile) {
    socket = io.connect(document.location.hostname + ':' + location.port);
}
var currentHash = getCurrentHash();
var isAPresenter = isPresenter();

function isMobile() {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        return true;
    } else {
        return false;
    }
}

function share(url) {
	var h = 200;
	var w = 500;
	var left = (screen.width/2)-(w/2);
	 var top = (screen.height/2)-(h/2);
	window.open(url, 'shareFacebook', 'height=' + h + ', width=' + w + ', top='+top+', left='+left);
	showHideMenu(true);
}

function shareFacebook() {
	share("https://www.facebook.com/sharer/sharer.php?u=" + window.location.href);
}

function shareTwitter() {
	share("http://twitter.com/share");
}

function openContactUs() {
     var form = document.createElement("form");
     form.method = "GET";
     form.action = "https://www.facebook.com/slitepresentations";
     form.target = "_blank";
     document.body.appendChild(form);
     form.submit();
}

function showHidePersonalNotes() {
    $("#personalNotes").slideToggle();
    var label = $("#personalNotesOpenCloseLabel");
    if (label.html() == "") {
        $("#personalNotesOpenCloseLabel").html("Close");
    } else {
        $("#personalNotesOpenCloseLabel").html("");
    }
	$('#personalNotesArea').focus();
    showHideMenu(true);
}


function showPreviewsOnMainPage(){
	//http://jsfiddle.net/q4d9m/2/
}

var justHidden = false;
var navigationButtonsTimeout;
function showHideNavButtons(){
	if (!justHidden) {
		justHidden = false;
		$(".navButton").css('display','block');
		clearTimeout(navigationButtonsTimeout);
		navigationButtonsTimeout = setTimeout('$(".navButton").hide(400);', 6000);
	}
}

function toggleMainWindow() {
	if(isCommentsOpen || isVideoChatOn){
		//reduce main window
        $(".rsContainer").css("float", "right");
		$(".rsContainer").animate({ "width": "77%", "clear": "both" },300);
        //$(".rsContainer").css({ "width": "77%", "clear": "both" });
		$(".navButtonPrev").animate({"left":"25%"},300);
		$(".navButton").animate({"padding-top":"15%"},300);
	}

	if( (!isCommentsOpen && !isVideoChatOn) ){
		//put main window back to full size
        $(".rsContainer").animate({"width":"100%", "clear":"both"},300);
        //$(".rsContainer").css({ "width": "100%", "clear": "both" });
		$(".navButtonPrev").animate({"left":"0%"},300);
		$(".navButton").animate({"padding-top":"30%"},300);
	}
}

var isCommentsOpen = false;
function showHideComments() {
    $("#comments").slideToggle();
    $("#comments").css('overflow', 'scroll');
    var label = $("#chatOpenCloseLabel");
    if (label.html() == "") {
		isCommentsOpen = true;
        $("#chatOpenCloseLabel").html("Close");
    } else {
		isCommentsOpen = false;
        $("#chatOpenCloseLabel").html("");
    }
	toggleMainWindow();
    showHideMenu(true);
}

var isVideoChatOn = false;
function showHideVideoChat() {
    if (!isVideoChatOn) {
        if ($("#join-button").length) {
            $("#join-button").trigger("click");
        } else {
            $("#setup-new-room").trigger("click");
        }
        isVideoChatOn = true;
    } else {
        // remove the video window on closing the panel
        //var videosContainer = document.getElementById('videos-container');
        if (videosContainer.firstChild) videosContainer.removeChild(videosContainer.firstChild);

        isVideoChatOn = false;
    }

    if (isAPresenter) {
        socket.emit("presenterVideoChat", {open: isVideoChatOn, hash: currentHash});
    }

    var label = $("#videoChatOpenCloseLabel");
    if (label.html() == "") {
        $("#videoChatOpenCloseLabel").html("Close ");
    } else {
        $("#videoChatOpenCloseLabel").html("");
    }

    $("#videochat").slideToggle();
    /*
		$("#videochat").css('overflow-x','hidden');
		$("#videochat").css('overflow-y','scroll');
		*/

	toggleMainWindow();
	showHideMenu(true);
}

var isScreensharingOn = false;
function showHideScreensharing() {
    if (!isScreensharingOn) {
		if(isPresenter()){
			$('#share-screen-screensharing').trigger("click");
		}
        isScreensharingOn = true;
    } else {
        // remove screensharing window on closing the panel
		conferenceUIScreensharing.leave();
        var screensharingContainer = document.getElementById('videos-container-screensharing');
        if (screensharingContainer.firstChild){
			screensharingContainer.removeChild(screensharingContainer.firstChild);
		}

        isScreensharingOn = false;
    }

    if (isAPresenter) {
        socket.emit("presenterScreensharing", {open: isScreensharingOn, hash: currentHash});
    }

    var label = $("#screensharingOpenCloseLabel");
    if (label.html() == "") {
        $("#screensharingOpenCloseLabel").html("Close ");
    } else {
        $("#screensharingOpenCloseLabel").html("");
    }

    $("#screensharing").slideToggle();
    /*
		$("#screensharing").css('overflow-x','hidden');
		$("#screensharing").css('overflow-y','scroll');
		*/

	toggleMainWindow();
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
        $('#helpOverlay').fadeIn(400);
        isHelpOverlayOn = true;
    } else {
        $('#helpOverlay').fadeOut(400);
        isHelpOverlayOn = false;
    }
    showHideMenu(true);
}

var isRenamePresentationOverlayOn = false;
function showHideRenamePresentationOverlay() {
    if (!isRenamePresentationOverlayOn) {
        $('#renamePresentationOverlay').fadeIn(400);
        isRenamePresentationOverlayOn = true;
    } else {
        $('#renamePresentationOverlay').fadeOut(400);
        isRenamePresentationOverlayOn = false;
    }
    showHideMenu(true);
}

function getCurrentHash() {
    var hash = document.location.href;
    if (hash[hash.length - 1] === '/') {
        hash = hash.slice(0, -1);
    }
    var slashPos = hash.lastIndexOf('/');
    hash = hash.slice(slashPos + 1);
    hash = hash.toLowerCase();
    return hash;
}

function downloadPresentation() {
    console.log('Sending Request to Download Presentation in Hash: ' + currentHash);
    socket.emit('requestDownloadPresentation', { 'hash': currentHash });
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

var isPasswordCreateOverlayOn = false;
function showHidePasswordCreateOverlay() {
    if (!isPasswordCreateOverlayOn) {
        $('#passwordCreateOverlay').fadeIn(400);
        $('#presentationPassword').focus();
        isPasswordCreateOverlayOn = true;
    } else {
        $('#passwordCreateOverlay').fadeOut(400);
        isPasswordCreateOverlayOn = false;
    }
    showHideMenu(true);
}

function submitPassword() {
    var pwd = document.getElementById("presentationPassword").value;
    socket.emit('updatePassword', { 'password': pwd, 'currentHash': currentHash});
    showHidePasswordCreateOverlay();
}

var isPasswordCheckOverlayOn = false;
function showHidePasswordCheckOverlay() {
    if (!isPasswordCheckOverlayOn) {
        $('#passwordCheckOverlay').fadeIn(400);
        $('#presentationCheckPassword').focus();
        isPasswordCheckOverlayOn = true;
    } else {
        $('#passwordCheckOverlay').fadeOut(400);
        isPasswordCheckOverlayOn = false;
    }
    showHideMenu(true);
}

function submitCheckPassword() {
    var pwd = document.getElementById("presentationCheckPassword").value;
	if(pwd) {
		socket.emit("checkSlidePassword-server", {password: pwd, hash: currentHash});
	}
}


function hideClickAllow(delay) {
    $('#clickallow').delay(3000).fadeOut(600);
}

function showRemote() {
    var pathName = document.location.pathname;
    if (pathName) {
        pathName = pathName.replace(/\//g, '');
    }

    var newUrl = "http://" + document.location.hostname + ':' + location.port
    /*if (document.location.hostname === 'localhost') {
        newUrl += ':8081';
    }*/
    newUrl += "/remote/index.html?presentation=" + pathName;
    window.open(newUrl, "popupWindow", "width=1160, height=850, scrollbars=no");
	showHideMenu(true);
}

function disableMenuItem(menuItem) {
	$(menuItem).attr('title','only presenter can do this');
	$(menuItem).attr('onclick','return false');
	$(menuItem).off();
	$(menuItem).unbind();
	$(menuItem).addClass("grayedOut");
}
function disableNonPresenterMenues() {
	disableMenuItem("#menuRemote");
	disableMenuItem("#menuOpenVideoChat");
	disableMenuItem("#menuPassword");
	disableMenuItem("#menuOpenScreensharing");
	disableMenuItem("#menuRenamePresentation");
}

function isInIFrame(){
	return (self!=top);
}

function renderMenuForIFrame(){
	if(isInIFrame()){
		$('#sliteWatermak').css({
			"height": "60px",
			"line-height": "60px",
			"font-size": "60px"
		});
		$('.menuSubmenu').css({
			"font-size": "40px",
			"right": "250px",
			"top": "50px"
		});
	}
}

function isLocalhost() {
	var location = document.location + "";
	return (pathName && location.indexOf("file") === 0);
}

function isPresenter() {
	 //returns true if there is a 'remote' word in the url
    //if (!parent || !parent.document) return false;
    //var pathName = parent.document.location.pathname;
    //var reg = RegExp(/^\/?remote(\/|#|\?|$).*/i);
    //var res = reg.test(pathName);
    //return res;
	return canBePresenter();
}

function canBePresenter() {
	if( typeof presenter !== 'undefined') {
		var result = presenter > 0 ? true : false;
		var location = document.location + "";
		if(location && location.indexOf("file") === 0){ //localhost case
			result = true;
		}
		return result;
	}
	else {
		return false;
	}
}

function getPresentationInRemote() {
    if (!parent || !parent.document) return null;
    var editBox = parent.document.getElementById('URLSlides');
    if (!editBox || !editBox.value) return null;
    return editBox.value.toUpperCase();
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
    	var pathName = document.location.pathname;
        if (pathName) {
            pathName = pathName.replace('/', '');
        }
        var slider = $(".royalSlider").data('royalSlider');
		socket.emit('insertVideoId', { video_hash: result, slite_hash: pathName, curr_slide: slider.currSlideId+1 });
	}else{
		alert("Your youtube url or id is wrong. Please see example above");
	}

	showHideInsertVideoSlideOverlay();
}

$('#navPrev').click(function () {
    var slider = $(".royalSlider").data('royalSlider');
	slider.prev();
	clearCanvas();
});
$('#navNext').click(function () {
	var slider = $(".royalSlider").data('royalSlider');
    slider.next();
	clearCanvas();
});
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
$('#closeRenamePresentationOverlay').click(function () {
    showHideRenamePresentationOverlay();
});
$('#closePasswordCreateOverlay').click(function () {
    showHidePasswordCreateOverlay();
});
$('#submitPassword').click(function () {
    submitPassword();
});
$('#submitCheckPassword').click(function () {
    submitCheckPassword();
});
$('#videochatpanel').click(function () {
    showHideVideoChat();
});
if(isVideoChatOpen){
    showHideVideoChat();
}
$('#closevideo').click(function () {
    showHideVideoChat();
    config.attachStream && config.attachStream.stop();
});
$('#closescreensharing').click(function () {
    showHideScreensharing();
});
if(isScreensharingOpen){
    showHideScreensharing();
}
$('#submitInsertVideoSlide').click(function () {
    submitInsertVideoSlide();
});
$('#sliteWatermak').click(function () {
    showHideMenu();
});
$('#closeExplanator').click(function () {
    showHideExplanators();
});
$(document).mousemove(function () {
	showHideNavButtons();
});
if (needToShowExplanators()) {
    showHideExplanators();
}
var hostname = window.location.hostname;
if( hostname.indexOf("www") == 0){
	hostname = hostname.substring(4);
}
if(presentationPassword == 1) {
    showHidePasswordCheckOverlay();
}
if( isMobile() ) {
	$("#sliteWatermak").css("display","none");
}
if( !isAPresenter ) {
	disableNonPresenterMenues();
}
$('#menuTitle').html(hostname);
$('#slide').css('overflow','hidden');
//renderMenuForIFrame(); //for when inside remote control

var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
var isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);
if(isAPresenter){
	if (navigator.mozGetUserMedia) {
		$('#install_chrome_extension').css("display","none");
	}else if(isChrome){
		$('#install_firefox_extension').css("display","none");
	}else{
		$('#install_firefox_extension').css("display","none");
		$('#install_chrome_extension').html("<b>Screensharing is available ONLY for Chrome and Firefox browsers.</b>");
	}
}else{
	$('#install_chrome_extension').css("display","none");
	$('#install_firefox_extension').css("display","none");
}
if(!navigator.mozGetUserMedia && !isChrome){
	$('#install_firefox_extension').css("display","none");
		$('#install_chrome_extension').html("<b>Screensharing is available ONLY for Chrome and Firefox browsers.</b>");
}


var _channelHash = "9WDXH6OH-6K73NMI";

window.onresize = function () {
    setTimeout(function(){
        $( "#video-gallery" ).width("90%");
        $( "#video-gallery" ).height("100%");
        $( ".rsOverflow " ).height("100%");
        $( ".rsSlide " ).height("100%");
        $( "#slide " ).height("100%");
        //scaleVideos();
        //resizeCanvas();
    }, 60);
};

jQuery(document).ready(function ($) {
	// Not works on real host - Show error mismatch 8081 & 80
	 if (canBePresenter() && !isInIFrame()) {
		 var item = $('.menuSubmenu #menuRemote');
		 item.show();
    }
	if (canBePresenter() && !isInIFrame()) {
		 var item = $('.menuSubmenu #menuPassword');
		 item.show();
    }
    if ( typeof title !== 'undefined' ) {
		if(isInIFrame() == true) {
      //Temporary disabled, error in mobile app
			//parent.document.title = title;
		}
		else {
			document.title = title;
		}


    }

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
        numImagesToPreload: 999,
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
            var slide_html = "<div style='text-align:center; position: relative' id=slide class='rsContent'>"
						           + "<img src='" + slide_html_path + "' height='100% width='100%' style='position: absolute;left: 0px;width: 100%;'>";
					               //+ "<div class='rsTmb'>"
					               //+ "<h5>SLIDE" + slide + "</h5>"
						           //+ "     <span>Slide " + slide + " here</span>"
						           //+ "</div> </div>";
            slider.appendSlide(slide_html);
        }
    }

    $("#video-gallery").css("height", "100%");
    $(".rsOverflow").css("height", "100%");
    $(".rsOverflow").css("width", "100%");
});

function getClearUrl() {
    var url = [location.protocol, '//', location.host, location.pathname].join('');
    return url;
}

if (!isFile) {
    //socket = io.connect(document.location.hostname + ':' + location.port);

    socket.on('responseDownloadPresentation', function (data) {
        if (data.fileName) {
            console.log('Received Response to Downloading presentation: ' + data.fileName + ', redirecting...');
            document.location.replace(getClearUrl() + '/' + data.fileName);
        }
    });

    socket.on('ccBroadcast', function (data) {
        $('#closedCaptioningPanel').hide();
        $('#closedCaptioningPanel').html(data.hello);
        $('#closedCaptioningPanel').show(400).delay(2000).fadeOut(400);
    });



    socket.on('news', function (data) {
        if ((document.location.pathname == "/" + data.slideID) || (document.location.pathname == "/" + data.slideID + "/")) {
		var button = data.hello - 1;
			var slider = $(".royalSlider").data('royalSlider');
            console.log(button);
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

    socket.on('checkSlidePassword-client', function (data) {
		if(data.result == 1) {
			showHidePasswordCheckOverlay();
		}else{
            alert("Wrong Password");
        }
    });

    socket.on('broadcastVideoChat', function (data) {
        if (data.hash !== currentHash || isAPresenter) return;
        console.log('broadcastVideoChat received');
        if (data.open === isVideoChatOn) return;
        showHideVideoChat();
    });
	socket.on('broadcastScreensharing', function (data) {
        if (data.hash !== currentHash || isAPresenter) return;
        console.log('broadcastScreensharing received');
        if (data.open === isScreensharingOn) return;
        showHideScreensharing();
    });
}
