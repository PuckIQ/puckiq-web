'use strict';

let _ = require('lodash');
let should = require('should');
let constants = require('../../../common/constants');
let ServiceLocator = require('../../../common/service_locator');
let WoodmoneyService = require('../../../services/woodmoney');

describe('woodmoney service tests', function() {

    let locator = new ServiceLocator();

    before(() => {
        locator.register('config', { api : { host : 'http://testenv'}});
        locator.register('request', {
            request_count: 0,
            post : (options, cb) => {
                this.request_count++;
                return cb(null, {}, {
                    players : require('../../data/oilers')
                });
            }
        })
    });

    it('will return results', function(done) {

        let iq = {
            current_woodmoney_season: {_id : 20182019 }
        };

        let options = {
            positions: 'd',
            count: 50,
            tier: constants.woodmoney_tier.elite
        };

        let proxy = new WoodmoneyService(locator);
        proxy.query(options, iq).then((results) => {
            return done();
        }, (err) => {
            should.fail('this should not be called');
            return done();
        });
    });

    it('will validate count', function(done) {

        let iq = {
            current_woodmoney_season: {_id : 20182019 }
        };

        let options = {
            positions: 'd',
            count: 51,
            tier: constants.woodmoney_tier.elite
        };

        let proxy = new WoodmoneyService(locator);
        proxy.query(options, iq).then((results) => {
            should.fail('this should not be called');
            return done();
        }, (err) => {
            (err.type).should.equal(constants.exceptions.invalid_argument);
            return done();
        });
    });

    it('will validate count and be fine if string of int', function(done) {

        let iq = {
            current_woodmoney_season: {_id : 20182019 }
        };

        let options = {
            positions: 'd',
            count: '45',
            tier: constants.woodmoney_tier.elite
        };

        let proxy = new WoodmoneyService(locator);
        proxy.query(options, iq).then((results) => {
            return done();
        }, (err) => {
            should.fail('this should not be called');
            return done();
        });
    });

});
