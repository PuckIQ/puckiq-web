const _ = require("lodash");

exports.encode_query = (query) => {
    return _.chain(_.keys(query))
        .map(key => key !== "" && key + "=" + encodeURIComponent(query[key]))
        .compact().value().join("&");
};

exports.getIpAddress = function(req) {
    if(!_.isObject(req)) return '';

    let ip = '';

    if(req.headers['x-forwarded-for']) {
        ip = req.headers['x-forwarded-for'];
    } else if(req.connection && req.connection.remoteAddress) {
        ip = req.connection.remoteAddress;
    }

    return ip.split(',')[0];
};