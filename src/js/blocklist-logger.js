// Copyright 2015 toishi-tech. All Rights Reserved.

/**
 * Blocklist for Logger
 *
 * @author tetsuwo.oishi@gmail.com (Tetsuwo OISHI)
 */

/**
 * Logger Space
 */
Blocklist.logger = {};

(function(logger) {

    logger.prefixKey = '{Blocklist.logger}';

    logger.setPrefixKey = function(prefixKey) {
        this.prefixKey = prefixKey;
    };

    logger.toArray = function(args) {
        if (args.length === 1) {
            return args[0];
        }
        var ret = [];
        var a = 0;
        for (var i = 0; i < args.length; i++) {
            ret.push(args[i]);
            if ('string' === typeof args[i] || 'number' === typeof args[i]) {
                a++;
            }
        }
        return args.length === a ? ret.join(' ') : ret;
    };

    logger.time = function(key) {
        console.time(this.prefixKey + ' ' + key);
    };

    logger.timeEnd = function(key) {
        console.timeEnd(this.prefixKey + ' ' + key);
    };

    logger.info = function() {
        console.info(this.prefixKey, this.toArray(arguments));
    };

    logger.log = function() {
        console.log(this.prefixKey, this.toArray(arguments));
    };

    logger.warn = function() {
        console.warn(this.prefixKey, this.toArray(arguments));
    };

    logger.debug = function() {
        console.debug(this.prefixKey, this.toArray(arguments));
    };

    logger.error = function() {
        console.error(this.prefixKey, this.toArray(arguments));
    };

    logger.clear = function() {
        console.clear();
    };

})(Blocklist.logger);
