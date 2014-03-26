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


function TimelineList($scope, $http) {
    $scope.timelines = [];
    var addCards = function (data, status, headers, config) {
        console.log('data', data);

        for (var i = 0, len = data.items.length, item; i < len; i += 1) {
            item = data.items[i];
            $scope.timelines.push({
                content: item.html || item.text,
                id: item.id
            });
        }
    };

    var errorCallback = function (data, status, headers, config) {
        console.log('data', data);
    };

    listUpdate($http, addCards, errorCallback);
    $scope.deleteCard = function () {
        var del = confirm("Delete this timeline?");
        if (del === true) {
            $http({
                method: 'GET',
                url: '/delete?id=' + $scope.timelines[this.$index].id
            }).
                success(function (data, status, headers, config) {
                    console.log('data', data);
                    $scope.timelines = ['1'];
                    listUpdate($http, addCards, errorCallback);
                }).
                error(function (data, status, headers, config) {
                    console.log('data', data);
                });
        }
    };
}

function listUpdate($http, successCallback, errorCallback) {
    $http({method: 'GET', url: '/list'}).success(successCallback).error(errorCallback);
}