'use strict';

var app = angular.module('Invitations', ['ngRoute', 'ui.bootstrap', 'ngResource']);

app.factory('Person', ['$resource', function ($resource) {
    return $resource('/api/guest/:id', { id: '@nro' });
}])

app.factory('PersonLoader', ['Person', '$route', '$q', function (Person, $route, $q) {
    return function () {
        var delay = $q.defer();
        Person.get({ id: $route.current.params.nro }, function (person) { delay.resolve(person) }, function () {
            delay.reject('Poblemas obteniendo el invitado ' + $route.current.params.nro);
        });
        return delay.promise;
    }
}]);

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
      when('/', {
          controller: 'RsvpController',
          templateUrl: '/views/rsvp.html'
      })
    .when('/confirmar/', {
        controller: 'ConfirmController',
        templateUrl: '/views/rsvpConfirm.html'
    })
    .when('/confirmar/:nro', {
        controller: 'ConfirmController',
        templateUrl: '/views/rsvpConfirm.html'
    })
    .when('/gracias/', {
        controller: 'ThanksController',
        templateUrl: '/views/rsvpThank.html'
    })
    .otherwise({ redirectTo: '/' })
}]);

app.factory("visit", function () {
    return {};
});

app.controller('RsvpController', ['$scope', 'visit', 'Person', '$location',
    function ($scope, visit, Person, $location) {
        $scope.visit = visit;

        $scope.submit = function () {
            if ($scope.visit.nro) {
                Person.get(
                    { id: $scope.visit.nro }, // query
                    function (guest, getResponseHeaders) { //success
                        $scope.visit.guest = guest;
                        $location.path('/confirmar/');
                    },
                    function (response) { //error handling
                        $scope.visit.error = 'No encontramos el número de invitado. Por favor verificalo o echale la culpa al ingeniero que hizo esto, es un perro.'
                    }
                );
            }
        }
    }
]);

app.controller('ConfirmController', ['$scope', 'visit', '$location', '$routeParams', 'Person',
    function ($scope, visit, $location, $routeParams, Person) {
        $scope.visit = visit;

        if (!$scope.visit.guest) { //first step not loaded
            if (!$routeParams.nro) { //no nro in params
                $location.path('/');
            }
            else {
                $scope.visit.nro = $routeParams.nro;
                Person.get(
                    { id: $scope.visit.nro }, // query
                    function (guest, getResponseHeaders) { //success
                        $scope.visit.guest = guest;
                    },
                    function (response) { //error handling
                        $scope.visit.error = 'No encontramos el número de invitado. Por favor verificalo o echale la culpa al ingeniero que hizo esto, es un perro.'
                        $location.path('/');
                    }
                );
            }
        }

        $scope.submit = function () {
            $scope.visit.guest.$save();
            $location.path('/gracias/');
        }

        $scope.getOptionsArray = function (max) {
            var options = [];
            for (var i = 1; i <= max; i++) {
                options.push(i);
            }
            return options
        }
    }
]);

app.controller('ThanksController', ['$scope', 'visit', '$location',
    function ($scope, visit, $location) {
        if (!visit.guest) {
            $location.path('/');
        }

        $scope.visit = visit;
    }
]);

app.directive('countdown', function () {
    return {
        restrict: 'E',
        replace: true,
        template: '<div class="married_coundown"></div>',
        link: function (scope, elem, attrs) {
            var date = new Date(attrs.date);
            elem.countdown({ until: date });
        }
    };
});
app.directive('map', function() {
    return {
        restrict: 'E',
        replace: true,
        template: '<div></div>',
        link: function(scope, element, attrs) {
            console.log(element);
            var myLatLng = { lat: -34.800659, lng: -55.991766 };

            var myOptions = {
                zoom: 15,
                center: myLatLng,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            var map = new google.maps.Map(document.getElementById(attrs.id), myOptions);
            
            var marker = new google.maps.Marker({
                position: myLatLng,
                map: map,
                title: 'Hello World!'
            });

            //google.maps.event.addListener(map, 'click', function(e) {
            //    scope.$apply(function() {
            //        addMarker({
            //            lat: e.latLng.lat(),
            //            lng: e.latLng.lng()
            //        }); 
                    
            //        console.log(e);
            //    });
    
            //}); // end click listener
            
            //addMarker= function(pos){
            //    var myLatlng = new google.maps.LatLng(pos.lat,pos.lng);
            //    var marker = new google.maps.Marker({
            //        position: myLatlng, 
            //        map: map,
            //        title:"Hello World!"
            //    });
            //} //end addMarker
            
        }
    };
});

//app.directive('map', function () {
//    return {
//        restrict: 'E',
//        replace: true,
//        template: '<div ip="map"></div>',
//        link: function (scope, elem, attrs) {
//            var map = new google.maps.Map(mapDiv, {
//                center: { lat: attrs.lat, lng: attrs.lng },
//                zoom: attrs.zoom
//            });
//        }
//    };
//});