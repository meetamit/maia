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
        start: maia.Event.getNow(),//new Date(2000,0,1,2,50),//maia.Event.getNow(1200000)
        end: null//maia.Event.getNow()//null
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
      editor.edit(null);
      events.remove(event);
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
      if(event) {
        event.set({ isEditing: false });
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
      if(!model || model.hasChanged('fStart')) {
        $start.find('.t').html(event.get('fStart').toString());
      }
      
      if(!model || model.hasChanged('fEnd')) {
        $end.find('.t').html(event.get('fEnd').toString());
      }
    };
  }
})();