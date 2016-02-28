$( document ).ready(function() {
  if(typeof parent.currentHash != "undefined") {
    $(window).on("keydown", function (e) {
            console.log(e);
            switch (e.keyCode) {
                case 39:
                    parent.nextSlideRemote();
                    e.preventDefault();
                    break;
                case 37:
                    parent.prevSlideRemote();
                    e.preventDefault();
                    break;
                case 34:
                    parent.nextSlideRemote();
                    e.preventDefault();
                    break;
                case 33:
                    parent.prevSlideRemote();
                    e.preventDefault();
                    break;
                default:
            }
        });
    }
});
