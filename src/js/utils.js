
Blocklist.utils = {};

Blocklist.utils.convertArray = function(text) {
    return text.split("\n");
};

Blocklist.utils.getBlocklist = function(urls, afterSchemes) {
    var domain, blocklist = [];
    for (var i = 0, len = urls.length; i < len; i++) {
        var url = _.trim(urls[i]), domain = null;
        if (_.isEmpty(url)) {
            continue;
        }
        // ドメイン形式にマッチしたら
        if (url.match(Blocklist.regex.DOMAIN)) {
            domain = RegExp.$1;
            //console.log(domain, afterSchemes);
            // scheme より後にマッチさせる場合
            if (afterSchemes && Blocklist.common.equal(afterSchemes, domain)) {
                //console.log('matched', domain, afterSchemes);
                if (url.match(Blocklist.regex.AFTER_SCHEME)) {
                    console.log('Blocklist.regex.AFTER_SCHEME', url, RegExp.$1);
                    blocklist.push(RegExp.$1);
                }
            } else {
                blocklist.push(domain);
            }
        }

        if (!domain) {
            blocklist.push(_.trimRight(url, '/'));
        }
    }
    return _.uniq(blocklist);
};

Blocklist.utils.fetchAfterSchemeDomains = function() {
    return db.get('after_scheme_domains');
};

Blocklist.utils.buildBlocklist = function(raw_blocklist) {
    var blocklist_urls = Blocklist.utils.convertArray(raw_blocklist);
    db.set('raw_blocklist', raw_blocklist);
    db.set('blocklist',
        Blocklist.utils.getBlocklist(
            blocklist_urls,
            Blocklist.utils.fetchAfterSchemeDomains()
        )
    );
    var list = db.get('blocklist'), regexp_blocklist = [];
    for (var i = 0, len = list.length; i < len; i++) {
        var url = list[i];
        regexp_blocklist.push(url.replace(/([.*+?^=!:${}()|[\]\/\\])/g, "\\$1"));
    }
    db.set('regexp_blocklist', regexp_blocklist);
};

