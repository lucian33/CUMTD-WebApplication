// attach controller to main app
myApp.controller('mapController', ['$scope', '$http', '$mdSidenav', '$mdDialog', 'routeService', 'stopsService', function($scope, $http, $mdSidenav,  $mdDialog, routeService, stopsService){

  var mylocation = {lat: 40.108966, lng: -88.211024};
  $scope.stops = [];
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

  stopsService.getStops().then(function(data){
    $scope.stops = data; // store all the stops information
  });

  // $scope.availableRoutes = ["NAVY", "GREEN", "ORANGEHOPPER", "ILLINI", "RUBY", "YELLOW", "RED", "BROWN", "GREY EVENING", "GREY", "GREENHOPPER", "YELLOW EVENING", "GREEN EVENING", "YELLOWHOPPER", "GOLD", "PINK", "LAVENDER", "BLUE", "ORANGE", "SILVER", "RAVEN", "TEAL", "GOLDHOPPER"];

  // --------------------------------------------functions for the autocomplete--------------------------------

  // once user selected a stop
  $scope.selectedStopChange = function (item){
    //console.log(item.stop_points);
    if(item !== undefined){
      createMarker(item.stop_points, [], $scope.showCard);
    }
  };


  $scope.querySearch = function (query) {
    // if there is a input query, then return the filtered results
    // else, return all results
    var results = query ? $scope.stops.filter( createFilterFor(query) ) : $scope.stops;
    return results;
  };

  function createFilterFor(query) {
   var lowercaseQuery = angular.lowercase(query);
   return function filterFn(item) {
     // item is a object in $scope.stops array
     // filter the result if it doesnt contain the input value
     return (angular.lowercase(item.stop_name).indexOf(lowercaseQuery) != -1);
   };

  }


  // toggle side Nav
  $scope.toggleLeft = buildToggler('left');
  $scope.toggleRight = buildToggler('right');

  function buildToggler(componentId) {
    return function() {
      $mdSidenav(componentId).toggle();
    };
  }


  // --------------------------------------------functions for the marker click--------------------------------
  $scope.showCard = function(ev) {

    $mdDialog.show({
      controller: 'dialogController',
      templateUrl: 'app/components/dialog/dialogView.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose:true,
      // fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
    });
  };



}]);


// Helper functions
// create marker's based on the position and marker array
function createMarker(stopPoints, markers, func) {
  var position;
  var img = {
    url: 'assets/img/placeholder.png',
    scaledSize: new google.maps.Size(50, 50), // scaled size
    origin: new google.maps.Point(0,0), // origin
    anchor: new google.maps.Point(25, 50) // anchor
  };

  stopPoints.forEach((entry)=>{

    position = {lat: entry.stop_lat, lng: entry.stop_lon};
    var marker = new google.maps.Marker({
        // assign the map and location of the marker
        map: map,
        position: position,
        title: entry.stop_name,
        icon: img
    });
    marker.addListener('click', func);

  });
  panTo(position.lat, position.lng);
  //
  // // add marker to the marker array
  // markers.push(marker);
}
// initial google map
function initMap() {
// Create a map object and specify the DOM element for display.
  map = new google.maps.Map(document.getElementById('GoogleMap'), {
      center: {lat: 40.108966, lng: -88.211024},
      scrollwheel: false,
      zoom: 18
  });
}

// panto specified location
function panTo(lat, lng){
  var center = new google.maps.LatLng(lat, lng);
  map.panTo(center);
}
