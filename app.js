const env = process.env.NODE_ENV || 'staging'; //tmp checkin till Zsolt gets build setup
const config = require('./config.js')[env];

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const favicon = require('serve-favicon');

const app = express();

app.set('views', [
  path.join(__dirname, 'views'),
  path.join(__dirname, 'ajax')
]);
app.set('view engine', 'ejs');
app.use(require('express-ejs-layouts'));
app.set('layout', '__layouts/main');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, '/public/puckiq/img/favicon.ico')));

const routes = require('./routes');
const http = require('http');
const server = http.createServer(app);

console.log("env", env);
console.log("api host", config.api.host);
app.locals.title = config.site.title;
app.locals.author = config.site.author;
app.locals.description = config.site.description;
app.locals.skin = config.site.skin;
app.locals.api_host = config.api.host;

routes(app, null, config);

console.log("running server on port", 5000);
server.listen(5000, function () {
    server.close(function() {
        server.listen(5000);
    });
});