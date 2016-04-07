app.controller('GuestsUploaderController', function ($scope, FileUploader, $window, $http) {
    $scope.uploader = new FileUploader();
    $scope.uploader.url = '/api/backend/guests/multiload';

    if ($window.sessionStorage["userInfo"]) {
        var authData = JSON.parse($window.sessionStorage["userInfo"]);
        if (authData) {
            $scope.uploader.headers.Authorization = authData.accessToken;
        }
    }
    
    $scope.clearWrong = function () {
        $http.get("/api/backend/guests/clear")
        .then(function (response) { console.log(response); });
    }
});