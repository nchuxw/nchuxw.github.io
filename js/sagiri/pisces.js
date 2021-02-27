function pisces () {

  $(document).ready(function () {

    var sidebarInner = $('.sidebar-inner');

    initAffix();
    resizeListener();

    function initAffix () {
      var sidebarHeight = $('#sidebar').height();
	  var contentHeight = $('#content').height();
	  var contentTop =  $('#main').offset().top;

      if (sidebarHeight < contentHeight) {
        sidebarInner.affix({
          offset: {
            top: contentTop,
            bottom: 0
          }
        });
	  }
	  
    }

    function resizeListener () {
      var mql = window.matchMedia('(min-width: 991px)');
      mql.addListener(function (e) {
        if (e.matches) {
          recalculateAffixPosition();
        }
      });
    }

    function recalculateAffixPosition () {
      $(window).off('.affix');
      sidebarInner.removeData('bs.affix').removeClass('affix affix-top affix-bottom');
      initAffix();
    }

  });
}

module.exports = pisces;
