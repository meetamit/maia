/* in jade file
 .range.slider
   .start.handle
   .end.handle
*/
(function() {
  maia.RangeSlider = RangeSlider;
  function RangeSlider($container, range) {
    var $start = $container.find('.start'),
        $end = $container.find('.end'),
        w, mspp;
  
    function update() {
      if(!w) { return; }
      var span = range.getSpan();
      mspp = span / w;
      console.log("mspp", mspp, range.getSpan());
    }
  
    this.updateWidth = function () {
      w = $container.width();
      update();
    };
  
    this.updateWidth();
    range.bind('change', update);
  }
  
  
  // function Quant() {
})();