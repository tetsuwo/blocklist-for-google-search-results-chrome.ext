/**
 * common.js for chrome extension
 *
 * @author Tetsuwo OISHI <tetsuwo.oishi@gmail.com>
 */

// ----

var Blocklist = {};

// ----

Blocklist.regex = {};
Blocklist.regex.INJECTION_LIST = [
    new RegExp('^https?:\/\/www\.google\.co\.jp\/?$'),
    new RegExp('^https?:\/\/www\.google\.co\.jp\/(\\?|search|webhp).*$'),
    new RegExp('^https?:\/\/www\.google\.com\/?$'),
    new RegExp('^https?:\/\/www\.google\.com\/(\\?|search|webhp).*$')
];
Blocklist.regex.DOMAIN = new RegExp('^https?:\/\/([a-z0-9\-\.\_]+)');

// ----

Blocklist.sendType = {};
Blocklist.sendType.GET_BLOCKLIST = 'GET_BLOCKLIST';
Blocklist.sendType.SEND_BLOCKLIST = 'SEND_BLOCKLIST';

// ----

Blocklist.common = {};

Blocklist.common.getDomain = function(url) {
    var matches = url.match(Blocklist.regex.DOMAIN);
    if (!matches) {
        return '';
    }
    var domain = matches[1];
    return domain;
};

Blocklist.common.matchInjectionList = function(url) {
    for (var i = 0, len = Blocklist.regex.INJECTION_LIST.length; i < len; i++) {
        var regex = Blocklist.regex.INJECTION_LIST[i];
        if (url.match(regex)) {
            return true;
        }
    }
    return false;
};

Blocklist.common.match = function(blocklist, domain) {
    for (var i = 0, len = blocklist.length; i < len; i++) {
        if (blocklist[i] === domain) {
            return true;
        }
    }
    return false;
};


//,
//  "content_scripts": [
//    {
//      "js": [
//        "js/common.js",
//        "js/injection-run.js"
//      ],
//      "matches": [
//        "*://www.google.co.jp/",
//        "*://www.google.co.jp/?*",
//        "*://www.google.co.jp/search*",
//        "*://www.google.co.jp/webhp*",
//        "*://www.google.com/",
//        "*://www.google.com/?*",
//        "*://www.google.com/search*",
//        "*://www.google.com/webhp*"
//      ]
//    }
//  ]
