/*jslint node: true, nomen: true, stupid: true */
/**
 * @module 'hapi-locale'
 * @description
 * Plugin module to use in hapi.js applications to determine requested language.
 */

var Boom        = require('boom'),
    fs          = require('fs'),
    path        = require('path'),
    lodash      = require('lodash');

var rootDir     = path.join(__dirname, '../../..');
var locales     = [];

/**
 * @typedef {Object}                    PluginOptions                   - Plugin configuration options.
 * @property {Array.<string>}           locales                         - List of locales to use in application.
 * @property {string}                   [default=1st Locale]            - Default locale to use if no locale is given.
 * @property {string}                   [configFile=package.json]       - Configuration file to get available locales.
 * @property {string}                   [configKey=locales]             - Key to look in configuration file to get available locales.
 * @property {Object}                   [scan]                          - Scanning options to get available locales
 * @property {string}                   [scan.path=locale]              - Path or paths to scan locale files to get available locales.
 * @property {string}                   [scan.fileTypes=json]           - File types to scan. ie. "json" for en_US.json, tr_TR.json
 * @property {boolean}                  [scan.directories=true]         - whether to scan directory names to get available locales.
 * @property {Array.<string>}           [scan.exclude=[templates]]      - Directory or file names to exclude from scan results.
 * @property {Object}                   [nameOf]                        - Name of the parameters to determine language.
 * @property {Object}                   [nameOf.param=lang]             - Name of the path parameter to determine language. ie. /{lang}/account
 * @property {Object}                   [nameOf.query=lang]             - Name of the query parameter to determine language. ie. /account?lang=tr_TR
 * @property {Object}                   [nameOf.header=accept-language] - Name of the header parameter to determine language.
 * @property {boolean}                  [throw404]                      - Whether to throw 404 not found if locale is not found. Does not apply path parameters, it always throws 404.
 * @property {string}                   [createGetterOn=getLocale]      - If not exists, creates a getter method with this name on request object to get current locale.
 * @property {string}                   [createSetterOn=setLocale]      - If not exists, creates a setter method with this name on request object to set current locale.
 * @property {Function|string}          [callback=setLocale]            - Callback method to set locale. If given as function called directly. If given as string called as a method of request object.
 * @property {string}                   [onEvent=onPreAuth]             - Event on which locale determination process is fired.
 */

/**
 * @type {PluginOptions}
 * @private
 */
