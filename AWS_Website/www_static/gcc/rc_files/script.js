/*!
 * 
 * Javascript Document
 * 
 */
 
$(function(){
	var navSubHeadObj, navObj = $('.main-nav li');
	
	/*
	 * On hover of sub navigation 
	 * relative sub menu will show up
	*/
	/*$(navObj).hover(function() {
		navSubHeadObj = $(this).children().attr('class');
		$('.'+navSubHeadObj+'-menu').css('display','block').fadeIn(500);
		},function(){
			//$('.'+navSubHeadObj+'-menu').css('display','none');
	});*/
	
	/*
	 * On click of sub navigation 
	 * active class will be added to sub menu
	 *
	*/
	$(navObj).on('click', function(){
		$(navObj).each(function(){
			$(this).removeClass('active');
		});
		$(this).addClass('active');
	});
	
	
	/*
	 * On click of footer navigation active class will be added
	 * to relative div having info about clicked navigation
	 *
	*/
	$('.tabPanelGroup .first').addClass('selected');
	$('.TabbedPanelsTab').click(function(){
		var targetDiv = $(this).data('rel');
		if(!$(this).hasClass('selected')){ //added to not animate when active
			$('.TabbedPanelsContent').addClass('selected');
			$(this).removeClass('selected');
			$('.TabbedPanelsContent').hide();
			$(targetDiv).fadeIn('slow');
		}
		return false;
	});
	
	
	
	/*$(window).scroll(function () { 
		var scrollPos = $(window).scrollTop();
		if(scrollPos >= 300){
			$('.social-media').css('top',scrollPos);
			console.log(scrollPos);
		}
		
	});*/
	
	$('.search-result-type ul a').click(function(){
		switch_tabs($(this));
	});
	
	/*Blocking character length of main search box*/
	$(".search-bar input.input").keypress(function(){ 
	  if($(this).val().length>=55){
			return false
	   }
	});
	
	/*if($.browser.version === "7.0"){
		$('ul.menu-head li.country').hover(function(){
			$('ul.main-nav').css({'position':'relative','z-index':'0'});
		})
	}*/

	
	/*if(jQuery.browser.version === "7.0"){
		$('ul.menu-head li.country').hover(function(){
			//$('li.full-width').css('position','static');
		},function(){
			$('li.full-width').css('position','static');
		})
	}*/
	
	
	// Style all the elements where uniform class is added
	$(".uniform").uniform();
	
	if($('#article ul li').length>6){
	$('#article').pajinate({
		num_page_links_to_display : 3,
		items_per_page : 6,
		show_first_last: false
	});
	}
	/*$('.rc-result').pajinate({
		num_page_links_to_display : 5,
		items_per_page : 7,
		show_first_last: false
	});*/
	
	if($('#lc-video ul li').length>3){
		$('#lc-video').pajinate({
			num_page_links_to_display : 2,
			items_per_page : 3,
			show_first_last: false,
			nav_label_prev :'',
			nav_label_next:''
		});
	}
	/*$('.submit-case a.add-comment').on('click', function(event){
		event.preventDefault();
		$('.new-case-list').show();
		$(this).addClass('comment')
	});*/
	
	/*if screen size less than 1104 or resize happens below 1104px*/
	if($(window).width()<1104)$('.social-media').addClass('body-narrow');$('#addthis_toolbox').css('display','block');
	$(window).resize(function() {
		if($(window).width()<1104)$('.social-media').addClass('body-narrow');else $('.social-media').removeClass('body-narrow');	
	}); 
	
});


function switch_tabs(obj) {
	$('.left-container').hide();
	$('.search-result-type ul a').removeClass("selected");
	
	$('.video-section').show();
	if($(obj).attr('id')=='articles-list-only'){
	 $('.video-section').hide();
	}
	
	$(obj.data("rel")).show();
	obj.addClass("selected");
}


/*Browser Detection Script*/
(function($){$.browserTest=function(a,z){var u='unknown',x='X',m=function(r,h){for(var i=0;i<h.length;i=i+1){r=r.replace(h[i][0],h[i][1]);}return r;},c=function(i,a,b,c){var r={name:m((a.exec(i)||[u,u])[1],b)};r[r.name]=true;r.version=(c.exec(i)||[x,x,x,x])[3];if(r.name.match(/safari/)&&r.version>400){r.version='2.0';}if(r.name==='presto'){r.version=($.browser.version>9.27)?'futhark':'linear_b';}r.versionNumber=parseFloat(r.version,10)||0;r.versionX=(r.version!==x)?(r.version+'').substr(0,1):x;r.className=r.name+r.versionX;return r;};a=(a.match(/Opera|Navigator|Minefield|KHTML|Chrome/)?m(a,[[/(Firefox|MSIE|KHTML,\slike\sGecko|Konqueror)/,''],['Chrome Safari','Chrome'],['KHTML','Konqueror'],['Minefield','Firefox'],['Navigator','Netscape']]):a).toLowerCase();$.browser=$.extend((!z)?$.browser:{},c(a,/(camino|chrome|firefox|netscape|konqueror|lynx|msie|opera|safari)/,[],/(camino|chrome|firefox|netscape|netscape6|opera|version|konqueror|lynx|msie|safari)(\/|\s)([a-z0-9\.\+]*?)(\;|dev|rel|\s|$)/));$.layout=c(a,/(gecko|konqueror|msie|opera|webkit)/,[['konqueror','khtml'],['msie','trident'],['opera','presto']],/(applewebkit|rv|konqueror|msie)(\:|\/|\s)([a-z0-9\.]*?)(\;|\)|\s)/);$.os={name:(/(win|mac|linux|sunos|solaris|iphone)/.exec(navigator.platform.toLowerCase())||[u])[0].replace('sunos','solaris')};if(!z){$('html').addClass([$.os.name,$.browser.name,$.browser.className,$.layout.name,$.layout.className].join(' '));}};$.browserTest(navigator.userAgent);})(jQuery);