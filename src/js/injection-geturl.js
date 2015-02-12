/*!
 * JavaScript for Injection
 *
 * @author Tetsuwo OISHI
 */

console.log('injection', 'geturl');
chrome.extension.sendRequest({ title: document.title, url: location });
