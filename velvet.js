/**
 * Created by sergey on 3/24/14.
 */
//http://velvet-azure.intelliconnect.cch.com/
//velvet.intelliconnect.stg.cch.com

//Csh!WKUS-TAL-DOCS-PHC-{DDE2ADE4-CE28-46FA-8A1A-86E199A52791}
///rsi-v1.svc/SearchResultListItemStream/$value?searchResultListItemId=%2714032509370128c2d0c02678744ea1b27ef2280b38b69e!0000000012!stb01cd88236e7b791000b877d8d385ad169402%27&channelId=%27owl-embeded-v2%27&_dc=1395740320843

///rsi-v1.svc/UserTrackers?$expand=Options&$orderby=Title&$skip=0&$top=501&_dc=1395741401013	200	GET	velvet-na-dev.cloudapp.net	/rsi-v1.svc/UserTrackers?$expand=Options&$orderby=Title&$skip=0&$top=501&_dc=1395741401013	 1671 ms	2.56 KB	Complete
///rsi-v1.svc/Search?$expand=Result/Items,Result/Citations/Items,Result/FilterTrees/Root/Children&workspaceId=-1&filterTreeId=%27cef573c2-fdc5-11dd-87af-0800200c9a66%27&filterTreeId=%27cef573c4-fdc5-11dd-87af-0800200c9a66%27&query=%27*%27&contentTreeNodeId=%27Csh!WKUS-TAL-DOCS-PHC-%7B18D897D0-E8F8-4202-A3BE-5CB2B2A7C4A2%7D%27&sort=%27mostrecent%27&citationCombo=true&_dc=1395741401251	/rsi-v1.svc/Search?$expand=Result/Items,Result/Citations/Items,Result/FilterTrees/Root/Children&workspaceId=-1&filterTreeId=%27cef573c2-fdc5-11dd-87af-0800200c9a66%27&filterTreeId=%27cef573c4-fdc5-11dd-87af-0800200c9a66%27&query=%27*%27&contentTreeNodeId=%27Csh!WKUS-TAL-DOCS-PHC-%7B18D897D0-E8F8-4202-A3BE-5CB2B2A7C4A2%7D%27&sort=%27mostrecent%27&citationCombo=true&_dc=1395741401251
//  /rsi-v1.svc/Search?$expand=Result/Items,Result/Citations/Items,Result/FilterTrees/Root/Children&workspaceId=-1&filterTreeId=%27cef573c2-fdc5-11dd-87af-0800200c9a66%27&filterTreeId=%27cef573c4-fdc5-11dd-87af-0800200c9a66%27&query=%27*%27&contentTreeNodeId=%27Csh!WKUS-TAL-DOCS-PHC-%7BDDE2ADE4-CE28-46FA-8A1A-86E199A52791%7D%27&sort=%27mostrecent%27&citationCombo=true&_dc=1395741401259	200	GET	velvet-na-dev.cloudapp.net	/rsi-v1.svc/Search?$expand=Result/Items,Result/Citations/Items,Result/FilterTrees/Root/Children&workspaceId=-1&filterTreeId=%27cef573c2-fdc5-11dd-87af-0800200c9a66%27&filterTreeId=%27cef573c4-fdc5-11dd-87af-0800200c9a66%27&query=%27*%27&contentTreeNodeId=%27Csh!WKUS-TAL-DOCS-PHC-%7BDDE2ADE4-CE28-46FA-8A1A-86E199A52791%7D%27&sort=%27mostrecent%27&citationCombo=true&_dc=1395741401259	 1152 ms	10.26 KB	Complete
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
    http.get('http://localhost:8081/velvetAuthorization', function () {
        console.log('Authorization success');
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
//        path: rsi + 'Search?$expand=Result/Items,Result/Citations/Items,Result/FilterTrees/Root/Children&workspaceId=-1&filterTreeId=%27cef573c2-fdc5-11dd-87af-0800200c9a66%27&filterTreeId=%27cef573c4-fdc5-11dd-87af-0800200c9a66%27&contentTreeNodeId=%27Csh!WKUS-TAL-DOCS-PHC-%7B18D897D0-E8F8-4202-A3BE-5CB2B2A7C4A2%7D%27&sort=%27mostrecent%27&citationCombo=true&_dc=1395323988509',
        requestNode({
            host: velvetUrl,
            path: rsi + 'UserTrackers?$expand=Options&$orderby=Title&$skip=0&$top=501&_dc=1395475142649',
            headers: headers
        }, function (data) {
            console.log('DATA', data);
            data = JSON.parse(data);
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

                response.send(resultJson);
                response.end();
            } else {
                response.send('into trouble');
                response.end();
            }
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
//                console.log('DATA', data);

                var requestString = '';
                var bundleCallback = function (html) {
                    html += '&cardTitle=CCH Tax Briefing';
                    //TODO domain call
                    http.get('http://localhost:8081/insertBundle?' + html, function () {
                    });

                    response.send('insert card');
                    response.end();
                };
                var waiting = data.length;
                for (var i = 0, len = data.length; i < len; i += 1) {
//                    console.log('DocumentID', data[i].DocumentId);
                    requestNode({
                        host: 'news-cch-com-dev.azurewebsites.net',
                        path: '/api/document-link?documentId=' + data[i].DocumentId + '&index=' + i
                    }, function (newsData, path) {
                        //http://news.cch.com/api/document-link?documentId=ftd011ea674867bd3100083e090b11c18c90207&_dc=1395413377325
                        //http://news-cch-com-dev.azurewebsites.net/api/document-link?documentId=stb01cd88236e7b791000b877d8d385ad169402&_dc=1395740326442
                        //XMLHttpRequest
                        console.log('data news.cch', JSON.parse(newsData).url);
//                        console.log('ORIGINAL DATA', res.connection._httpMessage.path);

                        var url_parts = nodeUrl.parse(path, true);
                        var query = url_parts.query;

                        console.log('i', query.index);

                        requestString += 'doc' + query.index + '=' + data[query.index].Title;

                        if(JSON.parse(newsData).url){
                            requestString += '&doc' + query.index + '=' + JSON.parse(newsData).url;
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
            console.log('DATA', data);
            data = JSON.parse(data);
            if (data.d) {
                data = data.d.results;

                var requestString = '';
                var bundleCallback = function () {
                    requestString += '&cardTitle=' + query.title;
                    //TODO domain call
                    http.get('http://localhost:8081/insertBundle?' + requestString, function () {
                    });

                    response.send('insert card');
                    response.end();
                };

                for (var i = 0, len = data.length; i < len; i += 1) {
                    requestNode({
                        host: 'news-cch-com-dev.azurewebsites.net',
                        path: '/api/document-link?documentId=' + data[i].Id,
                        headers: headers
                    }, function (data) {
                        //http://news.cch.com/api/document-link?documentId=ftd011ea674867bd3100083e090b11c18c90207&_dc=1395413377325
                        //http://news-cch-com-dev.azurewebsites.net/api/document-link?documentId=stb01cd88236e7b791000b877d8d385ad169402&_dc=1395740326442
                        //XMLHttpRequest
                        console.log('data news.cch', data);
                        requestString += 'doc' + i + '=' + data[i].Title;
                        if (i !== len - 1) {
                            requestString += '&';
                        } else {
                            bundleCallback();
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
