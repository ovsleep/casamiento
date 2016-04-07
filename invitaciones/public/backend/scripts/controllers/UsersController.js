app.controller('UsersController', ['$scope', 'users', 'User',
function ($scope, users, User) {
    $scope.users = users;
}]);