hapi-locale
===========
Hapi.js plugin for helping to determine requested locale using configuration. It is used by hapi18n plugin.

**This module is in alpha version. Incompatible changes may happen in future versions. Providing options explicitly and not using default values may be a wise choice**

Description
===========
This plugin determines which locale you should serve to incoming request by looking several criteria of the request. Every aspect of the plugin can be configured with options. Sensible defaults are tried to be provided.

Synopsis
========

Create server

    ...
    var plugins = ['hapi-locale']
    ...
    server.register(plugins, function (err) {
        if (err) throw err;
        server.start(function () {
            console.log('Server started at: ' + server.info.uri);
        });
    });
    
In handlers:

    var locale = request.i18n.getLocale();


WHY
===
It is easy to determine locale in hapi.js. So why is this plugin wirtten? We construct hapi applications from modules and most of them deal with i18n or i18n related stuff. We are tired of writing repetitive code for every application and some modules and decided to export this functionality as a hapi plugin.

Also we make it tested and documented.

Options
=======
Please see all options below in hapiLocale~PluginOptions in API section 

How it works
============
The workflow of the plugin is as below:

Plugin

1. Determines which locales are available in application. This happens one time during plugin registration.
2. Tries to find which locale is prefered looking incoming request. This and other steps below happen in every request. Event for this step is configured by `options.onEvent` 
3. Matches requested locale with available locales. If no match is found uses default locale or throws 404 according to options. 
4. (Optional) Adds getter and setter methods in request object: `request.i18n.getLocale` and `request.i18n.setLocale`.
5. Callback is called.

### 1. Available locales

Available locales are determined with methods in the following order. If one of the methods succeeds no other methods are tried. One or more steps may be cancelled via `options`. Available locales are searched one time during plugin registration.

Plugin
 
1. Looks locales in plugin options `options.locales`.
2. Looks `package.json` or other json file set by `options.configFile` and `options.configKey`. Key may be set with nested format such as 'pref.of.my.app.locales'.
3. Scans path given by `options.scan.path` excluding files and directories given by `options.path.exclude`.

### 2. Requested locale(s)

One or more locale may be preferred in requests. To determine most wanted locale for every request following steps are taken in order given. One or more steps may be cancelled via `options`.

Plugin:

1. Looks path paramater such as `{lang}/member` for `/en_US/member`. Path parameter name can be set via `options.nameOf.param`.
2. Looks query paramater such as `/member?lang=en_US`. Query parameter name can be set via `options.nameOf.query`.
3. Looks `accept-language` header of request. Header name can be set via `options.nameOf.header`.

### 3. Match Requested locale

Plugin tries to find first preferred locale which is available in application:

1. If a match is found, locale is determined.
2. If no match is found plugin either throws 404 if `options.throw404` set true. If path parameter (url) is wrong, it always throws 404 overriding `options.throw404`
3. If no 404 is thrown, default locale is used as a result. Default locale may set via `options.default`, otherwise first available locale is used as default.

### 4. Getter and Setter Methods

Plugin adds getter and setter methods to request object. Name of the methods are set via `options.createGetter` and `options.createSetter` options. If those options are null or there are already methods available with given names in request object, no methods will be added. Default values are `request.i18n.getLocale` and `request.i18n.setLocale`.

### 5. Callback is called

Callback is called with locale name as only parameter. Callback name is configured via `options.callback`. If callback name is given as a function reference, it is called directly. If it is given as string it is called as a chained method of request object. Default is "i18n.setLocale" which results as `request.i18n.setLocale`. It is possible to use a chained method name such as "i18n.setLocale" which results as `request.i18n.setLocale`.

Event Times
===========
Available locales are determined one time during server start plugin registration. Per request operations happens on event set by `options.onEvent`.

Examples
========

### Use with default options: 

    var server  = new hapi.Server(),
        path    = require('path');

    server.connection({
        host: 'localhost',
        port: 8080
    });

    var plugins = ['hapi-locale']

    server.route([
        {
            path: "/locale",
            method: "GET",
            handler: function(request, reply) {
                reply({ locale: request.i18n.getLocale() });    // This method is added by hapi-locale
            }
        },
        {
            path: "/{lang}/locale",
            method: "GET",
            handler: function(request, reply) {
                reply({ locale: request.i18n.getLocale() });    // This method is added by hapi-locale
            }
        }
    ]);


    server.register(plugins, function (err) {
        if (err) throw err;
        server.start(function () {
            console.log('Server started at: ' + server.info.uri);
        });
    });

### Providing options

    var server  = new hapi.Server(),
        path    = require('path');

    server.connection({
        host: 'localhost',
        port: 8080
    });

    var rootDir = __dirname;

    // Those are also default options:
    var plugins = [
        {
            register: 'hapi-locale',
            options: {
                locales             : [],
                default             : null,
                configFile          : path.join(rootDir, 'package.json'),
                configKey           : 'locales',
                scan                : {
                    path        : path.join(rootDir, 'locale'),
                    fileType    : 'json',
                    directories : true,
                    exclude     : ['templates', 'template.json']
                },
                nameOf              : {
                    param       : 'lang',
                    query       : 'lang',
                    header      : 'accept-language'
                },
                throw404        : false,
                createGetter        : 'i18n.getLocale',
                createSetter        : 'i18n.setLocale',
                callback            : 'i18n.setLocale',
                onEvent             : 'onPreAuth'
            };
        }
    ];

    server.route([
        {
            path: "/locale",
            method: "GET",
            handler: function(request, reply) {
                reply({ locale: request.i18n.getLocale() });    // This method is added by hapi-locale
            }
        },
        {
            path: "/{lang}/locale",
            method: "GET",
            handler: function(request, reply) {
                reply({ locale: request.i18n.getLocale() });    // This method is added by hapi-locale
            }
        }
    ]);


    server.register(plugins, function (err) {
        if (err) throw err;
        server.start(function () {
            console.log('Server started at: ' + server.info.uri);
        });
    });



API
===

