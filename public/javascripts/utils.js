(function() {
  $.browser.iPhone = navigator.userAgent.match(/iPhone/i) !== null;
  $.browser.iPad = navigator.userAgent.match(/iPad/i) !== null;
  $.browser.iOS = $.browser.iPhone || $.browser.iPad;
  $.browser.android = navigator.userAgent.match(/android/i) !== null;
  $.browser.touchDevice = $.browser.android || $.browser.iOS;

  maia.ONE_MINUTE = 60000;
  maia.FIVE_MINUTES = 300000;
  maia.TWELVE_HOURS = 43200000;
  maia.TIME_ZONE_OFFSET = (new Date()).getTimezoneOffset()*60000;
})();