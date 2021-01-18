function formatDecimal(val, no_decimals) {
    if(isNaN(no_decimals)) no_decimals = 2;
    return parseFloat("" + Math.round(val * 100) / 100).toFixed(no_decimals);
}


function getChartXRange(data, midpoint, initial_offset) {
    return _getChartRange(data, midpoint, initial_offset, 'x_axis');
}

function getChartYRange(data, midpoint, initial_offset) {
    return _getChartRange(data, midpoint, initial_offset, 'y_axis');
}

function _getChartRange(data, midpoint, initial_offset, field) {

    let fields = {};
    fields.min = field + '_min';
    fields.max = field + '_max';

    let range = {min: midpoint - initial_offset, max: midpoint + initial_offset};
    for (var i = 1; i < 6; i++) {
        if (data[fields.min] < range.min || data[fields.max] > range.max) {
            range.min -= 5;
            range.max += 5;
        } else {
            break;
        }
    }

    return range;
}

var column_definitions = {
    season : {
        name: 'Season',
        type: 'number',
        width: 70, // see js
        class_name: 'is-season',
        formatter : function(obj, tag) {
            if(obj.season) {
                let seas = obj.season.toString();
                let seas_str = seas.substring(0,4) + "/" + seas.substring(6,8);
                return `<${tag} style="width: 70px;">${seas_str}</${tag}>`;
            } else {
                return `<${tag}>All</${tag}>`;
            }
        }
    },
    player : {
        name: 'Player',
        type: 'string',
        class_name: 'is-player',
        // width: 200, // see js
        formatter : function(obj, tag) {
            return `<${tag} class="is-player"><a href="/players/${obj.player_id}">${obj.name}</a></${tag}>`
        }
    },
    position : {
        name: 'POS',
        type: 'String',
        width: 50 // see js
    },
    team : {
        name: 'Team',
        type: 'String',
        // width: 50,
        formatter : function(obj, tag) {
            if (obj.team) {
                return `<${tag}><a href="/woodmoney?team=${obj.team}">${obj.team}</a></${tag}>`;
            } else {
                return `<${tag}>all</${tag}>`;
            }
        }
    },

    games_played : {
        name: 'GP',
        type: 'number',
        width: 40
    },
    woodmoneytier : {
        name: 'Comp',
        type: 'string',
        width: 80,
        sortable: false,
    },
    game_type : {
        name: 'GT',
        type: 'string',
        width: 40,
        sortable: false,
        formatter : function(obj, tag) {
            return `<${tag}>All</${tag}>`;
        }
    },
    evtoi : {
        name: 'TOI',
        type: 'decimal',
        digits: 1,
        width: 60
    },

    ctoipct : {
        name: 'CTOI%',
        type: 'decimal',
        digits: 1,
        width: 60
    },
    cf : {
        name: 'CF',
        type: 'number',
        width: 50
    },
    ca : {
        name: 'CA',
        type: 'number',
        width: 50
    },
    cfpct: {
        name: 'CF%',
        type: 'decimal',
        digits: 2,
        width: 60
    },
    cf60 : {
        name: 'CF/60',
        type: 'decimal',
        digits: 1,
        width: 60
    },

    ca60 : {
        name: 'CA/60',
        type: 'decimal',
        digits: 1,
        width: 60
    },
    cf60rc : {
        name: 'CF60RC',
        type: 'decimal',
        digits: 2,
        width: 70
    },
    ca60rc : {
        name: 'CA60RC',
        type: 'decimal',
        digits: 2,
        width: 70
    },
    cfpctrc: {
        name: 'CF%RC',
        type: 'decimal',
        digits: 2,
        width: 70
    },
    dff : {
        name: 'DFF',
        type: 'decimal',
        digits: 1,
        width: 60
    },

    dfa : {
        name: 'DFA',
        type: 'decimal',
        digits: 1,
        width: 60
    },
    dffpct : {
        name: 'DFF%',
        type: 'decimal',
        digits: 1,
        width: 60
    },
    dff60 : {
        name: 'DFF60',
        type: 'decimal',
        digits: 1,
        width: 60
    },
    dfa60 : {
        name: 'DFA60',
        type: 'decimal',
        digits: 1,
        width: 60
    },
    dff60rc : {
        name: 'DFF60RC',
        type: 'decimal',
        digits: 2,
        width: 80
    },

    dfa60rc : {
        name: 'DFA60RC',
        type: 'decimal',
        digits: 2,
        width: 80
    },
    dffpctrc : {
        name: 'DFF%RC',
        type: 'decimal',
        digits: 2,
        width: 80
    },
    gf : {
        name: 'GF',
        type: 'number',
        width: 40
    },
    ga : {
        name: 'GA',
        type: 'number',
        width: 40
    },
    gfpct : {
        name: 'GF%',
        type: 'decimal',
        digits: 2,
        width: 60
    },

    onshpct : {
        name: 'ONSH%',
        type: 'decimal',
        digits: 1,
        width: 70
    },
    onsvpct : {
        name: 'ONSV%',
        type: 'decimal',
        digits: 1,
        width: 70
    },
    pdo : {
        name: 'PDO',
        type: 'decimal',
        digits: 0,
        width: 60
    },
    gf60 : {
        name: 'GF/60',
        type: 'decimal',
        digits: 1,
        width: 60
    },
    ga60 : {
        name: 'GA60',
        type: 'decimal',
        digits: 1,
        width: 60
    },

    ozspct : {
        name: 'OZS%',
        type: 'decimal',
        digits: 1,
        width: 60
    },
    fo60 : {
        name: 'FO60',
        type: 'decimal',
        digits: 1,
        width: 60
    },

    default : {
        name: 'TODO',
        type: 'string',
        width: 60
    },

}


function getFormattedHeader(field, tag) {

    tag = tag || "div";

    let defn = column_definitions.default;
    if(!column_definitions[field]){
        console.log('missing definition for field', field);
    } else {
        defn = column_definitions[field];
    }

    let classes = _.compact([defn.width ? `width${defn.width}` : '', defn.class_name]);
    let sort = defn.sortable === false ? 'data-sorter="false"' : `data-sort="${field}"`;

    return `<${tag} class="${classes.join(" ")}" ${sort}>${defn.name}</${tag}>`;
}

function getFormattedColumn(field, obj, tag) {

    tag = tag || "div";

    let defn = column_definitions.default;
    if(!column_definitions[field]){
        console.log('missing definition for field', field);
    } else {
        defn = column_definitions[field];
    }

    if(defn.formatter){
        return defn.formatter(obj, tag);
    } else {

        if(!(field in obj)) {
            return `<${tag} class="width${defn.width}">${field}</${tag}>`;
        }

        let val = obj[field];

        if(defn.type === 'decimal') {
            val = formatDecimal(val, defn.digits || 0);
        }

        return `<${tag} class="width${defn.width}">${val}</${tag}>`;
    }

}
