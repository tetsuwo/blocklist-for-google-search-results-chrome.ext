
DOM('#blocklist').value = db.get('raw_blocklist');
DOM('#after-scheme-domains').value = db.get('raw_after_scheme_domains');

DOM('#apply').onclick = function(e) {
    Blocklist.utils.buildBlocklist(DOM('#blocklist').value);
};

DOM('#open-optimized-blocklist').onclick = function(e) {
    var blocklist = db.get('blocklist');
    DOM('#optimized-blocklist').value = blocklist.join('\n');
    DOM('#optimized-blocklist').style.display = 'block';
};

DOM('#apply-after-scheme-domains').onclick = function(e) {
    var raw_blocklist = DOM('#after-scheme-domains').value;
    var blocklist_urls = Blocklist.utils.convertArray(raw_blocklist);
    db.set('raw_after_scheme_domains', raw_blocklist);
    db.set('after_scheme_domains', Blocklist.utils.getBlocklist(blocklist_urls));
    console.log('goge', raw_blocklist, Blocklist.utils.getBlocklist(blocklist_urls));
    Blocklist.utils.buildBlocklist(db.get('raw_blocklist'));
};

