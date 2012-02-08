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
        $startThumb = $start.find('.thumb'),
        $end = $container.find('.end.handle'),
        $endThumb = $end.find('.thumb'),
        $label = $container.find('.label'),
        bgCanvas = $bg[0], fgCanvas = $fg[0],
        bg = bgCanvas.getContext("2d"),
        fg = fgCanvas.getContext("2d"),
        w, h, ctr, innerRadius, outerRadius, digitRadius,
        transform = {}, transformProp = maia.TRANSFORM_PROP;
        
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
          startRotation = Math.round(2 * (startAngle * 180 / Math.PI + 90)) / 2,
          endRotation = Math.round(2 * (endAngle * 180 / Math.PI + 90)) / 2,
          span = event.getSpan();
          
      transform[transformProp] = 'rotate(' + startRotation + 'deg)';
      $start.css(transform);
      transform[transformProp] = 'rotate(' + (-startRotation) + 'deg)';
      $startThumb.css(transform);
      transform[transformProp] = 'rotate(' + endRotation + 'deg)';
      $end.css(transform);
      transform[transformProp] = 'rotate(' + (-endRotation) + 'deg)';
      $endThumb.css(transform);

      fg.clearRect(0,0,w,h);
      
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
      
      if(event.get('isTransient')) {
        var angle = dragged == END ? endAngle : startAngle;
        angle = (angle + Math.PI/2).mod(2 * Math.PI);
        var f = angle / 2,
            pt = { x:(outerRadius+1) * Math.sin(angle) + ctr.x, y:(outerRadius+1) * Math.cos(angle) + ctr.y };
        $label.css({
          right:   -pt.x + h,
          bottom: pt.y + 40 * Math.pow( Math.sin(angle / 2), 2 ) + 10 + 30 * Math.max(0, Math.sin(angle))
        }).html(
          ( dragged == END ? event.get('fEnd') : event.get('fStart') ).split('<br>').join('').toLowerCase()
        );
      }
    }

    function updateSize() {
      w = $fg.width();
      h = $fg.height();
      ctr = { x:w*.5, y:h*.5 };
      innerRadius = Math.min(w,h) * .5 - 28;
      outerRadius = Math.min(w,h) * .5 - 26;
      digitRadius = Math.min(w,h) * .5 - 15;
      
      var handleCss = {
        'height': 1.1 * innerRadius,
        'bottom': -.1 * innerRadius
      };
      $start.find('img').css(handleCss);
      $end.find('img').css(handleCss);
      
      var sz = .22 * innerRadius,
          d = .04 * innerRadius;
      $container.find('.thumb').css({
        'top': -innerRadius * .73,//.76,
        'width': sz,
        'height': sz,
        'line-height': (sz * (sz < 26 ? .95 : 1)) + 'px',
        'right': d,
        'font-size': sz < 26 ? '8px' : '9px'
      });
      $endThumb.css('left', d);
      
      
      if(w * h) {
        bgCanvas.width = fgCanvas.width = w;
        bgCanvas.height = fgCanvas.height = h;
        
        var a, tick, cosa, sina,
            $digits = $container.find('.digits').empty();
        for(var i=0; i<144; i++) {
          a = 2 * Math.PI * i/144;
          cosa = Math.round(10000 * Math.cos(a) ) / 10000;
          sina = Math.round(10000 * Math.sin(a) ) / 10000;
          bg.beginPath();
          tick = i % 12 == 0 ? 7 : (i % 2 == 0 ? 5 : 2);
          if(i % 12 == 0) {
            var hrs = (i+24) / 12 % 12 + 1,
                html;
            switch(hrs) {
              // TODO: This is broken (doesn't really do am/pm
              case 0:
              case 12:
                // html = '<div>M<span>idnight</span></div>';
                html = '<div>N<span>oon</span></div>';
                break;
              default:
                html = '<div>' + hrs + '<span>pm</span></div>';
            }
            
            var $digit = $(html).appendTo($digits);
            transform[transformProp] = [
              'translate(', ctr.x + digitRadius * cosa - $digit.width() * (.5 + (cosa == 0 ? 0 : cosa < 0 ? .3 : -.3)), 'px,', 
              ctr.y + digitRadius * sina - $digit.height() * (.5 + (sina == 0 ? .1 : sina < 0 ? .4 : -.1)), 'px) '
            ].join('');

            $digit.css(transform);
          }
          
          bg.moveTo(ctr.x + outerRadius * cosa, ctr.y + outerRadius * sina);
          bg.lineTo(ctr.x + (outerRadius+tick) * cosa, ctr.y + (outerRadius+tick) * sina);
          bg.lineWidth = i % 12 == 0 ? 3 : 1;
          var radgrad = bg.createRadialGradient(ctr.x, ctr.y, outerRadius-1 ,ctr.x, ctr.y, outerRadius+tick);
          radgrad.addColorStop(.2, 'rgba(255,255,255,1)');//'#ff0000');
          radgrad.addColorStop(1, 'rgba(255,255,255,0)');//'#0000ff');
          bg.strokeStyle = radgrad;

          bg.stroke();
        }
      }
    };
    
    this.copyInto = function(bgContext, fgContext) {
      bgContext.putImageData(fg.getImageData(0, 0, w, h), 0, 0);
      fgContext.putImageData(bg.getImageData(0, 0, w, h), 0, 0);
    };

    updateSize();
    $startThumb.bind($.browser.touchDevice ? 'touchstart' : 'mousedown', dragStart);
    $endThumb.bind($.browser.touchDevice ? 'touchstart' : 'mousedown', dragStart);

    var dragged,
        date0, date1ms,
        START = 'start',
        END = 'end',
        pg, dd, a0, a1,
        phaze, aLast;
    function dragStart(e) {
      $container.addClass("dragged");
      e.preventDefault();
      if(e.target == $startThumb[0]) {
        dragged = START;
        date0 = event.get(START);
      }
      else if(e.target == $endThumb[0]) {
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