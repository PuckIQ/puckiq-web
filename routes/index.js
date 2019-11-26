"use strict";

const LocalCache = require('../common/local_cache');
const ServiceLocator = require('../common/service_locator');
const ErrorHandler = require('../common/error_handler');

const PuckIQHandler = require('./puckiq');
const WoodmoneyHandler = require('./woodmoney');
const WoodwowyHandler = require('./woodwowy');

module.exports = function (app, request, config) {

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
    let woodmoneyHandler = new WoodmoneyHandler(app, locator);
    let woodwowyHandler = new WoodwowyHandler(app, locator);

    // Handle Primary Requests Here
    app.get('/', puckIQHandler.getHome);
    app.get('/about', puckIQHandler.getAbout);
    app.get('/glossary', puckIQHandler.getGlossary);

    app.get('/woodmoney', woodmoneyHandler.getWoodmoney('chart'));
    app.get('/woodmoney/data', woodmoneyHandler.getWoodmoney('data'));
    app.get('/woodmoney/download', woodmoneyHandler.downloadWoodmoney);
    app.post('/woodmoney/data', woodmoneyHandler.xhrWoodmoneyData);
    app.post('/woodmoney/chart', woodmoneyHandler.xhrWoodmoneyChartData);

    app.get('/players/:player', woodmoneyHandler.getPlayerWoodmoney);
    app.get('/players/:player/download', woodmoneyHandler.downloadPlayerWoodmoney);

    app.get('/woodwowy', woodwowyHandler.getWoodwowy);
    app.get('/woodwowy/download', woodwowyHandler.downloadWoodwowy);

    app.get('/_template', puckIQHandler.getTemplate);

    app.get('/error404', puckIQHandler.get404);
    app.get('/version', (req, res) => res.send("1.0.2"));

};
