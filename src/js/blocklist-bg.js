// Copyright 2015 toishi-tech. All Rights Reserved.

/**
 * Blocklist for Background
 *
 * @author tetsuwo.oishi@gmail.com (Tetsuwo OISHI)
 */

/**
 * Background Space
 */
Blocklist.bg = {};

(function(bg) {

    bg.INITIALIZED = false;

    bg.COUNTER = 0;

    bg.LOG_CLEAR_INTERVAL = 10;

    bg.storage = {
        parsedUrl: {}
    };

    bg.init = function() {
        this.INITIALIZED = true;
    };

    bg.countUp = function() {
        this.COUNTER++;
    };

    bg.handleClearLog = function() {
        if (this.LOG_CLEAR_INTERVAL < this.COUNTER) {
            console.clear();
            this.COUNTER = 0;
        }
    };

    bg.listenTabs = function() {
        chrome.tabs.onActivated.addListener(function(info) {
            chrome.tabs.get(info.tabId, function(tab) {
                if (Blocklist.common.matchInjectionList(tab.url)) {
                    bg.runBlock();
                }
            });
        });
        chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
            if (changeInfo.status === 'loading') {
                if (Blocklist.common.matchInjectionList(tab.url)) {
                    bg.runBlock();
                }
                return;
            }
        });
    };

    bg.getImageUrl = function(targetUrl, imageUrl) {
        var newUrl = imageUrl;

        // 画像 URL が絶対パス
        if (imageUrl.charAt(0) === '/' && imageUrl.charAt(1) !== '/') {
            var homeUrl = Blocklist.common.getHomeUrl(targetUrl);
            if (homeUrl.slice(-1) === '/') {
                newUrl = homeUrl + imageUrl;
            } else {
                newUrl = homeUrl + '/' + imageUrl;
            }
        }
        // 画像 URL が相対パス
        else if (imageUrl.charAt(0) === '.') {
            var baseUrl = targetUrl;
            if (10 < targetUrl.lastIndexOf('/')) {
                baseUrl = targetUrl.slice(0, targetUrl.lastIndexOf('/') + 1);
            }
            if (imageUrl.slice(-1) === '/') {
                newUrl = baseUrl + imageUrl;
            } else {
                newUrl = baseUrl + imageUrl;
            }
        }

        return newUrl;
    };

    bg.listenMessage = function() {
        chrome.runtime.onMessage.addListener(function(request, sender, sendMessage) {
            bg.handleClearLog();
            console.log('bg.runtime.onMessage', request);

            switch (request.type) {
                case Blocklist.type.REQUEST_PARSE_URL:
                    var targetUrl = request.data.url;

                    fetch(targetUrl).then(function(response) {
                        return response.text();
                    }).then(function(text) {
                        var imageUrls = [];

                        var imageTags = text.match(/<img[^>]+>/g);
                        if (imageTags && imageTags.length) {
                            imageTags.forEach(function(imageTag) {
                                var matches = imageTag.match(/src=["|'](.*?)["|']/);
                                if (matches && matches[1]) {
                                    imageUrls.push(bg.getImageUrl(targetUrl, matches[1]));
                                }
                            });
                        }


                        var bgImages = text.match(/url\s?\(["|'][^\)["|']]+\)/g);
                        if (bgImages && bgImages.length) {
                            bgImages.forEach(function(matches) {
                                if (matches && matches[1]) {
                                    imageUrls.push(bg.getImageUrl(targetUrl, matches[1]));
                                }
                            });
                        }

                        if (!imageUrls.length) {
                            return;
                        }

                        imageUrls = imageUrls.filter(Blocklist.common.onlyUnique);

                        if (!bg.storage.parsedUrl[targetUrl]) {
                            bg.storage.parsedUrl[targetUrl] = {};
                        }

                        Blocklist.logger.log(
                            'fetched',
                            targetUrl,
                            imageUrls
                        );

                        var tmp = bg.storage.parsedUrl[targetUrl];
                        tmp.status = 'parsed';
                        tmp.lineId = request.data.lineId;
                        tmp.url = targetUrl;
                        tmp.imageUrls = imageUrls;
                    });

                    sendMessage({
                        type: Blocklist.type.REQUESTED_PARSE_URL,
                        receiveType: request.type,
                        data: {
                            lineId: request.data.lineId,
                            url: targetUrl
                        }
                    });

                    break;

                case Blocklist.type.GET_PARSED_URL_LIST:
                    sendMessage({
                        type: Blocklist.type.SEND_PARSED_URL_LIST,
                        receiveType: request.type,
                        data: {
                            urlList: bg.storage.parsedUrl
                        }
                    });
                    break;

                case Blocklist.type.GET_BLOCKLIST:
                    sendMessage({
                        type: Blocklist.type.SEND_BLOCKLIST,
                        receiveType: request.type,
                        data: {
                            blocklist: db.get('regexp_blocklist')
                        }
                    });
                    break;

                case Blocklist.type.GET_GSRP_MODE:
                    sendMessage({
                        type: Blocklist.type.SEND_GSRP_MODE,
                        receiveType: request.type,
                        gsrpMode: db.get('gsrp_mode')
                    });
                    break;

                case Blocklist.type.SEND_BLOCK_URL:
                    var targetUrl = null;

                    switch (request.data.blockType) {
                        case 'blocked-url':
                            targetUrl = request.data.blockUrl;
                            break;

                        case 'blocked-domain':
                            var tmp = Blocklist.utils.detectDomain(request.data.blockUrl);
                            if (tmp === null) {
                                targetUrl = request.data.blockUrl;
                            } else {
                                targetUrl = tmp;
                            }
                            break;

                        default:
                            return false;
                    }

                    try {
                        Blocklist.utils.saveBlocklist(targetUrl);
                        sendMessage({
                            type: Blocklist.type.GET_BLOCK_URL,
                            receiveType: request.type,
                            data: {
                                url: targetUrl,
                                blocklist: db.get('regexp_blocklist')
                            }
                        });
                    } catch (e) {
                        console.error('FAILED', e);
                    }
                    break;

                default:
                    console.error('Not found request type (bg.listenMessage)');
                    break;
            }

            bg.countUp();
        });
    };

    bg.getUrl = function(callback) {
        chrome.tabs.getSelected(null, function(tab) {
            if (tab.url) {
                try {
                    chrome.tabs.executeScript(null, { file: 'js/injection-geturl.js' });
                } catch (e) {
                    console.error('bg.getUrl', e);
                }
            } else {
                callback(null);
            }
        });
    };

    bg.runBlock = function() {
        try {
            chrome.tabs.executeScript(null, { file: 'js/blocklist-common.js' });
            chrome.tabs.executeScript(null, { file: 'js/blocklist-logger.js' });
            chrome.tabs.executeScript(null, { file: 'js/blocklist-inject.js' });
            chrome.tabs.executeScript(null, { file: 'js/injection-run.js' });
        } catch (e) {
            console.error('bg.runBlock', e);
        }
    };

    bg.createContextMenus = function() {
        if (this.INITIALIZED) {
            return;
        }

        var contextMenuId = chrome.contextMenus.create({
            title: getMessage('ext_name'),
            type: 'normal',
            contexts: ['all']
        });

        chrome.contextMenus.create({
            title: getMessage('add_domain_with_context_menu'),
            type: 'normal',
            contexts: ['all'],
            parentId: contextMenuId,
            onclick: function(info) {
                var url = info.pageUrl;
                var target = '';

                var tmp = Blocklist.utils.detectDomain(url);
                if (tmp === null) {
                    target = url;
                } else {
                    target = tmp;
                }

                if (!window.confirm(target + '\n\nOK?')) {
                    return;
                }

                Blocklist.logger.info(url, target);

                try {
                    Blocklist.utils.saveBlocklist(target);
                } catch (e) {
                    console.error('FAILED', e);
                }
            }
        });

        chrome.contextMenus.create({
            title: getMessage('add_url_with_context_menu'),
            type: 'normal',
            contexts: ['all'],
            parentId: contextMenuId,
            onclick: function(info) {
                var url = info.pageUrl;
                Blocklist.logger.info(url);

                if (!window.confirm(url + '\n\nOK?')) {
                    return;
                }

                try {
                    Blocklist.utils.saveBlocklist(url);
                } catch (e) {
                    console.error('FAILED', e);
                }
            }
        });

        chrome.contextMenus.create({
            title: getMessage('go_to_options_page'),
            type: 'normal',
            contexts: ['all'],
            parentId: contextMenuId,
            onclick: function() {
                chrome.runtime.openOptionsPage();
            }
        });
    };

})(Blocklist.bg);
