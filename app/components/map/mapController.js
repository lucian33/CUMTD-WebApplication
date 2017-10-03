// attach controller to main app
myApp.controller('mapController', ['$scope', '$http', '$mdSidenav', '$mdDialog', 'routeService', 'stopsService', 'vehicleService', function($scope, $http, $mdSidenav,  $mdDialog, routeService, stopsService, vehicleService){

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



  // --------------------------------------------functions for the departure click--------------------------------
  $scope.busMarker = [];
  $scope.shapeMarker = [];
  // watch if the id updated
  $scope.$watch(
    function(){
      return vehicleService.route;
    },
    function (newVal, oldVal){
      // once the id updated, update view
      if (newVal !== oldVal){
        console.log(newVal);
        var shapeID = newVal.trip.shape_id;

        // clear all markers after this
        clearMarkers($scope.busMarker);
        clearMarkers($scope.shapeMarker);
        createBusMarker(newVal, $scope.busMarker);
        // get shape by shapeID
        createPolyline(shapeID, "#" + newVal.route.route_color, $scope.shapeMarker);
      }

    });

  function createPolyline(shapeID, color, markers){

    var url = 'https://developer.cumtd.com/api/v2.2/json/GetShape';
    $http.get(url, {
      params: {
        'key' : key,
        'shape_id' : shapeID
      }
    }).then((res) => {
      // initialize the coord to empty
      shapeCoordinates = [];
      data = res.data;
      // result.shapes[0].shape_pt_lat
      // add all the stops' lat and lon to coordinates
      for (i = 0; i < data.shapes.length; i++) {
        var coord = data.shapes[i];
        var location = {lat : coord.shape_pt_lat, lng : coord.shape_pt_lon};
        // add the coordinates to the array
        shapeCoordinates.push(location);
      }
      // draw the route Shpae on map
      drawPolyline(shapeCoordinates, color, markers);
    });
  }
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

function createBusMarker(busInfo, markers) {

  var img = {
    url: 'assets/img/bus.png',
    scaledSize: new google.maps.Size(25, 25), // scaled size
    origin: new google.maps.Point(0,0), // origin
    anchor: new google.maps.Point(12.5, 25) // anchor
  };

  var position = {lat: busInfo.location.lat, lng: busInfo.location.lon};
  var marker = new google.maps.Marker({
      // assign the map and location of the marker
      map: map,
      position: position,
      icon: img,
      title: busInfo.trip.trip_headsign
  });

  // store markers
  markers.push(marker);

  console.log(markers);
  panTo(position.lat, position.lng);

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

// create route polyLine
function drawPolyline(coordArray, color, markers){
  // clear all the drawn route initially
  var routeShape = new google.maps.Polyline({
    path: coordArray,
    geodesic: true,
    strokeColor: color,
    strokeOpacity: 1.0,
    strokeWeight: 4
  });
	markers.push(routeShape);
	routeShape.setMap(map);
}

// panto specified location
function panTo(lat, lng){
  var center = new google.maps.LatLng(lat, lng);
  map.panTo(center);
}
