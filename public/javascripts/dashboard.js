(function() {
  maia.Dashboard = Dashboard;
  function Dashboard($container) {
    var list = new List($container.find('ul'));
  }
  
  function List($container) {
    var sleep = new ListEntry( $container.find('.sleep') ),
        cry = new ListEntry( $container.find('.cry') ),
        notes = new ListEntry( $container.find('.notes') );
  }
  
  function ListEntry($container) {
    var $add = $container.find('.add'),
        _this = this;
    
    $add.bind('click', function() {
      new AddEvent(_this, $container);
    });
  }
  
  function AddEvent(listEntry, $container) {
    var event = new maia.Event({
          start: maia.Event.getNow(),//new Date(2000,0,1,2,50),//maia.Event.getNow(1200000)
          end: null//maia.Event.getNow()//null
        }),
        $start = $container.find('.start'),
        $end = $container.find('.end'),
        $incr = $container.find('[data-minutes]');

    $container.find('.add_event').fadeIn();
    
    $.each($incr, function(i, e) {
      var $this = $(e),
          btn = new maia.ContinuousButton($this);
          
      btn.bind('tick', function() {
        var field = $this.parents().indexOf($start[0]) > -1 ? 'start' : 'end',
            amount = parseInt($this.data('minutes'), 10) * 60000;

        event.increment(field, amount, maia.FIVE_MINUTES);
      });
    });

    function update() {
      $start.find('.t').text(event.get('fStart').toString());
      $end.find('.t').text(event.get('fEnd').toString());
    };
    
    update();
    event.bind('change', update);
  }
})();