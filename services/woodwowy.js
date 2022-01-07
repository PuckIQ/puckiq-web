const _ = require('lodash');
const constants = require('../common/constants');
const utils = require('../common/utils');
const validator = require('../common/validator');
const AppException = require('../common/app_exception');

class WoodwowyService {

    constructor(locator) {
        this.locator = locator;
    }

    query(options, iq) {

        let config = this.locator.get('config');
        let request = this.locator.get('request');
        let baseUrl = config.api.host;

        return new Promise((resolve, reject) => {

            let defaults = {
                season: null,
                player: null,
                teammates: [],
                //from_date : null,
                //to_date : null,
                //team: null,
                //tier: null,
            };

            options = _.extend({}, defaults, options);

            if (options.teammate) {
                options.teammates = [options.teammate];
                delete options.teammate;
            }

            if (options.season === 'custom') {
                console.log("todo cleanup season.custom");
                delete options.season;
            }

            if (_.has(options, "from_date") && _.has(options, "to_date") && options.from_date && options.to_date) {

                // dates are in the format of ms since epoch
                let err = validator.validateDate(parseInt(options.from_date), "from_date");
                if (err) return reject(err);

                err = validator.validateDate(parseInt(options.to_date), "to_date");
                if (err) return reject(err);

            } else {

                if (_.has(options, "season") && options.season) {
                    if (options.season !== "all") {
                        options.season = parseInt(options.season);
                        let err = validator.validateSeason(options.season, "season");
                        if (err) return reject(err);
                    }
                } else {
                    //let current_season = iq.current_woodmoney_season;
                    // options.season = current_season && current_season._id;
                    options.season = constants.default_woodwowy_season;
                }

            }

            if (!options.player) {
                return reject(new AppException(constants.exceptions.missing_argument, "player is required"));
            }

            if (!(options.teammates && options.teammates.length)) {
                return reject(new AppException(constants.exceptions.missing_argument, "at least one teammate is required"));
            }

            options.player = parseInt(options.player);
            let err = validator.validateInteger(options.player, "player", {nullable: false, min: 1});
            if (err) return reject(err);

            options.teammates = _.map(options.teammates, x => parseInt(x));
            err = validator.validateArray(options.teammates, "teammates", {
                nullable: false,
                iterator: (x) => {
                    validator.validateInteger(x, 'teammate', {nullable: false, min: 1})
                }
            });
            if (err) return reject(err);

            let url = `${baseUrl}/woodwowy`;

            if(config.env === 'local') {
                console.log(`${url}?${utils.encode_query(options)}`);
            }
            request.post({
                url: url,
                body: options,
                json: true,
                headers: {'X-Requested-With': 'XMLHttpRequest'}
            }, (err, response, data) => {

                if (err) {
                    return reject(new AppException(constants.exceptions.unhandled_error, "An unhandled error occurred", {err: err}));
                }

                //shouldnt really be possible as web should prevalidate but just in case
                if (response.statusCode === 400) {
                    return reject(new AppException(constants.exceptions.invalid_request, "Invalid request. Please check your parameters and try again. If you think this is an error please report to slopitch@gmail.com"));
                }

                if (data.error) {
                    return reject(new AppException(data.error.type, data.error.message));
                }

                if(_.isString(data)) {
                    return reject(new AppException(constants.exceptions.timeout, `The application timed out please try again`, {
                        status_code: response.statusCode,
                        data,
                        url,
                        options
                    }));
                }

                data.team = (options.team && iq.teams[options.team]) || null;

                return resolve(_.extend({request: options}, data));

            }, (err) => {
                return reject(err);
            });

        });

    }

}

module.exports = WoodwowyService;
