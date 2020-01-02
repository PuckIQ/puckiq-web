"use strict";

const _ = require('lodash');
const constants = require('../common/constants');
const utils = require('../common/utils');
const validator = require('../common/validator');
const AppException = require('../common/app_exception');

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
                min_toi: null,
                max_toi: null,
                positions: 'all',
                group_by : constants.group_by.player_season_team,
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

                delete options.from_date;
                delete options.to_date;

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

            if (options.group_by && !~_.values(constants.group_by).indexOf(options.group_by)) {
                return reject(new AppException(
                    constants.exceptions.invalid_argument,
                    `Invalid value for parameter: group_by`,
                    {param: 'group_by', value: options.group_by}
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

            if(config.env === 'local') console.log('options', JSON.stringify(options, null, 2));
            if(config.env === 'local') console.log(`${url}?${utils.encode_query(options)}`);

            request.post({
                url: url,
                body: options,
                json: true,
                headers : { 'X-Requested-With' : 'XMLHttpRequest'} }, (err, response, data) => {

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

                _.each(data.results, x => {
                    x.position = x.positions.length ? x.positions[0] : '';
                });

                data.team = (options.team && iq.teams[options.team]) || null;

                data.request.selected_positions = {};
                if (data.request.positions === "all") {
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

    formatChart(woodmoney, options) {

        let filters = options.filters;
        let chart_options = options.options;
        let results = woodmoney.results;

        const y_axises = {
            'toipct_diff': 'TOI % Elite - TOI % Grit',
            'toipct_elite': 'TOI % Elite',
            'toipct_middle': 'TOI % Middle',
            'toipct_gritensity': 'TOI % Grit'
        };

        const key_function = (rec) => {
            switch (filters.group_by) {
                case constants.group_by.player_season_team:
                    return `${rec.season}-${rec.player_id}-${rec.team}`;
                case constants.group_by.player_season:
                    return `${rec.season}-${rec.player_id}`;
                case constants.group_by.player_team:
                    return `${rec.player_id}-${rec.team}`;
                case constants.group_by.player:
                    return `${rec.player_id}`;
                default:
                    return 'something_wrong';
            }
        };

        let grouped = _.values(_.groupBy(results, x => key_function(x)));

        let forwards = _.filter(grouped, x => !~x[0].positions.indexOf('D') );
        let defence = _.filter(grouped, x => !!~x[0].positions.indexOf('D') );

        const x_axis_formatter = (player, result_type) => {
            if(woodmoney.request.tier){
                return player[woodmoney.request.tier][result_type]
            } else {
                return player[constants.woodmoney_tier.all][result_type]
            }
        };

        const y_axis_formatter = (player, result_type) => {
            switch(result_type){
                case 'toipct_diff':
                    return player[constants.woodmoney_tier.elite].ctoipct - player[constants.woodmoney_tier.gritensity].ctoipct;
                case 'toipct_elite':
                    return player[constants.woodmoney_tier.elite].ctoipct;
                case 'toipct_middle':
                    return player[constants.woodmoney_tier.middle].ctoipct;
                case 'toipct_gritensity':
                    return player[constants.woodmoney_tier.gritensity].ctoipct;
            }
        };

        const player_formatter = (player_results) => {
            let keyed = _.keyBy(player_results, 'woodmoneytier');
            return {
                x : x_axis_formatter(keyed, chart_options.x_axis),
                y : y_axis_formatter(keyed, chart_options.y_axis),
                r: 5
            };
        };

        let forward_data = _.map(forwards, player => player_formatter(player));
        let defence_data = _.map(defence, player => player_formatter(player));

        const include_player = !filters.player;
        const include_team = !filters.team && !!~filters.group_by.indexOf('team');
        const include_season = (filters.season === 'all' || (filters.from_date && filters.to_date))
            && !!~filters.group_by.indexOf('season');

        const format_label = (player) => {
            let lbl = include_player ? player.name : "";
            if(include_team && player.team && player.team !== 'all') {
                lbl += include_player ? ` (${player.team})` : `${player.team}`;
            }
            if(include_season && player.season && player.season !== 'all') {
                let seas = player.season.toString();
                lbl += ` ${seas.substr(2,2) + "-" + seas.substr(6,2)}`;
            }
            return lbl;
        };

        let forward_labels = _.map(forwards, player => format_label(player[0]));
        let defence_labels = _.map(defence, player => format_label(player[0]));

        let data = {
            y_axis: chart_options['y_axis'],
            y_axis_name: y_axises[chart_options['y_axis']],
            datasets: [
                {
                    labels: forward_labels,
                    backgroundColor: "rgba(51, 153, 51,0.8)",
                    borderColor: "rgba(51, 153, 51,1)",
                    data: forward_data
                },
                {
                    labels: defence_labels,
                    backgroundColor: "rgba(0, 102, 255,0.8)",
                    borderColor: "rgba(0, 102, 255,1)",
                    data: defence_data
                },
            ],
            id_map: {
                '0': forwards,
                '1': defence
            }
        };

        return data;
    }


}

module.exports = WoodmoneyService;