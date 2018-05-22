angular.module('nibs.tasklist', ['nibs.config'])

    // Routes
    .config(function ($stateProvider) {
        $stateProvider
            .state('app.tasklist', {
                url: "/tasklist",
                views: {
                    'menuContent' :{
                        templateUrl: "templates/tasklist.html",
                        controller: "TaskListController"
                    }
                }
            })
    
            .state('app.skillsetlist', {
                url: "/skillsetlist",
                views: {
                    'menuContent' :{
                        templateUrl: "templates/skillsetlist.html",
                        controller: "SkillsetListController"
                    }
                }
            })
    
    })

    // Services
    .factory('Tasklist', function ($http, $rootScope) {
        return {
            getTaskList: function(theTasklst) {
                return $http.post($rootScope.server.url + '/tasklist/',theTasklst);
            },
            getSkillsetList: function(theSkillsetlst) {
                return $http.post($rootScope.server.url + '/skillsetlist/',theSkillsetlst);
            }
        };
    })

    //Controllers
    .controller('TaskListController', function ($scope,$rootScope, $window, $ionicPopup, Tasklist, User) {
        $rootScope.username = $window.localStorage.getItem('username');

        $scope.tasklist = {};
        $scope.sfu = {'suser':$window.localStorage.getItem('sfuser'),'spassword':$window.localStorage.getItem('sfpassword'),'uid':$window.localStorage.getItem('uid')};
            Tasklist.getTaskList($scope.sfu).success(function(datalist) {
                     $scope.tasklist = datalist;
                });
  })

.controller('SkillsetListController', function ($scope,$rootScope, $window, $ionicPopup, Tasklist, User) {
        $rootScope.username = $window.localStorage.getItem('username');
        $scope.skillsetlist = {};
        $scope.sfu = {'suser':$window.localStorage.getItem('sfuser'),'spassword':$window.localStorage.getItem('sfpassword'),'uid':$window.localStorage.getItem('uid')};
            Tasklist.getSkillsetList($scope.sfu).success(function(datalist) {
                     $scope.skillsetlist = datalist;
             });
  });
