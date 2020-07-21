"use strict";

/*jslint node: true, nomen: true */
/*global describe, it, before, beforeEach, after, afterEach */

const Lab = require('@hapi/lab');
const { expect } = require('@hapi/code');
const path    = require('path');

const { afterEach, beforeEach, describe, it } = exports.lab = Lab.script();
const { init } = require('./hapi/create-server');

describe('hapi-locale', function() {
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

    it('should expose functions', async function () {
        const options = { method: "GET", url: "/exposed?lang=tr_TR" };

        const response = await server.inject(options);
        expect(response.result).to.equal({
                getLocales: ['en_US', 'tr_TR', 'fr_FR'],
                getLocale: 'tr_TR',
                getDefaultLocale: 'en_US',
            });
    });
});

describe('hapi-locale', function() {
    let server;

    beforeEach(async () => {
        const plugins = [
            {
                plugin: require('../index.js'),
                options: {
                    configFile: path.join(__dirname, 'config-files', 'config-default.json'),
                    scan: {
                        path: path.join(__dirname, 'locales')
                    },
                    getter: null,
                    setter: null,
                }
            }
        ];
    
        server = await init(plugins);
    });

    afterEach(async () => {
        await server.stop();
    });


    it('should expose function without poolluting request object', async function () {
        const options = { method: "GET", url: "/exposed?lang=tr_TR" };
        const response =  await server.inject(options)
        expect(response.result).to.equal(response.result, {
            getLocales: [ 'en_US', 'tr_TR', 'fr_FR' ],
            getLocale: 'tr_TR',
            getDefaultLocale: 'en_US',
        });       
    });

    it('should return undef for wrong locale', async function () {
        const options = { method: "GET", url: "/NA_NA/exposed" };
        const response = await server.inject(options);
        expect(response.result.getLocale).to.equal(undefined);
    });
});