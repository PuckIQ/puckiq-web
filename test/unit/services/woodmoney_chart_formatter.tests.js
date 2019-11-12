'use strict';

let _ = require('lodash');
let should = require('should');
let constants = require('../../../common/constants');
let WoodmoneyService = require('../../../services/woodmoney');
let oilers_data = require('../../data/oilers2');

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

});

