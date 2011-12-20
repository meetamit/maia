(function() {
  maia.CanvasKaleidoscope = CanvasKaleidoscope;
  function CanvasKaleidoscope($container, alt, numHalfLeaves) {
    var canvas = document.createElement('canvas'),
        context = canvas.getContext('2d'),
        img = new Image(),
        leafSym,
        hexSym,
        ang = 2 * Math.PI / numHalfLeaves,
        r = alt / Math.cos(ang);

    canvas.width = alt * 6;
    canvas.height = r * 3;
    document.body.appendChild(canvas);
    
    $(img).bind('load', function() {
      leafSym = new HalfLeafSymbol(img, alt, ang);
      hexSym = new HexSymbol(leafSym, alt, r, numHalfLeaves / 2);
    });
    img.src = "/images/wooshes_00.png";
    
    setInterval(function() {
      leafSym.update();
      hexSym.update();
      context.clearRect(0, 0, canvas.width, canvas.height);
      
      for(var i = (j % 2 == 1 ? 0 : -1); i < 3; i++) {
        for(var j = 0; j < 3; j++) {
          context.drawImage(hexSym.canvas, (2 * i + j % 2) * alt, j * r * (Math.sin(ang) + 1) - r);
        }
      }
    }, 50);
  }
  
  function HexSymbol(leafSym, alt, r, numLeaves) {
    var canvas = this.canvas = document.createElement('canvas'),
        context = canvas.getContext('2d');

    canvas.width = alt * 2;
    canvas.height = r * 2;
    
    (this.update = function() {
      context.clearRect(0, 0, alt * 2, r * 2);
      for(var i = 0; i < numLeaves; i++) {
        for(var j = 0; j < 2; j++) {
          context.save();
          context.translate(alt, r);
          context.rotate(2 * Math.PI * i / numLeaves);
          if(j % 2 == 0) {
            context.scale(1,-1);
          }
          // context.translate(-3, -1);
          context.drawImage(leafSym.canvas, 0, 0);
          context.restore();
        }
      }
    })();
  }
  
  function HalfLeafSymbol(img, alt, ang) {
    var canvas = this.canvas = document.createElement('canvas'),
        context = canvas.getContext('2d'),
        w = alt,
        h = Math.round(alt * Math.tan(ang)),
        slope = h / w;
        
    canvas.width = w;
    canvas.height = h;
    // document.body.appendChild(canvas);
    
    context.beginPath();
    context.moveTo(-2,0);
    context.lineTo(w,0);
    context.lineTo(w,h+2);
    context.clip();

    var rot = 0;
    (this.update = function() {
      context.save(); 
      context.clearRect(0, 0, w, h);
      context.translate(img.width/2, 0*img.height/2);
      context.rotate(rot * Math.PI / 180);
      context.translate(-img.width/2, -img.height/2);
      rot -=1;
      context.drawImage(img, 0, 0);
      context.restore();
    })();
  }
})();

(function() {
  maia.Kaleidoscope = Kaleidoscope;
  function Kaleidoscope($container, h, numHalfLeaves) {
/*
    for(var i = 0; i < 3; i++) {
      for(var j = (i == 1 ? -1 : 0); j < 2; j++) {
        var $hex = $('<div class="hexagon"></div>').appendTo($container),
            hex = new Hexagon($hex, 12);
      
        $hex.css({
          left:i * 302,
          top: j * 350 + (i % 2) * 175
        });
      }
    }    
*/
//http://amitair.local:3000/kaleidoscope.html
    // var w = Math.round(h * 200/350);
    var w = Math.round( h * Math.tan(2 * Math.PI / numHalfLeaves) );
    new Hexagon( $('<div class="hexagon"></div>').appendTo($container), numHalfLeaves, w, h );

    $('.leaf').css({
      '-webkit-transform-origin': w + 'px ' + h + 'px',
      width: w*2,
      height: h,
      left: -w,
      top: -h
    });
    
    $('.half_leaf').css({
      // '-webkit-mask':'url("/images/triangle_mask_200x350.png") no-repeat scroll left bottom;',
      '-webkit-mask':'url("/images/triangle_mask_' + w + 'x' + h + '.png") no-repeat scroll left bottom;',
      width:w,
      height:h
    });

/*    var rules = document.styleSheets[0].cssRules,
        imgRule = null;
    for(var i=0; i < rules.length; i++) {
      if(rules[i].cssText.indexOf('.half_leaf .img') > -1) {
        imgRule = rules[i];
      }
    }

    var tokens = ['-webkit-transform: rotate(', 0, 'deg);'];
    setInterval(function() {
      tokens[1] += 1;
      imgRule.style.cssText = tokens.join('');
    }, 30);*/
    
    var $imgs = $('.hexagon .img'),
        degs = 0;
    setInterval(function() {
      degs += 2;
      $imgs.css({ '-webkit-transform': 'rotate(' + degs + 'deg)' });
    }, 30);
  }
  
  function Hexagon($container, numHalfLeaves, w, h) {
    var leafAngle = 360 / numHalfLeaves,
        $leaf, $half,
        // imgHtml = '<img class="img" src="/images/wooshes_00.png" width="' + w + '" height="' + w + '">',
        imgHtml = '<img class="img" src="/images/wooshes_00.png" width="' + w + '" height="' + (h * 300/350) + '">',
        // imgHtml = '<div class="img" style="width:'+w+'px; height:'+h+'px; font-size:36px;">Amit was here</div>',
        halfLeafHtml1 = '<div class="half_leaf">' + imgHtml + '</div>',
        halfLeafHtml2 = '<div class="half_leaf reflected">' + imgHtml + '</div>';
    for(var i = 0; i < numHalfLeaves; i++) {
      var zeroMod2 = i % 2 == 0;
      if(zeroMod2) {
        $leaf = $('<div class="leaf"></div>').appendTo($container);
        $leaf.css({
          '-webkit-transform':'rotate(' + (i * leafAngle) + 'deg)'
        });
      }
      $half = $(zeroMod2 ? halfLeafHtml1 : halfLeafHtml2).appendTo($leaf);
    }
    
  }
})();