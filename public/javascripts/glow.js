(function() {
  maia.Glow = Glow;
  function Glow($container) {
    var $launchpad = $('.launchpad'),
        $editor = $('.event_editor'),
    
        events = new Backbone.Collection(),
        strip = new maia.Strip( $('.strip'), events ),
        sleep = new ListEntry( $launchpad.find('.sleep'), events),
        notes = new ListEntry( $launchpad.find('.notes') ),
        editor = new EventEditor( $editor );

    sleep.bind('add', function() {
      var event = new maia.Event({
        isNew: true,
        start: maia.Event.getNow(),
        end: null,
        creator: sleep
      });
      events.add(event);
      $editor.removeClass('out');
      $launchpad.addClass('out');
      editor.edit(event);
    });
    
    editor.bind('ok', function(event) {
      $editor.addClass('out');
      $launchpad.removeClass('out');
      editor.edit(null);
    });
    editor.bind('x', function(event) {
      $editor.addClass('out');
      $launchpad.removeClass('out');
      events.remove(event);
      editor.edit(null);
      event.destroy();
      event = null;
    });
    strip.bind('select', function(event) {
      $editor.removeClass('out');
      $launchpad.addClass('out');
      editor.edit(event);
    });
  }
  
  function ListEntry($container, events) {
    _.extend(this, Backbone.Events);
    var $add = $container.find('.add'),
        _this = this;
    $add.bind('click', function() { _this.trigger('add'); });
    
    if(events) {
      var $ing = $container.find('.ing');
      (this.update = function() {
        if(events.any(function(event) { return event.isEndImplied(); })) {
          $ing.show();
        }
        else {
          $ing.hide();
        }
      })();
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