// attach controller to main app
myApp.controller('mapController', ['$scope', '$http', '$mdSidenav', 'routeService', function($scope, $http, $mdSidenav, routeService){

  var mylocation = {lat: 40.108966, lng: -88.211024};
  var stopLocation;
  var busLocation;

  var result;
  var map;
  var key = "ef25cd9380fc43e7a4a76ec1af0557cf";
  // array used to store the route line coordinates
  var shapeCoordinates = [];
  // store the polylines
  var shapeArray = [];

  $(document).ready(function () {
    initMap();
  });

  // routeService.getRoutes().then(function(data){
  //   console.log(data);
  //   $scope.availableRoutes = data;
  // });

  $scope.availableRoutes = ["NAVY", "GREEN", "ORANGEHOPPER", "ILLINI", "RUBY", "YELLOW", "RED", "BROWN", "GREY EVENING", "GREY", "GREENHOPPER", "YELLOW EVENING", "GREEN EVENING", "YELLOWHOPPER", "GOLD", "PINK", "LAVENDER", "BLUE", "ORANGE", "SILVER", "RAVEN", "TEAL", "GOLDHOPPER"];

  $scope.querySearch = function (query) {
    // if there is a input query, then return the filtered results
    // else, return all results
    var results = query ? $scope.availableRoutes.filter( createFilterFor(query) ) : $scope.availableRoutes;
    return results;

  }

  function createFilterFor(query) {
   var lowercaseQuery = angular.lowercase(query);
   return function filterFn(item) {
     // filter the result if it doesnt contain the input value
     return (angular.lowercase(item).indexOf(lowercaseQuery) != -1);
   };

  }


  $scope.toggleLeft = buildToggler('left');
  $scope.toggleRight = buildToggler('right');

    function buildToggler(componentId) {
      return function() {
        $mdSidenav(componentId).toggle();
      };
    }

}]);

// initial google map
function initMap() {
// Create a map object and specify the DOM element for display.
  map = new google.maps.Map(document.getElementById('GoogleMap'), {
      center: {lat: 40.108966, lng: -88.211024},
      scrollwheel: false,
      zoom: 15
  });
}

function panTo(lat, lng){
  var center = new google.maps.LatLng(lat, lng);
  map.panTo(center);
}
