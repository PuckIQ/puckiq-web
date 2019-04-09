const _ = require('lodash');
const constants = require('../common/constants');
const AppException = require('../common/app_exception');
const validator = require('../common/validator');

class WoodmoneyProxy {

    constructor(locator) {
        this.locator = locator;
    }

    query(options, iq){

        let config = this.locator.get('config');
        let request = this.locator.get('request');
        let baseUrl = config.api.host;

        return new Promise((resolve, reject) => {

            let defaults = {
                positions : 'all',
                season: null,
                tier: null,
                offset : 0,
                sort : 'evtoi',
                sort_direction : 'desc',
                count: 50
            };

            options = _.extend({ }, defaults, options);

            if(_.has(options, "from_date") && _.has(options, "to_date")){

                let err = validator.validateDate(options.from_date, "from_date");
                if(err) return reject(err);

                err = validator.validateDate(options.to_date, "to_date");
                if(err) return reject(err);

            } else {

                if(_.has(options, "season")) {
                    let err = validator.validateSeason(options.season, "season");
                    if (err) return reject(err);
                } else {
                    let current_season = iq.current_woodmoney_season;
                    options.season = current_season && current_season._id;
                }

            }

            if(options.positions !== 'all'){
                options.positions = options.positions.toLowerCase();
                const all_positions = _.keys(constants.positions);
                for(var i=0; i< options.positions.length; i++){
                    if(!~all_positions.indexOf(options.positions[i])){
                        return new AppException(
                            constants.exceptions.invalid_argument,
                            `Invalid value for parameter: ${options.positions}`,
                            { param: 'tier', value: value }
                        );
                    }
                }
            }

            if(options.tier && !~_.values(constants.woodmoney_tier).indexOf(options.tier)){
                return new AppException(
                    constants.exceptions.invalid_argument,
                    `Invalid value for parameter: ${options.tier}`,
                    { param: 'tier', value: value }
                );
            }

            //TODO sort
            // if(options.sort && !~constants.sortable_columns).indexOf(options.sort)){
            //     return new AppException(
            //         constants.exceptions.invalid_argument,
            //         `Invalid value for parameter: ${options.tier}`,
            //         { param: 'tier', value: value }
            //     );
            // }

            if(options.count) {
                options.count = parseInt(options.count);
                let err = validator.validateInteger(options.count, 'count', {min: 1, max: 50});
                if(err) return reject(err);
            }

            request.post({url: `${baseUrl}/woodmoney`, json: true, data: options}, (err, response, data) => {
                if (err) return reject(new AppException(constants.exceptions.unhandled_error, "An unhandled error occurred", {err: err}));
                return resolve(data);
            }, (err) => {
                return reject(err);
            });

        });

    }

}

module.exports = WoodmoneyProxy;