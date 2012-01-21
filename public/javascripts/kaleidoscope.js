(function() {
  maia.Kaleidoscope = Kaleidoscope;
  function Kaleidoscope(imgUrl, alt, numHalfLeaves) {
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
    
    (this.setImgUrl = function(imgUrl) {
      if(!this.setImgUrl) {
        $(img).bind('load', function() {
          //leafSym = new HalfLeafSymbol(new RotatingImg(img), alt, ang);
          leafSym = new HalfLeafSymbol(new DebrisImg(alt, r * Math.sin(ang), r), alt, ang);
          hexSym = new HexSymbol(leafSym, alt, r, numHalfLeaves / 2);
          if($leafCanvasDiv) $leafCanvasDiv.empty().append(leafSym.canvas);
        });
      }
      img.src = imgUrl;
    })(imgUrl);
    
    var intervalId;
    var fff=true;
    (this.play = function() {
      if(intervalId) return;
      intervalId = setInterval(function() {
        leafSym.update();
        hexSym.update();
        context.clearRect(0, 0, canvas.width, canvas.height);
      
        for(var i = (j % 2 == 1 ? 0 : -1); i < 3; i++) {
          for(var j = 0; j < 3; j++) {
            context.drawImage(hexSym.canvas, (2 * i + j % 2) * alt, j * r * (Math.sin(ang) + 1) - r);
          }
        }
      }, 50);
      if(intervalId == 0) intervalId = '0';
    })();
    
    this.pause = function() {
      if(intervalId != null) {
        clearInterval(Number(intervalId));
        intervalId = null;
      }
    };
    
    this.playOrPause = function() {
      if(intervalId) this.pause();
      else this.play();
    };
    
    var $leafCanvasDiv;
    this.getLeafCanvas = function() {
      return $leafCanvasDiv = $leafCanvasDiv || $('<div class="leaf"></div>');
    };
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
    context.moveTo(0,0);
    context.lineTo(w,0);
    context.lineTo(w,h);
    context.clip();

    var rot = 0;
    (this.update = function() {
      context.save(); 
      context.clearRect(0, 0, w, h);
      img.drawInto(context);
      context.restore();
    })();
  }
  
  function DebrisImg(w,h,r) {
    var r1 = 20,
        r2 = 0;
    this.drawInto = function (context) {
      var radgrad = context.createRadialGradient(Kaleidoscope.mod1*w,0,Kaleidoscope.mod2*8,0,0,r);
      radgrad.addColorStop(0, '#A7D30C');
      radgrad.addColorStop(Kaleidoscope.mod2*.5 + .5, '#019F62');
      // radgrad.addColorStop(1, 'rgba(1,159,98,1)');
      context.fillStyle = radgrad;
      context.beginPath();
      context.arc(0,0,r,0,2*Math.PI);
      context.fill();

      context.fillStyle = 'rgba(0,0,0,.5)';
      context.lineWidth = 4;
      context.beginPath();
      var rr = (Kaleidoscope.mod1*.7 + .3) * w*.7,
          k = -Kaleidoscope.mod2 * h;
      context.arc(w/2,h/2+k,rr,0,2*Math.PI);
      context.lineTo(w/2+r1, h/2+k);
      context.arc(w/2,h/2+k,Math.max(0,rr-10),0,2*Math.PI,true);
      context.fill();
/*
      
      context.strokeStyle = 'rgba(0,0,0,.5)';
      context.lineWidth = 10;
      context.beginPath();
      context.moveTo(Kaleidoscope.mod1 * w-5,-5);
      context.lineTo(w+5,(1-Kaleidoscope.mod2)*h+5);
      context.stroke();
      context.beginPath();
      context.moveTo((1-Kaleidoscope.mod1) * w-5,-5);
      context.lineTo((1-Kaleidoscope.mod2) * w+5,h+5);
      context.stroke();
*/
    };
  }
  
  function RotatingImg(imgTag) {
    var rot = 0;
    this.drawInto = function (context) {
      context.translate(imgTag.width/2, 0*imgTag.height/2);
      context.rotate(rot * Math.PI / 180);
      context.translate(-imgTag.width/2, -imgTag.height/2);
      context.drawImage(imgTag, 0, 0);
      rot -=.25;
    };
  }
  
  Kaleidoscope.mod1 = Kaleidoscope.mod2 = .5;
  $(document).ready(function() { 
    $(document).bind($.browser.touchDevice ? 'touchmove' : 'mousemove', function(e) {
      var src = $.browser.touchDevice ? e.targetTouches[0] : e;
      Kaleidoscope.mod1 = Math.min(1, Math.max(0, src.pageX/document.width));
      Kaleidoscope.mod2 = Math.min(1, Math.max(0, src.pageY/document.height));
    });
    
    if($.browser.touchDevice) {
      $('body').bind('touchstart', function(e) {
        if(e.targetTouches.length == 1) e.preventDefault();
      });
    }
  });
  
/* ------------------------------------------------------------------------ */

  maia.KaleidoscopeEditor = KaleidoscopeEditor;
  function KaleidoscopeEditor(kaleidoscope) {
    var $container = $('.editor');
    $container.append(kaleidoscope.getLeafCanvas());
    $('.editor input').bind('keypress', function(key) {
      if(key.which == 13) {
        kaleidoscope.setImgUrl($(this).val());
      }
    });
  }
})();