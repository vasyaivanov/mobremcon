var socket;
var isFile = RegExp(/^file:.*/i).test(document.location.href);
var royalSlider;
var hashUsers = -1;
var presentPassword;

if(localStorage.getItem("presentationsLocal")) {
	var presentations = JSON.parse(localStorage.getItem("presentationsLocal"));
	presentPassword = (presentations[currentHash]) ? (presentations[currentHash]) : 0;

	if(presenter == 0 && presentPassword > 0) {
		$("#backButtonMobile").show();
        $("#presentationHashMobile").html("prezera.com/p/" + getCurrentHash());
        $("#presentationHashMobile").show();
	}
}

if(navigator.userAgent.indexOf("Firefox") != -1 )  {
	var uMatch = navigator.userAgent.match(/Firefox\/(.*)$/),
		ffVersion;
	if (uMatch && uMatch.length > 1) {
		ffVersion = uMatch[1];
	}

	if(ffVersion >= 42) {
		$('#menuOpenRecording').show();
	}
	else {
		alert("Please update your browser. We support FF version >= 42.0 for screen recording.")
	}
}

if (!isFile) {
    if (typeof socket !== 'undefined') {
        alert('socket in A1.js is already defined!');
    }
    socket = io.connect(document.location.hostname + ':' + location.port, {query: "type=user&hash=" + getCurrentHash()});
}
socket.on('connect', function (data) {
    console.log('Connected: ');
});

socket.on("disconnect", function(err) {
	console.log("Lost connection");
});


socket.on("reconnect", function(err) {
	console.log("Reconnected");
});

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
        $("#personalNotesOpenCloseLabel").html("Close ");
    } else {
        $("#personalNotesOpenCloseLabel").html("");
    }
	$('#personalNotesArea').focus();
    showHideMenu(true);
}


function showPreviewsOnMainPage(){
	//http://jsfiddle.net/q4d9m/2/
}

//var justHidden = false;
var navigationButtonsTimeout;
function showHideNavButtons(){
	//if (!justHidden) {
    //justHidden = false;
    if(!isRemoteOpen)  {
		$(".navButton").css('display','block');
		clearTimeout(navigationButtonsTimeout);
		navigationButtonsTimeout = setTimeout('$(".navButton").hide(400);', 6000);
	}
}

function hideNavigationButtons(){
    $(".navButton").hide(400);
}

function toggleMainWindow() {
	if(isCommentsOpen || isVideoChatOn){
		//reduce main window
		$("#video-gallery").animate({"width": "80%"},300);
		$("#navButtons").css({"left":"10%"});
	}

	if( (!isCommentsOpen && !isVideoChatOn) ){
		//put main window back to full size
    $("#video-gallery").animate({"width":"100%"},300);
		$("#navButtons").css({"left":"0%"});
	}
	resizeCanvas();
}

var isCommentsOpen = false;
function showHideComments() {
    $("#comments").slideToggle();
    $("#comments").css('overflow', 'scroll');
    var label = $("#chatOpenCloseLabel");
    if (label.html() == "") {
		isCommentsOpen = true;
        $("#chatOpenCloseLabel").html("Close ");
    } else {
		isCommentsOpen = false;
        $("#chatOpenCloseLabel").html("");
    }
	toggleMainWindow();
    showHideMenu(true);
}

