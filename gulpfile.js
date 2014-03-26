/**
 * Created by Andrey Selitsky on 3/11/14.
 */
var gulp = require('gulp');
var zip = require('gulp-zip');
var jedit = require('gulp-json-editor');
var path = require('path');
var request = require('request-json');
var gutil = require('gulp-util');
var clean = require('gulp-clean');

function getArguments() {
    return require('minimist')(process.argv.slice(2));
}

gulp.task('version', function () {
    gulp.src('*.pckg.json')
        .pipe(jedit(function (json) {
                json.version = json.version + '.' + Date.now();
                return json;
            }
        ))
        .pipe(gulp.dest('dist'));
});

gulp.task('build', function () {
    gulp.src(['**/**.*', '!./node_modules/**', '!./js/**', '!./scss/**', '!*.pckg.json'])
        .pipe(gulp.dest('dist'));
});

gulp.task('zip', function () {
    gulp.src(['**/*.*', '!.zip'], { cwd: path.join(process.cwd(), 'dist') })
        .pipe(zip('package.zip'))
        .pipe(gulp.dest('dist'));
});

gulp.task('clean', function () {
    gulp.src('./dist', {read: false})
        .pipe(clean());
});

gulp.task('publish-endpoint', function () {
    var args = getArguments();
    var endpointName = args.endpoint;
    var debug = args.debug;

    if (!endpointName) {
        gutil.log(gutil.colors.red('Publish error:') + ' Please specify ' + gutil.colors.cyan('--endpoint') + ' as an argument for the publish task.');
        return;
    }

    var client = request.newClient('http://owlhub-dev-nest.cloudapp.net/', {
        proxy:  debug ? 'http://127.0.0.1:8888' : null,

        headers: {
            authorization: 'OAuth http%3a%2f%2fschemas.xmlsoap.org%2fws%2f2005%2f05%2fidentity%2fclaims%2femailaddress=andrey.selitsky%40gmail.com&http%3a%2f%2fschemas.xmlsoap.org%2fws%2f2005%2f05%2fidentity%2fclaims%2fname=Andrey+Selitsky&http%3a%2f%2fschemas.xmlsoap.org%2fws%2f2005%2f05%2fidentity%2fclaims%2fnameidentifier=https%3a%2f%2fwww.google.com%2faccounts%2fo8%2fid%3fid%3dAItOawm_Fc-VYiYKPEHZkyCwlrqt9PQsxSWYU28&http%3a%2f%2fschemas.microsoft.com%2faccesscontrolservice%2f2010%2f07%2fclaims%2fidentityprovider=Google&Audience=owl%3aservice%3aowlhub-dev-nest%3acloudapp%3anet&ExpiresOn=1395854914&Issuer=https%3a%2f%2fwk-owl-access.accesscontrol.windows.net%2f&HMACSHA256=fSXBVMiL0fkVDBRS526E5FobCAOYpd5eADXutkvpxB8%3d'
        }});

    var data = {
        id: endpointName,
        title: endpointName,
        workspaceid: '3e526bbb-0a72-4194-be93-dc91abba93c6',
        deploymentTarget: '9143E549-40DD-428C-B7E9-D26A2C550D78'
    };

    gutil.log('Posting endpoint ' + gutil.colors.cyan(endpointName) + ' JSON to Bamboo Hub');

    client.post('/accessmanager.svc/publish/Endpoints', data, function (err, res, body) {
        if (err) {
            console.log(res);
            return;
        }
        client.sendFile('endpoints/' + endpointName + '/publish', './dist/package.zip', function (err, res, body) {
            gutil.log(res);
            if (!err) {
                gutil.log(gutil.colors.cyan(endpointName) + ' published to hub.');
            }
            else {
                gutil.log(gutil.colors.cyan(endpointName) + ' publish failed.');
                gutil.log(res);
            }
        });
    });
});

gulp.task('default', ['clean', 'build', 'zip']);
