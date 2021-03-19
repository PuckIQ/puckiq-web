function formatDecimal(val, no_decimals) {
    if(isNaN(no_decimals)) no_decimals = 2;
    return parseFloat("" + Math.round(val * 100) / 100).toFixed(no_decimals);
}

function encodeObjectForQuery(obj) {
    var keys = Object.keys(obj);
    var tmp = [];
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (obj[key] !== null && obj[key] !== '') tmp.push(key + "=" + encodeURIComponent(obj[key]));
    }
    return tmp.join("&");
}

function changeQueryString(val) {
    if (history.pushState) {
        var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?' + val;
        window.history.pushState({path: newurl}, '', newurl);
    }
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
            let player_id = (obj._id && obj._id.player_id) || obj.player_id;
            return `<${tag} class="is-player"><a href="/players/${player_id || obj._id}">${obj.name}</a></${tag}>`
        }
    },
    position : {
        name: 'POS',
        type: 'string',
        width: 50 // see js
    },
    team : {
        name: 'Team',
        type: 'string',
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
        width: 70,
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

    // this is woodwowy description
    description : {
        name: 'Players',
        type: 'string',
        // width: 200, see css
        class_name: 'is-woodwowy-desc',
        sortable: false,
        // formatter : function(obj, tag) {
        //     return `<${tag} class="width200">${obj.description}</${tag}>`;
        // }
    },

    //shifts
    shift_type : {
        name: 'Shift Type',
        type: 'string',
        digits: 1,
        width: 50,
        sortable: false,
    },
    shifts : {
        name: 'Shifts',
        type: 'decimal',
        digits: 0,
        width: 50,
    },
    toi : {
        name: 'TOI (min)',
        type: 'decimal',
        digits: 0,
        width: 80,
    },
    toi_per_game : {
        name: 'TOI/G (min)',
        type: 'decimal',
        digits: 0,
        width: 90,
    },
    shift_pct : {
        name: 'Shift Start %',
        type: 'decimal',
        digits: 1,
        width: 80,
    },
    avgshift : {
        name: 'AVG Shift (s)',
        type: 'decimal',
        digits: 2,
        width: 100,
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
    let sort = '';
    if(defn.sortable !== false) {
        classes.push('sortable');
        sort = `data-sort="${field}"`;
    }

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

        let classes = _.compact([defn.width ? `width${defn.width}` : '', defn.class_name]);
        let class_str = classes.join(' ');

        if(!(field in obj)) {
            return `<${tag} class="${class_str}">${field}</${tag}>`;
        }

        let val = obj[field];

        if(defn.type === 'decimal') {
            val = formatDecimal(val, defn.digits || 0);
        }

        return `<${tag} class="${class_str}">${val}</${tag}>`;
    }

}

function buildLeftColumn(columns, results) {

    var html = "<div class='puckiq-header'>";
    _.each(columns, col => {
        html += getFormattedHeader(col, 'span');
    });
    html += "</div>";

    _.each(results, (res) => {
        html += "<div>";
        _.each(columns, col => {
            html += getFormattedColumn(col, res,'span');
        });
        html += "</div>";
    });

    return html;
}

function buildRightHeader(columns) {

    var html = "";
    _.each(columns, col => {
        html += getFormattedHeader(col, 'div');
    });
    return html;

}

function buildRow(columns, pd) {

    var html = `<div class="row">`;
    _.each(columns, col => {
        html += getFormattedColumn(col, pd, 'div');
    });
    html += "</div>";
    return html;

}
