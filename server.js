var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var app = express();

var sendError = function(res, errorMessage) {
  res.send({
    'type': 'error',
    'message': errorMessage
  });
};

var sendFacebookRSS = function(res, id) {
  request({
    url: 'https://www.facebook.com/feeds/page.php?format=rss20&id=' + id,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.124 Safari/537.36'
    }
  }, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      console.log(body);
      res.send(body);
    }
  });
};

var allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

  // intercept OPTIONS method
  if ('OPTIONS' == req.method) {
    res.send(200);
  }
  else {
    next();
  }
};

app.use(allowCrossDomain);
app.get('/:id?', function(req, res){
  var id = req.params.id;

  if (!id) {
    sendError(res, 'Please send a valid id');
  } else {
    sendFacebookRSS(res, id);
  }

});

var port = process.env.PORT || 3000;
app.listen(port);
