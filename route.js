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
    console.log('cred', oauth2Client.credentials);
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
            response.end();
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
            response.end();
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

        if (query.cardTitle) {
            resultHtml += '<article class="cover-only text-large"><section><p>' + query.cardTitle + '</p></section></article>';
        }
        for (var key in query) {
            if (query[key] && key.search('^doc') !== -1) {
                resultHtml += '<article class="text-large"><section><p>' + query[key] + '</p></section></article>';
            }
        }

        mirrorApiExecute('insert', {
            "html": resultHtml,
            "notification": {
                "level": "DEFAULT"
            },
            "menuItems": [
                {"action": "SHARE"},
                {"action": "DELETE"}
            ]
        }, success, failure);

        response.send('Timeline insert');
        response.end();
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

                if (typeof query[key] !== 'string') {
                    text = query[key][0];
                    payload = query[key][1];
                    menuItems.splice(1, 0, {
                        "action": "OPEN_URI",
                        "payload": payload
                    });
                } else {
                    text = query[key];
                }
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

        response.send('Bundle timelines set');
        response.end();
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

function clearCredentials(request, response){
    oauth2Client.credentials = null;
 /*   oauth2Client.setToken();*/
    response.send('credentials cleared.');
    response.end();
}

function oauthCallback(request, response) {
    console.log('oauthCallback code: ', request.query.code);
    saveCredentials(request.query.code, function () {
        response.redirect('/');
        response.end();
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

exports.timelineList = timelineList;
exports.timelineDeleteItem = timelineDeleteItem;
exports.timelineClear = timelineClear;
exports.timelineInsert = timelineInsert;
exports.timelineBundleInsert = timelineBundleInsert;

exports.oauthCallback = oauthCallback;
exports.clearCredentials = clearCredentials;
exports.index = mainRequest;
