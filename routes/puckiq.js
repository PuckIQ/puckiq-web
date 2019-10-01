const _ = require('lodash');
const express = require('express');
const url = require('url');
const stringify = require('csv-stringify/lib/es5');
const constants = require('../common/constants');
const utils = require('../common/utils');
const AppException = require('../common/app_exception');
const csv_file_definition = require('../common/woodmoney_csv_file_definition');
const WoodmoneyService = require('../services/woodmoney');
const WoodwowyService = require('../services/woodwowy');
const PlayerService = require('../services/player');

function PuckIQHandler(app, locator) {

    const controller = this;

    let cache = locator.get('cache');
    let error_handler = locator.get('error_handler');

    let wm = new WoodmoneyService(locator);
    let woodwowy = new WoodwowyService(locator);
    let players = new PlayerService(locator);

    controller.getHome = function(req, res) {
        app.use(express.static('views/home/public'));
        cache.init().then((iq) => {

            let division_teams = _.chain(_.values(iq.teams)).filter(x => x.active !== false).groupBy(x => x.division).value();

            let divisions = _.map(_.keys(division_teams), x => {
                return { name: x, teams: _.sortBy(division_teams[x], y => y.name) };
            });

            res.render('home/index', {
                pgname: 'home',
                divisions: divisions,
                season: iq.current_woodmoney_season
            });

        }, (err) => {
            console.log("Error: " + err); //TODO better
            return error_handler.handle(req, res, err);
        });
    };

    controller.getAbout = function(req, res) {
        app.use(express.static('views/home/public'));
        res.render('home/about', { pgname: 'home' });
    };

    controller.getGlossary = function(req, res) {
        app.use(express.static('views/home/public'));
        res.render('home/glossary', { pgname: 'home' });
    };

    controller.getPlayerWowy = function(req, res) {
        app.use(express.static('views/player-wowy/public'));
        res.render('player-wowy/index', { pgname: 'player-wowy' });
    };

    controller.searchPlayers = function(req, res) {
        //todo implement??
        // app.use(express.static('views/player-wowy/public'));
        res.render('player-search/index', { pgname: 'player-search' });
    };

    controller.getWoodmoney = function(req, res) {

        controller._getWoodmoney(req.query).then((data) => {
            res.render('woodmoney/index', getWoodmoneyPage(data, req.url));
        }, (err) => {
            return error_handler.handle(req, res, err);
        });

    };

    controller.downloadWoodmoney = function(req, res) {

        let options = _.extend({ }, req.query, { count: 10000});

        controller._getWoodmoney(options).then((data) => {

            let records = [];

            if(data.results && data.results.length) {
                records = csv_file_definition.build(data);
            }

            let file_name = `woodmoney.csv`;

            res.setHeader('Content-Disposition', `attachment; filename=${file_name}`);
            res.setHeader('Content-Type', 'text/csv');

            stringify(records, { quoted_string: true }, (err, content) => {
                res.send(content);
            });

        }, (err) => {
            return error_handler.handle(req, res, err);
        });

    };

    controller.getPlayerWoodmoney = function(req, res) {

        if(!_.has(req.params, "player")) {
            return error_handler.handle(req, res, new AppException(constants.exceptions.missing_argument, "Missing argument: player"));
        }

        let options = _.extend({ player: req.params.player }, req.query);

        controller._getWoodmoney(options).then((data) => {
            res.render('woodmoney/index', getWoodmoneyPage(data, req.url));
        }, (err) => {
            return error_handler.handle(req, res, err);
        });
    };

    controller.downloadPlayerWoodmoney = function(req, res) {

        if(!_.has(req.params, "player")) {
            return error_handler.handle(req, res, new AppException(constants.exceptions.missing_argument, "Missing argument: player"));
        }

        let options = _.extend({ player: req.params.player }, req.query);

        controller._getWoodmoney(options).then((data) => {

            let records = [];

            if(data.results && data.results.length) {
                records = csv_file_definition.build(data);
            }

            let player_name = data.player.name.replace(/\s/g, "_");
            let file_name = `${player_name}_woodmoney.csv`;

            res.setHeader('Content-Disposition', `attachment; filename=${file_name}`);
            res.setHeader('Content-Type', 'text/csv');

            stringify(records, { quoted_string: true }, (err, content) => {
                res.send(content);
            });

        }, (err) => {
            return error_handler.handle(req, res, err);
        });

    };

    controller.getTeamWoodmoney = function(req, res) {

        if(!_.has(req.params, 'team')) {
            return error_handler.handle(req, res, new AppException(constants.exceptions.missing_argument, "Missing argument: team"));
        }

        let options = _.extend({ team: req.params.team }, req.query);

        controller._getWoodmoney(options).then((data) => {
            res.render('woodmoney/index', getWoodmoneyPage(data, req.url));
        }, (err) => {
            return error_handler.handle(req, res, err);
        });

    };

    controller.downloadTeamWoodmoney = function(req, res) {

        if(!_.has(req.params, 'team')) {
            return error_handler.handle(req, res, new AppException(constants.exceptions.missing_argument, "Missing argument: team"));
        }

        let options = _.extend({ team: req.params.team }, req.query, {count : 1000});

        controller._getWoodmoney(options).then((data) => {

            let records = [];

            if(data.results && data.results.length) {
                records = csv_file_definition.build(data);
            }

            let team_name = data.team.name.replace(/\s/g, "_");
            let file_name = `${team_name}_woodmoney.csv`;

            res.setHeader('Content-Disposition', `attachment; filename=${file_name}`);
            res.setHeader('Content-Type', 'text/csv');

            stringify(records, { quoted_string: true }, (err, content) => {
                res.send(content);
            });

        }, (err) => {
            return error_handler.handle(req, res, err);
        });

    };

    controller._getWoodmoney = function(options) {

        return new Promise((resolve, reject) => {

            cache.init().then((iq) => {

                //always do 50 for now...
                options = _.extend({}, { count: constants.MAX_COUNT }, options);

                wm.query(options, iq).then((data) => {
                    return resolve(data);
                }, (err) => {
                    return reject(err);
                });
            });
        });
    };

    function getWoodmoneyPage(data, base_url) {

        let page = {};

        let sub_title = '';
        if (data.team) {
            sub_title = data.team.name;
        } else if (data.player) {
            sub_title = data.player.name;
        }

        page.title = `PuckIQ | Woodmoney ${sub_title ? '| ' + sub_title : ''}`;
        page.sub_title = `${sub_title || 'Woodmoney'}`;

        if (!(data.request.from_date && data.request.to_date)) {
            data.request.season = data.request.season || 'all';
        } else {
            page.is_date_range = true;
            data.request.from_date_str = utils.dateString(data.request.from_date);
            data.request.to_date_str = utils.dateString(data.request.to_date);
        }

        //delete selected_positions its not used by the backend
        let _request = _.extend({}, data.request, {selected_positions: null});
        delete _request._id;
        _.each(_.keys(_request), key => {
            if (_request[key] === null) delete _request[key];
        });

        base_url = url.parse(base_url).pathname;

        page.download_url = `${base_url}/download?${utils.encode_query(_request)}`;

        //required for ejs
        data.player = data.player || null;
        data.team = data.team || null;

        return _.extend(page, data);
    }

    controller.getWoodwowy = function(req, res) {

        if (!req.query.player) {
            return res.render('woodwowy/index', getWoodwowyPage({ request: {}}, req.url));
        }

        if (!req.query.teammate) {
            //todo get player
            players.getById(req.query.player).then((player) => {
                res.render('woodwowy/index', getWoodwowyPage({player}, req.url));
            }, (err) => {
                return error_handler.handle(req, res, err);
            });
        } else {
            controller._getWoodwowy(req.query).then((data) => {
                res.render('woodwowy/index', getWoodwowyPage(data, req.url));
            }, (err) => {
                return error_handler.handle(req, res, err);
            });
        }
    };

    controller.downloadWoodwowy = function(req, res) {

        let options = _.extend({ }, req.query, { count: 10000});

        controller._getWoodwowy(options).then((data) => {

            let records = [];

            if(data.results && data.results.length) {
                records = csv_file_definition.build(data);
            }

            let file_name = `woodmoney.csv`;

            res.setHeader('Content-Disposition', `attachment; filename=${file_name}`);
            res.setHeader('Content-Type', 'text/csv');

            stringify(records, { quoted_string: true }, (err, content) => {
                res.send(content);
            });

        }, (err) => {
            return error_handler.handle(req, res, err);
        });

    };

    controller._getWoodwowy = function(options) {

        return new Promise((resolve, reject) => {

            cache.init().then((iq) => {

                options = _.extend({}, { count: constants.MAX_COUNT }, options);

                woodwowy.query(options, iq).then((data) => {
                    return resolve(data);
                }, (err) => {
                    return reject(err);
                });
            });
        });
    };

    controller.getTemplate = function(req, res) {
        app.use(express.static('views/_template/public'));
        res.render('_template/index', { pgname: 'template' });
    };

    controller.get404 = function(req, res) {
        app.use(express.static('views/error404/public'));
        res.render('error404/index');
    };
}

function getWoodwowyPage(data, base_url) {

    data.request = data.request || {};

    let page = {};

    if(data.teammates && data.teammates.length){
        data.teammate = data.teammates[0];
    }

    if(data.player && data.teammate){
        page.title = `PuckIQ | Wowy | ${data.player.name}`;
        page.sub_title = `with ${data.teammate.name}`;
    } else {
        page.title = `PuckIQ | Wowy`;
        page.sub_title = `Woodwowy`;
    }

    if (!(data.request.from_date && data.request.to_date)) {
        data.request.season = data.request.season || 'all';
    } else {
        page.is_date_range = true;
        data.request.from_date_str = utils.dateString(data.request.from_date);
        data.request.to_date_str = utils.dateString(data.request.to_date);
    }

    //delete selected_positions its not used by the backend
    let _request = _.extend({}, data.request || {});
    delete _request._id;
    _.each(_.keys(_request), key => {
        if (_request[key] === null) delete _request[key];
    });

    base_url = url.parse(base_url).pathname;

    page.download_url = `${base_url}/download?${utils.encode_query(_request)}`;

    data.player = data.player || null;
    data.teammate = data.teammate || null;
    data.results = data.results || [];

    return _.extend(page, data);
}

module.exports = PuckIQHandler;
