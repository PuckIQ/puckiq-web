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