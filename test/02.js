/*jslint node: true, nomen: true */
/*global describe, it, before, beforeEach, after, afterEach */

var assert  = require('chai').assert,
    Hoek    = require('hoek'),
    path    = require('path');


describe('hapi-locale with config file', function() {
    var plugins = [
        {
            register: require('../index.js'),
            options: {
                configFile: path.join(__dirname, 'config-files', 'config-default.json'),
                scan: {
                    path: path.join(__dirname, 'locale')
                }
            }
        }
    ];

    var server = require('./hapi/create-server.js')(plugins);


    "use strict";
    it('should determine language from query', function (done) {
        var options = {
            method: "GET",
            url: "/locale?lang=tr_TR"
        };

        server.inject(options, function(response) {
            assert.deepEqual(response.result, { locale: 'tr_TR' });
            done();
        });
    });

    it('should determine language from parameter', function (done) {
        var options = {
            method: "GET",
            url: "/fr_FR/locale"
        };

        server.inject(options, function(response) {
            assert.deepEqual(response.result, { locale: 'fr_FR' });
            done();
        });
    });

    it('should determine language from header', function (done) {
        var options = {
            method: "GET",
            url: "/locale",
            headers: {
                "accept-language": "tr_TR"
            }
        };

        server.inject(options, function(response) {
            assert.deepEqual(response.result, { locale: 'tr_TR' });
            done();
        });
    });

});



describe('hapi-locale with scan dir', function() {
    var plugins = [
        {
            register: require('../index.js'),
            options: {
                configFile: path.join(__dirname, 'config-files', 'config-empty.json'),
                scan: {
                    path: path.join(__dirname, 'locale')
                }
            }
        }
    ];

    var server = require('./hapi/create-server.js')(plugins);


    "use strict";
    it('should determine language from query', function (done) {
        var options = {
            method: "GET",
            url: "/locale?lang=jp_JP"
        };

        server.inject(options, function(response) {
            assert.deepEqual(response.result, { locale: 'jp_JP' });
            done();
        });
    });

    it('should determine language from parameter', function (done) {
        var options = {
            method: "GET",
            url: "/fr_FR/locale"
        };

        server.inject(options, function(response) {
            assert.deepEqual(response.result, { locale: 'fr_FR' });
            done();
        });
    });

    it('should determine language from header', function (done) {
        var options = {
            method: "GET",
            url: "/locale",
            headers: {
                "accept-language": "tr_TR"
            }
        };

        server.inject(options, function(response) {
            assert.deepEqual(response.result, { locale: 'tr_TR' });
            done();
        });
    });

});





describe('hapi-locale with options', function() {
    var plugins = [
        {
            register: require('../index.js'),
            options: {
                locales: ['fr_CA']
            }
        }
    ];

    var server = require('./hapi/create-server.js')(plugins);


    "use strict";
    it('should determine language from query', function (done) {
        var options = {
            method: "GET",
            url: "/locale?lang=fr_CA"
        };

        server.inject(options, function(response) {
            assert.deepEqual(response.result, { locale: 'fr_CA' });
            done();
        });
    });
});