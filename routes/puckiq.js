var express = require('express');
var path = require('path');

function PuckIQHandler(app, request) {

  this.getHome = function (req, res) {
    app.use(express.static('views/home/public'));
    res.render('home/index');
  }

  this.getPlayerWowy = function (req, res) {
    app.use(express.static('views/player-wowy/public'));
    res.render('player-wowy/index');
  }

  this.getPlayerWoodmoney = function (req, res) {
    app.use(express.static('views/player-woodmoney/public'));
    res.render('player-woodmoney/index');
  }

  this.get404 = function (req, res) {
    app.use(express.static('views/error404/public'));
    res.render('error404/index');
  }
}

module.exports = PuckIQHandler;