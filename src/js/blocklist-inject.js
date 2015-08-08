// Copyright 2015 toishi-tech. All Rights Reserved.

/**
 * Google search result page injection script.
 *
 * @author tetsuwo.oishi@gmail.com (Tetsuwo OISHI)
 */

/**
 * Inject Space
 */
Blocklist.inject = {};

/**
 * Blocklist
 * @type {Array}
 */
Blocklist.inject._blocklist = null;
Blocklist.inject._compiled_blocklist = null;

Blocklist.inject.GSRP_MODE_CHANGED = false;

/**
 * Blocklist Search Count
 * @type {Number}
 */
Blocklist.inject.COUNTER = 0;

/**
 */
Blocklist.inject.debug = function(a, b) {
    console.log(a, b);
};

/**
 * ID name of inject element
 * @type {String}
 */
Blocklist.inject.MARK_NAME = 'blocklist-for-gsr-injection';

/**
 * ID name of inject element
 * @type {String}
 */
Blocklist.inject.BLOCKED_NAME = 'blocklist-for-gsr-blocked';

/**
 * Interval
 * @type {Number}
 */
Blocklist.inject.INTERVAL = 10000;

/**
 * GSRP Mode
 * @type {String}
 */
Blocklist.inject.GSRP_MODE = 'hide';

/**
 * Class names of Search result
 * @type {Number}
 */
Blocklist.inject.SELECTOR_SEARCH_RESULT = 'ol .g:not(.blocklist-for-gsr-blocked)';
//Blocklist.inject.SELECTOR_SEARCH_RESULT = 'ol .g';
//Blocklist.inject.SELECTOR_SEARCH_RESULT_URL = 'h3 a[href]';
Blocklist.inject.SELECTOR_SEARCH_RESULT_URL = '.r a';
//Blocklist.inject.SELECTOR_SEARCH_RESULT = '#search ol li:not(.blocklist-for-gsr-blocked)';

// ----

/**
 * Callback of a get blocklist
 * @param {Object} response
 */
Blocklist.inject.callbackGetBlocklist = function(response) {
    switch (response.type) {
        case Blocklist.sendType.SEND_BLOCKLIST:
            Blocklist.inject._blocklist = response.blocklist;
            var list = response.blocklist, compiled = [];
            for (var i = 0, len = list.length; i < len; i++) {
                var url = list[i];
                compiled.push(new RegExp(url));
            }
            Blocklist.inject._compiled_blocklist = compiled;
            break;

        default:
            break;
    }
};

Blocklist.inject.callbackGsrpMode = function(response) {
    Blocklist.inject.GSRP_MODE_CHANGED = Blocklist.inject.GSRP_MODE !== response.gsrpMode;
    Blocklist.inject.GSRP_MODE = response.gsrpMode;
};

Blocklist.inject.getCompiledBlocklist = function() {
    return Blocklist.inject._compiled_blocklist;
};

/**
 * After refresh for blocklist
 */
Blocklist.inject.refreshBlocklistAfter = function() {
    Blocklist.inject.handleLine(Blocklist.inject.GSRP_MODE);
};

Blocklist.inject.refreshBlocklist = function() {
    chrome.runtime.sendMessage(
        { type: Blocklist.sendType.GET_BLOCKLIST },
        function(response) {
            Blocklist.inject.callbackGetBlocklist(response);
            Blocklist.inject.refreshBlocklistAfter();
        }
    );
};

Blocklist.inject.sendRequestGsrpMode = function() {
    chrome.runtime.sendMessage(
        { type: Blocklist.sendType.GET_GSRP_MODE },
        Blocklist.inject.callbackGsrpMode
    );
};

/**
 * Fetch search results
 *
 * @return {Array}
 */
Blocklist.inject.fetchSearchResults = function() {
    return document.querySelectorAll(Blocklist.inject.SELECTOR_SEARCH_RESULT);
};

/**
 * Fetch search result a URL
 *
 * @return {Object}
 */
Blocklist.inject.fetchSearchResultURL = function(element) {
    return element ? element.querySelector(Blocklist.inject.SELECTOR_SEARCH_RESULT_URL) : null;
};

/**
 * Is blocked URL
 *
 * @param {String} url
 * @return {Boolean}
 */
Blocklist.inject.isBlocked = function(url) {
    return Blocklist.common.match(Blocklist.inject.getCompiledBlocklist(), url);
};

/**
 * Show a line matched in blocklist
 *
 * @return void
 */
Blocklist.inject.showLineMatchBlocklist = function() {
    if (!Blocklist.inject._blocklist) {
        return;
    }
    var results = Blocklist.inject.fetchSearchResults();
    if (!results || !results.length) {
        return;
    }
    var len = results.length;
    var regexp = new RegExp(Blocklist.inject.BLOCKED_NAME, 'g');
    console.log('Blocklist.inject.showLineMatchBlocklist - target.length = ', len);
    for (var i = 0; i < len; i++) {
        var line = results[i];
        var anchor = Blocklist.inject.fetchSearchResultURL(line);
        if (!anchor) {
            continue;
        }
        var url = anchor.getAttribute('href');
        var targetUrl = null;
        //url = '/url?url=' + encodeURIComponent(url);
        //var targetUrl = 'https://www.google.co.jp/url?url=' + encodeURIComponent(url);
        if (url.indexOf('/') === 0 || url.indexOf('https://www.google.') === 0) {
            var getParams = Blocklist.common.getUrlVars(url);
            if (getParams && getParams.url) {
                targetUrl = Blocklist.common.getAfterScheme(getParams.url);
            }
        }
        if (targetUrl === null) {
            targetUrl = Blocklist.common.getAfterScheme(url);
        }
        //console.log(url, targetUrl);
        if (Blocklist.inject.isBlocked(targetUrl)) {
            line.style.backgroundColor = '#dddddd';
            line.style.padding = '10px';
            if (line.className.indexOf(Blocklist.inject.BLOCKED_NAME) === -1) {
                line.className = line.className + ' ' + Blocklist.inject.BLOCKED_NAME;
            }
        } else {
            //console.log('else', Blocklist.inject.BLOCKED_NAME, line.className, line.className.indexOf(Blocklist.inject.BLOCKED_NAME));
            if (-1 < line.className.indexOf(Blocklist.inject.BLOCKED_NAME)) {
                line.className = line.className.replace(regexp, '');
            }
        }
        line.style.display = 'block';

        var el = line.querySelectorAll('.blocklist-for-gsr-action');
        if (el.length === 0) {
            var div = document.createElement('div');
            div.className = 'blocklist-for-gsr-action';
            var button = Blocklist.inject.addButton(
                'URL をブロック',
                'ab_button'
            );
            button.style.marginRight = '5px';
            button.click = function() {
            };
            div.appendChild(button);
            var button = Blocklist.inject.addButton(
                'ドメインをブロック',
                'ab_button'
            );
            button.style.marginRight = '5px';
            div.appendChild(button);
            line.appendChild(div);
        }
    }
};

