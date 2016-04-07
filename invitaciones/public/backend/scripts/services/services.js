'use strict';

var services = angular.module('Invitaciones.services', ['ngResource']);

services.factory('Guest', ['$resource', function ($resource) {
    return $resource('/api/backend/guests/list/:_id', { _id: '@_id' }, {
        saveAll: { method: 'POST', isArray: true }
    });
}]);

services.factory('GuestLoader', ['Guest', '$route', '$q', function (Guest, $route, $q) {
    return function () {
        var delay = $q.defer();
        Guest.get({ id: $route.current.params.guestId }, function (guest) { delay.resolve(guest) }, function () {
            delay.reject('Poblemas obteniendo el guest ' + $route.current.params.guestId);
        });
        return delay.promise;
    }
}]);

//services.factory('ProductByType', ['$resource', function ($resource) {
//    return $resource('/api/backend/products/listado/filtro/:type', { type: '@type' });
//}]);

//services.factory('ProductByTypeLoader', ['ProductByType', '$route', '$q', function (ProductByType, $route, $q) {
//    return function () {
//        var delay = $q.defer();
//        ProductByType.query({ type: $route.current.params.type }, function (product) { delay.resolve(product) }, function () {
//            delay.reject('Poblemas obteniendo los productos de tipo ' + $route.current.params.type);
//        });
//        return delay.promise;
//    }
//}]);

services.factory('MultiGuestLoader', ['Guest', '$q', function (Guest, $q) {
    return function () {
        var delay = $q.defer();
        Guest.query(function (guests) {
            delay.resolve(guests);
        }, function () {
            delay.reject('Problemas obteniendo los productos');
        });

        return delay.promise;
    }
}]);

services.factory('Status', ['$resource', function ($resource) {
    return $resource('/api/backend/guests/status', {});
}]);

//services.factory('Order', ['$resource', function ($resource) {
//    return $resource('/api/backend/orders/:_id', 
//        { _id: '@_id' }, 
//        { exportToCsv: { method: 'POST', isArray: true } });
//}]);

//services.factory('OrderByStatus', ['$resource', function ($resource) {
//    return $resource('/api/backend/orders/filter/:status', { type: '@status' });
//}]);

//services.factory('OrderExport', ['$resource', function ($resource) {
//    return $resource('/api/backend/orders/export', { _id: '@_id' }, { exportToCsv: { method: 'POST' } });
//}]);

//services.factory('OrderByStatusLoader', ['OrderByStatus', '$route', '$q', function (OrderByStatus, $route, $q) {
//    return function () {
//        var delay = $q.defer();
//        OrderByStatus.query({ status: $route.current.params.status }, function (product) { delay.resolve(product) }, function () {
//            delay.reject('Poblemas obteniendo las ordenes de tipo ' + $route.current.params.status);
//        });
//        return delay.promise;
//    }
//}]);

//services.factory('MultiOrderLoader', ['Order', '$q', function (Order, $q) {
//    return function () {
//        var delay = $q.defer();
//        Order.query(function (orders) {
//            delay.resolve(orders);
//        }, function () {
//            delay.reject('Problemas obteniendo los pedidos');
//        });

//        return delay.promise;
//    }
//}]);

//services.factory('User', ['$resource', function ($resource) {
//    return $resource('/api/backend/users/:_id', { _id: '@_id' }, {
//        saveAll: { method: 'POST' }
//    });
//}]);

//services.factory('MultiUserLoader', ['User', '$q', function (User, $q) {
//    return function () {
//        var delay = $q.defer();
//        User.query(function (users) {
//            delay.resolve(users);
//        }, function () {
//            delay.reject('Problemas obteniendo los usuarios');
//        });

//        return delay.promise;
//    }
//}]);



services.factory("authenticationSvc", ["$http","$q","$window",function ($http, $q, $window) {
    var userInfo;

    function login(userName, password) {
        var deferred = $q.defer();

        $http.post("/api/auth/backend-login", { usr: userName, pass: password })
            .then(function (result) {
                userInfo = {
                    accessToken: result.data.accessToken,
                    usr:{
                        name: result.data.usr,
                        email: result.data.email,
                        phone: result.data.phone,
                        address: result.data.address,
                        id: result.data.id
                    }
                };
                $window.sessionStorage["userInfo"] = JSON.stringify(userInfo);
                deferred.resolve(userInfo);
            }, function (error) {
                deferred.reject(error);
            });

        return deferred.promise;
    }

    //function register(user) {
    //    var deferred = $q.defer();

    //    $http.post("/api/auth/register", { usr: user })
    //        .then(function (result) {
    //            userInfo = {
    //                accessToken: result.data.accessToken,
    //                userName: result.data.usr
    //            };
    //            $window.sessionStorage["userInfo"] = JSON.stringify(userInfo);
    //            deferred.resolve(userInfo);
    //        }, function (error) {
    //            deferred.reject(error);
    //        });

    //    return deferred.promise;
    //}

    function logout() {
        var deferred = $q.defer();

        $http({
            method: "POST",
            url: "/api/auth/logout",
            headers: {
                "access_token": userInfo.accessToken
            }
        }).then(function (result) {
            userInfo = null;
            $window.sessionStorage["userInfo"] = null;
            deferred.resolve(result);
        }, function (error) {
            deferred.reject(error);
        });

        return deferred.promise;
    }

    function getUserInfo() {
        return userInfo ? userInfo.usr : undefined;
    }

    function init() {
        if ($window.sessionStorage["userInfo"]) {
            userInfo = JSON.parse($window.sessionStorage["userInfo"]);
        }
    }
    init();

    return {
        //register: register,
        login: login,
        logout: logout,
        getUserInfo: getUserInfo
    };
}]);

services.factory('authInterceptorService', ['$q', '$location', '$window', function ($q, $location, $window) {

    function request(config) {

        config.headers = config.headers || {};

        if ($window.sessionStorage["userInfo"]) {
            var authData = JSON.parse($window.sessionStorage["userInfo"]);
            if (authData) {
                config.headers.Authorization = authData.accessToken;
            }
        }

        return config;
    }

    function responseError(rejection) {
        if (rejection.status === 401) {
            $location.path('/login');
        }
        return $q.reject(rejection);
    }

    return {
        request: request,
        responseError: responseError
    }
}]);