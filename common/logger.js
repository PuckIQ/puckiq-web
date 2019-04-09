'use strict';

const winston = require('winston');
const constants = require('./constants');

module.exports.init = function(locator) {

    let config = locator.get('config');

    winston.setLevels(constants.log_levels);

    winston.remove(winston.transports.Console);
    winston.add(winston.transports.Console, {
        level: config.error_handling.winston.log_levels.console,
        timestamp: true
    });
};

module.exports.Log = winston;