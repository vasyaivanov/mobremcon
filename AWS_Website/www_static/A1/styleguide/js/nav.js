$(function() {
    var $menu = $('nav#menu'),
        $html = $('html, body');

    $menu.mmenu({
        dragOpen: true
    });

    var $anchor = false;
    $menu.find( 'li > a' ).on(
        'click',
        function( e )
        {
            $anchor = $(this);
        }
    );

    var api = $menu.data( 'mmenu' );
    api.bind( 'closed',
        function()
        {
            if ( $anchor )
            {
                var href = $anchor.attr( 'href' );
                $anchor = false;

                //  if the clicked link is linked to an anchor, scroll the page to that anchor 
                if ( href.slice( 0, 1 ) == '#' )
                {
                    $html.animate({
                        scrollTop: $( href ).offset().top
                    }); 
                }
            }
        }
    );
});