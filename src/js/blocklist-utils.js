
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
        if (url.match(Blocklist.regex.DOMAIN)) {
            domain = RegExp.$1;
            if (afterSchemes && Blocklist.common.equal(afterSchemes, domain)) {
                if (url.match(Blocklist.regex.AFTER_SCHEME)) {
                    var afterScheme = RegExp.$1;
                    console.log('Blocklist.regex.AFTER_SCHEME', url, afterScheme);
                    blocklist.push(afterScheme);
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

Blocklist.utils.buildBlocklist = function(raw_blocklist, after_scheme_domains) {
    var blocklist_urls = Blocklist.utils.convertArray(raw_blocklist);
    var blocklist = Blocklist.utils.getBlocklist(
        blocklist_urls,
        after_scheme_domains
    );
    var regexp_blocklist = [];
    for (var i = 0, len = blocklist.length; i < len; i++) {
        var url = blocklist[i];
        var replacedUrl = '^' + url.replace(/([.*+?^=!:${}()|[\]\/\\])/g, "\\$1");
        regexp_blocklist.push(replacedUrl);
    }
    return {
        rawBlocklist: raw_blocklist,
        blocklist: blocklist,
        regexpBlocklist: regexp_blocklist
    };
};

