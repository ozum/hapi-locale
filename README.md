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

<a name="module_hapiLocale"></a>
## hapiLocale

* [hapiLocale](#module_hapiLocale)
  * _static_
    * [.register(server, options, next)](#module_hapiLocale.register)
  * _inner_
    * [~PluginOptions](#module_hapiLocale..PluginOptions) : <code>Object</code>

<a name="module_hapiLocale.register"></a>
### hapiLocale.register(server, options, next)
Hapi plugin function which adds i18n support to request and response objects.

**Kind**: static method of <code>[hapiLocale](#module_hapiLocale)</code>  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>server</td><td><code>Object</code></td><td><p>Hapi server object</p>
</td>
    </tr><tr>
    <td>options</td><td><code>PluginOptions</code></td><td><p>Plugin configuration options.</p>
</td>
    </tr><tr>
    <td>next</td><td><code>function</code></td><td><p>Callback function.</p>
</td>
    </tr>  </tbody>
</table>

<a name="module_hapiLocale..PluginOptions"></a>
### hapiLocale~PluginOptions : <code>Object</code>
Plugin configuration options.

**Kind**: inner typedef of <code>[hapiLocale](#module_hapiLocale)</code>  
**Properties**

<table>
  <thead>
    <tr>
      <th>Name</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>locales</td><td><code>Array.&lt;string&gt;</code></td><td></td><td>List of locales to use in application.</td>
    </tr><tr>
    <td>default</td><td><code>string</code></td><td><code>&quot;1st Locale&quot;</code></td><td>Default locale to use if no locale is given.</td>
    </tr><tr>
    <td>configFile</td><td><code>string</code></td><td><code>&quot;package.json&quot;</code></td><td>Configuration file to get available locales.</td>
    </tr><tr>
    <td>configKey</td><td><code>string</code></td><td><code>&quot;locales&quot;</code></td><td>Key to look in configuration file to get available locales.</td>
    </tr><tr>
    <td>scan</td><td><code>Object</code></td><td></td><td>Scanning options to get available locales</td>
    </tr><tr>
    <td>scan.path</td><td><code>string</code></td><td><code>&quot;locale&quot;</code></td><td>Path or paths to scan locale files to get available locales.</td>
    </tr><tr>
    <td>scan.fileTypes</td><td><code>string</code></td><td><code>&quot;json&quot;</code></td><td>File types to scan. ie. "json" for en_US.json, tr_TR.json</td>
    </tr><tr>
    <td>scan.directories</td><td><code>boolean</code></td><td><code>true</code></td><td>whether to scan directory names to get available locales.</td>
    </tr><tr>
    <td>scan.exclude</td><td><code>Array.&lt;string&gt;</code></td><td><code>[templates]</code></td><td>Directory or file names to exclude from scan results.</td>
    </tr><tr>
    <td>nameOf</td><td><code>Object</code></td><td></td><td>Name of the parameters to determine language.</td>
    </tr><tr>
    <td>nameOf.param</td><td><code>Object</code></td><td><code>lang</code></td><td>Name of the path parameter to determine language. ie. /{lang}/account</td>
    </tr><tr>
    <td>nameOf.query</td><td><code>Object</code></td><td><code>lang</code></td><td>Name of the query parameter to determine language. ie. /account?lang=tr_TR</td>
    </tr><tr>
    <td>nameOf.header</td><td><code>Object</code></td><td><code>accept-language</code></td><td>Name of the header parameter to determine language.</td>
    </tr><tr>
    <td>throw404</td><td><code>boolean</code></td><td></td><td>Whether to throw 404 not found if locale is not found. Does not apply path parameters, it always throws 404.</td>
    </tr><tr>
    <td>createGetter</td><td><code>string</code></td><td><code>&quot;getLocale&quot;</code></td><td>If not exists, creates a getter method with this name on request object to get current locale.</td>
    </tr><tr>
    <td>createSetter</td><td><code>string</code></td><td><code>&quot;setLocale&quot;</code></td><td>If not exists, creates a setter method with this name on request object to set current locale.</td>
    </tr><tr>
    <td>callback</td><td><code>function</code> | <code>string</code></td><td><code>setLocale</code></td><td>Callback method to set locale. If given as function called directly. If given as string called as a method of request object.</td>
    </tr><tr>
    <td>onEvent</td><td><code>string</code></td><td><code>&quot;onPreAuth&quot;</code></td><td>Event on which locale determination process is fired.</td>
    </tr>  </tbody>
</table>


---------------------------------------

History & Notes
================
Note: Simple documentation updates are not listed here.

#### 0.0.1 / 2015-10-06
* Initial version.

LICENSE
=======

The MIT License (MIT)

Copyright (c) 2015 Özüm Eldoğan

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.