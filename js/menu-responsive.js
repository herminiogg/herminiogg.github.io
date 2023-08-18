var num = $('header').height();

$(window).load(function() {
  $('#menu-icon').click(function() {
    $('nav').css('display', function (index, value) {
      if(value == 'none') return 'flex';
      else return 'none';
    });
    if($('header').hasClass('persistent-nav') && $(window).scrollTop() <= num)
      $('header').removeClass('persistent-nav')
    else if(!$('header').hasClass('persistent-nav'))
      $('header').addClass('persistent-nav')
  });
});
