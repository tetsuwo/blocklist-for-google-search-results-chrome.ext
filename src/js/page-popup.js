
DOM('#blocklist').value = db.get('raw_blocklist');

DOM('#apply').onclick = function(e) {
    var raw_blocklist = DOM('#blocklist').value;
    db.set('raw_blocklist', raw_blocklist);
    var blocklist_urls = raw_blocklist.split("\n");
    var blocklist = [];
    for (var i = 0, len = blocklist_urls.length; i < len; i++) {
        var url = _.trim(blocklist_urls[i]);
        if (_.isEmpty(url)) {
            continue;
        }
        if (url.match(Blocklist.regex.DOMAIN)) {
            blocklist.push(RegExp.$1);
        } else {
            blocklist.push(_.trimRight(url, '/'));
        }
    }
    blocklist = _.uniq(blocklist);
    //console.log('blocklist', blocklist);
    db.set('blocklist', blocklist);
};

DOM('#open-optimized-blocklist').onclick = function(e) {
    var blocklist = db.get('blocklist');
    DOM('#optimized-blocklist').value = blocklist.join('\n');
    DOM('#optimized-blocklist').style.display = 'block';
};
