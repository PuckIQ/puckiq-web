'use strict';

const _ = require('lodash');

class InMemoryCache {

    constructor(options){
        options = _.extend({timeout: 30}, options || {});

        this.data = {};
        this.timeout = options.timeout; // in seconds
    }

    has(key, cb) {
        var has = this.data.hasOwnProperty(key);
        return cb ? cb(null, has) : has;
    };

    get(key, cb) {
        var val = this.data[key] || null;
        return cb ? cb(null, val) : val;
    }

    set(key, val, cb) {
        this.data[key] = val;
        if(cb) cb();
        if(this.timeout) {
            var self = this;
            setTimeout(function() {
                delete self.data[key];
            }, this.timeout * 1000);
        }
    }
}

module.exports = InMemoryCache;

