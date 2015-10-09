/*jslint node: true, nomen: true */
/*global describe, it, before, beforeEach, after, afterEach */

var assert  = require('chai').assert,
    Hoek    = require('hoek'),
    path    = require('path');


describe('hapi-locale', function() {
    "use strict";

    var plugins = [
        {
            register: require('../index.js'),
            options: {
                configFile: path.join(__dirname, 'config-files', 'config-default.json'),
                scan: {
                    path: path.join(__dirname, 'locales')
                }
            }
        }
    ];

    var server = require('./hapi/create-server.js')(plugins);

    it('should expose functions', function (done) {
        var options = {
            method: "GET",
            url: "/exposed?lang=tr_TR"
        };

        server.inject(options, function (response) {
            assert.deepEqual(response.result, {
                getLocales: ['en_US', 'tr_TR', 'fr_FR'],
                getLocale: 'tr_TR',
                getDefaultLocale: 'en_US',
            });
            done();
        });
    });
});

describe('hapi-locale', function() {
        "use strict";

    var plugins = [
        {
            register: require('../index.js'),
            options: {
                configFile: path.join(__dirname, 'config-files', 'config-default.json'),
                scan: {
                    path: path.join(__dirname, 'locales')
                },
                createGetterOn: null,
                createSetterOn: null,
                callback: null
            }
        }
    ];

    var server = require('./hapi/create-server.js')(plugins);

    it('should expose function without poolluting request object', function (done) {
        var options = {
            method: "GET",
            url: "/exposed?lang=tr_TR",
        };

        server.inject(options, function (response) {
            assert.deepEqual(response.result, {
                getLocales: [ 'en_US', 'tr_TR', 'fr_FR' ],
                getLocale: 'tr_TR',
                getDefaultLocale: 'en_US',
            });
            done();
        });
    });

    it('should return undef for wrong locale', function (done) {
        var options = {
            method: "GET",
            url: "/NA_NA/exposed",
        };

        server.inject(options, function (response) {
            assert.equal(response.result.getLocale, null);
            done();
        });
    });
});