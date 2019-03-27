const _ = require('lodash');
const express = require('express');
const Request = require('request');
const stringify = require('csv-stringify/lib/es5');

const encode_query = (query) => {
    return _.chain(_.keys(query))
        .map(key => key !== "" && key + "=" + encodeURIComponent(query[key]))
        .compact().value().join("&");
};

function PuckIQHandler(app, request, config, cache) {

    let controller = this;

    let baseUrl = config.api.host;

    controller.getHome = function(req, res) {
        app.use(express.static('views/home/public'));
        cache.init().then((iq) => {

            let division_teams = _.chain(_.values(iq.teams))
                .filter(x => x.active !== false)
                .groupBy(x => x.division)
                .value();

            let divisions = _.map(_.keys(division_teams), x => {
                return {name : x, teams : division_teams[x]};
            });

            res.render('home/index', {
                pgname: 'home',
                layout : '__layouts/main2',
                divisions : divisions,
                season : iq.current_woodmoney_season
            });

        }, (err) => {
            console.log("Error: " + err); //TODO better
            res.render('500');
        });
    };

    controller.getAbout = function(req, res) {
        app.use(express.static('views/home/public'));
        res.render('home/about', { pgname: 'about', layout : '__layouts/main' });
    };

    controller.getPlayerWowy = function(req, res) {
        app.use(express.static('views/player-wowy/public'));
        res.render('player-wowy/index', { pgname: 'player-wowy' });
    };

    controller.getPlayerWoodmoney = function(req, res) {
        app.use(express.static('views/player-woodmoney/public'));

        controller._getPlayerWoodmoney(req, res, (err, data) => {

            if(err) {
                console.log("Error: " + err); //TODO better
                return res.render('500');
            }

            let page = _.extend({
                title: `PuckIQ | ${data.name}`,
                layout: '__layouts/main2'
            }, data);

            res.render('player-woodmoney/index', page);
        });
    };

    controller.downloadPlayerWoodmoney = function(req, res) {

        controller._getPlayerWoodmoney(req, res, (err, data) => {

            if(err) {
                console.log("Error: " + err); //TODO better
                return res.render('500');
            }

            let records = [];

            if(data.playerStats && data.playerStats.length) {

                let tier = req.query.woodmoneytier || null;
                let headers = _t .keys(_.extend({player_id:1, name:1, position:1}, data.playerStats[0]));

                records = _.chain(data.playerStats)
                    .filter(x => !tier || x.woodmoneytier.toLowerCase() === tier)
                    .map(x => {
                    let row = _.extend({
                        player_id: data.player_id,
                        name: data.name,
                        position: data.position
                    }, x);
                    return _.values(row);
                }).value();

                records.unshift(headers);
            }

            let player_name = data.name.replace(/\s/g, "_");
            let file_name = `${player_name}_woodmoney.csv`;

            res.setHeader('Content-Disposition', `attachment; filename=${file_name}`);
            res.setHeader('Content-Type', 'text/csv');

            stringify(records, {quoted_string: true}, (err, content) => {
                res.send(content);
            });
        });
    };

    controller._getPlayerWoodmoney = function(req, res, done){

        let player_id = req.params.player;

        let options = { season: "all" };

        if(_.has(req.query, "woodmoneytier")) options.woodmoneytier = req.query.woodmoneytier;

        let url = `${baseUrl}/woodmoney/players/${player_id}?${encode_query(options)}`;

        Request.get({ url: url, json: true }, (err, response, data) => {

            if (err) {
                return done(err);
            } else if (response.statusCode !== 200) {
                return done("Unhandle response " + response);
            }

            return done(null, massagePlayerResponse(player_id, data));
        });

    };

    controller.getTeamWoodmoney = function(req, res) {
        app.use(express.static('views/team-woodmoney/public'));

        controller._getTeamWoodmoney(req, res, (err, data) => {

            if(err) {
                console.log("Error: " + err); //TODO better
                return res.render('500');
            }

            let page = _.extend({
                title: `PuckIQ | ${data.team.name} | ${data.season}`,
                layout: '__layouts/main2'
            }, data);

            res.render('team-woodmoney/index', page);
        });

    };

    controller.downloadTeamWoodmoney = function(req, res) {

        controller._getTeamWoodmoney(req, res, (err, data) => {

            if(err) {
                console.log("Error: " + err); //TODO better
                return res.render('500');
            }

            let records = [];

            if(data.players && data.players.length) {

                let tier = req.query.woodmoneytier || null;

                let headers = _.keys(_.extend({season: 1, team: 1 }, data.players[0]));

                records = _.chain(data.players)
                    .filter(x => {
                        return !tier || x.woodmoneytier.toLowerCase() === tier;
                    })
                    .map(x => {
                        let row = _.extend({season: data.seasonId, team: data.team.name}, x);
                        return _.values(row);
                    }).value();

                records.unshift(headers);
            }

            let team_name = data.team.name.replace(/\s/g, "_");
            let file_name = `${team_name}_woodmoney.csv`;

            res.setHeader('Content-Disposition', `attachment; filename=${file_name}`);
            res.setHeader('Content-Type', 'text/csv');

            stringify(records, {quoted_string: true}, (err, content) => {
                res.send(content);
            });
        });

    };

    controller._getTeamWoodmoney = function(req, res, done) {

        let team_id = req.params.team;

        if (!team_id) return res.jsonp([]); //todo better

        cache.init().then((iq) => {

            let current_season = iq.current_woodmoney_season;
            let season_id = req.query.season ? req.query.season : current_season && current_season._id;

            let options = {season: season_id};

            let url = `${baseUrl}/woodmoney/teams/${team_id}?${encode_query(options)}`;
            let team = iq.teams[team_id.toLowerCase()];

            Request.get({url: url, json: true}, (err, response, data) => {
                if (err) {
                    return done(err);
                } else if (response.statusCode !== 200) {
                    return done("Unhandle response " + response);
                } else {
                    return done(null, massageTeamResponse(team, season_id, data));
                }
            }, (err) => {
                console.log("Error: " + err); //TODO better
                return done(err);
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
    player.positions = player.positions && player.positions.length ? player.positions[0] : {};
    player.seasonId = player.season;
    player.season = formatSeason(player.season);
    player.player_id = player.pid;
    return player;
}

module.exports = PuckIQHandler;
