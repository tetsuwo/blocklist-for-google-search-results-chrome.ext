/*!
 * JavaScript Original Functions
 *
 * @author Tetsuwo OISHI
 */

function DOM(selector) {
    return document.querySelector(selector);
}


function getMessage(a) {
    return chrome.i18n.getMessage(a) ? chrome.i18n.getMessage(a) : false;
}
