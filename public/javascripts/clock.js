(function() {
  maia.Clock = Clock;
  var NINETY_DEGREES = .5 * Math.PI;
  Clock.dateToRads = function(date) {
    return 2*Math.PI * (date % maia.TWELVE_HOURS - maia.TIME_ZONE_OFFSET) / maia.TWELVE_HOURS - NINETY_DEGREES;
  };
  Clock.ptToRads = function(pt) {
    return (Math.atan2(pt.y, pt.x) + NINETY_DEGREES).mod(2 * Math.PI);
  };
  Clock.radsToMs = function(rads) {
    return maia.TWELVE_HOURS * rads / (2*Math.PI);
  };
  Clock.extractCoords = function(e) {
    var src = $.browser.touchDevice ? e.targetTouches[0] : e;
    return { x:src.pageX, y:src.pageY };
  };
  function Clock($container, event) {
    var $bg = $container.find('canvas.bg'),
        $fg = $container.find('canvas.fg'),
        $start = $container.find('.start.handle'),
        $end = $container.find('.end.handle'),
        $label = $container.find('.label'),
        bgCanvas = $bg[0], fgCanvas = $fg[0],
        bg = bgCanvas.getContext("2d"),
        fg = fgCanvas.getContext("2d"),
        w, h, ctr, innerRadius, outerRadius;
        
    this.setEvent = function(_event) {
      event && event.unbind('change', update);
      event = _event;
      event.bind('change', update);
      update();
    };
    
    function update() {
      if(!w * h) { return; }
      var startAngle = Clock.dateToRads(event.get("start")),
          endAngle = Clock.dateToRads(event.get("end")),
          span = event.getSpan();
          
      $start.css({
        '-webkit-transform': [
          'translate(', innerRadius * Math.cos(startAngle) + ctr.x, 'px,', innerRadius * Math.sin(startAngle) + ctr.y, 'px) ',
          'rotate(', startAngle * 180 / Math.PI + 90, 'deg)'
        ].join('')
      });
      $end.css({
        '-webkit-transform': [
          'translate(', innerRadius * Math.cos( endAngle ) + ctr.x, 'px,', innerRadius * Math.sin( endAngle ) + ctr.y, 'px) ',
          'rotate(', endAngle * 180 / Math.PI + 90, 'deg)'
        ].join('')
      });

      fg.clearRect(0,0,w,h);
      
      fg.beginPath();
      fg.moveTo(10 * Math.cos(startAngle) + ctr.x, 10 * Math.sin(startAngle) + ctr.y);
      fg.lineTo(innerRadius * Math.cos(startAngle) + ctr.x, innerRadius * Math.sin(startAngle) + ctr.y);
      fg.strokeStyle = '#00a';
      fg.stroke();
      
      fg.fillStyle = "rgba(0,0,170,.3)";//'#00a';//"rgba(187,187,187,.3)";
      for(var i = Math.floor(span / maia.TWELVE_HOURS); i >= 1; i--) {
        fg.beginPath();
        fg.arc(ctr.x, ctr.y, innerRadius, 0, 2 * Math.PI, false);
        fg.arc(ctr.x, ctr.y, 10, 2 * Math.PI, 0, true);
        fg.fill();
      }
      if(span > 0) {
        fg.beginPath();
        fg.arc(ctr.x, ctr.y, innerRadius, startAngle, endAngle, false);
        fg.arc(ctr.x, ctr.y, 10, endAngle, startAngle, true);
        fg.fill();
      }
      
      fg.beginPath();
      fg.moveTo(10 * Math.cos(endAngle) + ctr.x, 10 * Math.sin(endAngle) + ctr.y);
      fg.lineTo(innerRadius * Math.cos(endAngle) + ctr.x, innerRadius * Math.sin(endAngle) + ctr.y);
      fg.strokeStyle = '#00a';
      fg.stroke();


      if(event.get('isTransient')) {
        var angle = dragged == END ? endAngle : startAngle;
        angle = (angle + Math.PI/2).mod(2 * Math.PI);
        var f = angle / 2,
            pt = { x:(outerRadius+1) * Math.sin(angle) + ctr.x, y:(outerRadius+1) * Math.cos(angle) + ctr.y };
        $label.css({
          right:   -pt.x + h,
          bottom: pt.y + 40 * Math.pow( Math.sin(angle / 2), 2 ) + 10 + 30 * Math.max(0, Math.sin(angle))
        }).html(dragged == END ? event.get('fEnd') : event.get('fStart'));
      }
    }

    function updateSize() {
      w = $fg.width();
      h = $fg.height();
      ctr = { x:w*.5, y:h*.5 };
      innerRadius = Math.min(w,h) * .35 + 15;
      outerRadius = Math.min(w,h) * .35 + 20;
      
      if(w * h) {
        bgCanvas.width = fgCanvas.width = w;
        bgCanvas.height = fgCanvas.height = h;
        
        var a, tick;
        for(var i=0; i<144; i++) {
          a = 2 * Math.PI * i/144;
          bg.beginPath();
          tick = i % 12 == 0 ? 10 : (i % 2 == 0 ? 5 : 2);
          bg.moveTo(ctr.x + outerRadius * Math.cos(a), ctr.y + outerRadius * Math.sin(a));
          bg.lineTo(ctr.x + (outerRadius+tick) * Math.cos(a), ctr.y + (outerRadius+tick) * Math.sin(a));
          bg.lineWidth = i % 12 == 0 ? 3 : 1;
          bg.strokeStyle = "#aaa";
          bg.stroke();
        }
      }
    };
    
    this.copyInto = function(bgContext, fgContext) {
      bgContext.putImageData(fg.getImageData(0, 0, w, h), 0, 0);
      fgContext.putImageData(bg.getImageData(0, 0, w, h), 0, 0);
    };

    updateSize();
    $start.bind($.browser.touchDevice ? 'touchstart' : 'mousedown', dragStart);
    $end.bind($.browser.touchDevice ? 'touchstart' : 'mousedown', dragStart);

    var dragged,
        date0, date1ms,
        START = 'start',
        END = 'end',
        pg, dd, a0, a1,
        phaze, aLast;
    function dragStart(e) {
      $container.addClass("dragged");
      e.preventDefault();
      if(e.target == $start[0]) {
        dragged = START;
        date0 = event.get(START);
      }
      else if(e.target == $end[0]) {
        dragged = END;
        date0 = event.get(END);
      }
      dd = $container.offset();
      pg = Clock.extractCoords(e);
      a0 = Clock.ptToRads({ x:pg.x - dd.left - ctr.x, y:pg.y - dd.top - ctr.y });
      aLast = a0;
      phaze = 0;
      
      event.set({ isTransient:true });
      
      $(document).bind($.browser.touchDevice ? 'touchmove' : 'mousemove', dragMove);
      $(document).bind($.browser.touchDevice ? 'touchend'  : 'mouseup', dragEnd);
    }
    
    function dragMove(e) {
      pg = Clock.extractCoords(e);
      a1 = Clock.ptToRads({ x:pg.x - dd.left - ctr.x, y:pg.y - dd.top - ctr.y });
      if(a1 - aLast > Math.PI) { phaze -= 1; }
      else if(a1 - aLast < -Math.PI) { phaze += 1; }
      aLast = a1;
      date1ms = Math.round((
        Number(date0) + Clock.radsToMs(a1 - a0) + maia.TWELVE_HOURS * phaze
      ) / maia.FIVE_MINUTES) * maia.FIVE_MINUTES;// Round to 5 minutes
      
      var setter = {};
      setter[dragged] = new Date(date1ms);
      event.set(setter);
    }
    
    function dragEnd(e) {
      $container.removeClass("dragged");
      event.set({ isTransient: false });
      $(document).unbind($.browser.touchDevice ? 'touchmove' : 'mousemove', dragMove);
      $(document).unbind($.browser.touchDevice ? 'touchend' : 'mouseup', dragEnd);
    }
  }
})();