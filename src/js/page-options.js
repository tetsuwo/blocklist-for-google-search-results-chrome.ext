/**
 *
 *
 */

var Page = {};

Page.switchAllButtons = function(enabled) {
    this.switchApplyButton(enabled);
    this.switchOptimizedBlocklistButton(enabled);
    this.switchApplySchemeDomainsButton(enabled);
};

Page.switchApplyButton = function(enabled) {
    DOM('#apply').disabled = !enabled;
};

Page.switchOptimizedBlocklistButton = function(enabled) {
    DOM('#open-optimized-blocklist').disabled = !enabled;
};

Page.switchApplySchemeDomainsButton = function(enabled) {
    DOM('#apply-after-scheme-domains').disabled = !enabled;
};

Page.blink = function(selector) {
    var elements = document.querySelectorAll(selector);
    for (var i = 0; i < elements.length; i++) {
        var el = elements[i];
        el.className += ' blink';
    }
};

Page.unblink = function(selector) {
    var elements = document.querySelectorAll(selector);
    for (var i = 0; i < elements.length; i++) {
        var el = elements[i];
        el.className = el.className.replace('blink', '');
    }
};

Page.displaySaving = function() {
    var elements = document.querySelectorAll('.display-message');
    for (var i = 0; i < elements.length; i++) {
        var el = elements[i];
        el.innerText = '保存中です...';
    }
    this.blink('.display-message');
};

Page.displaySaved = function() {
    var elements = document.querySelectorAll('.display-message');
    for (var i = 0; i < elements.length; i++) {
        var el = elements[i];
        el.innerText = '';
    }
    this.unblink('.display-message');
};

// ----

DOM('#blocklist').value = db.get('raw_blocklist');
DOM('#after-scheme-domains').value = db.get('raw_after_scheme_domains');

// ----

DOM('#apply').onclick = function(e) {
    Page.switchAllButtons(false);
    Page.displaySaving();
    var worker = new Worker(chrome.extension.getURL('js/blocklist-save-worker.js'));
    worker.onmessage = function(e) {
        console.log('worker receive');
        if (!e || !e.data || !e.data.blocklists) {
            return;
        }
        var data = e.data.blocklists;
        console.log(data);
        db.set('raw_blocklist', data.rawBlocklist);
        db.set('blocklist', data.blocklist);
        db.set('regexp_blocklist', data.regexpBlocklist);
        Page.switchAllButtons(true);
        Page.displaySaved();
    };
    worker.postMessage({
        command: 'save-blocklist',
        blocklist: DOM('#blocklist').value,
        afterSchemeDomains: Blocklist.utils.fetchAfterSchemeDomains()
    });
};

DOM('#open-optimized-blocklist').onclick = function(e) {
    Page.switchAllButtons(false);
    Page.displaySaving();
    var blocklist = db.get('blocklist');
    DOM('#optimized-blocklist').value = blocklist.join('\n');
    DOM('#optimized-blocklist').style.display = 'block';
    Page.switchAllButtons(true);
    Page.displaySaved();
};

DOM('#apply-after-scheme-domains').onclick = function(e) {
    Page.switchAllButtons(false);
    Page.displaySaving();
    var raw_blocklist = DOM('#after-scheme-domains').value;
    var blocklist_urls = Blocklist.utils.convertArray(raw_blocklist);
    db.set('raw_after_scheme_domains', raw_blocklist);
    db.set('after_scheme_domains', Blocklist.utils.getBlocklist(blocklist_urls));
    console.log('goge', raw_blocklist, Blocklist.utils.getBlocklist(blocklist_urls));
    var worker = new Worker(chrome.extension.getURL('js/blocklist-save-worker.js'));
    worker.onmessage = function(e) {
        if (!e || !e.data || !e.data.blocklists) {
            return;
        }
        var data = e.data.blocklists;
        console.log(data);
        db.set('raw_blocklist', data.rawBlocklist);
        db.set('blocklist', data.blocklist);
        db.set('regexp_blocklist', data.regexpBlocklist);
        Page.switchAllButtons(true);
        Page.displaySaved();
    };
    worker.postMessage({
        command: 'save-blocklist',
        blocklist: db.get('raw_blocklist'),
        afterSchemeDomains: Blocklist.utils.fetchAfterSchemeDomains()
    });
};
