var express = require('express');

app = express.createServer();
// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  
  this.use(require("stylus").middleware({
    src: __dirname + "/public",
    compress: true
  }));
  
  app.use(express.methodOverride());
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({ secret:'maialina' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.listen(process.env.PORT || 3000);


app.get('/', function(req, res) {
  res.render('maia', {
    layout: false
  });
});