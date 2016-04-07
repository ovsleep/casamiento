'use strict';

var app = angular.module('InvitacionesBackend',
    ['ngRoute', 'Invitaciones.directives', 'Invitaciones.services', 'ui.bootstrap', 'angularFileUpload']);

app.config(function ($httpProvider) {
    $httpProvider.interceptors.push('authInterceptorService');
});

app.filter('sumOfValue', function () {
    return function (data, key) {
        if (angular.isUndefined(data) && angular.isUndefined(key))
            return 0;
        var sum = 0;

        angular.forEach(data, function (v, k) {
            if (v[key]) {
                sum = sum + parseInt(v[key]);
            }
        });
        return sum;
    }
});

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
      when('/', {
          controller: 'DashboardController',
          templateUrl: '/backend/views/dashboard.html',
          access: {
              requiresLogin: true
          }
      })
    .when('/invitados/editar', {
        controller: 'GuestsController',
        templateUrl: '/backend/views/guests.html',
        resolve: {
            guests: ["MultiGuestLoader", function (MultiGuestLoader) {
                return MultiGuestLoader();
            }]
        },
        access: {
            requiresLogin: true
        }
    })
    .when('/invitados', {
        controller: 'GuestsController',
        templateUrl: '/backend/views/guestsList.html',
        resolve: {
            guests: ["MultiGuestLoader", function (MultiGuestLoader) {
                return MultiGuestLoader();
            }]
        },
        access: {
            requiresLogin: true
        }
    })
    .when('/invitados/cargar', {
        controller: 'GuestsUploaderController',
        templateUrl: '/backend/views/guestsUploader.html',
        access: {
            requiresLogin: true
        }
    })
    .when('/invitados/dump', {
        controller: 'GuestsDumpController',
        templateUrl: '/backend/views/guestsDump.html',
        resolve: {
            guests: ["MultiGuestLoader", function (MultiGuestLoader) {
                return MultiGuestLoader();
            }]
        },
        access: {
            requiresLogin: true
        }
    })
    .when('/login', {
        controller: 'LoginController',
        templateUrl: '/backend/views/login.html',
    })
    .otherwise({ redirectTo: '/' });
}]);

app.run(function ($rootScope, $location, authenticationSvc) {
    $rootScope.$on("$routeChangeStart", function (event, next, current) {
        if (next.access) {
            if (!authenticationSvc.getUserInfo()) {
                $location.path("/login");
            }
        }
    });
});


