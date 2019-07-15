// use strict;

// initialize angular app variable
var app = angular.module('PencilApp', ['ui.router']);
var storage = localStorage;
app.factory('$localstorage', ['$window', function($window) {
  return {
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || false;
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      if($window.localStorage[key] != undefined){
        return JSON.parse( $window.localStorage[key] || false );
      }
      return false;   
    },
    remove: function(key){
      $window.localStorage.removeItem(key);
    },
    clear: function(){
      $window.localStorage.clear();
    }
  }
}]);

// configuration for ui-router
app.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('home', {
            url: '/home',
            templateUrl: 'partials/home.html',
        })

        .state('order', {
            abstract: true,
            url: "/order",
            templateUrl: "partials/order.html",
            controller: "gridCtrl"
        })

        .state('order.list', {
            url: "/list",
            templateUrl: "partials/list.html"
        })

        .state('order.detail', {
            url: '/:id',
            templateUrl: 'partials/details.html',
            controller: 'gridCtrl'
        })

        .state('cart', {
            url: "/cart",
            templateUrl: "partials/cart.html",
            controller: "tableCtrl"
        })

        $urlRouterProvider.otherwise("/home");
}]);

// controller for displaying list of products on the bootsrap grid
app.controller('gridCtrl', ['$scope', '$http', '$filter', '$stateParams', '$localstorage', '$window', function($scope, $http, $filter, $stateParams, $localstorage, $window){
    $http.get('./data/products.json').then(function (response) {
        function chunk(arr, size){
            var newArr = [];
            for (var i=0; i<arr.length; i+=size) {
                newArr.push(arr.slice(i, i+size));
            };
            return newArr;
        };
        var a = chunk(response.data, 3);
        $scope.pencilsGroup = a;

        var id = $stateParams.id;
        var pencilDetails;
        for(var i=0; i<$scope.pencilsGroup.length; i++){
            for(var j=0; j<$scope.pencilsGroup[i].length; j++){
                if($scope.pencilsGroup[i][j].id.includes(id)){
                    pencilDetails = $scope.pencilsGroup[i][j];
                };
            };
        };
        $scope.input = {};
        $scope.details = pencilDetails;
        $scope.input.quantity = 1;
        var c = [{name:"Black", code:"000000"},{name:"Red", code:"FF0000"},{name:"Green", code:"008000"},{name:"Blue", code:"0000FF"}];
        $scope.colors = c;
        $scope.input.color = $scope.colors[0];
    });

    $scope.addToCart = function () {
        var name = $scope.details.name;
        var quantity = $scope.input.quantity;
        var color = $scope.input.color.name;
        var unitPrice = $scope.details.price;
        var total = unitPrice * quantity;
        var get = $localstorage.getObject(name);
         var item = {};
        
        if(get){
            if(get[color] != undefined){
                quantity += get[color].quantity;
                total += get[color].total;
                get[color] = {"unitPrice":unitPrice, "quantity":quantity,"total":total};
                $localstorage.setObject(name, get);
            } else {
                get[color] = {"unitPrice":unitPrice, "quantity":quantity,"total":total};
                $localstorage.setObject(name, get);
            }
            
        } else{
            item[color] = {"unitPrice":unitPrice, "quantity":quantity,"total":total};
            $localstorage.setObject(name, item);
        };
        $window.alert($scope.input.quantity + ' item(s) added to cart');
     };
}]);

// controller for the shopping cart page
app.controller('tableCtrl',['$scope', '$localstorage', '$window', function($scope, $localstorage, $window){
    var cart = {};
    for(var key in storage){
        var temp = $localstorage.getObject(key);
        cart[key] = temp;
    }
    $scope.cart = cart;
    $scope.decrease = function(key, color, item){
        if(item.quantity > 0){
            item.quantity--;
            var object = $localstorage.getObject(key);
            var temp = object[color];
            temp.quantity--;
            var total = temp.unitPrice * item.quantity;
            temp.total = total;
            object[color] = temp;
            $localstorage.setObject(key, object);
            item.total = total;
        };
    };
    
    $scope.increase = function(key, color, item){
        item.quantity++;
        var object = $localstorage.getObject(key);
        var temp = object[color];
        temp.quantity++;
        var total = temp.unitPrice * item.quantity;
        temp.total = total;
        object[color] = temp;
        $localstorage.setObject(key, object);
        item.total = total;
    };

    $scope.removeItem = function(key, color, item){
        var object = $localstorage.getObject(key);
        delete object[color];
        $localstorage.setObject(key, object);
        delete cart[key][color];
        $scope.cart = cart;
    }

    $scope.sum = function(){
        var total = 0;
        for(var key in cart){
            for(var color in cart[key]){
                total += cart[key][color].total;
            };
        }
        return total;
    };

    $scope.checkout = function(){
        $scope.cart = {};
        $scope.sum = function(){return 0};
        $localstorage.clear();
        $window.alert('Your orders are currently processed. Thank you for shopping with us.');
    }
}]);