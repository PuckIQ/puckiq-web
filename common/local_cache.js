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

    getTeams(){

        return Promise.resolve({
            "ana": { "_id" : "ana", "name": "TODO"},
            "atl": { "_id" : "atl", "name": "TODO", "active" : false},
            "ari": { "_id" : "ari", "name": "TODO"},
            "bos": { "_id" : "bos", "name": "TODO"},
            "buf": { "_id" : "buf", "name": "TODO"},
            "car": { "_id" : "car", "name": "TODO"},
            "cbj": { "_id" : "cbj", "name": "TODO"},
            "cgy": { "_id" : "cgy", "name": "TODO"},
            "chi": { "_id" : "chi", "name": "TODO"},
            "col": { "_id" : "col", "name": "TODO"},
            "dal": { "_id" : "dal", "name": "TODO"},
            "det": { "_id" : "det", "name": "TODO"},
            "edm": { "_id" : "edm", "name": "Edmonton Oilers"},
            "fla": { "_id" : "fla", "name": "TODO"},
            "lak": { "_id" : "lak", "name": "TODO"},
            "min": { "_id" : "min", "name": "TODO"},
            "mtl": { "_id" : "mtl", "name": "TODO"},
            "njd": { "_id" : "njd", "name": "TODO"},
            "nsh": { "_id" : "nsh", "name": "TODO"},
            "nyi": { "_id" : "nyi", "name": "TODO"},
            "nyr": { "_id" : "nyr", "name": "TODO"},
            "ott": { "_id" : "ott", "name": "TODO"},
            "phi": { "_id" : "phi", "name": "TODO"},
            "phx": { "_id" : "phx", "name": "TODO"},
            "pit": { "_id" : "pit", "name": "TODO"},
            "stl": { "_id" : "stl", "name": "TODO"},
            "sjs": { "_id" : "sjs", "name": "TODO"},
            "tbl": { "_id" : "tbl", "name": "TODO"},
            "tor": { "_id" : "tor", "name": "TODO"},
            "van": { "_id" : "van", "name": "TODO"},
            "vgk": { "_id" : "vgk", "name": "TODO"},
            "wsh": { "_id" : "wsh", "name": "TODO"},
            "wpg": { "_id" : "wpg", "name": "TODO"},
        });
    }
}

module.exports = SeasonCache;

