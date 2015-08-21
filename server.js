var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var app = express();
var phantom = require('phantom');

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
  console.log($('.userContent').text());

  $('.userContent').each(function(i, elem){
    var text = $(this).text();
    text = text.trim();
    if(text){posts.push({
      text: text
    });
    }
  });


  /*
  $('.userContentWrapper').each(function(i, element) {
    var text = $(this).children().attr('data-hover');
    posts.push({
      text: text
    });
  });*/
  console.log(posts);
  return posts;
};


var getPosts = function(res, id) {
  phantom.create(function(ph){
    ph.createPage(function (page){
      var url = 'http://facebook.com/' + id;
      console.log('Getting the html for ' + url);
      page.open(url, function(status) {
        console.log('status', status);
        page.evaluate(function () {
          return document.querySelectorAll('div [role="main"]')[1].innerHTML;
        }, function (result) {
          posts = parsePosts(result);

          res.send({
            posts: posts
          });
          ph.exit();
        });
      });
    });
  });
};

var allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

  //Question - intercept OPTIONS method - How would the OPTION method ever be called?
  //Wouldn't it always be a GET?
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
var port = process.env.PORT || 3200;
app.listen(port);
