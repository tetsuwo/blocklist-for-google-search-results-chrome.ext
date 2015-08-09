// Copyright 2015 toishi-tech. All Rights Reserved.

/**
 * Blocklist for Background
 *
 * @author tetsuwo.oishi@gmail.com (Tetsuwo OISHI)
 */

/**
 * Background Space
 */
Blocklist.bg = {};

(function(bg) {

    bg.COUNTER = 0;

    bg.LOG_CLEAR_INTERVAL = 10;

    bg.countUp = function() {
        this.COUNTER++;
    };

    bg.handleClearLog = function() {
        if (this.LOG_CLEAR_INTERVAL < this.COUNTER) {
            console.clear();
            this.COUNTER = 0;
        }
    };

    bg.listenTabs = function() {
        chrome.tabs.onActivated.addListener(function(info) {
            chrome.tabs.get(info.tabId, function(tab) {
                if (Blocklist.common.matchInjectionList(tab.url)) {
                    bg.runBlock();
                }
            });
        });
        chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
            if (changeInfo.status === 'loading') {
                if (Blocklist.common.matchInjectionList(tab.url)) {
                    bg.runBlock();
                }
                return;
            }
        });
    };

    bg.listenMessage = function() {
        chrome.runtime.onMessage.addListener(function(request, sender, sendMessage) {
            bg.handleClearLog();
            console.log('bg.runtime.onMessage', request);
            switch (request.type) {
                case Blocklist.type.GET_BLOCKLIST:
                    sendMessage({
                        type: Blocklist.type.SEND_BLOCKLIST,
                        receiveType: request.type,
                        data: {
                            blocklist: db.get('regexp_blocklist')
                        }
                    });
                    break;

                case Blocklist.type.GET_GSRP_MODE:
                    sendMessage({
                        type: Blocklist.type.SEND_GSRP_MODE,
                        receiveType: request.type,
                        gsrpMode: db.get('gsrp_mode')
                    });
                    break;

                case Blocklist.type.SEND_BLOCK_URL:
                    var raw_blocklist = db.get('raw_blocklist');
                    raw_blocklist = request.data.url + '\n' + raw_blocklist;
                    Blocklist.utils.buildBlocklist(raw_blocklist);
                    sendMessage({
                        type: Blocklist.type.GET_BLOCK_URL,
                        receiveType: request.type,
                        data: {
                            url: url,
                            blocklist: db.get('regexp_blocklist')
                        }
                    });
                    break;

                default:
                    console.error('Not found request type (bg.listenMessage)');
                    break;
            }
            bg.countUp();
        });
    };

    bg.getUrl = function(callback) {
        chrome.tabs.getSelected(null, function(tab) {
            if (tab.url) {
                try {
                    chrome.tabs.executeScript(null, { file: 'js/injection-geturl.js' });
                } catch (e) {
                    console.error('bg.getUrl', e);
                }
            } else {
                callback(null);
            }
        });
    };

    bg.runBlock = function() {
        try {
            chrome.tabs.executeScript(null, { file: 'js/blocklist-common.js' });
            chrome.tabs.executeScript(null, { file: 'js/blocklist-logger.js' });
            chrome.tabs.executeScript(null, { file: 'js/blocklist-inject.js' });
            chrome.tabs.executeScript(null, { file: 'js/injection-run.js' });
        } catch (e) {
            console.error('bg.runBlock', e);
        }
    };

})(Blocklist.bg);
