var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var app = express();
var phridge = require('phridge');

var sendError = function(res, errorMessage) {
  res.send({
    'type': 'error',
    'message': errorMessage
  });
};

var parsePosts = function(body){
  var $ = cheerio.load(body);
  var posts = [];

  $('.userContentWrapper').each(function(i, elem){
    var date = $(this).find('._5ptz').attr('title');
    var text = $(this).find('.userContent').text();
    text = text.trim();
    if(text){posts.push({
      date: date,
      text: text
    });
    }
  });

  return posts;
};


var getPosts = function(res, id) {
  var url = 'http://facebook.com/' + id;
  phridge.spawn()
    .then(function(phantom){
      return phantom.openPage(url);
    })

    .then(function(page){
      return page.run(function(){
        return this.evaluate(function(){
          return document.body.innerHTML;
      });
    });
  })

    .finally(phridge.disposeAll)

    .done(function(body){
      console.log(body);
      posts = parsePosts(body);

      res.send({
        posts:posts
      });
    }, function(err){
      throw err;
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
