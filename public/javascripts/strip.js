(function() {
  maia.Strip = Strip;
  function Strip($container, events) {
    _.extend(this, Backbone.Events);
    var l, ms0, mspp,
        $legend = $('<div class="legend"></div>').appendTo($container),
        _this = this;
        
    events.bind('add', addEvent);
    events.bind('remove', removeEvent);
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
          left: Math.round(x0),
          right: Math.round(l - x1)
        });
        
        if(event.hasChanged('impliedEnd')) {
          if(event.get('impliedEnd') == null)
            event.$seg.removeClass('ongoing');
          else if(event.previous('impliedEnd') == null)
            event.$seg.addClass('ongoing');
        }
      }
      if(justDoIt === true || event.hasChanged('isEditing')) {
        if(event.get('isEditing'))
          event.$seg.addClass('current');
        else
          event.$seg.removeClass('current');
      }
    }
    
    function addEvent(event) {
      event.$seg = $('<div class="seg">&nbsp;</div>').appendTo($container);
      update(event, true);
      
      event.$seg.bind('click', function() {
        if(!event.get("isEditing")) {
          _this.trigger('select', event);
        }
      });
    }
    
    function removeEvent(event) {
      event.$seg.remove();
    }
    
    function drawLegend() {
      var d = new Date();
      for(var i = ms0, ms1 = ms0 + maia.TWENTY_FOUR_HOURS; i <= ms1; i += maia.THREE_HOURS) {
        d.setTime(i);
        var hours = d.getHours(),
            hoursStr;
            
        if(hours % 12 == 0)
          hoursStr = hours == 12 ? 'N<span>oon</span>' : 'M<span>idnight</span>';
        else
          hoursStr = hours % 12 + (hours < 12 ? '<span>am</span>' : '<span>pm</span>');
            
        // hoursStr = hours % 12 == 0 ? (hours == 12 ? 'noon' : 'mid\'nt') : (hours % 12 + (hours < 12 ? '<span>AM</span>' : '<span>PM</span>')),
        $('<div class="tick">' + hoursStr + '</div>').css({
          position:'absolute',
          left: (i - ms0) / mspp
        }).appendTo($legend);
      }
    }
  }
})();