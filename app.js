const env = process.env.NODE_ENV || 'local'; //TODO
const config = require('./config.js')[env];

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

var app = express();

app.set('views', [
  path.join(__dirname, 'views'),
  path.join(__dirname, 'ajax')
]);
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//var request = require('request');
var routes = require('./routes'),
  request = require('request'),
  http = require('http'),
  server = http.createServer(app);

app.locals.title = config.site.title;
app.locals.author = config.site.author;
app.locals.description = config.site.description;
app.locals.skin = config.site.skin;
app.locals.api_host = config.api.host;

routes(app, null, config);

console.log("running server on port", 5000);
server.listen(5000, function () {
  server.close(function () {
    server.listen(5000);
  });
});