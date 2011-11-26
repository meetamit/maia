(function() {
  $.browser.iPhone = navigator.userAgent.match(/iPhone/i) !== null;
  $.browser.iPad = navigator.userAgent.match(/iPad/i) !== null;
  $.browser.iOS = $.browser.iPhone || $.browser.iPad;
  $.browser.android = navigator.userAgent.match(/android/i) !== null;
  $.browser.touchDevice = $.browser.android || $.browser.iOS;
  $.browser.firefox = navigator.userAgent.match(/firefox/i) !== null;

  maia.ONE_MINUTE = 60000;
  maia.FIVE_MINUTES = 300000;
  maia.THREE_HOURS = 10800000;
  maia.TWELVE_HOURS = 43200000;
  maia.TWENTY_FOUR_HOURS = 86400000;
  maia.TIME_ZONE_OFFSET = (new Date()).getTimezoneOffset()*60000;
  
  Number.prototype.mod = function(n) { return ((this%n)+n)%n; };
  
  maia.BROWSER_PREFIX = $.browser.webkit ? '-webkit-' : $.browser.firefox ? '-moz-' : '';
  maia.TRANSFORM_PROP = maia.BROWSER_PREFIX + 'transform';
})();