(function() {
  maia.Glow = Glow;
  function Glow($container) {
    var $launchpad = $('.launchpad'),
        $editor = $('.event_editor'),
    
        events = new Backbone.Collection(),
        // strip = new maia.Strip( $container.find('.strip'), events ),
        sleep = new ListEntry( $launchpad.find('.sleep'), events),
        notes = new ListEntry( $launchpad.find('.notes') ),
        editor = new EventEditor( $editor );
        
    sleep.bind('add', function() {
      var event = new maia.Event({
        start: maia.Event.getNow(),//new Date(2000,0,1,2,50),//maia.Event.getNow(1200000)
        end: null,//maia.Event.getNow()//null
        isCurrent: true
      });
      $launchpad.addClass('out');
      editor.edit(event);
    });
    // strip.bind('selected', function(event) {
    //   sleep.resume(event);// TEMP DEBUG
    // });
  }
  
  function ListEntry($container, events) {
    _.extend(this, Backbone.Events);
    var $add = $container.find('.add'),
        _this = this;
    $add.bind('click', function() {
      _this.trigger('add');
    });
  }
  
  function EventEditor($container) {
    var event,
        $start = $container.find('.start.field'),
        $end = $container.find('.end.field'),
        
        $clock = $container.find('.clock'),
        clock = new maia.Clock($clock.css({ height:$clock.width() }));

    this.edit = function(_event) {
      if(event)
        event.unbind('change', update);
        
      $container.removeClass("out");
      
      event = _event;
      event.bind('change', update);
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