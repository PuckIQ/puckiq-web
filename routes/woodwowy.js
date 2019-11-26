"use strict";

const _ = require('lodash');
const url = require('url');
const stringify = require('csv-stringify/lib/es5');
const constants = require('../common/constants');
const utils = require('../common/utils');
const AppException = require('../common/app_exception');
const WoodwowyService = require('../services/woodwowy');
const PlayerService = require('../services/player');

const woodwowy_csv_file_definition = require('../common/woodwowy_csv_file_definition');

function WoodwowyHandler(app, locator) {

    const controller = this;

    let cache = locator.get('cache');
    let error_handler = locator.get('error_handler');

    let woodwowy = new WoodwowyService(locator);
    let players = new PlayerService(locator);

    controller.getWoodwowy = function (req, res) {

        if (!req.query.player && !req.query.teammate) {
            return res.render('woodwowy/index', getWoodwowyPage({request: {}}, req.url));
        }

        if (req.query.player && !req.query.teammate) {
            players.getById(req.query.player).then((player) => {
                res.render('woodwowy/index', getWoodwowyPage({player}, req.url));
            }, (err) => {
                return error_handler.handle(req, res, err);
            });
        } else if (!req.query.player && req.query.teammate) {
            players.getById(req.query.teammate).then((teammate) => {
                res.render('woodwowy/index', getWoodwowyPage({teammate}, req.url));
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

    controller.downloadWoodwowy = function (req, res) {

        let options = _.extend({}, req.query, {count: 10000});

        controller._getWoodwowy(options).then((data) => {

            let records = [];

            if (data.results && data.results.length) {
                records = woodwowy_csv_file_definition.build(data);
            }

            let file_name = `woodwowy.csv`;

            res.setHeader('Content-Disposition', `attachment; filename=${file_name}`);
            res.setHeader('Content-Type', 'text/csv');

            stringify(records, {quoted_string: true}, (err, content) => {
                res.send(content);
            });

        }, (err) => {
            return error_handler.handle(req, res, err);
        });

    };

    controller._getWoodwowy = function (options) {

        return new Promise((resolve, reject) => {

            cache.init().then((iq) => {

                options = _.extend({}, {count: constants.MAX_COUNT}, options);

                woodwowy.query(options, iq).then((data) => {
                    return resolve(data);
                }, (err) => {
                    return reject(err);
                });
            });
        });
    };

    function getWoodwowyPage(data, base_url) {

        data.request = data.request || {};

        let page = {};

        if (data.teammates && data.teammates.length) {
            data.teammate = data.teammates[0];
        }

        if (data.player && data.teammate) {
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

        base_url = url.parse(base_url).pathname;

        let _request = _.pick(data.request, ['season', 'from_date', 'to_date', 'player']);
        if (data.request.teammates && data.request.teammates.length) {
            _request.teammate = data.request.teammates[0];
        }
        page.download_url = `${base_url}/download?${utils.encode_query(_request)}`;

        data.player = data.player || null;
        data.teammate = data.teammate || null;
        data.results = data.results || [];

        return _.extend(page, data);
    }

}

module.exports = WoodwowyHandler;
