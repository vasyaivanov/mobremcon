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
		window.location.hash = "#myPres";
		
		if(typeof customDomain != "undefined" && customDomain != "") {
			var domain = location.host;
			domain = domain.replace(/^www\./,"");
			domain = protocol + "://" + customDomain + "." + domain;
			location.href=domain;
		}
		else {
			$("#myPres").show();
		}
    });

    $( ".subscription" ).click(function() {
        $(".allData").hide();
        $("#subscription").show();
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

    $( ".account" ).click(function() {
        $(".allData").hide();
		$("#myAccount").show();
    });
	
	// Redirect to paypal
	if(typeof accountType != 'undefined' && accountType != '') {
		$(".allData").hide();
		$("#notifText").text("Redirecting to paypal...");
		$("#notifications").show();
		$("#" + accountType + "_account_upgrade").submit();
	}

	$('.allData').click(function() {
		if($("#sidebar-wrapper").hasClass("active") === true) {
			$("#sidebar-wrapper").toggleClass("active");
		}

	});

});
