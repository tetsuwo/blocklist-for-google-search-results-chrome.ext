/*!
 * JavaScript for Injection
 *
 * @author Tetsuwo OISHI
 */

console.log('injection', 'run');

// ----

Blocklist.inject = {};

Blocklist.inject._blocklist = null;

Blocklist.inject.SELECTOR_SEARCH_RESULT = '.g';
Blocklist.inject.SELECTOR_SEARCH_RESULT_URL = '.r a';

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

Blocklist.inject.refreshBlocklistAfter = function() {
    Blocklist.inject.hideMatchUrl();
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

Blocklist.inject.hideMatchUrl = function() {
    console.log('hideMatchUrl', Blocklist.inject._blocklist);
    if (!Blocklist.inject._blocklist) {
        return;
    }
    var results = document.querySelectorAll(Blocklist.inject.SELECTOR_SEARCH_RESULT);
    if (results && 0 < results.length) {
        for (var i = 0, len = results.length; i < len; i++) {
            var result = results[i];
            var a = result.querySelector(Blocklist.inject.SELECTOR_SEARCH_RESULT_URL);
            if (a) {
                var url = a.getAttribute('href');
                var domain = Blocklist.common.getDomain(url);
                console.log('URL', url, 'DOMAIN', domain);
                if (Blocklist.common.match(Blocklist.inject._blocklist, domain)) {
                    result.style.display = 'none';
                } else {
                    result.style.display = 'block';
                }
            }
        }
    }
};

Blocklist.inject.execute = function() {
    Blocklist.inject.refreshBlocklist();
};

Blocklist.inject.start = function() {
    Blocklist.inject.execute();
    window.setInterval(function() {
        Blocklist.inject.execute();
    }, 3000);
};

Blocklist.inject.listenMessage = function() {
    chrome.runtime.onMessage.addListener(function(request, sender, sendMessage) {
        //console.log('inject.runtime.onMessage', request);
        switch (request.type) {
            case Blocklist.sendType.SEND_BLOCKLIST:
                Blocklist.inject._blocklist = request.blocklist;
                break;

            default:
                break;
        }
    });
};

Blocklist.inject.start();
Blocklist.inject.listenMessage();
