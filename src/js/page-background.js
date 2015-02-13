/*!
 * JavaScript for Background Page
 *
 * @author Tetsuwo OISHI
 */

Blocklist.bg = {};

Blocklist.bg.listenTabs = function() {
    chrome.tabs.onActivated.addListener(function(info) {
        chrome.tabs.get(info.tabId, function(tab) {
            //console.log('onActivated', tab);
            if (Blocklist.common.matchInjectionList(tab.url)) {
                Blocklist.bg.runBlock();
            }
        });
    });
    chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
        if (changeInfo.status === 'loading') {
            //console.log('onUpdated', tab);
            if (Blocklist.common.matchInjectionList(tab.url)) {
                Blocklist.bg.runBlock();
            }
            return;
        }
    });
};

Blocklist.bg.listenMessage = function() {
    chrome.runtime.onMessage.addListener(function(request, sender, sendMessage) {
        console.log('bg.runtime.onMessage', request);
        switch (request.type) {
            case Blocklist.sendType.GET_BLOCKLIST:
                sendMessage({
                    type: Blocklist.sendType.SEND_BLOCKLIST,
                    blocklist: db.get('regexp_blocklist')
                });
                break;

            case Blocklist.sendType.GET_GSRP_MODE:
                sendMessage({
                    type: Blocklist.sendType.SEND_GSRP_MODE,
                    gsrpMode: db.get('gsrp_mode')
                });
                break;

            default:
                break;
        }
    });
};

Blocklist.bg.getUrl = function(callback) {
    chrome.tabs.getSelected(null, function(tab) {
        if (tab.url) {
            try {
                chrome.tabs.executeScript(null, { file: 'js/injection-geturl.js' });
            } catch (e) {
                console.error('Blocklist.bg.getUrl', e);
            }
        } else {
            callback(null);
        }
    });
};

Blocklist.bg.runBlock = function() {
    //console.log('runBlocklist');
    try {
        chrome.tabs.executeScript(null, { file: 'js/common.js' });
        chrome.tabs.executeScript(null, { file: 'js/injection-run.js' });
    } catch (e) {
        console.error('Blocklist.bg.runBlock', e);
    }
};

Blocklist.bg.listenTabs();
Blocklist.bg.listenMessage();
