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

(function(ij) {

    /**
     * Blocklist
     * @type {Array}
     */
    ij._blocklist = null;
    ij._compiled_blocklist = null;

    ij.GSRP_MODE_CHANGED = false;

    /**
     * Blocklist Search Count
     * @type {Number}
     */
    ij.COUNTER = 0;

    /**
     * ID name of inject element
     * @type {String}
     */
    ij.MARK_NAME = 'blocklist-for-gsr-injection';

    /**
     * ID name of inject element
     * @type {String}
     */
    ij.BLOCKED_NAME = 'blocklist-for-gsr-blocked';

    /**
     * Interval
     * @type {Number}
     */
    ij.INTERVAL = 10000;

    /**
     * GSRP Mode
     * @type {String}
     */
    ij.GSRP_MODE = 'hide';

    /**
     * Class names of Search result
     * @type {Number}
     */
    ij.SELECTOR_SEARCH_RESULT = 'ol .g:not(.blocklist-for-gsr-blocked)';
    //ij.SELECTOR_SEARCH_RESULT = 'ol .g';
    //ij.SELECTOR_SEARCH_RESULT_URL = 'h3 a[href]';
    ij.SELECTOR_SEARCH_RESULT_URL = '.r a';
    //ij.SELECTOR_SEARCH_RESULT = '#search ol li:not(.blocklist-for-gsr-blocked)';

    // ----

    /**
     * Callback of a get blocklist
     * @param {Object} response
     */
    ij.callbackGetBlocklist = function(response) {
        switch (response.type) {
            case Blocklist.sendType.SEND_BLOCKLIST:
                ij._blocklist = response.blocklist;
                var list = response.blocklist, compiled = [];
                for (var i = 0, len = list.length; i < len; i++) {
                    var url = list[i];
                    compiled.push(new RegExp(url));
                }
                ij._compiled_blocklist = compiled;
                break;

            default:
                break;
        }
    };

    ij.callbackGsrpMode = function(response) {
        this.GSRP_MODE_CHANGED = this.GSRP_MODE !== response.gsrpMode;
        this.GSRP_MODE = response.gsrpMode;
    };

    ij.getCompiledBlocklist = function() {
        return this._compiled_blocklist;
    };

    /**
     * After refresh for blocklist
     */
    ij.refreshBlocklistAfter = function() {
        this.handleLine(this.GSRP_MODE);
    };

    ij.refreshBlocklist = function() {
        var that = ij;
        chrome.runtime.sendMessage(
            { type: Blocklist.sendType.GET_BLOCKLIST },
            function(response) {
                that.callbackGetBlocklist(response);
                that.refreshBlocklistAfter();
            }
        );
    };

    ij.sendRequestGsrpMode = function() {
        chrome.runtime.sendMessage(
            { type: Blocklist.sendType.GET_GSRP_MODE },
            this.callbackGsrpMode
        );
    };

    /**
     * Fetch search results
     *
     * @return {Array}
     */
    ij.fetchSearchResults = function() {
        return document.querySelectorAll(ij.SELECTOR_SEARCH_RESULT);
    };

    /**
     * Fetch search result a URL
     *
     * @return {Object}
     */
    ij.fetchSearchResultURL = function(element) {
        return element ? element.querySelector(ij.SELECTOR_SEARCH_RESULT_URL) : null;
    };

    /**
     * Is blocked URL
     *
     * @param {String} url
     * @return {Boolean}
     */
    ij.isBlocked = function(url) {
        return Blocklist.common.match(ij.getCompiledBlocklist(), url);
    };

    /**
     * Show a line matched in blocklist
     *
     * @return void
     */
    ij.showLineMatchBlocklist = function() {
        if (!ij._blocklist) {
            return;
        }
        var results = this.fetchSearchResults();
        if (!results || !results.length) {
            return;
        }
        var len = results.length;
        var regexp = new RegExp(ij.BLOCKED_NAME, 'g');
        Blocklist.logger.log('showLineMatchBlocklist - target.length = ', len);
        for (var i = 0; i < len; i++) {
            var line = results[i];
            var anchor = ij.fetchSearchResultURL(line);
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
            //Blocklist.logger.debug(url, targetUrl);
            if (ij.isBlocked(targetUrl)) {
                line.style.backgroundColor = '#dddddd';
                line.style.padding = '10px';
                if (line.className.indexOf(ij.BLOCKED_NAME) === -1) {
                    line.className = line.className + ' ' + ij.BLOCKED_NAME;
                }
            } else {
                //Blocklist.logger.debug(
                //    'else', ij.BLOCKED_NAME, line.className,
                //    line.className.indexOf(ij.BLOCKED_NAME)
                //);
                if (-1 < line.className.indexOf(ij.BLOCKED_NAME)) {
                    line.className = line.className.replace(regexp, '');
                }
            }
            line.style.display = 'block';

            var elements = line.querySelectorAll('.blocklist-for-gsr-buttons');
            if (elements.length === 0) {
                line.appendChild(this.getRowActionButtons(targetUrl));
            }
        }
    };

    ij.addButton = function(name, className) {
        var button = document.createElement('input');
        button.type = 'button';
        button.value = name;
        button.className = className;
        return button;
    };

    ij.getRowActionButtons = function(url) {
        var btnUrl = ij.addButton(
            'URL をブロック',
            'ab_button blocklist-for-gsr-button'
        );
        btnUrl.style.marginRight = '5px';
        btnUrl.setAttribute('data-url', url);
        btnUrl.setAttribute('data-type', 'blocked-url');

        var btnDomain = this.addButton(
            'ドメインをブロック',
            'ab_button blocklist-for-gsr-button'
        );
        btnDomain.style.marginRight = '5px';
        btnDomain.setAttribute('data-url', url);
        btnDomain.setAttribute('data-type', 'blocked-domain');

        var div = document.createElement('div');
        div.className = 'blocklist-for-gsr-buttons';
        div.appendChild(btnUrl);
        div.appendChild(btnDomain);

        return div;
    };

    ij.hideLineMatchBlocklist = function() {
        if (!this._blocklist) {
            return;
        }
        var results = this.fetchSearchResults();
        if (!results || !results.length) {
            return;
        }
        var len = results.length;
        var regexp = new RegExp(this.BLOCKED_NAME, 'g');
        Blocklist.logger.log('hideLineMatchBlocklist - target.length =', len);
        for (var i = 0; i < len; i++) {
            var line = results[i];
            var anchor = this.fetchSearchResultURL(line);
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
            //Blocklist.logger.debug(url, targetUrl);
            if (ij.isBlocked(targetUrl)) {
                line.style.display = 'none';
                if (line.className.indexOf(ij.BLOCKED_NAME) === -1) {
                    line.className = line.className + ' ' + ij.BLOCKED_NAME;
                }
            } else {
                line.style.display = 'block';
                if (-1 < line.className.indexOf(ij.BLOCKED_NAME)) {
                    line.className = line.className.replace(regexp, '');
                }
            }

            var elements = line.querySelectorAll('.blocklist-for-gsr-buttons');
            if (elements.length === 0) {
                line.appendChild(this.getRowActionButtons(targetUrl));
            }
        }
    };

    ij.initGsrp = function() {
        var elements = document.querySelectorAll('.' + ij.BLOCKED_NAME);
        var len = elements.length;
        var regexp = new RegExp(ij.BLOCKED_NAME, 'g');
        for (var i = 0; i < len; i++) {
            var line = elements[i];
            line.className = line.className.replace(regexp, '');
        }
    };

    ij.execute = function() {
        this.sendRequestGsrpMode();
        this.refreshBlocklist();
    };

    ij.addedMark = function() {
        return document.getElementById(this.MARK_NAME) !== null;
    };

    ij.addMark = function() {
        if (!this.addedMark()) {
            var div = document.createElement('div');
            div.setAttribute('id', ij.MARK_NAME);
            document.body.appendChild(div);
        }
    };

    ij.start = function() {
        ij.addMark();
        Blocklist.logger.info('INJECTED');
        ij.execute();
        ij.timerId = window.setInterval(function() {
            ij.execute();
        }, ij.INTERVAL);
    };

    ij.end = function() {
        window.clearInterval(ij.timerId);
    };

    ij.countUp = function() {
        this.COUNTER++;
    };

    ij.tempFunction = function() {
        console.log('click row');
        var type = this.getAttribute('data-type');
        var url = this.getAttribute('data-url');
        console.log(type, url);
    };

    ij.handleLine = function(mode) {
        Blocklist.logger.time('Handled Line');
        this.countUp();
        Blocklist.logger.info('COUNTER', this.COUNTER);
        if (this.COUNTER % 10 === 0) {
            Blocklist.logger.clear();
            Blocklist.logger.log('Handled Line - CLEAR!');
        }
        if (mode === 'show') {
            this.showLineMatchBlocklist();
        } else {
            this.hideLineMatchBlocklist();
        }
        var elements = document.querySelectorAll('.blocklist-for-gsr-button');
        if (0 < elements.length) {
            for (var i = 0; i < elements.length; i++) {
                elements[i].removeEventListener('click', ij.tempFunction);
                elements[i].addEventListener('click', ij.tempFunction);
            }
        }
        Blocklist.logger.timeEnd('Handled Line');
    };

    ij.listenMessage = function() {
        var that = ij;
        chrome.runtime.onMessage.addListener(function(request, sender, sendMessage) {
            Blocklist.logger.info('chrome.runtime.onMessage', request);
            switch (request.type) {
                case Blocklist.sendType.SEND_BLOCKLIST:
                    that._blocklist = request.blocklist;
                    break;

                default:
                    break;
            }
        });
    };

})(Blocklist.inject);
