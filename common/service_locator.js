'use strict';

class ServiceLocator {
    constructor(is_unit_tests) {
        this.reset(is_unit_tests);
    }

    register(name, service, force) {
        if(!!this._registry[name] && !force) throw new Error('Service already registered with name: ' + name);
        this._registry[name] = service;
    }

    get(name) {
        if(!this._registry[name]) {
            if(this.is_unit_tests) {
                return null;
            } else {
                throw new Error('No service registered with name: ' + name);
            }
        }
        return this._registry[name];
    }

    has(name) {
        return !!this._registry[name];
    }

    unregister(name) {
        delete this._registry[name];
    }

    keys() {
        return Object.keys(this._registry);
    }

    reset(is_unit_tests) {
        this.is_unit_tests = !!is_unit_tests;
        this._registry = {};
        return this;
    }
}


module.exports = ServiceLocator;