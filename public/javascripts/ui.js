(function() {
  
/////////////////////////////// ContinuousButton \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

  maia.ContinuousButton = ContinuousButton;
  var intervalId = null;
  function clearIt() {
    clearTimeout(intervalId);
    intervalId = null;
  }
  $(document).ready(function() {
    $(document.body).bind($.browser.touchDevice ? 'touchend' : 'mouseup', function(e) {
      clearIt();
    });
  });
  function ContinuousButton($container) {
    _.extend(this, Backbone.Events);
    var _this = this,
        // intervalId = null,
        rate,
        rate0 = 300,
        rate1 = 100;
    $container.bind($.browser.touchDevice ? 'touchstart' : 'mousedown', function(e) {
      if(!isNaN(intervalId)) { clearIt(); }
      startIt();
    });
    
    function startIt() {
      rate = rate0;
      tick();
    }
    function tick() {
      _this.trigger('tick');
      intervalId = setTimeout(tick, rate);
      rate = Math.max(rate1, Math.pow(rate, .95));
    }
  }
  

/////////////////////////////// RangeSlider \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

  maia.RangeSlider = RangeSlider;
  function RangeSlider($container) {
  }

})();