'use strict';

//ALPHABETICAL
module.exports = {
    //default_woodmoney_season: 20202021, calculated in local_cache from backend
    default_shifts_season: 20222023,
    default_woodwowy_season: 20232024,
    MAX_COUNT : 100,
    exceptions: {
        invalid_argument: 'invalid_argument', // 400
        invalid_request: 'invalid_request', // 400
        missing_argument: 'missing_argument', // 400
        deprecated_request: 'deprecated_request', // 400
        notAllowed: 'not_allowed', // 403
        notFound: 'not_found', // 404
        rate_limit: 'rate_limit', // 429
        conflict: 'conflict', // 409
        database_error: 'database_error', // 500
        timeout: 'timeout', // 503
        unhandled_error: 'unhandled_error', // 500
        service_unavailable: 'service_unavailable', // 503
    },
    group_by : {
        player_season_team : 'player_season_team',
        player_season : 'player_season',
        player_team : 'player_team',
        player : 'player'
    },
    log_levels: {
        fatal: 0,
        error: 1,
        warn: 2,
        info: 3,
        verbose: 4,
        debug: 5
    },
    positions : {
        l : 'LW',
        r : 'RW',
        c : 'C',
        d : 'D'
    },
    shift_type : {
        "all": "all",
        "ostart": "ostart",
        "nstart":"nstart",
        "dstart":"dstart",
        "otf":"otf"
    },
    sort : {
        ascending: 'asc',
        descending: 'desc',
    },
    woodmoney_tier : {
        all: 'All',
        elite: 'Elite',
        middle: 'Middle',
        gritensity: 'Gritensity',
    }
};
