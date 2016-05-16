$(window).resize(function() {
    var selector = "#ui-id-1";
    var dialog_options = $(selector).dialog('option');
    if (dialog_options.resizable) {
        dialog_width = get_dialog_width();
        $(selector).dialog("option", "width", dialog_width + "px");
    }
    $(selector).dialog("option", "position", "center");
});

function get_dialog_width() {
    window_width = $( window ).width();
    if( window_width < 767 ){
        dialog_width = 300;
    }else{
        dialog_width = 515;
    }
    return dialog_width;
}