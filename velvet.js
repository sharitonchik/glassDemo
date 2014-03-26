/**
 * Created by sergey on 3/24/14.
 */
//http://velvet-azure.intelliconnect.cch.com/
//velvet.intelliconnect.stg.cch.com
var http = require('http'),
    nodeUrl = require('url'),
    rsi = "/rsi-v1.svc/",
    identity = "/identity-v1.svc/",
    apikey, credentials, token, velvetUrl;

function setConfig(config) {
    apikey = config.apikey;
    credentials = config.credentials;
    velvetUrl = config.velvetUrl;
    console.log('VELVET setconfig', credentials);
    console.log('VELVET domain', require('domain').create());
    //TODO domain call
    http.get('http://bamboo-glass.azurewebsites.net/velvetAuthorization', function () {
        console.log('VELVET Authorization success');
    });
}

function velvetGetTrackers(request, response) {
    var headers = {
        "Accept": "application/json",
        "X-Tunnel-Status-Code": "400-500",
        "X-ApiKey": apikey
    };
    if (!token) {
        velvetAuthorization(response);
        response.send('authorizated');
    } else {
        headers.Authorization = token;
        requestNode({
            host: velvetUrl,
            path: rsi + 'UserTrackers?$expand=Options&$orderby=Title&$skip=0&$top=501&_dc=1395475142649',
            headers: headers
        }, function (data) {
            data = JSON.parse(data);
            console.log('DATA get trackers', data);

            response.send(process.env || 'localhost');
            response.end();
            /*
            if (data.d) {
                data = data.d.results;
                var resultJson = {};
                resultJson.trackers = [];

                for (var key in data) {
                    resultJson.trackers.push({
                        "id": data[key].Id,
                        "title": data[key].Title
                    });
                }

                response.send(process.env || 'localhost');
                response.end();
            } else {
                response.send('into trouble');
                response.end();
            }*/
        });

    }
}

function requestNode(config, endCallback) {
    var options = {
            hostname: config.host,
            path: config.path,
            headers: config.headers
        },
        data = '',
        req = http.get(options, function (res) {
            res.on('data', function (chunk) {
                data += chunk;
            });

            res.on('end',
                function () {
                    endCallback(data, config.path)
                }
            );

            res.on('error', function (err) {
                failure(err);
            });
        });

    req.on('error', function (err) {
        failure(err);
    });

    req.end();
}

function velvetSearch(request, response) {
    var headers = {
        "Accept": "application/json",
        "X-Tunnel-Status-Code": "400-500",
        "X-ApiKey": apikey
    };
    var filterTreeIds = ['cef573c2-fdc5-11dd-87af-0800200c9a66', 'cef573c4-fdc5-11dd-87af-0800200c9a66'];
    if (!token) {
        velvetAuthorization(response);
        response.send('authorizated');
    } else {
        var url_parts = nodeUrl.parse(request.url, true);
        var query = url_parts.query;

        headers.Authorization = token;
        requestNode({
            host: velvetUrl,
            path: rsi + "Search?$expand=Result/Items,Result/Citations/Items,Result/FilterTrees/Root/Children&workspaceId=-1&filterTreeId=" + filterTreeIds[0] + "&filterTreeId=" + filterTreeIds[1] + "&query='*'&contentTreeNodeId='Csh!WKUS-TAL-DOCS-PHC-{DDE2ADE4-CE28-46FA-8A1A-86E199A52791}'&sort='mostrecent'&citationCombo=true&_dc=1395741401251",
            headers: headers
        }, function (data) {
            data = JSON.parse(data);
            if (data.d) {
                data = data.d.Result.Items.results;
                console.log('SEARCH data', data);
                var requestString = '';
                var bundleCallback = function (html) {
                    html += '&cardTitle=CCH Tax Briefing';
                    //TODO domain call
                    http.get('http://bamboo-glass.azurewebsites.net/insertBundle?' + html, function () {});

                    response.send('insert card');
                    response.end();
                };
                var waiting = data.length;
                for (var i = 0, len = data.length; i < len; i += 1) {
                    requestNode({
                        host: 'news-cch-com-dev.azurewebsites.net',
                        path: '/api/document-link?documentId=' + data[i].DocumentId + '&index=' + i
                    }, function (newsData, path) {
                        var url_parts = nodeUrl.parse(path, true);
                        var query = url_parts.query;

                        newsData = JSON.parse(newsData);
                        requestString += 'doc' + query.index + '=' + data[query.index].Title;

                        if (newsData.url) {
                            requestString += '&doc' + query.index + '=' + newsData.url;
                        }

                        if (query.index !== len - 1) {
                            requestString += '&';
                        }

                        if (--waiting == 0) {
                            bundleCallback(requestString);
                        }

                    });
                }
            } else {
                response.send('into trouble');
                response.end();
            }
        });

    }
}

