angular.module('nibs.auth', ['openfb', 'nibs.config'])

    /*
     * Routes
     */
    .config(function ($stateProvider) {

        $stateProvider

            
    
         .state('app.sflogin', {
                url: "/sflogin",
                views: {
                    'menuContent' :{
                        templateUrl: "templates/sflogin.html",
                        controller: "SfLoginCtrl"
                    }
                }
            })
    
     .state('app.logout', {
                url: "/logout",
                views: {
                    'menuContent' :{
                        templateUrl: "templates/logout.html",
                        controller: "LogoutCtrl"
                    }
                }
            })

    
    })

    /*
     * REST Resources
     */
    .factory('Auth', function ($http, $window, $rootScope) {

        return {
            sflogin: function (sfuser) {
                return $http.post($rootScope.server.url + '/sflogin', sfuser)
                    .success(function (data) {
                        console.log('----------->'+ JSON.stringify(data)); 
                        $rootScope.user = data.sfuser;
                        $window.localStorage.user = JSON.stringify(data.sfuser);
                        $window.localStorage.token = data.token;
                        //$window.localStorage.setItem('sid','raj');
                        $window.localStorage.setItem('username',data.runninguser[0].name);
                        $window.localStorage.setItem('sfuser',data.sfuser);
                        $window.localStorage.setItem('sfpassword',data.sfpassword);
                        $window.localStorage.setItem('uid',data.runninguser[0].id);
                    
                    
                    console.log('sid user data is'+$window.localStorage.getItem('sfuser'));    
                    console.log('user data is'+data.token);
                        if (typeof(ETPush) != "undefined") {
                            ETPush.setSubscriberKey(
                                function() {
                                    console.log('setSubscriberKey: success');
                                },
                                function(error) {
                                    alert('Error setting Push Notification subscriber');
                                },
                                //data.sfuser.email
                            );
                        }

                    });
            },
            logout: function () {
                $rootScope.user = undefined;
                var promise = $http.post($rootScope.server.url + '/logout');
                $window.localStorage.removeItem('user');
                $window.localStorage.removeItem('token');
                $window.localStorage.removeItem('sid');
                return promise;
            }
        }
    })

    /*
     * Controllers
     */


.controller('SfLoginCtrl', function ($scope, $rootScope, $state, $window, $location, $ionicViewService, $ionicPopup, $ionicModal, Auth, OpenFB) {
  
       $(function() {

                if ($window.localStorage.chkbx && $window.localStorage.chkbx != '') {
                    $('#remember_me').attr('checked', 'checked');
                    $('#username').val($window.localStorage.usrname);
                    $('#pass').val($window.localStorage.pass);
                } else {
                    $('#remember_me').removeAttr('checked');
                    $('#username').val('');
                    $('#pass').val('');
                }

                $('#remember_me').click(function() {
                    if ($('#remember_me').is(':checked')) {
                        // save username and password
                        $window.localStorage.usrname = $('#username').val();
                        $window.localStorage.pass = $('#pass').val();
                        $window.localStorage.chkbx = $('#remember_me').val();
                    } else {
                        $window.localStorage.usrname = '';
                        $window.localStorage.pass = '';
                        $window.localStorage.chkbx = '';
                    }
                });
            });    
    
        $ionicModal.fromTemplateUrl('templates/server-url-setting.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.modal = modal;
        });
       

        $window.localStorage.removeItem('user');
        $window.localStorage.removeItem('token');

        $scope.sfuser = {};

        $scope.sflogin = function () {

            Auth.sflogin($scope.sfuser)
                .success(function (data) {
                console.log('SF Login data :--' + data.token); 
                console.log('SF Login data :--' + JSON.stringify(data)); 
                console.log('SF Login data 1 :--' + JSON.stringify(data.runninguser));
                console.log('SF Login data 2 :--' + data.runninguser[0].firstname);
                $rootScope.username = $window.localStorage.getItem('username');
                
                if(data.status == "1"){
                       console.log(' IF '+data);
                       $state.go("app.profile");
                   }else{
                       console.log(' Else '+data);
                       $ionicPopup.alert({title: 'Message', content: data});
                   }
                    

                })
                .error(function (err) {
                    $ionicPopup.alert({title: 'Error', content: err});
                });
        };

        $scope.forgotpassword = function(){
            $state.go("app.forgotpassword");
        };

        $scope.facebookLogin = function () {

            OpenFB.login('email, publish_actions').then(
                function () {
                    OpenFB.get('/me', {fields: 'id,first_name,last_name,email,picture,birthday,gender'})
                        .success(function (fbUser) {
                            Auth.fblogin(fbUser)
                                .success(function (data) {

                                    $state.go("app.profile");
                                    setTimeout(function () {
                                        $ionicViewService.clearHistory();
                                    });
                                })
                                .error(function (err) {

                                    console.log('FB error'+JSON.stringify(err));
                                    $ionicPopup.alert({title: 'Oops', content: err});
                                })
                        })
                        .error(function () {
                            $ionicPopup.alert({title: 'Oops', content: "The Facebook login failed"});
                        });
                },
                function () {
                    $ionicPopup.alert({title: 'Oops', content: "The Facebook login failed"});
                });
        };

    })


    .controller('LogoutCtrl', function ($rootScope, $window,$ionicPopup,$state) {
        console.log("Logout");
        var confirmPopup = $ionicPopup.confirm({
              title: 'Logout',
              template: 'Are you sure want to Logout ?',
           });

           confirmPopup.then(function(res) {
              if (res) {
                 $rootScope.user = null;
                 $window.localStorage.removeItem('user');
                 $window.localStorage.removeItem('token');
                 $window.localStorage.removeItem('username');
                 $state.go('app.welcome');
              } else {
                 $state.go('app.profile');
              }
           });
    })


    .controller('SignupCtrl', function ($scope, $state, $ionicPopup, Auth, OpenFB) {

        $scope.user = {};

        $scope.signup = function () {
            if ($scope.user.password !== $scope.user.password2) {
                $ionicPopup.alert({title: 'Oops', content: "passwords don't match"});
                return;
            }
            Auth.signup($scope.user)
                .success(function (data) {
                    $ionicPopup.alert({title: 'Alert', content: "Signed Up successfully."});
                    $state.go("app.login");
                }).error(function(err){
                    $ionicPopup.alert({title: 'Oops5', content: err});
                });
        };

        $scope.facebookLogin = function () {

            OpenFB.login('email, publish_actions').then(
                function () {
                    OpenFB.get('/me', {fields: 'id,first_name,last_name,email,picture,birthday,gender'})
                        .success(function (fbUser) {
                            Auth.fblogin(fbUser)
                                .success(function (data) {
                                    $state.go("app.profile");
                                    setTimeout(function () {
                                        $ionicViewService.clearHistory();
                                    });
                                })
                                .error(function (err) {
                                    $ionicPopup.alert({title: 'Oops', content: err});
                                })
                        })
                        .error(function () {
                            $ionicPopup.alert({title: 'Oops', content: "The Facebook login failed"});
                        });
                },
                function () {
                    $ionicPopup.alert({title: 'Oops', content: "The Facebook login failed"});
                });
        };

    });
