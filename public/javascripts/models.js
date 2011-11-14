(function() {
  var START = 'start', END = 'end', IMPLIED_END = 'impliedEnd',
      FORMATTED_START = 'fStart', FORMATTED_END = 'fEnd';
      
  var Event = maia.Event = Backbone.Model.extend({
    initialize: function(hash) {
      if(!this.get(END)) {
        var _this = this,
            implied = {
              // impliedInterval: setInterval(function() { _this.updateImpliedEnd(); }, 1000)
            };
        implied[IMPLIED_END] = Event.getNow();
        this.set(implied);
      }
    },
    
    set: function(attributes, options) {
      if(attributes[START]) {
        attributes[FORMATTED_START] = this.format(attributes[START]);
      }
      if(attributes[IMPLIED_END]) {
        if(!this.isEndImplied()) {
          var _this = this;
          attributes.impliedInterval = setInterval(function() { _this.updateImpliedEnd(); }, 1000);
        }
        attributes[END] = attributes[IMPLIED_END];
      }
      else if(attributes[END] && this.isEndImplied()) {
        clearInterval(this.get('impliedInterval'));
        attributes[IMPLIED_END] = null;
      }

      if(attributes[END]) {
        attributes[FORMATTED_END] = this.format(attributes[END], this.isEndImplied() && attributes[IMPLIED_END] !== null);
      }
      
      if(attributes[IMPLIED_END]) {
        attributes[FORMATTED_END] = this.format(attributes[IMPLIED_END], true);
      }
      Backbone.Model.prototype.set.call(this, attributes, options);
    },
    
    format: function(date, hasSeconds) {
      return (//(date.getMonth()+1) + '/' +date.getDate() + ' ' + 
        date.getHours() + ':' + String(date.getMinutes() + 100).substr(1) + (
        hasSeconds ? ':' + String(date.getSeconds() + 100).substr(1) : ''
      ));
    },
    
    isEndImplied: function() {
      return !!this.get(IMPLIED_END);
    },
    
    increment: function(field, amount, snap) {
      if(!this.get(field)) {
        throw new Error('Unknown field, ' + field);
      }
      else {
        var setter = {};
        setter[field] = new Date( Event.getIncremented(this.get(field), amount, snap) );
        this.set(setter);
      }
    },
    
    canIncrement: function(field, amount, snap) {
      var current = this.get(field);
      if(!current) {
        throw new Error('Unknown field, ' + field);
      }
      var future = Event.getIncremented(current, amount, snap);
      
      if( field == START && future <= this.get(END) ) return true;
      else if ( field == END && future >= this.get(START) && future <= Date.now() ) return true;
      else return false;
    },
    
    updateImpliedEnd: function() {
      var implied = {};
      implied[IMPLIED_END] = Event.getNow();
      this.set(implied);
    },

    getSpan: function() { return (this.get(END) || this.get(IMPLIED_END)) - this.get(START); }
  },
  
  // STATIC methods
  {
    getIncremented: function(date, amount, snap) {
      var ms = Number(date) + amount;
      if(snap) {
        ms = Math[amount >= 0 ? 'floor' : 'ceil'](ms / snap) * snap;
      }
      return ms;
    },
    
    getNow: function(minus) {
      var t = new Date(Date.now() - (minus || 0));
      t.setMilliseconds(0);
      return t;
    }
  });
  
})();