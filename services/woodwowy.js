const _ = require('lodash');
const constants = require('../common/constants');
const validator = require('../common/validator');
const AppException = require('../common/app_exception');

class WoodwowyService {

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
                min_toi: null,
                max_toi: null,
                positions: 'all',
                offset: 0,
                sort: 'evtoi',
                sort_direction: 'desc',
                count: constants.MAX_COUNT
            };

            options = _.extend({}, defaults, options);

            if(options.season === 'custom') {
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

                if(_.has(options, "season") && options.season) {
                    if(options.season !== "all") {
                        options.season = parseInt(options.season);
                        let err = validator.validateSeason(options.season, "season");
                        if(err) return reject(err);
                    }
                } else if(options.player) {
                    options.season = 'all';
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

            if (options.min_toi) {
                options.min_toi = parseInt(options.min_toi);
                let err = validator.validateInteger(options.min_toi, "min_toi", {nullable: true, min: 0});
                if (err) return reject(err);
            }

            if (options.max_toi) {
                options.max_toi = parseInt(options.max_toi);
                let err = validator.validateInteger(options.max_toi, "max_toi", {nullable: true, min: 0});
                if (err) return reject(err);
            }

            if(options.min_toi && options.max_toi && options.min_toi > options.max_toi){
                return new AppException(
                    constants.exceptions.invalid_argument,
                    `Min toi cannot be greater than max toi`,
                    {param: 'min_toi', value: value}
                );
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
                let err = validator.validateString(options.positions, "positions");
                if(err) return reject(err);
                options.positions = options.positions.toLowerCase();
                const all_positions = _.keys(constants.positions);
                for (var i = 0; i < options.positions.length; i++) {
                    if (!~all_positions.indexOf(options.positions[i])) {
                        return reject(new AppException(
                            constants.exceptions.invalid_argument,
                            `Invalid value for parameter: ${options.positions}`,
                            {param: 'positions', value: value}
                        ));
                    }
                }
            }

            if (options.tier && !~_.values(constants.woodmoney_tier).indexOf(options.tier)) {
                return reject(new AppException(
                    constants.exceptions.invalid_argument,
                    `Invalid value for parameter: tier`,
                    {param: 'tier', value: options.tier}
                ));
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
                let err = validator.validateInteger(options.count, 'count'); //, {min: 1, max: 50});
                if (err) return reject(err);
            }

            let url = `${baseUrl}/woodmoney`;

            // console.log('options', JSON.stringify(options));
            request.post({
                url: url,
                body: options,
                json: true,
                headers : { 'X-Requested-With' : 'XMLHttpRequest'} }, (err, response, data) => {

                if (err) {
                    return reject(new AppException(constants.exceptions.unhandled_error, "An unhandled error occurred", {err: err}));
                }

                //shouldnt really be possible as web should prevalidate but just in case
                if(response.statusCode === 400) {
                    return reject(new AppException(constants.exceptions.invalid_request, "Invalid request. Please check your parameters and try again. If you think this is an error please report to slopitch@gmail.com"));
                }

                if(data.error) {
                    return reject(new AppException(data.error.type, data.error.message));
                }

                data.results = _.map(data.results, x => {
                    x.position = x.positions.length ? x.positions[0] : '';
                    return x;
                });

                data.team = (options.team && iq.teams[options.team]) || null;

                data.request.selected_positions = {};
                if(data.request.positions === "all"){
                    _.each(_.keys(constants.positions), pos => data.request.selected_positions[pos] = true);
                    data.request.selected_positions.f = true;
                } else {
                    _.each(data.request.positions.split(''), pos => data.request.selected_positions[pos] = true);
                    data.request.selected_positions.f = data.request.selected_positions.l &&
                        data.request.selected_positions.c &&
                        data.request.selected_positions.r;
                }

                return resolve(_.extend({request: options}, data));

            }, (err) => {
                return reject(err);
            });

        });

    }

}

module.exports = WoodwowyService;