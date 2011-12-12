(function() {
  maia.Kaleidoscope = Kaleidoscope;
  function Kaleidoscope($container, numHalfLeaves) {
    // new Hexagon( $('<div class="hexagon"></div>').appendTo($container), numHalfLeaves || 12 );
        
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

    var $imgs = $('.hexagon img'),
        degs = 0;
    setInterval(function() {
      degs += 1;
      $imgs.css({ '-webkit-transform': 'rotate(' + degs + 'deg)' });
    }, 30);
  }
  
  function Hexagon($container, numHalfLeaves) {
    var leafAngle = 360 / numHalfLeaves,
        $leaf, $half,
        imgHtml = '<img src="/images/note.jpg" width="200" height="300">',
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