'use strict';

let _ = require('lodash');
let should = require('should');
let constants = require('../../../common/constants');
let WoodmoneyService = require('../../../services/woodmoney');
let oilers_data = require('../../data/oilers2');
let oilers_data3 = require('../../data/oilers3');

describe('woodmoney service tests', function() {

    it('will format response', function (done) {

        let service = new WoodmoneyService({});
        service.formatChart(oilers_data.results).then((data) => {
            (data.datasets.length).should.equal(2);
            (data.datasets[0].length).should.equal(16);
            (data.datasets[1].length).should.equal(8);
            return done();
        }, (err) => {
            should.fail('this should not be called');
            return done();
        });
    });

    it('will format response 2', function (done) {

        let service = new WoodmoneyService({});
        let data = service.formatChart2(oilers_data3, {
            options: {
                y_axis: 'dffpct'
            }
        });

        (data.datasets.length).should.equal(2);
        (data.datasets[0].data.length).should.equal(6);
        (data.datasets[1].data.length).should.equal(6);

        (data.datasets[0].data[0].x).should.equal(1);
        (data.datasets[0].data[0].y).should.equal(43.61702127659575);
        (data.datasets[1].data[0].x).should.equal(1);
        (data.datasets[1].data[0].y).should.equal(71.13402061855672);

        return done();
    });

    it('will format response 3', function (done) {

        const nurse_test = require('../../data/nurse_test');

        let service = new WoodmoneyService({});
        let data = service.formatChart2(nurse_test, {
            options: {
                y_axis: 'dffpct'
            }
        });

        (data.datasets.length).should.equal(2);
        (data.datasets[0].data.length).should.equal(50);
        (data.datasets[1].data.length).should.equal(50);

        return done();
    });

});

