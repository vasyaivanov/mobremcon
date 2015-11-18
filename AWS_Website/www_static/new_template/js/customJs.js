$(function() {

    // Closes the sidebar menu
    $("#menu-close").click(function(e) {
        e.preventDefault();
        $("#sidebar-wrapper").toggleClass("active");
    });

    // Opens the sidebar menu
    $("#menu-toggle").click(function(e) {
        e.preventDefault();
        $("#sidebar-wrapper").toggleClass("active");
    });

  // Click on item in menu
  $(".menuLink,.menuLinkOther").click(function(e) {
        e.preventDefault();
        $("#sidebar-wrapper").toggleClass("active");
    });

    // Scrolls to the selected menu item on the page
    $(function() {
        $('a[href*=#]:not([href=#])').click(function() {
            if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') || location.hostname == this.hostname) {

                var target = $(this.hash);
                target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
                if (target.length) {
                    $('html,body').animate({
                        scrollTop: target.offset().top
                    }, 1000);
                    return false;
                }
            }
        });
    });

    // Menu visualization
    $(".allData").hide();
	if(window.location.hash) {
		$(window.location.hash).show();
	}
	else {
		$(".mainData").show();
	}

    $( ".loginUser" ).click(function() {
        $(".allData").hide();
        $("#login").show();
    });

    $( ".myPres" ).click(function() {
        $(".allData").hide();
        $("#myPres").show();

    });

    $( ".menuLink" ).click(function() {
		$(".allData").hide();
		$(".mainData").show();
    });

    //show sign up hide everything else
    $( ".signUpUser" ).click(function() {
        $(".allData").hide();
		$("#signUp").show();
    });

    $( ".accountUpgrade" ).click(function() {
        $(".allData").hide();

    });

	$('.allData').click(function() {
		if($("#sidebar-wrapper").hasClass("active") === true) {
			$("#sidebar-wrapper").toggleClass("active");
		}

	});

});
