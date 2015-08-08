// Copyright 2015 toishi-tech. All Rights Reserved.

/**
 * Google search result page injection script.
 *
 * @author tetsuwo.oishi@gmail.com (Tetsuwo OISHI)
 */
Blocklist.logger.setPrefixKey('{BlocklistGSR}');
Blocklist.logger.info('RUN');

// ----

if (!Blocklist.inject.addedMark()) {
    Blocklist.inject.start();
    Blocklist.inject.listenMessage();
}
