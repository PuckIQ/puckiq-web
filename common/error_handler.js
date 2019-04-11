'use strict';

let _ = require('lodash');
let constants = require('./constants');
let logger = require('./logger').Log;
let EmailQueue = require('./email_queue');
let AppException = require('./app_exception');
let getIpAddress = require('./utils').getIpAddress;

const logLevelNames = ['fatal', 'error', 'warn', 'info', 'verbose', 'debug'];

let _config = null;
let _email_queue = null;

exports.init = function(locator) {
    _config = locator.get('config');
    _email_queue = new EmailQueue(locator);
};

exports.handle = function(req, res, err) {

    let error = log(req, err);
    let statusCode = _.isNumber(error.code) ? error.code : 500;

    sendEmail(statusCode, error);

    if(res.headersSent) {
        // short out - we've already sent a response
        return;
    }

    if(req && !req.xhr) {
        if(statusCode === 400) {
            res.render('400', error);
        } else if(statusCode === 403) {
            res.render('404', error);
        } else if(!!~_.indexOf([404, 500, 503], statusCode)) {
            //known error pages
            res.render(statusCode.toString(), {
                message: 'Sorry and error occurred. For feedback or to report this issue please email slopitch@gmail.com'
            });
        } else {
            res.render('500', error);
        }
    } else {
        res.status(statusCode).jsonp({
            error: error.error
        });
    }
};

function log(req, err) {

    let code = AppException.getCode(err);

    let ex = {};

    if(err instanceof AppException) {
        ex = err;
    } else if(_.isString(err)) {
        ex = new AppException(constants.exceptions.unhandled_error, err);
    } else {
        ex = new AppException(constants.exceptions.unhandled_error, "Request could not be completed at this time.  Please try again later.", err);
    }

    if(req && req.headers && req.headers.referer) {
        ex.data.referer = req.headers.referer;
    }

    if(req && req.method) {
        ex.data.method = req.method;
        ex.data.url = req.url;
    }

    if(req && req.body) {
        ex.data.body = req.body;
        // special handling to remove password fields
        delete ex.data.body.password;
        delete ex.data.body.password_confirm;
    }

    ex.data.ip_address = getIpAddress(req);

    let level = ex.data.level || constants.log_levels.error;

    logger.log(logLevelNames[level], JSON.stringify(ex), (err) => {
        if(err) {
            //oh dear...
            console.log(err);
        }
    });

    return {
        type: ex.type,
        message: ex.message,
        data: ex.data || {},
        level,
        code
    };
}

function sendEmail(code, error) {

    let config = _config;

    if(!config) {
        console.log('Unable to send email. Please initialize config!');
        return;
    }

    if(!_email_queue) {
        console.log('Please initialize error queue!');
        return;
    }

    // Don't send emails for anything less significant than an error
    if(error.level > constants.log_levels.error) {
        return;
    }

    if(_config.error_handling.emailErrors && code >= 500) {

        let html = JSON.stringify(error);

        _email_queue.push({
            from: { email: 'todo' },
            to: [{ email: config.error_handling.emailRecipient }],
            subject: config.error_handling.emailSubject + ' - ' + error.type,
            html: html
        });

    }
}

exports.log = log;