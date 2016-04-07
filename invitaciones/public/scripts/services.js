var services = angular.module('Invitations.services', ['ngResource']);

services.factory('Person', ['$resource', function ($resource) {
    return $resource('/api/guest/:id', { id: '@nro' });
}]);

services.factory('PersonLoader', ['Person', '$route', '$q', function (Person, $route, $q) {
    return function () {
        var delay = $q.defer();
        Person.get({ id: $route.current.params.nro }, function (person) { delay.resolve(person) }, function () {
            delay.reject('Poblemas obteniendo el invitado ' + $route.current.params.nro);
        });
        return delay.promise;
    }
}]);