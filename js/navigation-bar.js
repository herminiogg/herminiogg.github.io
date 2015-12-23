var num = $('header').height();

$(window).bind('scroll', function () {
    if ($(window).scrollTop() > num) {
        $('header').addClass('persistent-nav');
    }
    else {
        $('header').removeClass('persistent-nav');
    }
});
