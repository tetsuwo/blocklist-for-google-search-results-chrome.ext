
DOM('#blocklist').value = db.get('raw_blocklist');

DOM('#apply').onclick = function(e) {
    Blocklist.utils.buildBlocklist(DOM('#blocklist').value);
};

DOM('#open-optimized-blocklist').onclick = function(e) {
    var blocklist = db.get('blocklist');
    DOM('#optimized-blocklist').value = blocklist.join('\n');
    DOM('#optimized-blocklist').style.display = 'block';
};

DOM('#show-line-gsrp').onclick = function(e) {
    db.set('gsrp_mode', 'show');
};

DOM('#hide-line-gsrp').onclick = function(e) {
    db.set('gsrp_mode', 'hide');
};

