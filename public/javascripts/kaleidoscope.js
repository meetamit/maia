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