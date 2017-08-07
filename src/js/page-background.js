/*!
 * JavaScript for Background Page
 *
 * @author Tetsuwo OISHI
 */

try {
    Blocklist.bg.listenTabs();
    Blocklist.bg.listenMessage();
    Blocklist.bg.createContextMenus();
    Blocklist.bg.init();
} catch (e) {
    Blocklist.logger.error('page-background.js', e);
}
