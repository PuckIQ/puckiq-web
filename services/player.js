const _ = require('lodash');
const constants = require('../common/constants');
const validator = require('../common/validator');
const AppException = require('../common/app_exception');

class WoodwowyService {

    constructor(locator) {
        this.locator = locator;
    }

    getById(player_id){

        let config = this.locator.get('config');
        let request = this.locator.get('request');
        let baseUrl = config.api.host;

        return new Promise((resolve, reject) => {

            if (!player_id) {
                return reject(new AppException(constants.exceptions.missing_argument, "player is required"));
            }

            player_id = parseInt(player_id);
            let err = validator.validateInteger(player_id, "player", {nullable: false, min: 1});
            if (err) return reject(err);

            let url = `${baseUrl}/players/${player_id}`;

            // console.log('options', JSON.stringify(options));
            request.get({
                url: url,
                json: true,
                headers : { 'X-Requested-With' : 'XMLHttpRequest'} }, (err, response, data) => {

                if (err) {
                    return reject(new AppException(constants.exceptions.unhandled_error, "An unhandled error occurred", {err: err}));
                }

                //shouldnt really be possible as web should pre-validate but just in case
                if(response.statusCode === 400) {
                    return reject(new AppException(constants.exceptions.invalid_request, "Invalid request. Please check your parameters and try again. If you think this is an error please report to slopitch@gmail.com"));
                }

                if(data.error) {
                    return reject(new AppException(data.error.type, data.error.message));
                }

                return resolve(data);

            }, (err) => {
                return reject(err);
            });

        });

    }

}

module.exports = WoodwowyService;