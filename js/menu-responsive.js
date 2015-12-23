$(window).load(function() {
  $('#menu-icon').click(function() {
    $('nav').toggle();
    $('header').toggleClass('persistent-nav')
  });
});
