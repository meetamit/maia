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
        bgCanvas = $bg[0], fgCanvas = $fg[0],
        bg = bgCanvas.getContext("2d"),
        fg = fgCanvas.getContext("2d"),
        w, h, ctr, innerRadius, outerRadius;
    function update() {
      if(!w * h) { return; }
      var startAngle = Clock.dateToRads(event.get("start")),
          endAngle = Clock.dateToRads(event.get("end") || event.get("impliedEnd")),
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
      fg.fillStyle = "rgba(187,187,187,.2)";//"#bbb";
      for(var i = Math.floor(span / maia.TWELVE_HOURS); i >= 1; i--) {
        fg.beginPath();
        fg.arc(ctr.x, ctr.y, innerRadius, 0, 2 * Math.PI, false);
        fg.arc(ctr.x, ctr.y, 10, 2 * Math.PI, 0, true);
        fg.fill();
      }
      fg.beginPath();
      fg.arc(ctr.x, ctr.y, innerRadius, startAngle, endAngle, false);
      fg.arc(ctr.x, ctr.y, 10, endAngle, startAngle, true);
      fg.fill();
    }

    this.updateSize = function () {
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
        
        update();
      }
    };

    this.updateSize();
    event.bind('change', update);
    
    $start.bind($.browser.touchDevice ? 'touchstart' : 'mousedown', dragStart);
    $end.bind($.browser.touchDevice ? 'touchstart' : 'mousedown', dragStart);

    var dragged,
        date0,
        $dragged = null,
        START = 'start',
        END = 'end',
        pg, dd, pt0, pt1, a0, a1, d,
        phaze, dLast, aLast;
    function dragStart(e) {
      e.preventDefault();
      if(e.target == $start[0]) {
        dragged = START;
        $dragged = $start;
        date0 = event.get(START);
      }
      else if(e.target == $end[0]) {
        dragged = END;
        $dragged = $end;
        date0 = event.get(END) || event.get('impliedEnd');
      }
      dd = $container.offset();
      pg = Clock.extractCoords(e);
      pt0 = { x:pg.x - dd.left - ctr.x, y:pg.y - dd.top - ctr.y };
      a0 = Clock.ptToRads(pt0);
      aLast = a0;
      phaze = 0;
      dLast = 0;
      
      $(document).bind($.browser.touchDevice ? 'touchmove' : 'mousemove', dragMove);
      $(document).bind($.browser.touchDevice ? 'touchend' : 'mouseup', dragEnd);
    }
    
    function dragMove(e) {
      pg = Clock.extractCoords(e);
      pt1 = { x:pg.x - $container.offset().left - ctr.x, y:pg.y - $container.offset().top - ctr.y };
      a1 = Clock.ptToRads(pt1);
      d = a1 - a0;
      if(a1 - aLast > Math.PI) {
        phaze -= 1;
      }
      else if(a1 - aLast < -Math.PI) {
        phaze += 1;
      }
      dLast = d;
      aLast = a1;
      
      var setter = {};
      setter[dragged] = new Date(Number(date0) + Clock.radsToMs(a1 - a0) + maia.TWELVE_HOURS * phaze);
      event.set(setter);
    }
    
    function dragEnd(e) {
      $(document).unbind($.browser.touchDevice ? 'touchmove' : 'mousemove', dragMove);
      $(document).unbind($.browser.touchDevice ? 'touchend' : 'mouseup', dragEnd);
    }
  }
})();