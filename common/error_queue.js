'use strict';

let async = require("async");

/**
 *  class to basically prevent too many emails from going out
 */
class EmailQueue {

    constructor(locator) {

        this._queue = [];
        this.email_service = locator.get('email_service');
        this.settings = locator.get('config').error_handling.queue_errors;

        if(this.settings && this.settings.interval) {
            console.log('setting error email queue interval to', this.settings.interval / 1000, 's');
            setTimeout(() => this._queueTick(), this.settings.interval);
        }
    }

    push(error_email) {
        if(this.settings) {
            if(this._queue.length <= this.settings.length) {
                this._queue.push(error_email);
            }
            //otherwise ignore it
        } else {
            this.email_service.sendEmail(error_email, (err) => {
                if(err) {
                    console.log("error sending email. details: " + err);
                }
            });
        }
    }

    _queueTick() {

        if(!this._queue) {
            console.log("config error...");
            return;
        }

        if(this._queue.length === 0) {
            setTimeout(() => this._queueTick, this.settings.interval);
        } else {
            let items = this._queue.splice(0, this._queue.length);
            async.each(items, function(item, cb) {
                this.email_service.sendEmail(item, cb);
            }, function(err) {
                if(err) {
                    console.log("error sending email. details: " + err);
                }
                setTimeout(() => this._queueTick(), this.settings.interval);
            });
        }
    }
}

module.exports = function(locator) {
    return new EmailQueue(locator);
};