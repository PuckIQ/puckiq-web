const express = require('express');

function PuckIQHandler(app, request, config) {

    this.getHome = function(req, res) {
        app.use(express.static('views/home/public'));
        res.render('home/index', { pgname: 'home', layout : '__layouts/main'  });
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
        app.use(express.static('views/team/public'));
        res.render('player-woodmoney/index', { pgname: 'player-woodmoney' });
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

module.exports = PuckIQHandler;