function velvetTracker(request, response) {
    var headers = {
        "Accept": "application/json",
        "X-Tunnel-Status-Code": "400-500",
        "X-ApiKey": apikey
    };
    if (!token) {
        velvetAuthorization(response);
        response.send('authorizated');
    } else {
        var url_parts = nodeUrl.parse(request.url, true);
        var query = url_parts.query;

        headers.Authorization = token;
        requestNode({
            host: velvetUrl,
            path: rsi + 'UserTrackers(\'' + query.id + '\')/News?$orderby=Index&$skip=0&$top=11&_dc=1395324098555',
            headers: headers
        }, function (data) {
            data = JSON.parse(data);
//            console.log('DATA get tracker', data);

            if (data.d) {
                data = data.d.results;
                console.log('DATA get tracker results', data);
                var requestString = '';

                requestString += '&cardTitle=' + query.title;
                for (var i = 0, len = data.length, item; i < len; i += 1) {
                    item = data[i];
                    requestString += 'doc' + i + '=' + item.Title;

                    if (i !== len - 1) {
                        requestString += '&';
                    }
                }
                console.log('requestString', requestString);

                //TODO domain call
                /*
                 http.get('http://bamboo-glass.azurewebsites.net/insert?' + requestString, function () {
                 });*/

                response.send('insert card');
                response.end();
            } else {
                response.send('into trouble');
                response.end();
            }
        });

    }
}

function getAuthorization(credentials) {
    if (credentials.userId && credentials.password) {
        return 'Basic' + new Buffer((credentials.userId + ':' + credentials.password)).toString('base64');
    }
}

function velvetAuthorization(request, response) {
    var headers = {
        "Accept": "application/json",
        "X-Tunnel-Status-Code": "400-500",
        "X-ApiKey": apikey,
        "Authorization": getAuthorization(credentials)
    };

    var options = {
        hostname: velvetUrl,
        path: identity + 'AccessToken?type=%27Twill-RC4-Token%27',
        headers: headers
    };
    var data = '';
    var req = http.get(options, function (res) {
        res.on('data', function (chunk) {
            data += chunk;
        });

        res.on('error', function (err) {
            console.log('VELVET Authorization', err);
        });

        res.on('end', function () {
            console.log('data json', JSON.parse(data));
            data = JSON.parse(data);
            if (data.d) {
                data = data.d;
                token = data.AccessToken.Code;
                response.send('VELVET authorized.');
            }
            console.log('data', token);
        });
    });

    req.on('error', function (err) {
        console.log('VELVET authorization error', err);
    });

    req.end();
}

function success(data, callback) {
    console.log('VELVET success ', data);
    if (callback) {
        callback(data);
    }
}

function failure(data) {
    console.log('VELVET error ', data);
}

exports.setConfig = setConfig;
exports.velvetGetTrackers = velvetGetTrackers;
exports.velvetTracker = velvetTracker;
exports.velvetAuthorization = velvetAuthorization;
exports.velvetSearch = velvetSearch;
