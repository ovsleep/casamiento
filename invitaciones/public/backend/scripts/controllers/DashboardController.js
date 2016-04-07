
app.controller("DashboardController", ["$scope", "$location", "$window", "authenticationSvc", "Status", function ($scope, $location, $window, authenticationSvc, Status) {
    $scope.userInfo = null;
    $scope.login = function () {
        authenticationSvc.login($scope.userName, $scope.password)
            .then(function (result) {
                $scope.userInfo = result;
                $location.path("/");
            }, function (error) {
                $window.alert("Invalid credentials");
                console.log(error);
            });
    };
    
    $scope.status = Status.get();
    $scope.cancel = function () {
        $scope.userName = "";
        $scope.password = "";
    };
}]);
