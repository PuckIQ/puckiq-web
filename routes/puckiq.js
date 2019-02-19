const _ = require('lodash');
const express = require('express');
const Request = require('request');

const encode_query = (query) => {
    return _.chain(_.keys(query))
        .map(key => key !== "" && key + "=" + encodeURIComponent(query[key]))
        .compact().value().join("&");
};

function PuckIQHandler(app, request, config, cache) {

    let baseUrl = config.api.host;

    this.getHome = function(req, res) {
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

    this.getAbout = function(req, res) {
        app.use(express.static('views/home/public'));
        res.render('home/about', { pgname: 'about', layout : '__layouts/main' });
    };

    this.getPlayerWowy = function(req, res) {
        app.use(express.static('views/player-wowy/public'));
        res.render('player-wowy/index', { pgname: 'player-wowy' });
    };

    this.searchPlayers = function(req, res) {

        console.log("searching players body", req.body);
        console.log("searching players query", req.query);

        res.jsonp([
            {id: '8470638', name: "Connor McDavid", position : "C", team: 'EDM'},
            {id: '8470638', name: "Connor Brown", position : "LW", team: 'TBL'},
            {id: '8470638', name: "Leon Draisatl", position : "C", team: 'EDM'},
            {id: '8470638', name: "Ryan Nugent-Hopkins", position : "C", team: 'EDM'},
            {id: '8470638', name: "Oscar Klefbom", position : "LD", team: 'EDM'}
        ])
        // let url = `${baseUrl}/woodmoney/players/${player_id}?${encode_query({ season: "all" })}`;
        // console.log(url);
        // Request.get({ url: url, json: true }, (err, response, data) => {
        //
        //     let content = massagePlayerResponse(player_id, data);
        //     let page = _.extend({
        //         title: `PuckIQ | ${content.playerName}`,
        //         layout: '__layouts/main2'
        //     }, content);
        //
        //     res.render('player-woodmoney/index', page);
        // });
    };

    this.getPlayerWoodmoney = function(req, res) {
        app.use(express.static('views/player-woodmoney/public'));

        let player_id = req.params.player;

        let url = `${baseUrl}/woodmoney/players/${player_id}?${encode_query({ season: "all" })}`;
        console.log(url);
        Request.get({ url: url, json: true }, (err, response, data) => {

            let content = massagePlayerResponse(player_id, data);
            let page = _.extend({
                title: `PuckIQ | ${content.playerName}`,
                layout: '__layouts/main2'
            }, content);

            res.render('player-woodmoney/index', page);
        });
    };

    this.getTeamWoodmoney = function(req, res) {
        app.use(express.static('views/team-woodmoney/public'));

        let team_id = req.params.team;

        if(!team_id) return res.jsonp([]); //todo better

        cache.init().then((iq) => {
            let current_season = iq.current_woodmoney_season;
            let season_id = req.query.season ? req.query.season : current_season && current_season._id;

            let options = { season : season_id};

            let url = `${baseUrl}/woodmoney/teams/${team_id}?${encode_query(options)}`;
            console.log(url);

            let team = iq.teams[team_id.toLowerCase()];

            Request.get({ url: url, json: true }, (err, response, data) => {
                let content = massageTeamResponse(team, season_id, data);
                let page = _.extend({
                    title: `PuckIQ | ${team.name} | ${content.season}`,
                    layout: '__layouts/main2'
                }, content);

                res.render('team-woodmoney/index', page);

            }, (err) => {
                console.log("Error: " + err); //TODO better
                res.render('500');
            });

        });
    };

    this.getTemplate = function(req, res) {
        app.use(express.static('views/_template/public'));
        res.render('_template/index', { pgname: 'template' });
    };

    this.get404 = function(req, res) {
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
    let player = extractPlayerInfo(responseJSON[0])
    let stats = []
    for(var i = 0; i < responseJSON.length; i++) {
        stats.push(massagePlayerData(responseJSON[i]));
    }

    return {
        playerID: player.pid,
        playerName: player.pfullname,
        playerPosition: player.ppossible,
        playerStats: _.sortBy(stats, x => x.seasonId * -1),
    }
}

function extractPlayerInfo(playerData) {
    let player = _.pick(playerData, ['pid', 'pfullname', 'ppossible']);
    player.ppossible = player.ppossible && player.ppossible.length ? player.ppossible[0] : {};
    return player
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
    player.ppossible = player.ppossible && player.ppossible.length ? player.ppossible[0] : {};
    player.seasonId = player.season;
    player.season = formatSeason(player.season);
    return player;
}

module.exports = PuckIQHandler;
