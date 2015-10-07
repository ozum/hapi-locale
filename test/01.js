/*jslint node: true, nomen: true */
/*global describe, it, before, beforeEach, after, afterEach */

var assert  = require('chai').assert,
    rewire  = require('rewire'),
    lodash  = require('lodash'),
    Hoek    = require('hoek'),
    path    = require('path'),
    module  = rewire('../lib/index.js');

var scan                = module.__get__('scan');
var getAvailableLocales = module.__get__('getAvailableLocales');
var defaultOptions      = module.__get__('defaultOptions');
var options             = Hoek.applyToDefaults(defaultOptions, {
    configFile: path.join(__dirname, 'config-files', 'config-default.json'),
    scan: {
        path: path.join(__dirname, 'locale')
    }
});


describe('scan', function() {
    "use strict";
    it('should scan files and directories', function() {
        assert.deepEqual(scan(options.scan), ['en', 'en_US', 'fr_FR', 'jp_JP', 'tr_TR' ]);
    });

    it('should scan only files', function() {
        var localOptions = Hoek.applyToDefaults(options, {
            scan: {
                path: path.join(__dirname, 'locale'),
                directories: false
            }
        });
        assert.deepEqual(scan(localOptions.scan), ['en', 'en_US', 'tr_TR' ]);
    })
});



describe('getAvailableLocales', function() {
    "use strict";
    it('should return for default config', function() {
        assert.deepEqual(getAvailableLocales(options), ["en_US", "tr_TR", "fr_FR"]);
    });

    it('should return for deep config', function() {
        var localOptions = Hoek.applyToDefaults(options, {
            configFile: path.join(__dirname, 'config-files', 'config-deep.json'),
            configKey: 'options.locales'
        });
        assert.deepEqual(getAvailableLocales(localOptions), ["en_US", "tr_TR"]);
    });

    it('should return for empty config', function() {
        var localOptions = Hoek.applyToDefaults(options, {
            configFile: path.join(__dirname, 'config-files', 'config-empty.json'),
        });
        assert.deepEqual(getAvailableLocales(localOptions), ['en', 'en_US', 'fr_FR', 'jp_JP', 'tr_TR' ]);
    });

    it('should prioritize options', function() {
        assert.deepEqual(getAvailableLocales({locales: ['tr_TR']}), ['tr_TR']);
    });
});