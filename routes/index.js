var express = require('express');
var PuckIQHandler = require('./puckiq');
var AjaxHandler = require('./ajax');

module.exports = exports = function (app, request) {
  var puckIQHandler = new PuckIQHandler(app, request);
  var ajaxHandler = new AjaxHandler(app, request);

  // Handle Primary Requests Here
  app.get('/', puckIQHandler.getHome);
  app.get('/player-wowy', puckIQHandler.getPlayerWowy);

  app.get('/error404', puckIQHandler.get404);

  // Handle All AJAX Requests Here
  app.get('/ajax/:pqreq?', ajaxHandler.getAjaxRequest);
}