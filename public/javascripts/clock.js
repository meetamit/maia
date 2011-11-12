(function() {
  maia.Clock = Clock;
  var TWELVE_HOURS = 43200000;
  function Clock($container, range) {
    var $bg = $container.find('canvas.bg'),
        $fg = $container.find('canvas.fg'),
        $start = $container.find('.handles .start'),
        $end = $container.find('.handles .end'),
        bgCanvas = $bg[0], fgCanvas = $fg[0],
        bg = bgCanvas.getContext("2d"),
        fg = fgCanvas.getContext("2d"),
        w, h, radius, innerRadius, outerRadius;
    function update() {
      if(!w * h) { return; }
      var startAngle = 2*Math.PI * (range.get("start") % TWELVE_HOURS) / TWELVE_HOURS,
          endAngle = 2*Math.PI * ((range.get("end") || range.get("impliedEnd")) % TWELVE_HOURS) / TWELVE_HOURS,
          span = range.getSpan();
          
      $start.css({
        '-webkit-transform': ['translate(', radius * Math.cos(startAngle), 'px,', radius * Math.sin(startAngle), 'px)'].join('')
      });
      $end.css({
        '-webkit-transform': ['translate(', radius * Math.cos(endAngle), 'px,', radius * Math.sin(endAngle), 'px)'].join('')
      });

      fg.clearRect(0,0,w,h);
      fg.beginPath();
      fg.arc(w *.5, h *.5, radius + 9, startAngle, endAngle, false);
      fg.lineWidth = 15;
      fg.strokeStyle = "black"; // line color
      fg.stroke();
    }

    this.updateSize = function () {
      w = $fg.width();
      h = $fg.height();
      radius = Math.min(w,h) * .35;
      innerRadius = radius - 15;
      outerRadius = radius + 20;
      
      if(w * h) {
        bgCanvas.width = fgCanvas.width = w;
        bgCanvas.height = fgCanvas.height = h;
        update();
        
        var a,
            tick;
        for(var i=0; i<144; i++) {
          a = 2 * Math.PI * i/144;
          bg.beginPath();
          tick = i % 12 == 0 ? 10 : (i % 2 == 0 ? 5 : 2);
          bg.moveTo(w*.5 + outerRadius * Math.cos(a), h*.5 + outerRadius * Math.sin(a));
          bg.lineTo(w*.5 + (outerRadius+tick) * Math.cos(a), h*.5 + (outerRadius+tick) * Math.sin(a));
          bg.lineWidth = i % 12 == 0 ? 3 : 1;
          bg.strokeStyle = "#aaa";
          bg.stroke();
        }
      }
    };

    this.updateSize();
    range.bind('change', update);
    
    $start.bind($.browser.touchDevice ? 'touchstart' : 'mousedown', function(e) {
      e.preventDefault();
    });
    $end.bind($.browser.touchDevice ? 'touchstart' : 'mousedown', function(e) {
      e.preventDefault();
    });

  }
})();