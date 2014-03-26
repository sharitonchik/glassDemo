/**
 * Created by sergey on 2/23/14.
 */

//    "velvetUrl": "velvet-na-dev.cloudapp.net",


var nodeUrl = require('url'),
    googleapis = require('googleapis'),
    OAuth2Client = googleapis.OAuth2Client,
    timeline = require('./timeline'),
    config = require('./config'),
    velvet = require('./velvet');

var oauth2Client = new OAuth2Client(config.CLIENT_ID, config.CLIENT_SECRET, config.REDIRECT_URL);
velvet.setConfig(config.velvetConfig);

function mainRequest(request, response) {
    if (!oauth2Client.credentials) {
        var url = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: 'https://www.googleapis.com/auth/glass.timeline'
        });
        console.log('GET oauth2Client url: ', url);
        response.redirect(url);
    } else {
        response.sendfile('index.html');
    }
}

function getNewsConfig(request, response) {
    response.sendfile("velvetNewsConfig.json");
}

function getScript(request, response) {
    response.sendfile(__dirname + request.path);
}

function getStyles(request, response) {
    response.sendfile(__dirname + request.path);
}


function timelineClear(request, response) {
    if (!oauth2Client.credentials) {
        var url = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: 'https://www.googleapis.com/auth/glass.timeline'
        });
        console.log('uri ', url);
        response.redirect(url);
    } else {
        mirrorApiExecute('list', null, function (data) {
            console.log('TIMELINE LIST response: ', data);
            for (var i = 0, len = data.items.length, item; i < len; i += 1) {
                item = data.items[i];
                console.log('item id: ', item.id);
                mirrorApiExecute('delete', item.id, success, failure);
            }
            response.send('All items deleted.');
        }, failure);
    }
}

function timelineDeleteItem(request, response) {
    if (!oauth2Client.credentials) {
        var url = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: 'https://www.googleapis.com/auth/glass.timeline'
        });
        console.log('uri ', url);
        response.redirect(url);
    } else {
        var url_parts = nodeUrl.parse(request.url, true);
        var query = url_parts.query;
        var id = query.id || query.itemId;

        mirrorApiExecute('delete', id, success, failure);
    }
}

function timelineList(request, response) {
    if (!oauth2Client.credentials) {
        var url = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: 'https://www.googleapis.com/auth/glass.timeline'
        });
        console.log('uri ', url);
        response.redirect(url);
    } else {
        mirrorApiExecute('list', null, function (data) {
            console.log('TIMELINE LIST response: ', data);
            response.send(data);
        }, failure);
    }
}

function timelineInsert(request, response) {
    if (!oauth2Client.credentials) {
        var url = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: 'https://www.googleapis.com/auth/glass.timeline'
        });
        console.log('uri ', url);
        response.redirect(url);
    } else {
        var url_parts = nodeUrl.parse(request.url, true);
        var query = url_parts.query;

        var resultHtml = '';
        console.log('INSERT query: ', query);
        if (query.cardTitle) {
            resultHtml += '<article class="cover-only text-large"><section><p>' + query.cardTitle + '</p></section></article>';
        }
        for (var key in query) {
            if (query[key] && key.search('^doc') !== -1) {
                resultHtml += '<article class="text-large"><section><p>' + query[key] + '</p></section></article>';
            }
        }

        console.log('INSERT result html: ', resultHtml);
        mirrorApiExecute('insert', {
            "html": resultHtml,
            "notification": {
                "level": "DEFAULT"
            },
            "menuItems": [
                {"action": "SHARE"},
                {"action": "OPEN_URI",
                    "payload": "https://www.youtube.com/watch?feature=player_embedded&v=3qqhwjHi5z0"
                },
                {"action": "DELETE"}
            ]
        }, success, failure);
        response.send('something happened');
    }
}

function timelineBundleInsert(request, response) {
    if (!oauth2Client.credentials) {
        var url = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: 'https://www.googleapis.com/auth/glass.timeline'
        });
        console.log('uri ', url);
        response.redirect(url);
    } else {
        var url_parts = nodeUrl.parse(request.url, true);
        var query = url_parts.query;

        var resultHtml = {};
        var date = new Date().getMilliseconds();
        console.log('INSERT query: ', query);
        if (query.cardTitle) {
            resultHtml = {
                "bundleId": date,
                "isBundleCover": true,
                html: '<article class="cover-only text-large"><section><p>' + query.cardTitle + '</p></section></article>',
                "menuItems": [
                    {"action": "SHARE"},
                    {"action": "DELETE"}
                ]
            };
//            mirrorApiExecute('list-insert', resultHtml, success, failure);
        }

        for (var key in query) {
            if (query[key] && key.search('^doc') !== -1) {
                console.log('QUERY KEY', query[key]);
                var payload;
                var text;
                var menuItems = [
                    {"action": "SHARE"},
                    {"action": "DELETE"}
                ];

                if (query[key][0]) {
                    text = query[key][0];
                    payload = query[key][1];
                    menuItems.push({
                        "action": "OPEN_URI",
                        "payload": payload
                    });
                } else {
                    text = query[key];
                }
                console.log('text', text);
            /*    resultHtml = {
                    "text": text,
                    "bundleId": date,
                    "notification": {
                        "level": "DEFAULT"
                    },
                    "menuItems": menuItems
                };
                mirrorApiExecute('list-insert', resultHtml, success, failure);*/
            }


        }

        response.send('something happened');
    }
}

