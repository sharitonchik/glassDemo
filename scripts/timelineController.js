/**
 * Created by sergey on 3/22/14.
 */

function GoogleLogout($scope, $http){
    $scope.logout = function () {
        document.location = "https://www.google.com/accounts/Logout?continue=https://appengine.google.com/_ah/logout?continue=http://localhost:8081"
//        $http({
//            method: 'GET',
//            url: '/oauthClear'
//        }).
//            success(function (data, status, headers, config) {
//                console.log('data', data);
//            }).
//            error(function (data, status, headers, config) {
//                console.log('data', data);
//            });
    }
}

function SearchNews($scope, $http){
    $scope.insertSearch = function () {
        $http({
            method: 'GET',
            url: '/velvetSearch'
        }).
            success(function (data, status, headers, config) {
                console.log('data', data);
            }).
            error(function (data, status, headers, config) {
                console.log('data', data);
            });
    }
}


function VelvetNews($scope, $http) {
    $http({method: 'GET', url: '/velvetTrackers'}).success(function (data, status, headers, config) {
        $scope.news = data.trackers;
    }).error(function (data, status, headers, config) {
            console.err(data);
        });

    $scope.insertNews = function () {
        $http({
            method: 'GET',
            url: '/velvetTracker?id=' + $scope.news[this.$index].id + '&title=' + $scope.news[this.$index].title
        }).
            success(function (data, status, headers, config) {
                console.log('data', data);
            }).
            error(function (data, status, headers, config) {
                console.log('data', data);
            });
    }
}