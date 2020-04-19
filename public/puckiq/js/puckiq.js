function formatDecimal(val, no_decimals) {
    if(isNaN(no_decimals)) no_decimals = 2;
    return parseFloat("" + Math.round(val * 100) / 100).toFixed(no_decimals);
}

function getChartRange(data, midpoint, initial_offset) {

    let range = {min: midpoint - initial_offset, max: midpoint + initial_offset};
    for (var i = 1; i < 6; i++) {
        if (data.x_axis_min < range.min || data.x_axis_max > range.max) {
            range.min -= 5;
            range.max += 5;
        } else {
            break;
        }
    }

    return range;
}