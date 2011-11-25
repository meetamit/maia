(function() {
  maia.Strip = Strip;
  function Strip($container, events) {
    _.extend(this, Backbone.Events);
    var l, ms0, mspp,
        $legend = $('<div class="legend"></div>').appendTo($container),
        _this = this;
        
    events.bind('add', addEvent);
    events.bind('change', update);
    $(window).bind('resize', updateLength);
    updateLength();
    
    function updateLength() {
      $legend.empty();
      l = $container.width();
      ms0 = Math.floor((Date.now() - maia.TIME_ZONE_OFFSET) / maia.TWENTY_FOUR_HOURS) * maia.TWENTY_FOUR_HOURS + maia.TIME_ZONE_OFFSET;
      // ms0 -= maia.TWELVE_HOURS;// TEMP DEBUG
      mspp = maia.TWENTY_FOUR_HOURS / l;
      drawLegend();
      update();
    }
    
    function update(event, justDoIt) {
      if(!event) {
        events.each(function(model) {
          update(model, true);
        });
        return;
      }
      if(justDoIt === true || event.hasChanged('start') || event.hasChanged('end')) {
        var x0 = (event.get('start') - ms0) / mspp,
            x1 = (event.get('end') - ms0) / mspp;
        event.$seg.css({
          left: x0,
          right: l - x1
        });
      }
      if(justDoIt === true || event.hasChanged('isCurrent')) {
        if(event.get('isCurrent'))
          event.$seg.addClass('current');
        else
          event.$seg.removeClass('current');
      }
    }
    
    function addEvent(event) {
      event.$seg = $('<div class="seg">&nbsp;</div>').appendTo($container);
      update(event, true);
      
      event.$seg.bind('click', function() {
        if(!event.get("isCurrent")) {
          _this.trigger('selected', event);
        }
      });
    }
    
    function drawLegend() {
      var d = new Date();
      for(var i = ms0, ms1 = ms0 + maia.TWENTY_FOUR_HOURS; i <= ms1; i += maia.THREE_HOURS) {
        d.setTime(i);
        var hours = d.getHours(),
            hoursStr = hours % 12 == 0 ? (hours == 12 ? 'noon' : 'mid\'nt') : (hours % 12 + (hours < 12 ? 'am' : 'pm')),
            $tick = $('<div class="tick">' + hoursStr + '</div>').css({
              position:'absolute',
              left: (i - ms0) / mspp
            }).appendTo($legend);
      }
    }
  }
})();