var isVideoChatOn = 0;
function showHideVideoChat() {
	if(isScreensharingOn == 1) {
		showHideScreensharing()
	}

    if (!isVideoChatOn) {
        isVideoChatOn = 1;
		$("#videoframe").attr("src","/video.html?presentation=" + getCurrentHash() + "&random=" + Math.random() * 999999999999999);
    } else {
		$("#videoframe").attr("src","");
        isVideoChatOn = 0;
    }

    if (isPresenter() && isVideoChatOn == 0) {
		socket.emit("presenterVideoChat", {open: isVideoChatOn, hash: getCurrentHash()});
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


var isRecordingOn = 0;
function recording() {
    if (!isRecordingOn) {
        isRecordingOn = 1;
		$("#recordingframe").attr("src","/record.html?presentation=" + getCurrentHash() + "&random=" + Math.random() * 999999999999999);
    } else {
		$('#recording').animate({ "width": "100%", "clear": "both" },300);
		$("#recordingframe").attr("src","");
        isRecordingOn = 0;
    }

    var label = $("#RecordingOpenCloseLabel");
    if (label.text() == "Start") {
        $("#RecordingOpenCloseLabel").html("Stop");
    } else {
        $("#RecordingOpenCloseLabel").html("Start");
    }
	//$("#recording").hide();
    $("#recording").slideToggle();
	showHideMenu(true);
}

$("#recordButton").click(function() {
	$("#recStarted").hide();
	$("#recording").slideToggle();
	document.getElementById("recordingframe").contentWindow.stopRec();
});


var isScreensharingOn = 0;
function showHideScreensharing() {
	if(isVideoChatOn == 1) {
		showHideVideoChat()
	}

    if (!isScreensharingOn) {
			//document.getElementById('screensharingiframe').contentWindow.start();
		$("#screensharingiframe").attr("src","/screensharing.html?presentation=" + getCurrentHash() + "&random=" + Math.random() * 999999999999999);
        isScreensharingOn = 1;
    } else {
		$("#screensharingiframe").attr("src","");
				//document.getElementById('screensharingiframe').contentWindow.stopSession();
        isScreensharingOn = 0;
    }

    if (isPresenter() && isScreensharingOn == 0) {
        socket.emit("presenterScreensharing", {open: isScreensharingOn, hash: getCurrentHash()});
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
        askNumberOfUsers();
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
    return currentHash;
}

function downloadPresentation() {
		addPimg = "/p/";
		if(location.hostname.split('.')[0] != "www") {
			addPimg = "";
		}
		window.open(addPimg + getCurrentHash() + '/download');
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

function getPresentationKey() {
	socket.emit('get-presentation-key', { sid: getCurrentHash()}, function(confirmation){
		if(confirmation.key > 0) {
			showHideMenu(true);
			//alert("Presentation ID: " + confirmation.id + "\n" + "Presenter password: " + confirmation.key);
			$("#getPassResult").html("<div style='margin-bottom:7px;'><b>Presentation ID:</b> " + confirmation.id + "</div>" + "<div><b>Presenter password:</b> " + confirmation.key + "</div>");
			$('#presPassOverlay').fadeIn(400);

		}
	});
}

function submitPassword() {
    var pwd = document.getElementById("presentationPassword").value;
    socket.emit('updatePassword', { 'password': pwd, 'currentHash': getCurrentHash()});
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
		socket.emit("checkSlidePassword-server", {password: pwd, hash: getCurrentHash()});
	}
}


function hideClickAllow(delay) {
    $('#clickallow').delay(3000).fadeOut(600);
}

/*function showRemote() {
    var pathName = document.location.pathname;
    if (pathName) {
        pathName = pathName.replace(/\//g, '');
    }

    var newUrl = "http://" + document.location.hostname + ':' + location.port
    newUrl += "/remote/index.html?presentation=" + pathName;
    window.open(newUrl, "popupWindow", "width=1160, height=850, scrollbars=no");
	showHideMenu(true);
}*/

var isRemoteOpen = false;

function showHideRemote() {
    var slider = $(".royalSlider").data('royalSlider');
    //console.log(slider.st);
    //console.log(slider);

    var label = $("#remoteOpenCloseLabel");
    if (!isRemoteOpen) {
        isRemoteOpen = true;
        label.html("Close ");
        hideNavigationButtons();
        slider._slidesContainer.off(slider._downEvent);
        slider._doc.off(slider._moveEvent)
				   .off(slider._upEvent);
        $('.royalSlider').on('dragstart', function (event) { event.preventDefault(); });
    } else {
        isRemoteOpen = false;
        label.html("");
        slider._slidesContainer.on(slider._downEvent, function (e) { console.log('_downEvent'); slider._onDragStart(e); });
        slider._doc.on(slider._moveEvent, function (e) { console.log('_moveEvent'); slider._onDragMove(e, false/*isThumbs*/); })
				   .on(slider._upEvent, function (e) { console.log('_upEvent'); slider._onDragRelease(e, false/*isThumbs*/); });
        turnLaser(false);
        turnDraw(false);
        clearCanvas();
    }
    $("#navButtons").slideToggle();
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
    disableMenuItem("#menuShowHideRemote");
	disableMenuItem("#menuOpenVideoChat");
	disableMenuItem("#menuPassword");
	disableMenuItem("#menuPresKey");
	disableMenuItem("#menuOpenScreensharing");
	disableMenuItem("#menuRenamePresentation");
	disableMenuItem("#menuOpenRecording");
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
	if( typeof presenter !== 'undefined') {
		var result = presenter > 0 ? true : false;
		if(presentPassword > 0) {
			result = true;
		}
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
    var editBox = getCurrentHash();
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

        var slider = $(".royalSlider").data('royalSlider');
		socket.emit('insertVideoId', { video_hash: result, slite_hash: getCurrentHash(), curr_slide: slider.currSlideId+1 });
	}else{
		alert("Your youtube url or id is wrong. Please see example above");
	}

	showHideInsertVideoSlideOverlay();
}

$("#navNext").click(function() {
	if (isPresenter()) {
		nextSlideRemote();
	} else {
		nextSlideLocal();
	}
});

$("#navPrev").click(function() {
	if (isPresenter()) {
		prevSlideRemote();
	} else {
		prevSlideLocal();
	}
});

function prevSlideLocal(){
	var slider = $(".royalSlider").data('royalSlider');
	slider.prev();
	clearCanvas();
}

function nextSlideLocal(){
	var slider = $(".royalSlider").data('royalSlider');
	slider.next();
	clearCanvas();
}
$('#prev').click(function() {
	if (isPresenter()) {
		prevSlideRemote();
	}
});
$('#next').click(function() {
	if (isPresenter()) {
		nextSlideRemote();
	}
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
$('#closePassOverlay').click(function () {
	$('#presPassOverlay').fadeOut(400);
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

if(isVideoChatOpen == 1){
    setTimeout(function(){showHideVideoChat()},2000);
}
$('#closevideo').click(function () {
    showHideVideoChat();
	//config.attachStream && config.attachStream.stop();
});
$('#closerecording').click(function () {
    recording();
	//config.attachStream && config.attachStream.stop();
});
$('#closescreensharing').click(function () {
    showHideScreensharing();
});
if(isScreensharingOpen == 1){
	setTimeout(function(){showHideScreensharing()},2000);
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
if(presentationPassword == 1 && isPresenter() == false) {
    showHidePasswordCheckOverlay();
}

if( isMobile() ) {
	$("#sliteWatermak").css("display","none");

	if (window.innerHeight > window.innerWidth){
	    $('#orientationOverlay').fadeIn(400);
	}

	window.addEventListener("orientationchange", function() {
		if (window.orientation == 0 || window.orientation == 180) {
			$("#mainSlide").hide();
			$('#orientationOverlay').fadeIn(400);
		}
		else {
			$('#orientationOverlay').fadeOut(400);
			resizeCanvas();
			$("#mainSlide").show();
		}
	}, false);

}
if( !isPresenter() ) {
	disableNonPresenterMenues();
}
$('#menuTitle').html(hostname);
$('#slide').css('overflow','hidden');
//renderMenuForIFrame(); //for when inside remote control

var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
var isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);
if(isPresenter()){
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

/*window.onresize = function () {
    setTimeout(function(){
        $( "#video-gallery" ).width("100%");
        $( "#video-gallery" ).height("100%");
        $( ".rsOverflow " ).height("100%");
        $( ".rsSlide " ).height("100%");
        $( "#slide " ).height("100%");
        //scaleVideos();
        //resizeCanvas();
    }, 60);
};*/

function updateTitle() {
    var newTitle = "";

    if (!isNaN(hashUsers) && hashUsers >= 0) {
        newTitle += "(" + hashUsers + ") ";
    }

    if (typeof title !== 'undefined') {
        newTitle += title;
    } else {
        newTitle += "Presentation";
    }

    if (isInIFrame() == true) {
        //Temporary disabled, error in mobile app
		//parent.document.title = newTitle;
    } else {
        document.title = newTitle;
    }
}

function askNumberOfUsers(){
    socket.emit("get-nof-users", { hash: getCurrentHash() });
}

$( window ).load(function() {
	// Not works on real host - Show error mismatch 8081 & 80
	 if (isPresenter() && !isInIFrame()) {
		 var item = $('.menuSubmenu #menuRemote');
		 item.show();
    }
	if (isPresenter() && !isInIFrame()) {
		 var item = $('.menuSubmenu #menuPassword');
		 item.show();
    }

    updateTitle();
    askNumberOfUsers();

    royalSlider = $('#video-gallery').royalSlider({
        arrowsNav: false,
        arrowsNavAutoHide: false,
        navigateByClick: false,
        fadeinLoadedSlide: true,
        controlNavigationSpacing: 0,
        controlNavigation: 'none',
        arrowsNavHideOnTouch: false,
        sliderTouch: false,
        sliderDrag: true,

        thumbs: {
            autoCenter: false,
            fitInViewport: true,
            orientation: 'vertical',
            spacing: 0,
            paddingBottom: 0
        },
        keyboardNavEnabled: false,
        imageScaleMode: 'fit',//'fit-if-smaller',//'fill', //'none'
        imageAlignCenter: true,
        slidesSpacing: 0,
        loop: false,
        loopRewind: true,
        numImagesToPreload: number_of_slides,
        video: {
            autoHideArrows: true,
            autoHideControlNav: false,
            autoHideBlocks: true
        },
        autoScaleSlider: true,
        autoScaleSliderWidth: 200,
        autoScaleSliderHeight: 100,
        visibleNearby: {
            enabled: true,
            centerArea: 0.5,
            center: true,
            breakpoint: 650,
            breakpointCenterArea: 0.64,
            navigateByCenterClick: true
        }
    });

    var staticSlite = (slite === '/HASH_TEMPLATE/' || slite === '/<%= hash %>/');
    if (staticSlite) {
        slite = '';
		number_of_slides = 13;
    }

		var addPimg = "/p";

		if(location.hostname.split('.')[0] != "www") {
			addPimg = "";
		}

    for (var slide = 1; slide <= number_of_slides; ++slide) {
        var slide_html_path = addPimg + slite + "img" + (slide - 1) + ".jpg" + "?ts=" + (new Date().getTime()); //slide url with added time stamp to stop caching
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
            var slide_html = "<div style='position: relative' id='slide' class='rsContent'>"
						           + "<img class=\"rsImg\" id=\"actualSlide_" + slide + "\" src='" + slide_html_path + "'>"
					             + "</div>";


            slider.appendSlide(slide_html);
						// Resize images
						var resizer = new Resizer({imgid:slide});
						resizer.checkImage();
        }
    }

		var tSlider = $(".royalSlider").data('royalSlider');

    $("#video-gallery").css("height", "100%");
    $(".rsOverflow").css("height", "100%");
    $(".rsOverflow").css("width", "100%");

    if (isPresenter()) {
        showHideRemote();
    }

    $(window).on("keydown", function (e) {
        console.log(e);
        switch (e.keyCode) {
            case 39:
                if (isPresenter()) {
                    nextSlideRemote();
                } else {
                    nextSlideLocal();
                }
                e.preventDefault();
                break;
            case 37:
                if (isPresenter()) {
                    prevSlideRemote();
                } else {
                    prevSlideLocal();
                }
                e.preventDefault();
                break;
            case 34:
                if (isPresenter()) {
                    nextSlideRemote();
                } else {
                    nextSlideLocal();
                }
                e.preventDefault();
                break;
            case 33:
                if (isPresenter()) {
                    prevSlideRemote();
                } else {
                    prevSlideLocal();
                }
                e.preventDefault();
                break;
            default:
        }
    });


  if (!isFile) {
      //socket = io.connect(document.location.hostname + ':' + location.port);

	// We don't use this function
    /*socket.on('responseDownloadPresentation', function (data) {
        if (data.fileName) {
            console.log('Received Response to Downloading presentation: ' + data.fileName + ', redirecting...');
            window.open("/" + getCurrentHash() + '/' + data.fileName);
        }
    });*/

    socket.on('ccBroadcast', function (data) {
        $('#closedCaptioningPanel').hide();
        $('#closedCaptioningPanel').html(data.hello);
        $('#closedCaptioningPanel').show(400).delay(2000).fadeOut(400);
    });



    socket.on('changeSlideBroadcast', function (data) {
				if(data.slideID == getCurrentHash() && isPresenter() === false) {
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
                    //slider.next();
                    clearCanvas();
                    break;
                }
                case 101: {
                    //slider.prev();
                    clearCanvas();
                    break;
                }
                default: {
                    slider.stopVideo();
                    //slider.goTo(button);
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
        if (data.hash !== getCurrentHash() || isPresenter()) return;
		// Reload video frame if two way signal communication signal was sent
		if(data.reload > 0) {
			if(data.reload == 2) {
				if(navigator.userAgent.indexOf("Firefox") != -1 )  {
						location.href="/" + getCurrentHash();
				}
				else {
					document.getElementById("videoframe").contentWindow.changeClass();
					document.getElementById("videoframe").contentWindow.addStream();
				}
			}
			else if(data.reload == 1) {
				document.getElementById("videoframe").contentWindow.location.reload();
			}
		}

		if(data.open == 2) {return;}
        if (data.open === isVideoChatOn) return;
        showHideVideoChat();
    });
    socket.on('broadcastScreensharing', function (data) {

        if (data.hash !== getCurrentHash() || isPresenter()) return;
        console.log('broadcastScreensharing received');
        if (data.open === isScreensharingOn) return;
        if(data.open == false) {
            showHideScreensharing()
        }
        else {
            showHideScreensharing();
        }
    });

    socket.on('nof-users', function (data) {
						if(data.hash == getCurrentHash()) {
	            hashUsers = data.nof_users;
	            var usersText = "";
	            if (!isNaN(hashUsers) && hashUsers >= 0) {
	                usersText = " ( " + hashUsers + " user" + (hashUsers === 1 ? "" : "s") + " )";
	            }
	            $("#chatUsersLabel").html(usersText);
	            updateTitle();
						}
    });

  }

});

function getClearUrl() {
    var url = [location.protocol, '//', location.host, location.pathname].join('');
    return url;
}

var Resizer = function (params) {
	this.params = params;
	this.count=0;
	this.maxattempts = 10;
	this.timeout = 0;
	this.checkImage = function() {
		var self = this;
		self.count++;
		self.image = $("#actualSlide_" + self.params.imgid);
		if(typeof self.image[0] == "undefined") {
			//console.log("Image" + self.params.imgid + " not loaded. Running again. ");
			if(self.count < self.maxattempts) {
				self.timeout = setTimeout(function(){self.checkImage()},1000);
			}
		}
		else {
			//console.log("Image found, getting the actual image size.");
			if(self.image[0].naturalWidth == 0) {
				if(self.count < self.maxattempts) {
					self.timeout = setTimeout(function(){self.checkImage()},1000);
				}
			}
			else {
				if(self.params.imgid == number_of_slides) {
					$("#loadingPage").hide();
				}
				// If everything is ok - resize image
				self.image.animate({ "height": self.image[0].height * 100 / window.innerHeight + "%", "clear":"both"},300);
				self.image.animate({ "width": self.image[0].width * 100 / window.innerWidth + "%", "clear":"both"},300);
			}
		}
	}


}
