$(function() {
    $("#login2").hide();
    $("#signUp").hide();
    $("#accountUpgrade").hide();
    //hide all data and show login
    $( ".loginUser" ).click(function() {
        $(".allData").hide();
        $("#login2").show();
        $("#signUp").hide();
        $("#accountUpgrade").hide();
    });

    //hide login and show all data
    $( ".menuLink" ).click(function() {
        $(".allData").show();
        $("#login2").hide();
        $("#signUp").hide();
        $("#accountUpgrade").hide();
    });

    //show sign up hide everything else
    $( ".signUpUser" ).click(function() {
        $(".allData").hide();
        $("#login2").hide();
        $("#signUp").show();
        $("#accountUpgrade").hide();
    });

    $( ".accountUpgrade" ).click(function() {
        $(".allData").hide();
        $("#login2").hide();
        $("#signUp").hide();
        $("#accountUpgrade").show();
    });
    
});