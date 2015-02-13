// Copyright 2015 toishi-tech. All Rights Reserved.

/**
 * Google search result page injection script.
 *
 * @author tetsuwo.oishi@gmail.com (Tetsuwo OISHI)
 */
console.log('Blocklist for GSR', 'run');

// ----

/**
 * Inject Space
 */
Blocklist.inject = {};

/**
 * Blocklist
 * @type {Array}
 */
Blocklist.inject._blocklist = null;

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
 * Interval
 * @type {Number}
 */
Blocklist.inject.INTERVAL = 3000;

/**
 * GSRP Mode
 * @type {String}
 */
Blocklist.inject.GSRP_MODE = 'hide';

/**
 * Class names of Search result
 * @type {Number}
 */
Blocklist.inject.SELECTOR_SEARCH_RESULT = '.g';
Blocklist.inject.SELECTOR_SEARCH_RESULT_URL = '.r a';

/**
 * Callback of a get blocklist
 * @param {Object} response
 */
Blocklist.inject.callbackGetBlocklist = function(response) {
    //console.log('callbackGetBlocklist', response);
    switch (response.type) {
        case Blocklist.sendType.SEND_BLOCKLIST:
            Blocklist.inject._blocklist = response.blocklist;
            break;

        default:
            break;
    }
};

/**
 * After refresh for blocklist
 */
Blocklist.inject.refreshBlocklistAfter = function() {
    //console.log('Blocklist.inject._blocklist', Blocklist.inject._blocklist);
    Blocklist.inject.handleLine(Blocklist.inject.GSRP_MODE);
};

Blocklist.inject.refreshBlocklist = function() {
    //console.log('refreshBlocklist');
    chrome.runtime.sendMessage(
        { type: Blocklist.sendType.GET_BLOCKLIST },
        function(response) {
            Blocklist.inject.callbackGetBlocklist(response);
            Blocklist.inject.refreshBlocklistAfter();
        }
    );
};

/**
 * Fetch search results
 * @return {Array}
 */
Blocklist.inject.fetchSearchResults = function() {
    return document.querySelectorAll(Blocklist.inject.SELECTOR_SEARCH_RESULT);
};

/**
 * Fetch search result a URL
 * @return {Object}
 */
Blocklist.inject.fetchSearchResultURL = function(element) {
    return element ? element.querySelector(Blocklist.inject.SELECTOR_SEARCH_RESULT_URL) : null;
};

Blocklist.inject.showLineMatchBlocklist = function() {
    if (!Blocklist.inject._blocklist) {
        return;
    }
    console.log('Blocklist.inject.showLineMatchBlocklist');
    //console.time('inject.start');
    var results = Blocklist.inject.fetchSearchResults();
    if (!results || !results.length) {
        return;
    }
    for (var i = 0, len = results.length; i < len; i++) {
        var line = results[i];
        var a = Blocklist.inject.fetchSearchResultURL(line);
        if (!a) {
            return;
        }
        var url = a.getAttribute('href');
        //var domain = Blocklist.common.getDomain(url);
        var domainPath = Blocklist.common.getAfterScheme(url);
        //console.log('URL', url, 'DOMAIN', domainPath);
        if (Blocklist.common.match(Blocklist.inject._blocklist, domainPath)) {
            line.style.backgroundColor = '#dddddd';
            //line.style.padding = '10px';
        }
        line.style.display = 'block';
    }
    //console.timeEnd('inject.start');
};

Blocklist.inject.hideLineMatchBlocklist = function() {
    if (!Blocklist.inject._blocklist) {
        return;
    }
    console.log('Blocklist.inject.hideLineMatchBlocklist');
    //console.time('inject.start');
    var results = Blocklist.inject.fetchSearchResults();
    if (!results || !results.length) {
        return;
    }
    for (var i = 0, len = results.length; i < len; i++) {
        var line = results[i];
        var a = Blocklist.inject.fetchSearchResultURL(line);
        if (!a) {
            return;
        }
        var url = a.getAttribute('href');
        //var domain = Blocklist.common.getDomain(url);
        var domainPath = Blocklist.common.getAfterScheme(url);
        //console.log('URL', url, 'DOMAIN', domainPath);
        if (Blocklist.common.match(Blocklist.inject._blocklist, domainPath)) {
            line.style.display = 'none';
        } else {
            line.style.display = 'block';
        }
    }
    console.timeEnd('inject.start');
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

Blocklist.inject.sendRequestGsrpMode = function() {
    chrome.runtime.sendMessage(
        { type: Blocklist.sendType.GET_GSRP_MODE },
        Blocklist.inject.callbackGsrpMode
    );
};

Blocklist.inject.handleLine = function(mode) {
    if (mode === 'show') {
        Blocklist.inject.showLineMatchBlocklist();
    } else {
        Blocklist.inject.hideLineMatchBlocklist();
    }
};

Blocklist.inject.callbackGsrpMode = function(response) {
    console.log('Blocklist.inject.handleGsrpMode', response);
    Blocklist.inject.GSRP_MODE = response.gsrpMode;
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

if (!Blocklist.inject.addedMark()) {
    Blocklist.inject.start();
    Blocklist.inject.listenMessage();
}
