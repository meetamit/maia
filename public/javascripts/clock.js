(function() {
  maia.Clock = Clock;
  var TWELVE_HOURS = 43200000;
  function Clock($container, range) {
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
      var startAngle = 2*Math.PI * (range.get("start") % TWELVE_HOURS) / TWELVE_HOURS,
          endAngle = 2*Math.PI * ((range.get("end") || range.get("impliedEnd")) % TWELVE_HOURS) / TWELVE_HOURS,
          span = range.getSpan();
          
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
      fg.arc(ctr.x, ctr.y, innerRadius - 7, startAngle, endAngle, false);
      fg.lineWidth = 15;
      fg.strokeStyle = "black"; // line color
      fg.stroke();
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
    range.bind('change', update);
    
    $start.bind($.browser.touchDevice ? 'touchstart' : 'mousedown', dragStart);
    $end.bind($.browser.touchDevice ? 'touchstart' : 'mousedown', dragStart);

    var dragged = null,
        $dragged = null,
        START = 'start',
        END = 'end',
        d0, dd, pt0, pt1;
    function dragStart(e) {
      e.preventDefault();
      if(e.target == $start[0]) {
        dragged = START;
        $dragged = $start;
      }
      else if(e.target == $end[0]) {
        dragged = END;
        $dragged = $end;
      }
      console.log(e);
      dd = $container.offset();
      d0 = { x:e.offsetX, y:e.offsetY };
      console.log(d0.x,d0.y);
      pt0 = { x:e.pageX - dd.left - ctr.x, y:e.pageY - dd.top - ctr.y };
      
      
      $(document).bind($.browser.touchDevice ? 'touchmove' : 'mousemove', dragMove);
      $(document).bind($.browser.touchDevice ? 'touchend' : 'mouseup', dragEnd);
    }
    
    function dragMove(e) {
      // pt1 = 
      console.log(e.pageX - $container.offset().left - ctr.x, e.pageY - $container.offset().top - ctr.y);
      // console.log(e.pageX + dd.x, e.pageY + dd.y);
      // console.log(e.layerX-ctr.x,e.layerY-ctr.y);
    }
    
    function dragEnd(e) {
      $(document).unbind($.browser.touchDevice ? 'touchmove' : 'mousemove', dragMove);
      $(document).unbind($.browser.touchDevice ? 'touchend' : 'mouseup', dragEnd);
    }
  }
})();