function saveCredentials(code, success, failure) {
    oauth2Client.getToken(code, function (err, tokens) {
        if (!!err) {
            failure(err);
        } else {
            oauth2Client.credentials = tokens;
            success('token');
        }
    });
}

function oauthCallback(request, response) {
    console.log('oauthCallback code: ', request.query.code);
    saveCredentials(request.query.code, function () {
        response.redirect('/');
    }, failure);
}

function mirrorApiExecute(command, data, successCallback, errorCallback) {
    googleapis
        .discover('mirror', 'v1')
        .execute(function (err, client) {
            if (err) {
                failure(err);
            } else {
                timeline.route(command, data, client, oauth2Client, successCallback, errorCallback);
            }
        });
}

//http://velvet-na-dev.cloudapp.net/rsi-v1.svc/UserTrackers?$expand=Options&$orderby=Title&$skip=0&$top=501&_dc=1395323864727
//http://velvet-na-dev.cloudapp.net/rsi-v1.svc/Search?$expand=Result/Items,Result/Citations/Items,Result/FilterTrees/Root/Children&workspaceId=-1&filterTreeId=%27cef573c2-fdc5-11dd-87af-0800200c9a66%27&filterTreeId=%27cef573c4-fdc5-11dd-87af-0800200c9a66%27&contentTreeNodeId=%27Csh!WKUS-TAL-DOCS-PHC-%7B18D897D0-E8F8-4202-A3BE-5CB2B2A7C4A2%7D%27&sort=%27mostrecent%27&citationCombo=true&_dc=1395323988509
//http://velvet-azure.intelliconnect.cch.com/rsi-v1.svc/UserTrackers?$expand=Options&$orderby=Title&$skip=0&$top=501&_dc=1395405417933
//http://velvet-azure.intelliconnect.cch.com/rsi-v1.svc/UserTrackers('481048')/News?$orderby=Index&$skip=0&$top=11&_dc=1395405458597
//dev 'UserTrackers(\'1120393\')/News?$orderby=Index&$skip=0&$top=11&_dc=1395324098555'
//var ref = 'https://velvet.intelliconnect.cch.com/route/ic-router/SearchResultListItem?searchResultListItemId=' + listData[i].Id + '&apikey=owl-dev-test&authorization=' + auth;
//http://velvet.intelliconnect.stg.cch.com/rsi-v1.svc/UserTrackers?$expand=Options&$orderby=Title&$skip=0&$top=501&_dc=1395475142649
//http://velvet.intelliconnect.stg.cch.com/rsi-v1.svc/Search?$expand=Result/Items,Result/Citations/Items,Result/FilterTrees/Root/Children&workspaceId=-1&filterTreeId=%27cef573c2-fdc5-11dd-87af-0800200c9a66%27&filterTreeId=%27cef573c4-fdc5-11dd-87af-0800200c9a66%27&query=%27*%27&contentTreeNodeId=%27Csh!WKUS-TAL-DOCS-PHC-%7B18D897D0-E8F8-4202-A3BE-5CB2B2A7C4A2%7D%27&sort=%27mostrecent%27&citationCombo=true&_dc=1395475142841
//http://velvet.intelliconnect.stg.cch.com/rsi-v1.svc/Search?$expand=Result/Items,Result/Citations/Items,Result/FilterTrees/Root/Children&workspaceId=-1&filterTreeId=%27cef573c2-fdc5-11dd-87af-0800200c9a66%27&filterTreeId=%27cef573c4-fdc5-11dd-87af-0800200c9a66%27&query=%27*%27&contentTreeNodeId=%27Csh!WKUS-TAL-DOCS-PHC-%7BDDE2ADE4-CE28-46FA-8A1A-86E199A52791%7D%27&sort=%27mostrecent%27&citationCombo=true&_dc=1395475142849

function success(data, callback) {
    console.log('success ', data);
    if (callback) {
        callback(data);
    }
}

function failure(data) {
    console.log('error ', data);
}

exports.velvetGetTrackers = velvet.velvetGetTrackers;
exports.velvetAuthorization = velvet.velvetAuthorization;
exports.velvetTracker = velvet.velvetTracker;
exports.velvetSearch = velvet.velvetSearch;

exports.getScript = getScript;
exports.getStyles = getStyles;
exports.getNewsConfig = getNewsConfig;

exports.timelineList = timelineList;
exports.timelineDeleteItem = timelineDeleteItem;
exports.timelineClear = timelineClear;
exports.timelineInsert = timelineInsert;
exports.timelineBundleInsert = timelineBundleInsert;

exports.oauthCallback = oauthCallback;
exports.index = mainRequest;
