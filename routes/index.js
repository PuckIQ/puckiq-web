var express = require('express');
var PuckIQHandler = require('./puckiq');
var AjaxHandler = require('./ajax');

module.exports = exports = function (app, request) {
  var puckIQHandler = new PuckIQHandler(app, request);
  var ajaxHandler = new AjaxHandler(app, request);

  // Handle Primary Requests Here
  app.get('/', puckIQHandler.getHome);
  app.get('/player-wowy', puckIQHandler.getPlayerWowy);
  app.get('/player-woodmoney', puckIQHandler.getPlayerWoodmoney);
  app.get('/player-search', puckIQHandler.getPlayerWowy);
  app.get('/_template', puckIQHandler.getTemplate);

  app.get('/error404', puckIQHandler.get404);

  // Handle All AJAX Requests Here
  //app.get('/ajax/:pqreq?', ajaxHandler.getAjaxRequest);
  app.get('/ajax/player-wowy-range', ajaxHandler.getPlayerRangeWowy);
  app.get('/ajax/player-wowy-season', ajaxHandler.getPlayerSeasonWowy);
  app.get('/ajax/player-woodmoney-range', ajaxHandler.getPlayerSeasonWowy);
  app.get('/ajax/player-woodmoney-season', ajaxHandler.getPlayerSeasonWowy);
}