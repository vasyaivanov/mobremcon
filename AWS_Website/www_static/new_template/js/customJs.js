$(function() {
    $("#login2").hide();

    //hide all data and show login
    $( ".loginUser" ).click(function() {
        $(".allData").hide();
        $("#login2").show();
    });

    //hide login and show all data
    $( ".menuLink" ).click(function() {
        $(".allData").show();
        $("#{}login2").hide();
    });
    
});