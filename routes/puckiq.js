const _ = require('lodash');
const express = require('express');
const url = require('url');
const constants = require('../common/constants');
const utils = require('../common/utils');
const AppException = require('../common/app_exception');

function PuckIQHandler(app, locator) {

    const controller = this;

    let cache = locator.get('cache');
    let error_handler = locator.get('error_handler');

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

    controller.getTemplate = function(req, res) {
        app.use(express.static('views/_template/public'));
        res.render('_template/index', { pgname: 'template' });
    };

    controller.get404 = function(req, res) {
        app.use(express.static('views/error404/public'));
        res.render('error404/index');
    };
}

module.exports = PuckIQHandler;
