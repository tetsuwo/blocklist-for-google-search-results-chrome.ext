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
Blocklist.regex.AFTER_SCHEME = new RegExp('^https?:\/\/(.*)');

// ----

Blocklist.type = {};
Blocklist.type.GET_BLOCKLIST  = 'GET_BLOCKLIST';
Blocklist.type.SEND_BLOCKLIST = 'SEND_BLOCKLIST';
Blocklist.type.GET_GSRP_MODE  = 'GET_MODE';
Blocklist.type.SEND_GSRP_MODE = 'SEND_MODE';
Blocklist.type.GET_BLOCK_URL  = 'GET_BLOCK_URL';
Blocklist.type.SEND_BLOCK_URL = 'SEND_BLOCK_URL';

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

Blocklist.common.getAfterScheme = function(url) {
    var matches = url.match(Blocklist.regex.AFTER_SCHEME);
    if (!matches) {
        return '';
    }
    return matches[1];
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

Blocklist.common.equal = function(haystack, needle) {
    for (var i = 0, len = haystack.length; i < len; i++) {
        if (haystack[i] === needle) {
            return true;
        }
    }
    return false;
};

Blocklist.common.match = function(haystack, needle) {
    var len = haystack.length;
    for (var i = 0; i < len; i++) {
        if (haystack[i].exec(needle)) {
        //if (needle.match(haystack[i])) {
        //if (needle.match(new RegExp(haystack[i], 'i'))) {
            return true;
        }
    }
    return false;
};

Blocklist.common.getUrlVars = function(url) {
    var vars = [], hash;
    var hashes = url.slice(url.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = decodeURIComponent(hash[1]);
    }
    return vars;
};
