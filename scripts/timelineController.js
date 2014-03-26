/**
 * Created by sergey on 3/22/14.
 */
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