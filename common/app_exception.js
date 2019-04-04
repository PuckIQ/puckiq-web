'use strict';

let _ = require('lodash');
let constants = require('./constants');

let default_options = {
    level: constants.log_levels.error //todo reduce default log level
};

class AppException {

    constructor(type, message, data, options) {

        options = _.assign({}, default_options, options);

        Error.call(this);
        Error.captureStackTrace(this, AppException);

        this.type = type;
        this.message = message;
        this.data = data || {};
        this.level = options.level;

    }

    static getCode(ex) {

        switch(ex.type) {
            case constants.exceptions.invalid_argument:
            case     constants.exceptions.invalid_request:
            case     constants.exceptions.missing_argument:
            case     constants.exceptions.deprecated_request:
                return 400;
            case     constants.exceptions.notAllowed:
                return 403;
            case     constants.exceptions.notFound:
                return 404;
            case     constants.exceptions.conflict:
                return 409;
            case     constants.exceptions.rate_limit:
                return 429;
            case     constants.exceptions.database_error:
            case     constants.exceptions.unhandled_error:
                return 500;
            case     constants.exceptions.timeout:
            case     constants.exceptions.service_unavailable:
                return 503;
            default:
                return 500;
        }
    }
}

module.exports = AppException;