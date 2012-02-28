(function() {
  maia.Glow = Glow;
  function Glow($container) {
    var $launchpad = $('.launchpad'),
        $editor = $('.event_editor'),
    
        events = new Backbone.Collection(),
        strip = new maia.Strip( $('.strip'), events ),
        sleep = new ListEntry( $launchpad.find('.sleep'), events),
        eat = new ListEntry( $launchpad.find('.eat') ),
        notes = new ListEntry( $launchpad.find('.notes') ),
        editor = new EventEditor( $editor );

    sleep.bind('add', function() {
      var event = new maia.Event({
        isNew: true,
        isRange: true,
        start: maia.Event.getNow(),
        end: null,
        creator: sleep
      });
      events.add(event);
      openEditor(event);
    });
    sleep.bind('select', function(event) {
      openEditor(event);
    });
    
    eat.bind('add', function() {
      var event = new maia.Event({
        isNew: true,
        isRange: false,
        start: maia.Event.getNow()
      });
      events.add(event);
      openEditor(event);
    });
    
    editor.bind('ok', function(event) {
      openList();
    });
    editor.bind('x', function(event) {
      events.remove(event);
      openList();
      event.destroy();
    });
    strip.bind('select', function(event) {
      openEditor(event);
    });
    
    function openList() {
      $editor.addClass('out');
      $launchpad.removeClass('out');
      editor.edit(null);
    }
    function openEditor(eventToEdit) {
      $editor.removeClass('out');
      $launchpad.addClass('out');
      editor.edit(eventToEdit);
    }
  }
  
  function ListEntry($container, events) {
    _.extend(this, Backbone.Events);
    var $add = $container.find('.add'),
        _this = this;
    $add.bind('click', function() { _this.trigger('add'); });
    
    if(events) {
      var $ing = $container.find('.ing'),
          $ongoing = $container.find('.ongoing'),
          $duration = $ongoing.find('.duration'),
          $pause = $container.find('.pause'),
          changeBinding = null,
          _this = this;
      (this.update = function() {
        if(findOngoingEvent()) {
          $ing.show();
          $ongoing.show();
          if(!changeBinding) {
            events.bind('change:impliedEnd', changeBinding = function(ongoingEvent) {
              $duration.html( maia.Event.formatSpan(ongoingEvent.getSpan()) );
            });
          }
          $duration.html( maia.Event.formatSpan(findOngoingEvent().getSpan()) );
        }
        else {
          $ing.hide();
          $ongoing.hide();
          if(changeBinding) {
            events.unbind('change:impliedEnd', changeBinding);
            changeBinding = null;
          }
        }
      })();
      
      $duration.bind('click', function() {
        _this.trigger('select', findOngoingEvent());
      });
      $pause.bind('click', function() {
        findOngoingEvent().set({ end: new Date(Date.now() - 101) });// -101 is a hack to get the end to be un-implied
        _this.update();
      });
    }
    
    function findOngoingEvent() {
      return events.find(function(event) { return event.isEndImplied(); });
    }
  }
  
  function EventEditor($container) {
    _.extend(this, Backbone.Events);
    var event,
        $ing = $container.find('label .ing'),
        $ok = $container.find('.ok'),
        $x = $container.find('.x'),
        $start = $container.find('.start.field'),
        $end = $container.find('.end.field'),
        
        $clock = $container.find('.clock'),
        clock = new maia.Clock($clock.css({ height:$clock.width() })),
        
        _this = this;
        
    $ok.bind('click', function() { _this.trigger('ok', event); });
    $x.bind('click', function() { _this.trigger('x', event); });

    this.edit = function(_event) {
      if(event) {
        event.set({ 
          isEditing: false,
          isNew: false
        });
        event.get('creator') && event.get('creator').update();// Update list entry creator (i.e sleep ListEntry updating it's $ing)
        event.unbind('change', update);
      }
        
      event = _event;
      
      if(!event) return;
      
      event.bind('change', update);
      event.set({ isEditing: true });
      update(null);
      clock.setEvent(event);
    };
    
    function update(model) {
      if(!model || model.hasChanged('isNew')) {
        $x.text(event.get('isNew') ? 'Cancel' : 'Delete');
      }

      var isEndImplied = null;
      if(!model) {
        isEndImplied = event.isEndImplied();
      }
      else if(model.hasChanged('impliedEnd')) {
        if(model.previous('impliedEnd') == null) {
          isEndImplied = true;
        }
        else if(model.get('impliedEnd') == null) {
          isEndImplied = model.isEndImplied();
        }
      }
      if(isEndImplied !== null) {
        $ok.text(isEndImplied ? 'Close' : 'Done');
        $ing[isEndImplied ? 'show' : 'hide']();
      }
      
      if(!model || model.hasChanged('fStart')) {
        $start.find('.t').html(event.get('fStart').toString());
      }
      
      if(!model || model.hasChanged('fEnd')) {
        $end.find('.t').html(event.get('fEnd').toString());
      }
    };
  }
})();