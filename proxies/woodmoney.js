const _ = require('lodash');
const constants = require('../common/constants');
const InMemoryCache = require('../common/in_memory_cache');
const AppException = require('../common/app_exception');
const validator = require('../common/validator');

class WoodmoneyProxy {

    constructor(locator, cache) {
        this.locator = locator;
        this.cache = cache || new InMemoryCache({timeout: 600});//10 min
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
                let err = validator.validateInteger(options.count, 'count', {min: 1, max: 50});
                if(err) return reject(err);
            }

            let date_key = options.season ? `${options.season}` : `${options.from_date}-${options.to_date}`;

            let search_key = `${date_key}`;
            //-${options.positions}-${options.tier||'not_specified'}-${options.count}-${options.sort}-${options.offset}`;

            console.log("done validation");

            if(this.cache.has(search_key)) {
                let player_results = this.cache.get(search_key);
                return resolve(this.select(player_results, options));

            } else {
                request.post({url: `${baseUrl}/woodmoney`, json: true, data: options}, (err, response, data) => {

                    if (err) return reject(new AppException(constants.exceptions.unhandled_error, "An unhandled error occurred", {err: err}));

                    console.log("got results", data.players.length);

                    let player_results = {};

                    _.each(data.players, x => {
                        if(!player_results[x.player_id]){
                            player_results[x.player_id] = {
                                positions : _.map(x.positions, pos => pos.toLowerCase())
                            };
                        }
                        player_results[x.player_id][x.woodmoneytier] = x
                    });

                    console.log("grouped by player", _.keys(player_results).length);

                    this.cache.set(player_results);

                    return resolve(this.select(player_results, options));
                }, (err) => {
                    return reject(err);
                });
            }

        });

    }

    select(player_results, options) {

        console.log('select', JSON.stringify(options));

        const dir = options.sort_direction === constants.sort.ascending ? 1 : -1;
        const filter_positions = _.map(options.positions, x => x);

        let result = _.chain(player_results)
            .filter(x => {

                if (options.positions !== "all") {
                    if (_.intersection(x.positions, filter_positions).length === 0) {
                        return false;
                    }
                } else {
                    //lets ignore goalies...
                    return !(x.positions.length === 1 && x.positions[0] === 'g');
                }

                return true;
            })
            .sortBy(x => {
                let tier = options.tier || 'All';
                return x[tier][options.sort] * dir;
            })
            .slice(options.offset, options.offset + options.count)
            .map(x => {

                let tiers = _.map(_.values(constants.woodmoney_tier), tier => {
                    if(!options.tier || tier === options.tier) return x[tier];
                    return null;
                });

                return _.compact(tiers);
            })
            .flatten()
            .value();

        return result;
    }

    reset() {
        this.cache.reset();
    }
}

module.exports = WoodmoneyProxy;