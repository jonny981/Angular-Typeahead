angular.module('typeahead', [])
    .config(function ($sceProvider) {
        $sceProvider.enabled(false);
    })
    .factory('productservice', function ($http) {
        return {
            getProducts: function () {
                return $http.get('json/products.json').then(
                    function (success) {
                        return success.data;
                    },
                    function (error) {
                        console.error('ERROR! productservice > getProducts: ' + error.status + ' (' + error.statusText + ')');
                    });
            }
        };
    })
    .directive('predictivesearch', function (productservice) {

        //build html for each item in the ng-repeat to provide word specific formatting
        function buildHtml(searchItem, input) {
            var startIndex = searchItem.toLowerCase().indexOf(input);
            var endIndex = startIndex + input.length;
            var highlight = searchItem.substring(startIndex, endIndex);
            return searchItem.split(new RegExp(highlight, 'g')).join('<span class="highlighted">' + highlight + '</span>');
        }

        //search for input string in results
        //in real use case search term would be passed as a param to backend so return specific results
        function parseResults(input, items, tempResults, scope) {
            for (var i = 0; i < items.length; i++) {
                var lcInput = input.toLowerCase();
                var lcItem = items[i].toLowerCase();

                if (lcItem.indexOf(lcInput) !== -1) {
                    var result = buildHtml(items[i], lcInput);
                    tempResults.results.push(result);
                }
            }
            if (tempResults.results.length) {
                scope.results.push(tempResults);
            }
        }

        function link(scope) {
            scope.results = [];
            scope.searchInput = ''
            //search for products that match the user input
            scope.productSearch = function () {
                scope.reset(false);
                var input = scope.searchInput;
                if (input.length > 2) {
                    productservice.getProducts(input).then(
                        function (products) {
                            if (products) {
                                angular.forEach(products, function (items, category) {
                                    var tempResults = {
                                        heading: category,
                                        results: []
                                    };
                                    parseResults(input, items, tempResults, scope);
                                });
                            }
                        });
                }
            };

            scope.reset = function (all) {
                scope.results = [];
                if (all) scope.searchInput = '';
            };
        }

        return {
            restrict: 'A',
            templateUrl: 'templates/typeahead.template.html',
            link: link,
            scope: {}
        };
    });

