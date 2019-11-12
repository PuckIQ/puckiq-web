const _ = require('lodash');
const url = require('url');
const stringify = require('csv-stringify/lib/es5');
const constants = require('../common/constants');
const utils = require('../common/utils');
const AppException = require('../common/app_exception');
const WoodmoneyService = require('../services/woodmoney');
const PlayerService = require('../services/player');

const woodmoney_csv_file_definition = require('../common/woodmoney_csv_file_definition');

function WoodmoneyHandler(app, locator) {

    const controller = this;

    let cache = locator.get('cache');
    let error_handler = locator.get('error_handler');

    let wm = new WoodmoneyService(locator);
    let players = new PlayerService(locator);

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
                records = woodmoney_csv_file_definition.build(data);
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
                records = woodmoney_csv_file_definition.build(data);
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
                records = woodmoney_csv_file_definition.build(data);
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

    controller.getTeamWoodmoneyChart = function(req, res) {

        if (!_.has(req.params, 'team')) {
            return error_handler.handle(req, res, new AppException(constants.exceptions.missing_argument, "Missing argument: team"));
        }

        let selected_positions = { f : true};
        _.each(_.keys(constants.positions), pos => selected_positions[pos] = true);

        cache.init().then((iq) => {

            //default empty page... not much to do here...
            let data = _.extend({
                season :  iq.current_woodmoney_season,
                request: { selected_positions }
            }, req.query);

            let team = req.params.team.toLowerCase();
            data.team = (team && iq.teams[team]) || null;

            let page = getWoodmoneyPage(data, req.url);

            res.render('woodmoney/chart', page);
        });

    };

    controller.woodmoneyChartData = function(req, res) {

        if(!_.has(req.body, 'team')) {
            return error_handler.handle(req, res, new AppException(constants.exceptions.missing_argument, "Missing argument: team"));
        }

        let options = _.extend({ }, req.body);

        controller._getWoodmoney(options).then((woodmoney) => {
            let data = wm.formatChart(woodmoney.results);
            console.log(JSON.stringify(data));
            res.jsonp(data);
        }, (err) => {
            return error_handler.handle(req, res, err);
        });

    };

}

module.exports = WoodmoneyHandler;
