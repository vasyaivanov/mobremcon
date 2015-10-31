$(function() {
    $("#login2").hide();
    $("#signUp").hide();

    //hide all data and show login
    $( ".loginUser" ).click(function() {
        $(".allData").hide();
        $("#login2").show();
        $("#signUp").hide();
    });

    //hide login and show all data
    $( ".menuLink" ).click(function() {
        $(".allData").show();
        $("#login2").hide();
        $("#signUp").hide();
    });

    //show sign up hide everything else
    $( ".signUpUser" ).click(function() {
        $(".allData").hide();
        $("#login2").hide();
        $("#signUp").show();
    });
    
});