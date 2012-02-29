(function() {
  var START = 'start', END = 'end', IMPLIED_END = 'impliedEnd',
      FORMATTED_START = 'fStart', FORMATTED_END = 'fEnd';
      
  var Event = maia.Event = Backbone.Model.extend({
    initialize: function(hash) {
      if(!this.get(END)) {
        var _this = this,
            implied = {};
        implied[IMPLIED_END] = Event.getNow();
        this.set(implied);
      }
    },
    
    set: function(attributes, options) {
      if(attributes[START] && !this.get('isRange') && !attributes['isRange']) {
        attributes[END] = new Date(attributes[START]);// START sets END
      }
      else if(attributes[START] > (attributes[END] || this.get(END))) {
        attributes[END] = new Date(attributes[START]);// START pushes END
      }
      
      // Can't exceed present
      var diff = Date.now() - attributes[END];
      if(this.get('isRange')) {
        if(diff < 100) {
          if(diff < 0) {
            attributes[IMPLIED_END] = Event.getNow();
          }
          else {
            attributes[IMPLIED_END] = attributes[END];
          }
        
          if(attributes[START] && attributes[START] > attributes[IMPLIED_END]) {
            attributes[START] = attributes[IMPLIED_END];
          }
        }
      }
      else {
        if(diff < 100) {
          attributes[START] = Event.getNow();
          attributes[END] = Event.getNow();
        }
      }
      
      // Implied end or normal end
      if(attributes[IMPLIED_END]) {
        if(!this.isEndImplied()) {
          var _this = this;
          attributes.impliedInterval = setInterval(function() { _this.updateImpliedEnd(); }, 1000);
        }
        attributes[END] = attributes[IMPLIED_END];
      }
      else if(attributes[END]) {
        if(this.isEndImplied()) {
          clearInterval(this.get('impliedInterval'));
          attributes[IMPLIED_END] = null;
        }
        
        if(attributes[END] < this.get(START)) {
          attributes[START] = attributes[END];
        }
      }

      // Formatting
      if(attributes[START]) {
        attributes[FORMATTED_START] = this.format(attributes[START]);
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
      var hours = date.getHours(),
          isPM = hours >= 12;
      hours = hours == 12 ? 12 : hours % 12;
      return [
        // (date.getMonth()+1) + '/' + date.getDate() + ' ',
        '<em>',
          hours + ':' + String(date.getMinutes() + 100).substr(1),
        '</em>',
        '<span>',
          hasSeconds ? ':' + String(date.getSeconds() + 100).substr(1) + '<br>' : '',
          isPM ? 'PM' : 'AM',
        '</span>'
      ].join('');
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
      
      if ( future <= Date.now() ) return true;
      else return false;
    },
    
    updateImpliedEnd: function() {
      var implied = {};
      implied[IMPLIED_END] = Event.getNow();
      this.set(implied);
    },
    
    destroy: function() {
      if(this.isEndImplied()) {
        clearInterval(this.get('impliedInterval'));
      }
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
    },
    
    formatSpan: function(span) {
      var seconds = Math.round(span / 1000),
          modSeconds = seconds % 60,
          strSeconds = String(modSeconds + 100).substr(1),
          minutes = Math.floor(seconds / 60),
          modMinutes = minutes % 60,
          strMinutes = String(modMinutes + 100).substr(1),
          hours = Math.floor(minutes / 60);
      return [
        '<em>', hours, ':',
        String(modMinutes + 100).substr(1), '</em>',
        '<span>:', String(modSeconds + 100).substr(1), '</span>'
      ].join('');
    }
  });
  
})();