const _ = require("lodash");

exports.encode_query = (query) => {
    return _.chain(_.keys(query)).map(key => {
        return (query[key] !== null && key !== "") && (key + "=" + encodeURIComponent(query[key]));
    }).compact().value().join("&");
};

exports.getIpAddress = (req) => {
    if(!_.isObject(req)) return '';

    let ip = '';

    if(req.headers['x-forwarded-for']) {
        ip = req.headers['x-forwarded-for'];
    } else if(req.connection && req.connection.remoteAddress) {
        ip = req.connection.remoteAddress;
    }

    return ip.split(',')[0];
};

exports.dateString = (dt) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    if(!_.isDate(dt)) {
        dt = new Date(dt);
    }

    return `${months[dt.getMonth()]} ${dt.getDate()}, ${dt.getFullYear()}`;
};