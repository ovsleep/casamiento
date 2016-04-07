app.controller('WelcomeController', ['$scope', '$location', "authenticationSvc",
function ($scope, $location, auth) {
    $scope.auth = auth;
    $scope.logout = function () {
        auth.logout();
        $location.path('/');
    }
    $scope.user = auth.getUserInfo();

    $scope.$watch('auth.getUserInfo()', function (newVal) {
        $scope.user = newVal;
    });

}]);