Blocklist.inject.addButton = function(name, className) {
    var button = document.createElement('input');
    button.type = 'button';
    button.value = name;
    button.className = className;
    return button;
};

Blocklist.inject.hideLineMatchBlocklist = function() {
    if (!Blocklist.inject._blocklist) {
        return;
    }
    var results = Blocklist.inject.fetchSearchResults();
    if (!results || !results.length) {
        return;
    }
    var len = results.length;
    var regexp = new RegExp(Blocklist.inject.BLOCKED_NAME, 'g');
    console.log('Blocklist.inject.hideLineMatchBlocklist - target.length = ', len);
    for (var i = 0; i < len; i++) {
        var line = results[i];
        var anchor = Blocklist.inject.fetchSearchResultURL(line);
        if (!anchor) {
            continue;
        }
        var url = anchor.getAttribute('href');
        var targetUrl = null;
        //url = '/url?url=' + encodeURIComponent(url);
        //var targetUrl = 'https://www.google.co.jp/url?url=' + encodeURIComponent(url);
        if (url.indexOf('/') === 0 || url.indexOf('https://www.google.') === 0) {
            var getParams = Blocklist.common.getUrlVars(url);
            if (getParams && getParams.url) {
                targetUrl = Blocklist.common.getAfterScheme(getParams.url);
            }
        }
        if (targetUrl === null) {
            targetUrl = Blocklist.common.getAfterScheme(url);
        }
        //console.log(url, targetUrl);
        if (Blocklist.inject.isBlocked(targetUrl)) {
            line.style.display = 'none';
            if (line.className.indexOf(Blocklist.inject.BLOCKED_NAME) === -1) {
                line.className = line.className + ' ' + Blocklist.inject.BLOCKED_NAME;
            }
        } else {
            line.style.display = 'block';
            if (-1 < line.className.indexOf(Blocklist.inject.BLOCKED_NAME)) {
                line.className = line.className.replace(regexp, '');
            }
        }
    }
};

Blocklist.inject.initGsrp = function() {
    var elements = document.querySelectorAll('.' + Blocklist.inject.BLOCKED_NAME);
    var len = elements.length;
    var regexp = new RegExp(Blocklist.inject.BLOCKED_NAME, 'g');
    for (var i = 0; i < len; i++) {
        var line = elements[i];
        line.className = line.className.replace(regexp, '');
    }
};

Blocklist.inject.execute = function() {
    Blocklist.inject.sendRequestGsrpMode();
    Blocklist.inject.refreshBlocklist();
};

Blocklist.inject.addedMark = function() {
    return document.getElementById(Blocklist.inject.MARK_NAME) !== null;
};

Blocklist.inject.addMark = function() {
    if (!Blocklist.inject.addedMark()) {
        var div = document.createElement('div');
        div.setAttribute('id', Blocklist.inject.MARK_NAME);
        document.body.appendChild(div);
    }
};

Blocklist.inject.start = function() {
    Blocklist.inject.addMark();
    console.log('Blocklist for GSR', 'injected');
    Blocklist.inject.execute();
    Blocklist.inject.timerId = window.setInterval(function() {
        Blocklist.inject.execute();
    }, Blocklist.inject.INTERVAL);
};

Blocklist.inject.end = function() {
    window.clearInterval(Blocklist.inject.timerId);
};

Blocklist.inject.countUp = function() {
    Blocklist.inject.COUNTER++;
};

Blocklist.inject.handleLine = function(mode) {
    console.time('Blocklist.inject.handleLine');
    //if (Blocklist.inject.GSRP_MODE_CHANGED) {
    //    Blocklist.inject.initGsrp();
    //}
    Blocklist.inject.countUp();
    console.log('Blocklist.inject.COUNTER', Blocklist.inject.COUNTER);
    if (Blocklist.inject.COUNTER % 10 === 0) {
        console.clear();
        console.log('Blocklist.inject.handleLine', 'CLEAR!');
    }
    if (mode === 'show') {
        Blocklist.inject.showLineMatchBlocklist();
    } else {
        Blocklist.inject.hideLineMatchBlocklist();
    }
    console.timeEnd('Blocklist.inject.handleLine');
};

Blocklist.inject.listenMessage = function() {
    chrome.runtime.onMessage.addListener(function(request, sender, sendMessage) {
        console.log('inject.runtime.onMessage', request);
        switch (request.type) {
            case Blocklist.sendType.SEND_BLOCKLIST:
                Blocklist.inject._blocklist = request.blocklist;
                break;

            default:
                break;
        }
    });
};
