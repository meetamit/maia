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
        $space = $container.find('.space'),
        addEvent = null;
    
    $add.bind('click', function() {
      $space.removeClass("closed").addClass("open");
      addEvent = addEvent || new AddEvent($container.find('.add_event'));
      addEvent.startNew();
    });
  }
  
  function AddEvent($container) {
    var event,
        $start = $container.find('.start.field'),
        $end = $container.find('.end.field'),
        clock = new maia.Clock($container.find('.clock')),
        btns = $.map($container.find('[data-minutes]'), newIncrBtn);
        
    this.startNew = function(_event) {
      if(event) {
        event.unbind('change', update);
        var $n = $($container[0].cloneNode()).html($container.html());
        $container.after($n);
        
        clock.copyInto(
          $n.find('canvas.bg')[0].getContext('2d'),
          $n.find('canvas.fg')[0].getContext('2d')
        );
        
        $container.removeClass("open").addClass("incoming");
        setTimeout(function() { console.log("ye"); 
          $container.removeClass("incoming").addClass("open"); 
        }, 0);
      }
      else {
        $container.css({display:'block'});
        clock.updateSize();
        $container.removeClass("closed").addClass("open");
      }
      
      event = _event || new maia.Event({
        start: maia.Event.getNow(),//new Date(2000,0,1,2,50),//maia.Event.getNow(1200000)
        end: null//maia.Event.getNow()//null
      });
      event.bind('change', update);
      update(null);
      clock.setEvent(event);
      return event;
    };

    function update(model) {
      if(!model || model.hasChanged('fStart')) {
        $start.find('.t').html(event.get('fStart').toString());
      }
      
      if(!model || model.hasChanged('fEnd')) {
        $end.find('.t').html(event.get('fEnd').toString());
      }
      
      $.each(btns, function(i, btn) { btn.updateDisability(); });
    };
    
    function newIncrBtn(element) {
      var $btn = $(element),
          btn = new maia.ContinuousButton($btn);
          
      btn.field = $btn.parents().indexOf($start[0]) > -1 ? 'start' : 'end';
      btn.amount = parseInt($btn.data('minutes'), 10) * 60000;
      btn.updateDisability = function() {
        if(this.amount > 0 && event.isEndImplied() && (this.field == 'end' || event.getSpan() < 60000)) {
          btn.disable();
        }
        else {
          btn.enable();
        }
      };

      btn.bind('tick', function() {
        event.increment(this.field, this.amount, maia.FIVE_MINUTES);
      });
      return btn;
    }
  }
})();