/*!
 * JavaScript for Background Page
 *
 * @author Tetsuwo OISHI
 */

Blocklist.bg.listenTabs();
Blocklist.bg.listenMessage();


chrome.contextMenus.create({
  "title" : getMessage('add_domain_with_context_menu'),
  "type"  : "normal",
  "contexts" : ["all"],
  "onclick" : function(info) {
    console.log('info', info);
    var url = "https://www.google.co.jp/"
    chrome.tabs.create({ url : url});
  }
});
