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
        $start = $container.find('.start.field'),
        $end = $container.find('.end.field'),
        btns = $.map($container.find('[data-minutes]'), newIncrBtn);

    $container.find('.add_event').fadeIn();
    update();
    event.bind('change', update);

    function update(model) {
      if(!model || model.hasChanged('fStart')) {
        $start.find('.t').text(event.get('fStart').toString());
      }
      
      if(!model || model.hasChanged('fEnd')) {
        $end.find('.t').text(event.get('fEnd').toString());
      }
      
      $.each(btns, function(i, btn) { btn.updateDisability(); });
    };
    
    function newIncrBtn(element) {
      var $btn = $(element),
          btn = new maia.ContinuousButton($btn);
          
      btn.field = $btn.parents().indexOf($start[0]) > -1 ? 'start' : 'end';
      btn.amount = parseInt($btn.data('minutes'), 10) * 60000;
      btn.updateDisability = function() {
        // console.log(this.field, this.amount, event.canIncrement(this.field, this.amount));
        if(event.canIncrement(this.field, this.amount)) { 
          $btn.removeClass('disabled');
        }
        else {
          $btn.addClass('disabled');
        }
      };

      btn.bind('tick', function() {
        event.increment(this.field, this.amount, maia.FIVE_MINUTES);
      });
      return btn;
    }
  }
})();