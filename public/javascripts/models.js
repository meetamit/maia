(function() {
  var START = 'start', END = 'end', IMPLIED_END = 'impliedEnd';
  maia.Event = Backbone.Model.extend({
    initialize: function(hash) {
      if(!this.get('end')) {
        var _this = this,
            implied = {
              impliedEnd: maia.Event.getNow(),
              impliedInterval: setInterval(function() { _this.updateImpliedEnd(); }, 1000)
            };
        this.set(implied);
      }
    },
    
    set: function(attributes, options) {
      if(attributes.start) {
        attributes.fStart = this.format(attributes.start);
      }
      if(attributes.end) {
        attributes.fEnd = this.format(attributes.end);
        if(this.get('impliedEnd')) {
          attributes.impliedEnd = null;
        }
      }
      if(attributes.impliedEnd) {
        attributes.fEnd = this.format(attributes.impliedEnd, true);
      }
      Backbone.Model.prototype.set.call(this, attributes, options);
    },
    
    format: function(date, hasSeconds) {
      return date.getHours() + ':' + String(date.getMinutes() + 100).substr(1) + (hasSeconds ? ':' + String(date.getSeconds() + 100).substr(1) : '');
    },
    
    isEndImplied: function() {
      return !!this.get('impliedEnd');
    },
    
    increment: function(field, amount, snap) {
      if(field == 'end' && !this.get('end')) {
        clearInterval(this.get('impliedInterval'));
        this.set({ end:new Date(this.get('impliedEnd')) });
      }
      else if(!this.get(field)) {
        throw new Error('Unknown field, ' + field);
      }
      
      var setter = {};
      setter[field] = maia.Event.getIncremented(this.get(field), amount, snap);
      this.set(setter);
    },
    
    updateImpliedEnd: function() {
      console.log("tick");
      this.set({ impliedEnd: maia.Event.getNow() });
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