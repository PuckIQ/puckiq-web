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
        cache.currentWoodmoneySeason().then((season) => {
            res.render('home/index', { pgname: 'home', layout : '__layouts/main', season : season  });
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

    this.getPlayerWoodmoney = function(req, res) {
        app.use(express.static('views/player-woodmoney/public'));
        res.render('player-woodmoney/index', { pgname: 'player-woodmoney' });
    };

    this.getTeamWoodmoney = function(req, res) {
        app.use(express.static('views/player-search/public')); // seems wrong...

        let team_id = req.params.team;
        cache.init().then((iq) => {
            let current_season = iq.current_woodmoney_season;
            let season_id = req.query.season ? req.query.season : current_season && current_season._id;
            console.log('Querying woodmoney/team for ' + team_id + ' (' + season_id + ')');
            let url = `${baseUrl}/woodmoney/teams/${team_id}?${encode_query(req.query)}`;
            Request.get({ url: url, json: true }, (err, response, data) => {
                res.render('player-search/index', massageResponse(iq.teams[team_id], season_id, data));
            });
        }, (err) => {
            console.log("Error: " + err); //TODO better
            res.render('500');
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

function massageResponse(team, season, responseJSON) {
    var players = [];
    for(var i = 0; i < responseJSON.length; i++) {
        players.push(massagePlayerData(responseJSON[i]));
    }

    if(_.isNumber(season)) {
        season = season.toString();
        season = season.substr(0, 4) + '-' + season.substr(6);
    } else {
        season = season.substr(0, 4) + '-' + season.substr(4);
    }

    return {
        team: team,
        season: season,
        players: players
    }
}

// Make copy; this is the spot to perform any alterations to the data
function massagePlayerData(playerData) {
    var player = Object.assign({}, playerData);
    player.ppossible = player.ppossible && player.ppossible.length ? player.ppossible[0] : {};
    return player;
}

function simulateJSON(team, season) {
    return {
        team: team,
        season: season,
        players: [
        {
          "pid": 8478402,
          "pfullname": "Connor McDavid",
          "pfirstname": "Connor",
          "plastname": "McDavid",
          "ppossible": [ "C" ],
          "team": "EDM",
            "onoff": "On Ice",
            "wowytype": "WoodMoney",
            "woodmoneytier": "Middle",
            "cf": 714,
            "ca": 612,
            "cfpct": 53.84615384615385,
            "cf60": 67.41148701809598,
            "ca60": 57.78127458693942,
            "gf": 38,
            "ga": 27,
            "gfpct": 58.46153846153847,
            "gf60": 3.5877261998426437,
            "ga60": 2.5491738788355627,
            "ff": 544,
            "fa": 467,
            "ffpct": 53.80811078140455,
            "ff60": 51.36113296616837,
            "fa60": 44.091266719118806,
            "sf": 389,
            "sa": 339,
            "sfpct": 53.434065934065934,
            "sf60": 36.726986624704956,
            "sa60": 32.00629425649095,
            "oz": 203,
            "ozpct": 34.232715008431704,
            "oz60": 19.166011014948857,
            "dz": 180,
            "dzpct": 30.354131534569984,
            "dz60": 16.99449252557042,
            "nz": 210,
            "nzpct": 35.413153456998316,
            "nz60": 19.82690794649882,
            "dff": 621.1,
            "dfa": 462.1,
            "dffpct": 57.33936484490398,
            "dff60": 58.64044059795437,
            "dfa60": 43.62863886703383,
            "sacf": 708.2,
            "saca": 620.2,
            "sacfpct": 53.31225534477567,
            "sacf60": 66.86388670338316,
            "saca60": 58.555468135326514,
            "evtoi": 38130
        },
        {
          "pid": 8478402,
          "pfullname": "McDavid Connor",
          "pfirstname": "Connor",
          "plastname": "McDavid",
          "ppossible": [ "D" ],
          "team": "EDM",
            "onoff": "On Ice",
            "wowytype": "WoodMoney",
            "woodmoneytier": "Middle",
            "cf": 714,
            "ca": 612,
            "cfpct": 53.84615384615385,
            "cf60": 67.41148701809598,
            "ca60": 57.78127458693942,
            "gf": 38,
            "ga": 27,
            "gfpct": 58.46153846153847,
            "gf60": 3.5877261998426437,
            "ga60": 2.5491738788355627,
            "ff": 544,
            "fa": 467,
            "ffpct": 53.80811078140455,
            "ff60": 51.36113296616837,
            "fa60": 44.091266719118806,
            "sf": 389,
            "sa": 339,
            "sfpct": 53.434065934065934,
            "sf60": 36.726986624704956,
            "sa60": 32.00629425649095,
            "oz": 203,
            "ozpct": 34.232715008431704,
            "oz60": 19.166011014948857,
            "dz": 180,
            "dzpct": 30.354131534569984,
            "dz60": 16.99449252557042,
            "nz": 210,
            "nzpct": 35.413153456998316,
            "nz60": 19.82690794649882,
            "dff": 621.1,
            "dfa": 462.1,
            "dffpct": 57.33936484490398,
            "dff60": 58.64044059795437,
            "dfa60": 43.62863886703383,
            "sacf": 708.2,
            "saca": 620.2,
            "sacfpct": 53.31225534477567,
            "sacf60": 66.86388670338316,
            "saca60": 58.555468135326514,
            "evtoi": 38130
        }
        ]
    }
}
module.exports = PuckIQHandler;
