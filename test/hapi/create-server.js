"use strict";

const Hapi      = require("@hapi/hapi");
const rewire    = require('rewire');
const plugin    = rewire('../../lib/index.js');
const lodash    = require('lodash');

const defaultOptions  = plugin.__get__('defaultOptions');
const getter          = defaultOptions.getter;
const setter          = defaultOptions.setter;


exports.init = async (plugins) => {
    const server = Hapi.server({
        port: 8000,
        host: 'localhost'
    });
    
    server.route([
        {
            path: "/locale",
            method: "GET",
            handler: function(request, reply) {
                var getLocale = lodash.get(request, getter);
                return { locale: getLocale() };
            }
        },
        {
            path: "/{lang}/locale",
            method: "GET",
            handler: function(request, reply) {
                var getLocale = lodash.get(request, getter);
                return { locale: getLocale() };
            }
        },
        {
            path: "/getter-setter",
            method: "GET",
            handler: function(request, reply) {
                var getLocale = lodash.get(request, getter);
                var setLocale = lodash.get(request, setter);
                setLocale('ru_RU');
                return {
                    locale: getLocale()
                };
            }
        },
        {
            path: "/exposed",
            method: "GET",
            handler: function(request, reply) {
                var plugin = request.server.plugins['hapi-locale'];
                return {
                    getLocales: plugin.getLocales(),
                    getLocale: plugin.getLocale(request, reply),
                    getDefaultLocale: plugin.getDefaultLocale()
                };
    
            }
        },
        {
            path: "/{lang}/exposed",
            method: "GET",
            handler: function(request, reply) {
                var plugin = request.server.plugins['hapi-locale'];
                return {
                    getLocales: plugin.getLocales(),
                    getLocale: plugin.getLocale(request, reply),
                    getDefaultLocale: plugin.getDefaultLocale()
                };
    
            }
        }
    ]);

    await server.register(plugins);

    await server.initialize();
    return server;
};



process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});