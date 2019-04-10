const _ = require('lodash');
const constants = require('../common/constants');
const AppException = require('../common/app_exception');
const utils = require('../common/utils');
const validator = require('../common/validator');

class WoodmoneyService {

    constructor(locator) {
        this.locator = locator;
    }

    query(options, iq){

        let config = this.locator.get('config');
        let request = this.locator.get('request');
        let baseUrl = config.api.host;

        return new Promise((resolve, reject) => {

            let defaults = {
                season: null,
                //from_date : null,
                //to_date : null,
                //player: null,
                //team: null,
                //tier: null,
                positions: 'all',
                offset: 0,
                sort: 'evtoi',
                sort_direction: 'desc',
                count: 50
            };

            options = _.extend({}, defaults, options);

            if (!_.has(options, "from_date") && _.has(options, "to_date")) {

                let err = validator.validateDate(options.from_date, "from_date");
                if (err) return reject(err);

                err = validator.validateDate(options.to_date, "to_date");
                if (err) return reject(err);

            } else {

                if (_.has(options, "season") && options.season) {
                    let err = validator.validateSeason(options.season, "season");
                    if (err) return reject(err);
                } else {
                    let current_season = iq.current_woodmoney_season;
                    options.season = current_season && current_season._id;
                }

            }

            if (options.player) {
                options.player = parseInt(options.player);
                let err = validator.validateInteger(options.player, "player", {nullable: false, min: 1});
                if (err) return reject(err);
            }

            if (options.team) {
                let err = validator.validateString(options.team, "team", {nullable: false});
                if (err) return reject(err);
                options.team = options.team.toLowerCase(); //just in case
                if(!_.has(iq.teams, options.team)){
                    return new AppException(
                        constants.exceptions.invalid_argument,
                        `Invalid value for parameter: ${options.team}`,
                        {param: 'team', value: value}
                    );
                }
            }

            if (options.positions !== 'all') {
                options.positions = options.positions.toLowerCase();
                const all_positions = _.keys(constants.positions);
                for (var i = 0; i < options.positions.length; i++) {
                    if (!~all_positions.indexOf(options.positions[i])) {
                        return new AppException(
                            constants.exceptions.invalid_argument,
                            `Invalid value for parameter: ${options.positions}`,
                            {param: 'tier', value: value}
                        );
                    }
                }
            }

            if (options.tier && !~_.values(constants.woodmoney_tier).indexOf(options.tier)) {
                return new AppException(
                    constants.exceptions.invalid_argument,
                    `Invalid value for parameter: ${options.tier}`,
                    {param: 'tier', value: value}
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

            if (options.count) {
                options.count = parseInt(options.count);
                let err = validator.validateInteger(options.count, 'count', {min: 1, max: 50});
                if (err) return reject(err);
            }

            options.count ="adfasdasdfa";

            let url = `${baseUrl}/woodmoney`; //?${utils.encode_query(options)}`;

            request.post({ url: url, body: options, json: true, is_xhr: true }, (err, response, data) => {
                if (err) return reject(new AppException(constants.exceptions.unhandled_error, "An unhandled error occurred", {err: err}));
                return resolve(_.extend({request: options}, data));
            }, (err) => {
                return reject(err);
            });

        });

    }

}

module.exports = WoodmoneyService;