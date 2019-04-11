const _ = require('lodash');
const express = require('express');
const stringify = require('csv-stringify/lib/es5');
const constants = require('../common/constants');
const utils = require('../common/utils');
const validator = require('../common/validator');
const AppException = require('../common/app_exception');
const csv_file_definition = require('../common/csv_file_definition');
const WoodmoneyService = require('../services/woodmoney');

function PuckIQHandler(app, locator) {

    const controller = this;

    let cache = locator.get('cache');
    let error_handler = locator.get('error_handler');

    let wm = new WoodmoneyService(locator);

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
            res.render('500');
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

            let sub_title = '';
            if(data.team) {
                sub_title = data.team.name;
            } else if(data.player) {
                sub_title = data.player.name;
            }

            let page = _.extend({
                title: `PuckIQ | Woodmoney ${sub_title ? '| ' + sub_title : ''}`,
                sub_title: `${sub_title || 'Woodmoney'}`
                }, data);

            res.render('woodmoney/index', page);

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

            let page = _.extend({
                title: `PuckIQ | Woodmoney | ${(data.player && data.player.name) || 'unknown'}`,
                sub_title: `${(data.player && data.player.name) || 'unknown'}`
            }, data);

            res.render('woodmoney/index', page);

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

            let player_name = data.name.replace(/\s/g, "_");
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

            let page = _.extend({
                title: `PuckIQ | Woodmoney | ${data.request.team.name}`,
                sub_title : `${data.request.team.name}`
            }, data);

            res.render('woodmoney/index', page);

        }, (err) => {
            return error_handler.handle(req, res, err);
        });

    };

    controller.downloadTeamWoodmoney = function(req, res) {

        if(!_.has(req.params, 'team')) {
            return error_handler.handle(req, res, new AppException(constants.exceptions.missing_argument, "Missing argument: team"));
        }

        let options = _.extend({ team: req.params.team }, req.query);

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
                options = _.extend({}, options, { count: 50 });

                wm.query(options, iq).then((data) => {
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

function massageTeamResponse(team, seasonId, responseJSON) {

    var players = [];
    for(var i = 0; i < responseJSON.length; i++) {
        players.push(massagePlayerData(responseJSON[i]));
    }

    return {
        team: team,
        seasonId: seasonId,
        season: formatSeason(seasonId),
        players: players
    }
}

function massagePlayerResponse(playerID, responseJSON) {
    let player = extractPlayerInfo(responseJSON[0]);
    let stats = [];
    for(var i = 0; i < responseJSON.length; i++) {
        stats.push(massagePlayerData(responseJSON[i]));
    }

    return {
        player_id: playerID,
        name: player.name,
        position: player.positions,
        playerStats: _.sortBy(stats, x => x.seasonId * -1),
    }
}

function extractPlayerInfo(playerData) {

    let player = {
        player_id : playerData.pid,
        name : playerData.name,
        positions : playerData.positions
    };
    player.positions = player.positions && player.positions.length ? player.positions[0] : {};
    return player;
}

function formatSeason(seasonId) {

    if (seasonId === undefined) {
        return '2018-2019'
    } else if (_.isNumber(seasonId)) {
        let season = seasonId.toString();
        return season.substr(0, 4) + '-' + season.substr(6);
    }
    return seasonId.substr(0, 4) + '-' + seasonId.substr(4);
}


// Make copy; this is the spot to perform any alterations to the data
function massagePlayerData(playerData) {
    let player = Object.assign({}, playerData);
    player.position = player.positions && player.positions.length ? player.positions[0] : {};
    player.seasonId = player.season;
    player.season = formatSeason(player.season);
    player.player_id = player.player_id;
    return player;
}

module.exports = PuckIQHandler;
