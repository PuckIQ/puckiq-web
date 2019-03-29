"use strict";

const _ = require("lodash");

const definition = {
    "name": "Name",
    "season": "Season",
    "team": "Team",
    "positions": "Positions",
    "woodmoneytier": "Woodmoneytier",
    "evtoi": 'EVTOI',
    "ctoipct": "CTOI%",
    "cf60": "CF60",
    "ca60": "CA60",
    "cfpct": "CF%",
    "cf60rc": "CF60RC",
    "ca60rc": "CA60RC",
    "cfpctrc": "CF%RC",
    "dff60": "DFF60",
    "dfa60": "DFA60",
    "dffpct": "DFF%",
    "dff60rc": "DFF60RC",
    "dfa60rc": "DFA60RC",
    "dffpctrc": "DFF%RC",
    "gf60": "GF60",
    "ga60": "GA60",
    "gfpct": "GF%",
    "sf60": "SF60",
    "sa60": "SA60",
    "sfpct": "SF%",
    "ff60": "FF60",
    "fa60": "FA60",
    "ffpct": "FF%",
    "sacf60": "SACF60",
    "saca60": "SACA60",
    "sacfpct": "SACF%",
    "oz": "OZ",
    "nz": "NZ",
    "dz": "DZ",
    "cf": "CF",
    "ca": "CA",
    "dff": "DFF",
    "dfa": "DFA",
    "gf": "GF",
    "ga": "GA",
    "sf": "SF",
    "sa": "SA",
    "ff": "FF",
    "fa": "FA",
    "sacf": "SACF",
    "saca": "SACA",
    //"seasonId": "SeasonId",
    "player_id": "PlayerId",
    "cfpctra": "CF%RA",
    "onoff": "ONOFF",
    "wowytype": "WowyType",
    "dffpctra": "DFF%RA"
};

const apply_filter = (record, filters) => {

    if(!(!filters.tier || record.woodmoneytier.toLowerCase() === filters.tier)){
        return false;
    }

    // if(filters.positions && filters.positions.length) {
    //     let _pos = record.positions(x => x.toLowerCase());
    //     return _.intersection(_pos, filters.positions).length > 0;
    // }

    return true;
};

exports.buildForPlayers = (data, filters) => {

    let headers = _.values(definition);

    let records = _.chain(data.playerStats)
        .filter(x => {
            return apply_filter(x, filters);
        })
        .map(x => {
            let row = { season: data.seasonId };
            _.each(_.keys(definition), field => {
                if(!_.has(x, field)){
                    console.log("Missing field", field);
                } else {
                    row[field] = x[field];
                }
            });
            return _.values(row);
        }).value();

    records.unshift(headers);

    return records;
};

exports.buildForTeam = (data, filters) => {

    let headers = _.values(definition);

    let records = _.chain(data.players)
        .filter(x => {
            return apply_filter(x, filters);
        })
        .map(x => {
            let row = { season: data.seasonId, team: data.team.name };
            _.each(_.keys(definition), field => {
                if(!_.has(x, field)){
                    console.log("Missing field", field);
                } else {
                    row[field] = x[field];
                }
            });

            return _.values(row);
        }).value();

    records.unshift(headers);

    return records;
};