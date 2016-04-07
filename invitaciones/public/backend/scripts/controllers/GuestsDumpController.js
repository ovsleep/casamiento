app.controller('GuestsDumpController', ['$scope', 'guests', 'Guest', '$http',
    function ($scope, guests, Guest, $http) {
        $scope.dump = JSON.stringify(guests);

    }]);