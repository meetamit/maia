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
    this.$container = $container;
    this.disabled = false;
    var _this = this,
        // intervalId = null,
        rate,
        rate0 = 300,
        rate1 = 50;
    $container.bind($.browser.touchDevice ? 'touchstart' : 'mousedown', function(e) {
      if(_this.disabled) { return; }
      e.preventDefault();
      if(!isNaN(intervalId)) { clearIt(); }
      startIt();
    });
    
    function startIt() {
      rate = rate0;
      tick();
    }
    function tick() {
      if(_this.disabled) { return; }
      _this.trigger('tick');
      intervalId = setTimeout(tick, rate);
      rate = Math.max(rate1, Math.pow(rate, .95));
    }
  }
  ContinuousButton.prototype.enable = function() { 
    if(this.disabled) {
      this.disabled = false;
      this.$container.removeClass('disabled');
    }
  };
  ContinuousButton.prototype.disable = function() {
    if(!this.disabled) {
      this.disabled = true;
      this.$container.addClass('disabled');
    }
  };
  

/////////////////////////////// TBD \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\


})();