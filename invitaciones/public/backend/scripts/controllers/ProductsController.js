app.controller('ProductsController', ['$scope', 'products', 'Product',
    function ($scope, products, Product) {
        $scope.products = products;
        $scope.units = ['Atado', 'Bandeja', 'Bolsa', 'Gramo', 'Gusto', 'Kilo', 'Unidad'];
        $scope.Product = Product;
        $scope.save = function (product) {
            Product.save(product, function () {
                alert('Guardado!');
            });
            //product.$save(function () {
            //});
        }

        $scope.remove = function (index) {
            var product = $scope.products.splice(index, 1)[0];
            product.$delete();
        }
        $scope.saveAll = function () {
            Product.saveAll($scope.products, function () {
            alert('Guardado!')
            });
            //$scope.products.forEach(function (prod) { prod.$save(); });
        }
    }]);