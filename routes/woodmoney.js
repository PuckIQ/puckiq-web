"use strict";

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

    const cache = locator.get('cache');
    const error_handler = locator.get('error_handler');

    const wm = new WoodmoneyService(locator);
    const playerService = new PlayerService(locator);

    controller.getWoodmoney = function (view) {

        return function (req, res) {

            let selected_positions = {};
            if(req.query.positions) {
                _.each(_.keys(constants.positions), pos => {
                    selected_positions[pos] = false;
                });
                //this works for array or string
                _.each(req.query.positions, pos => {
                    selected_positions[pos] = true;
                });
                selected_positions.f = !!(selected_positions.c && selected_positions.l && selected_positions.r);
            } else {
                selected_positions.f = true;
                _.each(_.keys(constants.positions), pos => selected_positions[pos] = true);
            }

            cache.init().then((iq) => {

                let request = _.extend({
                    season: iq.current_woodmoney_season._id,
                    selected_positions
                }, req.query);

                if(request.team) request.team = request.team.toLowerCase();

                let data = { request };

                let page = getWoodmoneyPage(data, req.url, iq.teams);

                res.render('woodmoney/' + view, page);
            }, (err) => {
                return error_handler.handle(req, res, err);
            });
        };

    };

    controller.downloadWoodmoney = function (req, res) {

        let options = _.extend({}, req.query, {count: 10000});

        controller._getWoodmoney(options).then((data) => {

            let records = [];

            if (data.results && data.results.length) {
                records = woodmoney_csv_file_definition.build(data);
            }

            let file_name = `woodmoney.csv`;

            res.setHeader('Content-Disposition', `attachment; filename=${file_name}`);
            res.setHeader('Content-Type', 'text/csv');

            stringify(records, {quoted_string: true}, (err, content) => {
                res.send(content);
            });

        }, (err) => {
            return error_handler.handle(req, res, err);
        });

    };

    controller.getPlayerWoodmoney = function (req, res) {

        if (!_.has(req.params, "player")) {
            return error_handler.handle(req, res, new AppException(constants.exceptions.missing_argument, "Missing argument: player"));
        }

        Promise.all([
            playerService.getById(req.params.player),
            cache.init()
        ]).then((promise_results) => {
            let player = promise_results[0];
            let iq = promise_results[1];

            let request = _.extend({
                season: 'all', //iq.current_woodmoney_season._id,
                selected_positions: null,
                player: req.params.player
            }, req.query);

            let data = {request, player};

            let page = getWoodmoneyPage(data, req.url, iq.teams);

            res.render('woodmoney/data', page);

        }, (err) => {
            return error_handler.handle(req, res, err);
        });

    };

    controller.downloadPlayerWoodmoney = function (req, res) {

        if (!_.has(req.params, "player")) {
            return error_handler.handle(req, res, new AppException(constants.exceptions.missing_argument, "Missing argument: player"));
        }

        let options = _.extend({player: req.params.player}, req.query);

        controller._getWoodmoney(options).then((data) => {

            let records = [];

            if (data.results && data.results.length) {
                records = woodmoney_csv_file_definition.build(data);
            }

            let player_name = data.player.name.replace(/\s/g, "_");
            let file_name = `${player_name}_woodmoney.csv`;

            res.setHeader('Content-Disposition', `attachment; filename=${file_name}`);
            res.setHeader('Content-Type', 'text/csv');

            stringify(records, {quoted_string: true}, (err, content) => {
                res.send(content);
            });

        }, (err) => {
            return error_handler.handle(req, res, err);
        });

    };

    controller._getWoodmoney = function (options) {

        return new Promise((resolve, reject) => {

            cache.init().then((iq) => {

                //always do 50 for now...
                options = _.extend({}, {count: constants.MAX_COUNT}, options);

                wm.query(options, iq).then((data) => {
                    return resolve(data);
                }, (err) => {
                    return reject(err);
                });
            });
        });
    };

    function getWoodmoneyPage(data, base_url, teams) {

        let page = {};

        let sub_title = '';
        if (data.player) {
            sub_title = data.player.name;
        }

        page.title = `PuckIQ | Woodmoney ${sub_title ? '| ' + sub_title : ''}`;
        page.sub_title = `${sub_title || 'Woodmoney'}`;

        if (!(data.request.from_date && data.request.to_date)) {
            data.request.season = data.request.season || 'all';
        } else {
            page.is_date_range = true;
            data.request.from_date = parseInt(data.request.from_date);
            data.request.to_date = parseInt(data.request.to_date);
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
        data.teams = _.values(data.teams || teams);

        return _.extend(page, data);
    }

    controller.xhrWoodmoneyData = function (req, res) {

        let options = _.extend({}, req.body);

        controller._getWoodmoney(options).then((woodmoney) => {
            res.jsonp(woodmoney);
        }, (err) => {
            return error_handler.handle(req, res, err);
        });

    };

    controller.xhrWoodmoneyChartData = function (req, res) {

        let chart_options = _.extend({}, req.body);

        if (!chart_options.options) {
            return error_handler.handle(req, res, new AppException(constants.exceptions.missing_argument, "Missing chart_options.options"));
        }

        chart_options.options['y_axis'] = chart_options.filters.tier ?
            `toipct_${chart_options.filters.tier.toLowerCase()}` :
            'toipct_diff';

        controller._getWoodmoney(chart_options.filters).then((woodmoney) => {
            let chart = wm.formatChart(woodmoney, chart_options);
            res.jsonp(_.extend(woodmoney, {chart}));
        }, (err) => {
            return error_handler.handle(req, res, err);
        });

    };

}

module.exports = WoodmoneyHandler;
