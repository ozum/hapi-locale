"use strict";

/*jslint node: true, nomen: true */
const Lab = require('@hapi/lab');
const { expect } = require('@hapi/code');
const path    = require('path');

const { afterEach, beforeEach, describe, it } = exports.lab = Lab.script();
const { init } = require('./hapi/create-server');

describe('hapi-locale with config file', function() {
    let server;

    beforeEach(async () => {
        const plugins = [
            {
                plugin: require('../index.js'),
                options: {
                    configFile: path.join(__dirname, 'config-files', 'config-default.json'),
                    scan: {
                        path: path.join(__dirname, 'locales')
                    }
                }
            }
        ];
    
        server = await init(plugins);
    });

    afterEach(async () => {
        await server.stop();
    });

    it('should determine language from query', async function () {
        const options = { method: "GET", url: "/locale?lang=tr_TR" };
        const response = await server.inject(options);
        expect(response.result).to.equal({ locale: 'tr_TR' });  
    });

    it('should determine language from parameter', async function() {
        var options = { method: "GET", url: "/fr_FR/locale" };
        const response = await server.inject(options);
        expect(response.result).to.equal( { locale: 'fr_FR' });
    });

    it('should determine language from header', async function() {
        var options = { method: "GET", url: "/locale", headers: { "Accept-Language": "tr-TR,tr;q=0.8" } };
        const response = await server.inject(options);
        expect(response.result).to.equal({ locale: 'tr_TR' });
    });

});



describe('hapi-locale with scan dir', function() {
    let server;

    beforeEach(async () => {
        const plugins = [
            {
                plugin: require('../index.js'),
                options: {
                    configFile: path.join(__dirname, 'config-files', 'config-empty.json'),
                    scan: {
                        path: path.join(__dirname, 'locales')
                    }
                }
            }
        ];
    
        server = await init(plugins);
    });

    afterEach(async () => {
        await server.stop();
    });

    it('should determine language from query', async function() {
        var options = { method: "GET", url: "/locale?lang=jp_JP" };
        const response = await server.inject(options);
        expect(response.result).to.equal({ locale: 'jp_JP' });
    });

    it('should determine language from parameter', async function() {
        var options = { method: "GET", url: "/fr_FR/locale" };
        const response = await server.inject(options);
        expect(response.result).to.equal({ locale: 'fr_FR' });
    });

    it('should determine language from header', async function() {
        var options = { method: "GET", url: "/locale", headers: { "accept-language": "tr-TR,tr;q=0.8" } };
        const response = await server.inject(options);
        expect(response.result).to.equal({ locale: 'tr_TR' });
    });
});




describe('hapi-locale with options', function() {
    let server;

    beforeEach(async () => {
        const plugins = [
            {
                plugin: require('../index.js'),
                options: {
                    locales: ['fr_CA']
                }
            }
        ];
    
        server = await init(plugins);
    });

    afterEach(async () => {
        await server.stop();
    });

    it('should determine language from query', async function() {
        var options = { method: "GET", url: "/locale?lang=fr_CA" };
        const response = await server.inject(options);
        expect(response.result).to.equal({ locale: 'fr_CA' });
    });
});


describe('hapi-locale with different order', function() {
    let server;

    beforeEach(async () => {
        const plugins = [
            {
                plugin: require('../index.js'),
                options: {
                    order: ['query', 'params'],
                    configFile: path.join(__dirname, 'config-files', 'config-empty.json'),
                    scan: {
                        path: path.join(__dirname, 'locales')
                    }
                }
            }
        ];
    
        server = await init(plugins);
    });

    afterEach(async () => {
        await server.stop();
    });

    it('should determine language from query', async function() {
        var options = { method: "GET", url: "/tr_TR/locale?lang=fr_FR" };
        const response = await server.inject(options);
        expect(response.result).to.equal({ locale: 'fr_FR' });
    });


    it('should return second order language', async function() {
        var options = { method: "GET", url: "/tr_TR/locale?lang=NA_NA" };
        const response = await server.inject(options);
        expect(response.result).to.equal({ locale: 'tr_TR' });
    });

    it('should define setter', async function() {
        var options = { method: "GET", url: "/getter-setter" };
        // Handler set locale as ru_RU.
        const response = await server.inject(options);
        expect(response.result).to.equal({ locale: 'ru_RU' });
    });

    it('should throw 404', async function() {
        var options = { method: "GET", url: "/NA_NA/locale" };
        const response = await server.inject(options);
        expect(response.statusCode).to.equal(404);
    });
});