(function() {
  var START = 'start', END = 'end', IMPLIED_END = 'impliedEnd',
      FORMATTED_START = 'fStart', FORMATTED_END = 'fEnd';
  maia.Event = Backbone.Model.extend({
    initialize: function(hash) {
      if(!this.get(END)) {
        var _this = this,
            implied = {
              impliedInterval: setInterval(function() { _this.updateImpliedEnd(); }, 1000)
            };
        implied[IMPLIED_END] = maia.Event.getNow();
        this.set(implied);
      }
    },
    
    set: function(attributes, options) {
      if(attributes[START]) {
        attributes.fStart = this.format(attributes[START]);
      }
      if(attributes[END]) {
        attributes[FORMATTED_END] = this.format(attributes[END]);
        if(this.get(IMPLIED_END)) {
          attributes[IMPLIED_END] = null;
        }
      }
      if(attributes[IMPLIED_END]) {
        attributes[FORMATTED_END] = this.format(attributes[IMPLIED_END], true);
      }
      Backbone.Model.prototype.set.call(this, attributes, options);
    },
    
    format: function(date, hasSeconds) {
      return date.getHours() + ':' + String(date.getMinutes() + 100).substr(1) + (hasSeconds ? ':' + String(date.getSeconds() + 100).substr(1) : '');
    },
    
    isEndImplied: function() {
      return !!this.get(IMPLIED_END);
    },
    
    increment: function(field, amount, snap) {
      if(field == END && !this.get(END)) {
        clearInterval(this.get('impliedInterval'));
        this.set({ end:new Date(this.get(IMPLIED_END)) });
      }
      else if(!this.get(field)) {
        throw new Error('Unknown field, ' + field);
      }
      
      var setter = {};
      setter[field] = maia.Event.getIncremented(this.get(field), amount, snap);
      this.set(setter);
    },
    
    updateImpliedEnd: function() {
      var implied = {};
      implied[IMPLIED_END] = maia.Event.getNow();
      this.set(implied);
    }
  },
  
  // STATIC methods
  {
    getIncremented: function(date, amount, snap) {
      var ms = Number(date) + amount;
      if(snap) {
        ms = Math[amount >= 0 ? 'floor' : 'ceil'](ms / snap) * snap;
      }
      return new Date(ms);
    },
    
    getNow: function(minus) {
      var t = new Date(Date.now() - (minus || 0));
      t.setMilliseconds(0);
      return t;
    }
  });
  
})();