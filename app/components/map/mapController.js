// attach controller to main app
myApp.controller('mapController', ['$scope', '$http', '$mdSidenav', '$mdDialog', 'routeService', 'stopsService', function($scope, $http, $mdSidenav,  $mdDialog, routeService, stopsService){

  var mylocation = {lat: 40.108966, lng: -88.211024};
  var result;

  // array used to store the route line coordinates
  var shapeCoordinates = [];
  // store the polylines
  var shapeArray = [];
  // store the stops markers
  $scope.stopMarkers = [];
  $(document).ready(function () {
    initMap();
  });

  // routeService.getRoutes().then(function(data){
  //   console.log(data);
  //   $scope.availableRoutes = data;
  // });

  $scope.stops = stopsService.getStops();
  $scope.markers = [];


  // --------------------------------------------functions for the autocomplete--------------------------------

  // once user selected a stop
  $scope.selectedStopChange = function (item){
    //console.log(item.stop_points);
    if(item !== undefined){
      clearMarkers($scope.stopMarkers); // clear markers from map
      $scope.stopMarkers = []; // clear markers from array
      createMarker(item.stop_points, $scope.stopMarkers, $scope.showCard);
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
  // index of the clicked stop
  $scope.showCard = function(index) {

    $mdDialog.show({
      controller: 'dialogController',
      templateUrl: 'app/components/dialog/dialogView.html',
      parent: angular.element(document.body),
      clickOutsideToClose:true,
      // pass stop infomation
      locals:{
        stopInfo: $scope.stopMarkers[index].info
      }
      // fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
    });
    //console.log($scope.stopMarkers[index].info);
  };

}]);

function clearMarkers(markers){
  markers.forEach((marker)=>{
    marker.setMap(null);
  });
}

// Helper functions
// create marker's based on the position and marker array
function createMarker(stopPoints, markers, func) {

  var position;
  var img = {
    url: 'assets/img/icon.svg',
    scaledSize: new google.maps.Size(50, 50), // scaled size
    origin: new google.maps.Point(0,0), // origin
    anchor: new google.maps.Point(25, 50) // anchor
  };

  stopPoints.forEach((entry, i)=>{

    position = {lat: entry.stop_lat, lng: entry.stop_lon};
    var marker = new google.maps.Marker({
        // assign the map and location of the marker
        map: map,
        position: position,
        title: entry.stop_name,
        icon: img,
        info:entry
    });

    // add evt listener to each marker
    // use closure to ensure the lexical scope wont be the same
    marker.addListener('click', (function(index){
      return function (){
        // show the dialog
        func(i);
      }
    })(i));// self invoke, preserve the index

    // store markers
    markers.push(marker);

  });
  console.log(markers);
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
