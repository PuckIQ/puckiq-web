'use strict';

let _ = require('lodash');
let should = require('should');
let constants = require('../../../common/constants');
let ServiceLocator = require('../../../common/service_locator');
let WoodmoneyProxy = require('../../../proxies/woodmoney');

describe('woodmoney proxy tests', function() {

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

    it('will get top 5 dman vs elite tier', function(done) {

        let iq = {
            current_woodmoney_season: {_id : 20182019 }
        };

        let options = {
            positions: 'd',
            count: 5,
            tier: constants.woodmoney_tier.elite
        };

        let proxy = new WoodmoneyProxy(locator);
        proxy.query(options, iq).then((results) => {
            (results.length).should.equal(5);
            // _.each(results, x => {
            //    console.log(x.name, x.player_id, x.evtoi);
            // });
            (results[0].player_id).should.equal(8477498);
            (results[0].evtoi).should.equal(537.1333333333333);
            return done();
        }, (err) => {
            should.fail('this should not be called');
            return done();
        });
    });

    it('will get top 5 players', function(done) {

        let iq = {
            current_woodmoney_season: {_id : 20182019 }
        };

        let options = {
            positions: 'all',
            count: 5,
            tier: null
        };

        let proxy = new WoodmoneyProxy(locator);
        proxy.query(options, iq).then((results) => {
            (results.length).should.equal(20);
            _.each(results, x => {
               console.log(x.name, x.player_id, x.evtoi);
            });
            (results[0].player_id).should.equal(8477498); //Nurse again...?
            (results[0].evtoi).should.equal(1543.2666666666667);
            return done();
        }, (err) => {
            should.fail('this should not be called');
            return done();
        });
    });

    it('will 2nd page of players by cf', function(done) {

        let iq = {
            current_woodmoney_season: {_id : 20182019 }
        };

        let options = {
            positions: 'all',
            count: 5,
            tier: null,
            offset : 5,
            sort: 'cfpct'
        };

        let proxy = new WoodmoneyProxy(locator);
        proxy.query(options, iq).then((results) => {
            (results.length).should.equal(20);
            _.each(results, x => {
                console.log(x.name, x.player_id, x.evtoi, x.cfpct);
            });
            (results[0].player_id).should.equal(8479483); //Auvitu
            (results[0].cfpct).should.equal(52.4);
            return done();
        }, (err) => {
            should.fail('this should not be called');
            return done();
        });
    });

    it('will only get as many results as there are players', function(done) {

        let iq = {
            current_woodmoney_season: {_id : 20182019 }
        };

        let options = {
            positions: 'd',
            count: 50,
            tier: constants.woodmoney_tier.elite
        };

        let proxy = new WoodmoneyProxy(locator);
        proxy.query(options, iq).then((results) => {
            (results.length).should.equal(11);
            return done();
        }, (err) => {
            should.fail('this should not be called');
            return done();
        });
    });

});
