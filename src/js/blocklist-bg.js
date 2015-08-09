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
            console.log('bg.runtime.onMessage', request);
            switch (request.type) {
                case Blocklist.type.GET_BLOCKLIST:
                    sendMessage({
                        type: Blocklist.type.SEND_BLOCKLIST,
                        blocklist: db.get('regexp_blocklist')
                    });
                    break;

                case Blocklist.type.GET_GSRP_MODE:
                    sendMessage({
                        type: Blocklist.type.SEND_GSRP_MODE,
                        gsrpMode: db.get('gsrp_mode')
                    });
                    break;

                case Blocklist.type.SEND_BLOCK_URL:
                    sendMessage({
                        type: Blocklist.type.GET_BLOCK_URL,
                        data: null
                    });
                    break;

                default:
                    break;
            }
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
