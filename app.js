/**
 * Created by sergey on 2/23/14.
 */

var http = require('http'),
    express = require('express'),
    route = require('./route');

var app = express();
var port = 8081;

app.get('/', route.index);

app.get('/oauth2callback', route.oauthCallback);

app.get('/velvetTracker', route.velvetTracker);

app.get('/insert', route.timelineInsert);

app.get('/insertBundle', route.timelineBundleInsert);

app.get('/list', route.timelineList);

app.get('/clearAll', route.timelineClear);

app.get('/delete', route.timelineDeleteItem);

app.get('/velvetTrackers', route.velvetGetTrackers);

app.get('/velvetSearch', route.velvetSearch);

app.get('/velvetAuthorization', route.velvetAuthorization);

app.get('/scripts/*', route.getScript);

app.get('/styles/*', route.getStyles);



http.createServer(app).listen(port, function () {
    console.log('Express server listening on port ' + port);
});



