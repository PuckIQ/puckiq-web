'use strict';

let _ = require('lodash');
let async = require('async');
let path = require('path');
let constants = require('../common/constants');
let AppException = require('../common/app_exception');

const MAX_BOUNCE_COUNT = 3;

module.exports = function(locator) {
    return new EmailService(locator);
};

class EmailService {

    constructor(locator) {
        this.locator = locator;
    }

    /**
     * Send an Email
     * @param {object} message
     * @param {object} message.from
     * @param {string} message.from.name The from name
     * @param {string} message.from.email The from email
     * @param {object} message.to[]
     * @param {string} message.to[].name The to name
     * @param {string} message.to[].email The to email
     * @param {string} message.subject The email subject
     * @param {string} message.html The email html content
     * @param {function} message.template The HTML template
     * @param {object} message.data The data for the HTML template
     * @param {object} options
     * @param {boolean} options.force
     * @param done
     */
    sendEmail(message, options, done) {

        if(_.isFunction(options)) {
            done = options;
            options = {};
        } else if(!options) {
            options = {};
        }

        done && done();
    };
}