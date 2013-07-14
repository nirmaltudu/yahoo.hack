var express = require('express');
var fs = require('fs');
var q = require('./query_place');

var app = express();

app.get('/', function(request, response) {
  q.get_location('panjim', 'kolkata', '18/08/2013');
  var data = fs.readFileSync('client_data.json');
  response.send(data.toString());
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
