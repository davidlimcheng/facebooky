var express = require('express');
var request = require('request');
var Browser = require('zombie');
var cheerio = require('cheerio');
var app = express();

var sendError = function(res, errorMessage) {
  res.send({
    'type': 'error',
    'message': errorMessage
  });
};

var parsePosts = function(body){
  var $ = cheerio.load(body);
  var posts = [];
  //test
  console.log($('#pagelet_timeline_main_column').html());


  //not functional
  $('.userContentWrapper').each(function(i, element) {
    var text = $(this).children().attr('data-hover');
    posts.push({
      text: text
    });
  });
  return posts;
};


var getPosts = function(res, id) {
  //multiple waitFor calls to equal 10 seconds
  browser = new Browser({waitFor:5000});
  browser.visit('http://facebook.com/'+id, {waitFor:5000}, function (body) {
      body = browser.html('body');
      var posts = parsePosts(body);
      res.send({
        id: id,
        posts: posts
      });
    }
  );
};

var allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

  /** Question - intercept OPTIONS method - How would the OPTION method ever be utilized?
  Wouldn't it always be a GET? **/
  if ('OPTIONS' == req.method) {
    res.send(200);
  }
  else {
    next();
  }
};

app.use(allowCrossDomain);
//Possibly use app.all(...) here, then we wouldn't need to intercept OPTIONS?
app.get('/:id?', function(req, res){
  var id = req.params.id;
  var posts = [];

  if (!id) {
    sendError(res, 'Please send a valid id');
  } else {
    posts = getPosts(res, id);
  }

});

/**
var sendFacebookRSS = function(res, id) {
  request({
    url: 'https://www.facebook.com/feeds/page.php?format=rss20&id=' + id,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.124 Safari/537.36'
    }
  }, function (error, response, body) {
    if (!error && response.statusCode === 200) {

      parseString(body, function (err, result) {
        res.send(result);
      });
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

/**
 * Since we're showing personal pictures, make sure we only pass data over https

var forceSSL = function(req, res, next) {
  if (req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(['https://', req.get('Host'), req.url].join(''));
  }
  return next();
};

// When in production, force SSL
if (env === 'production') {
  app.use(forceSSL);
}
app.use(allowCrossDomain);

app.get('/:id?', function(req, res){
  var id = req.params.id;

  if (!id) {
    sendError(res, 'Please send a valid id');
  } else {
    sendFacebookRSS(res, id);
  }

});

**/
var port = process.env.PORT || 3200;
app.listen(port);
