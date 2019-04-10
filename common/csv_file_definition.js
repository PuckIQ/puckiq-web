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
    "cf60": "CF/60",
    "ca60": "CA/60",
    "cfpct": "CF%",
    "cf60rc": "CF60RC",
    "ca60rc": "CA60RC",
    "cfpctrc": "CF%RC",
    "dff60": "DFF/60",
    "dfa60": "DFA/60",
    "dffpct": "DFF%",
    "dff60rc": "DFF60RC",
    "dfa60rc": "DFA60RC",
    "dffpctrc": "DFF%RC",
    "gf60": "GF/60",
    "ga60": "GA/60",
    "gfpct": "GF%",
    "sf60": "SF/60",
    "sa60": "SA/60",
    "sfpct": "SF%",
    "ff60": "FF/60",
    "fa60": "FA/60",
    "ffpct": "FF%",
    "sacf60": "SACF/60",
    "saca60": "SACA/60",
    "sacfpct": "SACF%",
    "oz": "OZ",
    "nz": "NZ",
    "dz": "DZ",
    "ozspct": "OZS%",
    "fo60": "FO/60",
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
    //"cfpctra": "CF%RA",
    "onoff": "ONOFF",
    "wowytype": "WowyType",
    "dffpctra": "DFF%RA"
};

exports.build = (data) => {

    let headers = _.values(definition);

    let records = _.chain(data.results)
        .map(x => {
            let row = { name: x.name, season: data.seasonId };
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