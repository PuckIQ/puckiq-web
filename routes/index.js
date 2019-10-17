"use strict";

const PuckIQHandler = require('./puckiq');
const AjaxHandler = require('./ajax');
const LocalCache = require('../common/local_cache');
const ServiceLocator = require('../common/service_locator');
const ErrorHandler = require('../common/error_handler');

module.exports = exports = function (app, request, config) {

    //bootstrap... todo move
    let cache = new LocalCache(config);
    let locator = new ServiceLocator();

    locator.register('cache', cache);
    locator.register('config', config);
    locator.register('error_handler', ErrorHandler);
    locator.register('request', require('request'));
    locator.register('email_service', require('../services/email')(locator));

    ErrorHandler.init(locator);

    let puckIQHandler = new PuckIQHandler(app, locator);
    let ajaxHandler = new AjaxHandler(app, locator);

    // Handle Primary Requests Here
    app.get('/', puckIQHandler.getHome);
    app.get('/about', puckIQHandler.getAbout);
    app.get('/glossary', puckIQHandler.getGlossary);
    app.get('/woodmoney', puckIQHandler.getWoodmoney);
    app.get('/woodmoney/download', puckIQHandler.downloadWoodmoney);
    app.get('/teams/:team', puckIQHandler.getTeamWoodmoney);
    app.get('/teams/:team/download', puckIQHandler.downloadTeamWoodmoney);
    app.get('/players/:player', puckIQHandler.getPlayerWoodmoney);
    app.get('/players/:player/download', puckIQHandler.downloadPlayerWoodmoney);

    app.get('/woodwowy', puckIQHandler.getWoodwowy);
    app.get('/woodwowy/download', puckIQHandler.downloadWoodwowy);

    app.get('/player-wowy', puckIQHandler.getPlayerWowy);
    app.get('/player-woodmoney', puckIQHandler.getPlayerWoodmoney);
    app.get('/player-search', puckIQHandler.searchPlayers);

    app.get('/_template', puckIQHandler.getTemplate);

    app.get('/error404', puckIQHandler.get404);
    app.get('/version', (req, res) => res.send("1.0.2"));

    // Handle All AJAX Requests Here
    //app.get('/ajax/:pqreq?', ajaxHandler.getAjaxRequest);
    app.get('/ajax/player-player-search', ajaxHandler.getPlayerSearchResults);
    app.get('/ajax/player-wowy-range', ajaxHandler.getPlayerRangeWowy);
    app.get('/ajax/player-wowy-season', ajaxHandler.getPlayerSeasonWowy);
    app.get('/ajax/player-woodmoney-range', ajaxHandler.getPlayerRangeWoodmoney);
    app.get('/ajax/player-woodmoney-season', ajaxHandler.getPlayerSeasonWoodmoney);
};
