(function() {
  maia.Glow = Glow;
  function Glow($container) {
    var $launchpad = $('.launchpad'),
        $editor = $('.event_editor'),
    
        events = new (Backbone.Collection.extend({
          model: maia.Event,
          localStorage: new Store('maia-events'),
          parse: function(response) {
            _.each(response, function(hash) {
              hash.start = new Date( Date.parse(hash.start) );
              hash.end = hash.end && new Date( Date.parse(hash.end) );
              hash.impliedEnd = hash.impliedEnd && new Date( Date.parse(hash.impliedEnd) );
            });
            return response;
          }
        }))(),
        strip = new maia.Strip( $('.strip'), events ),
        sleep = new ListEntry( $launchpad.find('.sleep'), 'sleep', events),
        eat = new ListEntry( $launchpad.find('.eat'), 'eat' ),
        notes = new ListEntry( $launchpad.find('.notes') ),
        editor = new EventEditor( $editor );

    events.fetch({ add:true });
    var editing = events.find(function(event) { return event.get('isEditing'); });
    if(editing) {
      openEditor(editing);
    }

    sleep.bind('add', function() {
      var event = events.create({
        creator: this.type,
        isNew: true,
        isRange: true,
        start: maia.Event.getNow(),
        end: null
      });
      openEditor(event);
    });
    sleep.bind('select', function(event) {
      openEditor(event);
    });
    
    eat.bind('add', function() {
      var event = new maia.Event({
        creator: this.type,
        isNew: true,
        isRange: false,
        start: maia.Event.getNow()
      });
      events.add(event);
      openEditor(event);
    });
    
    editor.bind('ok', function(event) {
      openList();
      event.save();
    });
    editor.bind('x', function(event) {
      event.destroy();
      openList();
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
  
  function ListEntry($container, type, events) {
    _.extend(this, Backbone.Events);
    if(type) { 
      this.type = type;
      ListEntry[this.type] = this;
    }
    this.$container = $container;
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
    else {
      this.update = function() {};// no-op
    }
    
    function findOngoingEvent() {
      return events.find(function(event) { return event.isEndImplied(); });
    }
  }
  
  function EventEditor($container) {
    _.extend(this, Backbone.Events);
    var event,
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
      if(event && event.collection) {// event.collection is null if event is destroyed
        event.save({ 
          isEditing: false,
          isNew: false
        });
        var creator = ListEntry[event.get('creator')];
        creator.update();// Update list entry creator (i.e sleep ListEntry updating it's $ing)
        $container.removeClass(creator.$container.attr('class'));
        event.unbind('change', update);
      }
        
      event = _event;
      
      if(!event) return;
      
      event.bind('change', update);
      event.save({ isEditing: true });
      
      var creator = ListEntry[event.get('creator')];
      $container.addClass(creator.$container.attr('class'));
      $container.children().eq(0).html(  creator.$container.find('label').html()  );
      if(event.get('isRange')) {
        $start.find('label').text('FROM');
        $end.show();
      }
      else {
        $start.find('label').text('TIME');
        $end.hide();
      }
      update(null);
      clock.setEvent(event);
    };
    
    function update(model) {
      if(!model || model.hasChanged('isNew')) {
        $x.text(event.get('isNew') ? 'Cancel' : 'Delete');
      }
      
      if(model && model.hasChanged('isTransient') && !model.get('isTransient')) {
        event.save();
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
        $container.find('label .ing')[isEndImplied ? 'show' : 'hide']();
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