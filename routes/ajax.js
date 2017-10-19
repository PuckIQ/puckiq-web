var config = require('../config');
var baseUrl = 'http://' + config.api.host + '/' + config.api.base;

function AjaxHelper(app, request) {

  this.getAjaxRequest = function(req, res) {
    var query = req.query;
    var pqreq = req.params.pqreq;
    var serialize = serializeQuery(req.query);
    res.render('__' + pqreq + '/index');
  }
}

function serializeQuery(query) {
  var serialized = "";
  Object.keys(query).forEach(function (key) {
    if (query[key] !== '' && typeof key !== 'undefined' && key.substr(0, 2) != 'q3') {
      if (isArray(query[key])) {
        query[key].forEach(function (val) {
          serialized += key.toString() + '[]=' + val.toString() + '&';
        });
      } else {
        serialized += key.toString() + '=' + query[key].toString() + '&';
      }
    }
  });
  return serialized.substr(0, serialized.length - 1);
}

function isArray(n) {
  return Array.isArray(n);
}

module.exports = AjaxHelper;