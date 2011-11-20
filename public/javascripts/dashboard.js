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
    var $ok = $container.find('.ok'),
        $add = $container.find('.add'),
        $minz = $container.find('.minz'),
        $space = $container.find('.space'),
        $ing = $container.find('.ing'),
        $d = $container.find('.d'),
        addEvent = null,
        ongoing = null,
        event = null,
        state = null,
        
        any = {
          update: function (model) {
            if(model == ongoing) {
            }
          }
        },
        idle = {
          enter: function () {
            $space.addClass('closed');
            $add.removeClass('supressed');
            $ing.addClass('supressed');
          },
          action: function() {
            addEvent = addEvent || new AddEvent($container.find('.add_event'));
            event = addEvent.startNew();
            event.bind('change', xxx=function(model) {
              state.update(model);
            });
            setState(edit_ongoing);
          },
          exit: function () {
            $space.removeClass('closed');
            $add.addClass('supressed');
            $ing.removeClass('supressed');
          }
        },
        idle_ongoing = $.extend({}, idle, {
          enter: function() {
            $space.addClass('closed');
            $add.removeClass('supressed');
            $ing.removeClass('supressed');
            $d.removeClass('supressed');
            $d.bind('click', function() {
              if(event) {
                event.unbind('change', xxx);
              }
              event = addEvent.startNew(ongoing);
              ongoing = null;
              setState(edit_ongoing);
            });
          },
          update: function(model) {
            if(model == ongoing) {
              $d.text( maia.Event.formatSpan(ongoing.getSpan()) );
            }
          },
          exit: function() {
            $space.removeClass('closed');
            $add.addClass('supressed');
            $ing.addClass('supressed');
            $d.addClass('supressed');
          }
        }),
        edit_ongoing = {
          enter: function () {
            $space.addClass('open');
            $ing.removeClass('supressed');
            if(ongoing) {
              $minz.addClass('supressed');
            }
            else {
              $minz.removeClass('supressed');
            }
          },
          action: function() {
            ongoing = event;
            event = null;
            setState(idle_ongoing);
          },
          update: function () {
            if(!event.isEndImplied() && state != edit_ok) {
              setState(edit_ok);
            }
          },
          exit: function () {
            $space.removeClass('open');
            if(!ongoing) {
              $ing.addClass('supressed');
            }
            $minz.addClass('supressed');
          }
        },
        edit_ok = {
          enter: function () {
            $space.addClass('open');
            $ok.removeClass('supressed');
          },
          action: function() {
            if(ongoing) {
              setState(idle_ongoing);
            }
            else {
              setState(idle);
            }
          },
          update: function () {
            if(event.isEndImplied() && state != edit_ongoing) {
              setState(edit_ongoing);
            }
          },
          exit: function () {
            $space.removeClass('open');
            $ok.addClass('supressed');
          }
        };
        
    setState(idle);
        
    $container.find('.action').bind('click', function() {
      state.action();
    });
    
    function setState(s) {
      state && state.exit();
      state = s;
      state.enter();
    }
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
        setTimeout(function() {
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