function formatDecimal(val, no_decimals) {
    if(isNaN(no_decimals)) no_decimals = 2;
    return parseFloat("" + Math.round(val * 100) / 100).toFixed(no_decimals);
}
