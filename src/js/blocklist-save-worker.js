/**
 *
 *
 */

importScripts('../lib/lodash.min.js', 'blocklist-common.js', 'blocklist-utils.js');

// ----

var My = {};

My.doSaveBlocklist = function(blocklist, afterSchemeDomains) {
    var blocklists = Blocklist.utils.buildBlocklist(
        blocklist,
        afterSchemeDomains
    );
    self.postMessage({
        ack: true,
        success: true,
        blocklists: blocklists
    });
};


// ----

self.onmessage = function(e) {
    if (!e || !e.data || !e.data.command) {
        self.postMessage(null);
        return;
    }
    var data = e.data;
    switch (data.command) {
        case 'save-blocklist':
            My.doSaveBlocklist(data.blocklist, data.afterSchemeDomains);
            break;

        default:
            self.postMessage(null);
            break;
    }
    self.close();
};
