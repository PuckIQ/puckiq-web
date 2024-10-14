'use strict';

const _ = require('lodash');
const rq = require('request');
const InMemoryCache = require('./in_memory_cache');

class SeasonCache {

    constructor(config, cache){
        this.config = config;
        this._cache = cache || new InMemoryCache();
        this._waiting = null;
    }

    init() {
        return new Promise((resolve, reject) => {
            Promise.all([
                this.currentWoodmoneySeason(),
                this.getWoodmoneySeasons(),
                this.getTeams(),
            ]).then(data => {
                return resolve({
                   current_woodmoney_season : data[0],
                   woodmoney_seasons : data[1],
                   teams : data[2]
                });
            }, (e) => {
                return reject(e);
            });
        });
    }

    currentWoodmoneySeason() {
        return this.getWoodmoneySeasons().then((seasons) => {
            return Promise.resolve(seasons && seasons.length ? seasons[0] : null);
        }, (e) => {
            return Promise.reject(e);
        });
    }

    getWoodmoneySeasons() {

        let val = this._cache.get("woodmoney_seasons");

        if(val) return Promise.resolve(val);

        let p = new Promise((resolve, reject) => {

            rq.get({ url: `${this.config.api.host}/woodmoney/seasons`, json: true }, (err, response, data) => {
                if(err) {
                    console.log("Error occurred", err);
                    return reject(err);
                } else if(response.statusCode !== 200) {
                    console.log("Invalid response", response.statusCode);
                    return reject("Invalid response");
                }

                let seasons = _.orderBy(data || [], x => x._id, 'desc');

                if(this._waiting) this._waiting = null;
                this._cache.set("woodmoney_seasons", seasons);
                resolve(seasons);
            });
        });

        return this._waiting || p;
    }

    getTeams() {

        return Promise.resolve({
            "ana": { "_id" : "ana", "name": "Anaheim Ducks", division : "Pacific"},
            //"atl": { "_id" : "atl", "name": "TODO", "active" : false},
            // "ari": { "_id" : "ari", "name": "Arizona Coyotes", division : "Central"},
            "bos": { "_id" : "bos", "name": "Boston Bruins", division : "Atlantic"},
            "buf": { "_id" : "buf", "name": "Buffalo Sabres", division : "Atlantic"},
            "car": { "_id" : "car", "name": "Carolina Hurricanes", division : "Metropolitan"},
            "cbj": { "_id" : "cbj", "name": "Columbus Blue Jackets", division : "Metropolitan"},
            "cgy": { "_id" : "cgy", "name": "Calgary Flames", division : "Pacific"},
            "chi": { "_id" : "chi", "name": "Chicago Blackhawks", division : "Central"},
            "col": { "_id" : "col", "name": "Colorado Avalanche", division : "Central"},
            "dal": { "_id" : "dal", "name": "Dallas Stars", division : "Central"},
            "det": { "_id" : "det", "name": "Detroit Red Wings", division : "Atlantic"},
            "edm": { "_id" : "edm", "name": "Edmonton Oilers", division : "Pacific"},
            "fla": { "_id" : "fla", "name": "Florida Panthers", division : "Atlantic"},
            "lak": { "_id" : "lak", "name": "Los Angeles Kings", division : "Pacific"},
            "min": { "_id" : "min", "name": "Minnesota Wild", division : "Central"},
            "mtl": { "_id" : "mtl", "name": "Montreal Canadians", division : "Atlantic"},
            "njd": { "_id" : "njd", "name": "New Jersey Devils", division : "Metropolitan"},
            "nsh": { "_id" : "nsh", "name": "Nashville Predators", division : "Central"},
            "nyi": { "_id" : "nyi", "name": "New York Islanders", division : "Metropolitan"},
            "nyr": { "_id" : "nyr", "name": "New York Rangers", division : "Metropolitan"},
            "ott": { "_id" : "ott", "name": "Ottawa Senators", division : "Atlantic"},
            "phi": { "_id" : "phi", "name": "Philadelphia Flyers", division : "Metropolitan"},
            //"phx": { "_id" : "phx", "name": "Phoenix Coyotes", "active" : false},
            "pit": { "_id" : "pit", "name": "Pittsburgh Penguins", division : "Metropolitan"},
            "sea": { "_id" : "sea", "name": "Seattle Kraken", division : 'Pacific'},
            "stl": { "_id" : "stl", "name": "St Louis Blues", division : "Central"},
            "sjs": { "_id" : "sjs", "name": "San Jose Sharks", division : "Pacific"},
            "tbl": { "_id" : "tbl", "name": "Tampa Bay Lightning", division : "Atlantic"},
            "tor": { "_id" : "tor", "name": "Toronto Maple Leafs", division : "Atlantic"},
            "uta": { "_id" : "uta", "name": "Utah Hockey Club", division : "Central"},
            "van": { "_id" : "van", "name": "Vancouver Canucks", division : "Pacific"},
            "vgk": { "_id" : "vgk", "name": "Las Vegas Golden Knights", division : "Pacific"},
            "wsh": { "_id" : "wsh", "name": "Washington Capitals", division : "Metropolitan"},
            "wpg": { "_id" : "wpg", "name": "Winnipeg Jets", division : "Central"},
        });
    }
}

module.exports = SeasonCache;

