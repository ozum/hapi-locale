

/*jslint node: true, nomen: true */
const Lab = require('@hapi/lab');
const { expect } = require('@hapi/code');
const path    = require('path');
const rewire  = require('rewire');
const plugin  = rewire('../lib/index.js');

const { describe, it } = exports.lab = Lab.script();

var Internal            = plugin.__get__('Internal');
var options = {
    configFile: path.join(__dirname, 'config-files', 'config-default.json'),
    scan: {
        path: path.join(__dirname, 'locales')
    }
};
var internal = new Internal(options);



describe('scan', function() {
    
    it('should scan files and directories', function() {
        expect(internal.scan()).to.equal(['en', 'en_US', 'fr_FR', 'jp_JP', 'tr_TR' ]);        
    });

    it('should scan only files', function() {
        const localOptions = { ...options,   scan: { path: path.join(__dirname, 'locales'), directories: false }}
        var internal = new Internal(localOptions);
        expect(internal.scan()).to.equal(['en', 'en_US', 'fr_FR', 'jp_JP', 'tr_TR' ]);
    })
});



describe('getAvailableLocales', function() {
    
    it('should return for default config', function() {
        expect(internal.getAvailableLocales()).to.equal(["en_US", "tr_TR", "fr_FR"]);
        
    });

    it('should return for deep config', function() {
        var localOptions = { ...options, 
            configFile: path.join(__dirname, 'config-files', 'config-deep.json'),
            configKey: 'options.locales'
        };
        var internal = new Internal(localOptions);
        expect(internal.getAvailableLocales()).to.equal(["en_US", "tr_TR"]);
        
    });

    it('should return for empty config', function() {
        var localOptions = { ...options,
            configFile: path.join(__dirname, 'config-files', 'config-empty.json'),
        };
        var internal = new Internal(localOptions);
        expect(internal.getAvailableLocales()).to.equal(['en', 'en_US', 'fr_FR', 'jp_JP', 'tr_TR' ]);
        
    });

    it('should prioritize options', function() {
        var localOptions = { ...options, locales: ['tr_TR'] };
        var internal = new Internal(localOptions);
        expect(internal.getAvailableLocales()).to.equal(['tr_TR']);
        
    });
});