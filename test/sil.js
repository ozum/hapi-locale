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
            assert.equal(1,1);
            done();
        });
    });
});