var defaultOptions = {
    locales             : [],
    default             : null,
    configFile          : path.join(rootDir, 'package.json'),
    configKey           : 'locales',
    scan                : {
        path        : path.join(rootDir, 'locales'),
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
    createGetterOn      : 'i18n.getLocale',
    createSetterOn      : 'i18n.setLocale',
    callback            : 'i18n.setLocale',
    onEvent             : 'onPreAuth'
};


/**
 * Checks requirements:
 * - Checks if scan path is available.
 * - Checks if config file is available.
 * - Checks existence of language JSON files.
 * - Checks if some locales are available.
 * @param {PluginOptions} options    - Plugin configuration options.
 * @returns {undefined|string}       - Error string or undefined if no errors are found.
 * @private
 */
function checkRequirements(options) {
    "use strict";
    var i;

    if (Array.isArray(options.locales) && options.locales.length > 0) {
        return;     // No need to check files, because no config file or scanning are necessary.
    }

    if (options.scan.path && !exists(options.scan.path, true)) {    // Check if scan path is available
        return 'Locales directory "' + options.scan.path + '"cannot be found.';
    }

    if (options.configFile && !exists(options.configFile, false)) { // Check if config file is available
        return 'Configuration file "' + options.configFile + '" cannot be found';
    }

    // Check existence of language JSON files.
    for (i=0; i<options.locales.length; i=i+1) {
        if (!exists(path.join(options.directory, options.locales[i] + '.json'), false)) {
            return 'Locale file "' + path.join(options.directory, options.locales[i] + '.json') + '" cannot be found';
        }
    }

    options.locales = getAvailableLocales(options);

    if (!options.locales || options.locales.length === 0) {
        return 'No locales found.';
    }
}


/**
 * Scans path in options.scan.path and returns list of available locale files.
 * @property {Object}                   [scan]                          - Scanning options to get available locales
 * @property {string}                   [scan.path=locale]              - Path or paths to scan locale files to get available locales.
 * @property {string}                   [scan.fileTypes=json]           - File types to scan. ie. "json" for en_US.json, tr_TR.json
 * @property {boolean}                  [scan.directories=true]         - whether to scan directory names to get available locales.
 * @property {Array.<string>}           [scan.exclude=[templates]]      - Directory or file names to exclude from scan results.
 * @returns {Array.<string>}
 * @private
 */
function scan(options) {
    "use strict";
    var i,
        fullPath,
        locales = [],
        dir     = options.path,
        files   = fs.readdirSync(dir);

    for (i = 0; i < files.length; i = i + 1) {
        fullPath = path.join(dir, files[i]);

        // Skip if it is in exclude list or it is directory and scan.directories is false
        if (options.exclude.indexOf(files[i]) > -1 || (fs.statSync(fullPath).isDirectory() && !options.directories)) {
            continue;
        }

        locales.push(path.basename(files[i], '.' + options.fileType));
    }

    return lodash.unique(locales);
}



/**
 * Determines which locales are available. It tries to determine available locales in given order:
 * 1. Returns if locales are present in options.locales.
 * 2. If not found, looks for given config file and searches opted key in config file.
 * 3. If not found, scans path given in options.scan.path for files and directories excluding files in options.scan.exclude.
 * @param {PluginOptions}   options
 * @returns {Array|null}    - List of available locales
 * @private
 */
function getAvailableLocales(options) {
    "use strict";
    var locales = [];

    if (Array.isArray(options.locales) && options.locales.length > 0) {
        return options.locales;     // No need to check files, because no config file or scanning are necessary.
    }

    if (locales.length === 0 && options.configFile) {
        locales = lodash.get(require(options.configFile), options.configKey);       // key chain string to reference: 'options.locale' => options.locale
        if (!Array.isArray(locales)) { locales = []; }
    }

    if (locales.length === 0 && options.scan.path) {
        locales = scan(options.scan);
    }

    return locales.length > 0 ? locales : null;
}



/**
 * Checks synchroniously if given file or directory exists. Returns true or false.
 * @param {string}  path        - Path of the file or directory.
 * @param {boolean} shouldBeDir - Whether given path should be directory.
 * @returns {boolean}
 * @private
 */
function exists(path, shouldBeDir) {
    "use strict";
    try {
        var lstat = fs.lstatSync(path);
        if (shouldBeDir && lstat.isDirectory()) { return true; }
        if (!shouldBeDir && lstat.isFile()) { return true; }
    } catch(err) {
        return false;
    }
    return false;
}


/**
 * @param {Object}              request - hapi.js request object
 * @param {PluginOptions}       options - Plugin configuration options.
 * @returns {Array.<string>}            - List of requested locales in order of preference.
 * @private
 */
function getRequestedLocales(request, options) {
    "use strict";
    var nameOf           = options.nameOf,
        requestedLocales = request.params[nameOf.param] || request.query[nameOf.query] || request.headers[nameOf.header];

    // Header and Query parameter may return array of languages in preferred order.
    return Array.isArray(requestedLocales) ? requestedLocales : [requestedLocales];
}

/**
 * @param {Object}              request - hapi.js request object
 * @param {Object}              reply   - hapi.js reply object
 * @param {PluginOptions}       options - Plugin configuration options.
 * @returns {string|undefined}          - Locale
 * @private
 */
function determineLocale(request, reply, options) {
    var i,
        requestedLocales = getRequestedLocales(request, options);

    for (i = 0; i < requestedLocales.length; i = i + 1) {
        if (options.locales.indexOf(requestedLocales[i]) > -1) {
            return requestedLocales[i]
        }
    }

    // If none of the requested locales are available: For wrong path and throw404 option throw 404.
    if (request.params[options.nameOf.param] || options.throw404) {
        return reply( Boom.notFound('Requested localization "' + getRequestedLocales(request, options) + '" is not available.') );
    }

    return options.default;
}

/**
 *
 * @param {Object}              request - hapi.js request object
 * @param {Object}              reply   - hapi.js reply object
 * @param {PluginOptions}       options - Plugin configuration options.
 * @returns {*}
 * @private
 */
function processRequest(options, request, reply) {
    "use strict";
    var locale = determineLocale(request, reply, options);

    // Add getter to request if necessary.
    if (options.createGetterOn && !lodash.has(request, options.createGetterOn)) {
        lodash.set(request, options.createGetterOn, function() {
            return locale;
        });
    }

    // Add setter to request if necessary.
    if (options.createSetterOn && !lodash.has(request, options.createSetterOn)) {
        lodash.set(request, options.createSetterOn, function() {
            return locale;
        });
    }

    // Call callback function
    if (typeof options.callback === 'function') {
        options.callback(locale);
    } else if (typeof options.callback === 'string') {
        lodash.get(request, options.callback)(locale);
    }

    return reply.continue();
}





/**
 * Hapi plugin function which adds i18n support to request and response objects.
 * @param {Object}          server      - Hapi server object
 * @param {PluginOptions}   options     - Plugin configuration options.
 * @param {Function}        next        - Callback function.
 */
exports.register = function(server, options, next) {
    "use strict";
    var error;
    lodash.defaultsDeep(options, defaultOptions);
    error = checkRequirements(options);

    if (error) {
        return next(new Error(error));
    }

    options.default = options.default || options.locales[0];

    /**
     * @module exposed
     * @description
     * Exposed functions and attributes are listed under exposed name.
     * To access those attributes `request.server.plugins['hapi-locale']` can be used.
     * @example
     * var locales = request.server.plugins['hapi-locale'].getLocales(); // ['tr_TR', 'en_US'] etc.
     */

    /**
     * Returns all available locales as an array.
     * @name getLocales
     * @function
     * @returns {Array.<string>}    - Array of locales.
     * @example
     * var locales = request.server.plugins['hapi-locale'].getLocales(); // ['tr_TR', 'en_US'] etc.
     */
    server.expose('getLocales', function getLocales() { return options.locales; } );

    /**
     * Returns default locale.
     * @name getDefaultLocale
     * @function
     * @returns {string}    - Default locale
     */
    server.expose('getDefaultLocale', function getDefaultLocale() { return options.default; } );

    /**
     * Returns requested language. Can be used if developer does not want to pollute request object and want to get locale manually.
     * It may be best interest to store result and use it during request instead of calling this function repetitively to prevent repeated calculations.
     * @name getLocale
     * @function
     * @param {Object}      request - Hapi.js request object
     * @param {Object}      reply   - Hapi.js reply object
     * @returns {string}    Locale
     */
    server.expose('getLocale', function getLocale(request, reply) { return determineLocale(request, reply, options) } );

    server.ext(options.onEvent, processRequest.bind(undefined, options)); //function(request, reply) { return processRequest(request, reply, options) } );

    return next();
};

exports.register.attributes = {
    pkg: require('./../package.json')
};