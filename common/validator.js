'use strict';

const _ = require('lodash');
const utils = require('./utils');
const constants = require('./constants');
const AppException = require('./app_exception');

/**
 * Validate that something is not null
 * @param {object} value
 * @param {string} name
 * @returns {AppException} err
 */
exports.validateNonNull = function(value, name) {

    if(_.isNil(value)) {
        return new AppException(
            constants.exceptions.missing_argument,
            `Missing value for parameter: ${name}`,
            { param: name }
        );
    }

};

/**
 * Validate an ObjectId
 * @param {string} value
 * @param {string} name
 * @param {object} [options = {}]
 * @param {boolean} [options.nullable] if false, will validate that value is not null
 * @returns {AppException} err
 */
exports.validateId = function(value, name, options) {

    if(!options.nullable) {
        let err = exports.validateNonNull(value, name);
        if(err) return err;
    }

    if(!_.isNil(value)) {

        if(!utils.isValidObjectId(value)) {
            return new AppException(
                constants.exceptions.invalid_argument,
                `Invalid value for parameter: ${name}`,
                { param: name, value: value }
            );
        }

    }

};

/**
 * Validate an Integer
 * @param {number} value
 * @param {string} name
 * @param {object} [options = {}]
 * @param {boolean} [options.nullable] if false, will validate that value is not null
 * @param {number} [options.min] will validate that value >= options.min
 * @param {number} [options.max] will validate that value <= options.max
 * @returns {AppException} err
 */
exports.validateInteger = function(value, name, options) {

    if(!options.nullable) {
        let err = exports.validateNonNull(value, name);
        if(err) return err;
    }

    if(!_.isNil(value)) {

        let valid = _.isInteger(value);

        if(valid && !_.isNil(options.min)) {
            valid = (value >= options.min);
        }

        if(valid && !_.isNil(options.max)) {
            valid = (value <= options.max);
        }

        if(!valid) {
            return new AppException(
                constants.exceptions.invalid_argument,
                `Invalid value for parameter: ${name}`,
                { param: name, value: value }
            );
        }

    }

};

/**
 * Validate a String
 * @param {string} value
 * @param {string} name
 * @param {object} [options = {}]
 * @param {boolean} [options.nullable] if false, will validate that value is not null
 * @param {number} [options.min] will validate that value.length >= options.min
 * @param {number} [options.max] will validate that value.length <= options.max
 * @param {regex} [options.regex] will validate that value matches the provided regex
 * @returns {AppException} err
 */
exports.validateString = function(value, name, options) {

    if(!options.nullable) {
        let err = exports.validateNonNull(value, name);
        if(err) return err;
    }

    if(!_.isNil(value)) {

        let valid = _.isString(value);

        if(valid && !_.isNil(options.min)) {
            valid = (value.length >= options.min);
        }

        if(valid && !_.isNil(options.max)) {
            valid = (value.length <= options.max);
        }

        if(valid && !_.isNil(options.regex)) {
            valid = (options.regex.match(value));
        }

        if(!valid) {
            return new AppException(
                constants.exceptions.invalid_argument,
                `Invalid value for parameter: ${name}`,
                { param: name, value: value }
            );
        }

    }

};

/**
 * Validate a Date
 * @param {Date|number} value
 * @param {string} name
 * @param {object} [options = {}]
 * @param {boolean} [options.nullable] if false, will validate that value is not null
 * @param {number} [options.min] will validate that value >= options.min
 * @param {number} [options.max] will validate that value <= options.max
 * @returns {AppException} err
 */
exports.validateDate = function(value, name, options) {

    if(!options.nullable) {
        let err = exports.validateNonNull(value, name);
        if(err) return err;
    }

    if(!_.isNil(value)) {

        if(!_.isDate(value)) value = new Date(value);

        let valid = !isNaN(value.getTime());

        if(valid && !_.isNil(options.min)) {
            valid = (value >= options.min);
        }

        if(valid && !_.isNil(options.max)) {
            valid = (value <= options.max);
        }

        if(!valid) {
            return new AppException(
                constants.exceptions.invalid_argument,
                `Invalid value for parameter: ${name}`,
                { param: name, value: value }
            );
        }

    }

};

/**
 * Validate an Array
 * @param {array} value
 * @param {string} name
 * @param {object} [options = {}]
 * @param {boolean} [options.nullable] if false, will validate that value is not null
 * @param {number} [options.min] will validate that value.length >= options.min
 * @param {number} [options.max] will validate that value.length <= options.max
 * @param {function} [options.iterator] will validate that all values pass the iterator
 * @returns {AppException} err
 */
exports.validateArray = function(value, name, options = {}) {

    if(!options.nullable) {
        let err = exports.validateNonNull(value, name);
        if(err) return err;
    }

    if(!_.isNil(value)) {

        let valid = _.isArray(value);

        if(valid && !_.isNil(options.min)) {
            valid = (value.length >= options.min);
        }

        if(valid && !_.isNil(options.max)) {
            valid = (value.length <= options.max);
        }

        if(!valid) {
            return new AppException(
                constants.exceptions.invalid_argument,
                `Invalid value for parameter: ${name}`,
                { param: name, value: value }
            );
        }

        if(!_.isNil(options.iterator)) {
            for(let i = 0; i < value.length; i++) {
                let err = options.iterator(value[i], i);
                if(err) return err;
            }
        }

    }

};

exports.validateSeason = (season) => {
    return season && season.length === 8 && this.validateInteger(season);
};
