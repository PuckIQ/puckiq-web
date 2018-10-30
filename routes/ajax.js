var config = require('../config');
var rq = require('request');
var baseUrl = 'https://' + config.api.host; // + '/' + config.api.base;

function AjaxHelper(app, request) {

    this.getAjaxRequest = function(req, res) {
        var query = req.query;
        var pqreq = req.params.pqreq;
        var serialize = serializeQuery(req.query);
        res.render('__' + pqreq + '/index');
    };

    this.getPlayerRangeWowy = function(req, res) {

        var query = req.query;
        var serialize = serializeQuery(query);
        //var url = baseUrl + '/m2/schedule/getRangeWowy?' + serialize;
        var url = baseUrl + '/wowy/player?' + serialize;

        rq.get({ url: url, json: true }, (err, response, data) => {
            var datacheck = (!err && response.statusCode !== 200) ? false : true;
            var wowy = (!err && response.statusCode !== 200) ? [] : data;
            rq.get({ url: baseUrl + '/m2/players/getPlayer?playerid=' + query.q2player1id, json: true }, (e, r, d) => {
                res.render('__player-wowy-range/index', {
                    check: datacheck,
                    data: wowy,
                    queryData: query,
                    player1info: d[0]
                });
            });
        });
    };

    this.getPlayerSeasonWowy = function(req, res) {

        var query = req.query;
        var serialize = serializeQuery(query);
        var url = baseUrl + '/m2/seasonwowy/getSeasonWowy?' + serialize;
        // var url = baseUrl + '/stats/wowy?' + serialize;

        rq.get({ url: url, json: true }, (err, response, data) => {
            var datacheck = (!err && response.statusCode !== 200) ? false : true;
            var wowy = (!err && response.statusCode !== 200) ? [] : data;
            rq.get({ url: baseUrl + '/m2/players/getPlayer?playerid=' + query.q2player1id, json: true }, (e, r, d) => {
                res.render('__player-wowy-season/index', {
                    check: datacheck,
                    data: wowy,
                    queryData: query,
                    player1info: d[0]
                });
            });
        });
    };

    this.getPlayerRangeWoodmoney = function(req, res) {

        var query = req.query;
        var serialize = serializeQuery(query);
        var url = baseUrl + '/m2/schedule/getRangeWoodMoney?' + serialize;
        // var url = baseUrl + '/stats/woodmoney?' + serialize;

        rq.get({ url: url, json: true }, (err, response, data) => {
            var datacheck = (!err && response.statusCode !== 200) ? false : true;
            var woodmoney = (!err && response.statusCode !== 200) ? [] : data;
            res.render('__player-woodmoney-range/index', { check: datacheck, data: woodmoney, queryData: query });
        });
    };

    this.getPlayerSeasonWoodmoney = function(req, res) {

        var query = req.query;
        var serialize = serializeQuery(query);
        var url = baseUrl + '/m2/seasonwoodmoney/getSeasonWoodMoney?' + serialize;
        //var url = baseUrl + '/stats/woodmoney?' + serialize;

        rq.get({url: url, json: true }, (err, response, data) => {
            var datacheck = (!err && response.statusCode !== 200) ? false : true;
            var wowy = (!err && response.statusCode !== 200) ? [] : data;
            console.log(data);
            rq.get({ url: baseUrl + '/m2/players/getPlayer?playerid=' + query.q2playerid, json: true }, (e, r, d) => {
                res.render('__player-woodmoney-season/index', {
                    check: datacheck,
                    data: wowy,
                    queryData: query,
                    player1info: d[0]
                });
            });
        });
    }
}

function serializeQuery(query) {
    var serialized = "";
    Object.keys(query).forEach(function(key) {
        if(query[key] !== '' && typeof key !== 'undefined' && key.substr(0, 2) !== 'q3') {
            if(isArray(query[key])) {
                query[key].forEach(function(val) {
                    serialized += key.toString() + '[]=' + val.toString() + '&';
                });
            } else {
                serialized += key.toString() + '=' + query[key].toString() + '&';
            }
        }
    });
    return serialized.substr(0, serialized.length - 1);
}

function isArray(n) {
    return Array.isArray(n);
}

module.exports = AjaxHelper;