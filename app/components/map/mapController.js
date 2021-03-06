
// attach controller to main app
myApp.controller('mapController', ['$scope', '$http', '$mdSidenav', '$mdDialog', 'routeService', 'stopsService', 'vehicleService', function($scope, $http, $mdSidenav,  $mdDialog, routeService, stopsService, vehicleService){

  var mylocation = {lat: 40.1063, lng: -88.2237};
  var result;

  // array used to store the route line coordinates
  var shapeCoordinates = [];
  // store the polylines
  var shapeArray = [];
  // store the stops markers
  $scope.stopMarkers = [];
  $scope.selectedMarkers = [];

  $(document).ready(function () {
    initMap();
  });

  // get all stops
  $scope.stops = stopsService.getStops();
  // $scope.markers = [];

  // --------------------------------------------functions for the autocomplete--------------------------------

  // once user selected a stop
  $scope.selectedStopChange = function (item){
    // if the user select nearest stop first than
    // search the stop
    if (item === null){
      item = $scope.selectedStop;
    }
    else {
      $scope.selectedStop = item;
    }

    if (item === undefined){
      return;
    }

    createSelectedStopMarker(item, $scope.stopMarkers, $scope.selectedMarkers, $scope.showCard);

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


  // draw all available stops
  $scope.stops.forEach((stop, i)=>{
    createStopsMarker(stop, $scope.stopMarkers, $scope.showCard);
  });


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

        // sets the current states
        $scope.currentStates.isSelected = true;
        $scope.currentStates.stop_id = newVal.stop_id;
        $scope.currentStates.route = newVal.route.route_id;

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

  // --------------------------------------------functions for the collecting feedback--------------------------------
  // store current states for updating database
  $scope.currentStates = {
    isSelected: false,
    route: '',
    stop_id: ''
  };

  // --------------------------------------------functions for the sideNav--------------------------------
  $scope.showSearchPrompt = function() {
    $mdDialog.show(
      $mdDialog.alert()
        .clickOutsideToClose(true)
        // .title('Searching your location...')
        .content('<i class="fa fa-circle-o-notch fa-spin fa-3x fa-fw"></i>')
        .textContent('Searching your location...!')
        // .ariaLabel('Left to right demo')
        .ok('ok')
        .openFrom({
          top: -50,
          width: 30,
          height: 80
        })
        .closeTo({
          left: 1500
        })
    );
  }

  $scope.locateUser = ()=>{
    locateUser($scope, $mdDialog);
  }

  // get Nearest stop
  $scope.getNearestStop = getNearestStop;

  $scope.news = [];

  $scope.getNews = getNews;

  getNews();

  function getNearestStop(){
    console.log("get nearest stop..");
    var url = 'https://developer.cumtd.com/api/v2.2/json/getstopsbylatlon';
    // get user location first
    if (userMarker === null){
      if (navigator.geolocation) {
        $scope.showSearchPrompt();
        navigator.geolocation.getCurrentPosition(function(position) {
          var pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          $mdDialog.hide();
          fetchNearestStop(url, pos.lat, pos.lng);
        });
      }
    }
    else {
      fetchNearestStop(url, userMarker.position.lat(), userMarker.position.lng());
    }
  }

  function fetchNearestStop(url, lat, lng){

    $http.get(url, {
      params: {
        'key' : key,
        'lat'	: lat,
        'lon' : lng,
        'count'	: 1
      }
    }).then((res) => {
      console.log(res);
      $scope.selectedStop = res.data.stops[0];
      $scope.selectedStopChange(res.data.stops[0]);

    });
  }

  function getNews(){
    var url = 'https://developer.cumtd.com/api/v2.2/json/getnews';
    $scope.news = []; // empty news and show the progress bar
    $http.get(url, {
      params: {
        'key' : key,
        'count' : 6
      }
    }).then((res) => {
      // console.log(res.data.news);
      $scope.news = res.data.news;
    });
  }

}]);

// closure for the hovering button
(function() {
  myApp.controller('fabCtrl', ['$scope', function($scope) {

    this.isOpen = false;

    this.selectedMode = 'md-fling';

    this.selectedDirection = 'right';

    // console.log($scope.currentStates);

    // handle the click function
    // base on up and down vote
    this.clickHandler = function (bool){
      if (bool){
        alert(`I am satisfied with stop_id: ${$scope.currentStates.stop_id}, route: ${$scope.currentStates.route}`);
      }
      else{
        alert(`I am unsatisfied with stop_id: ${$scope.currentStates.stop_id}, route: ${$scope.currentStates.route}`);
      }
    }
  }]);

})();

function clearMarkers(markers){
  markers.forEach((marker)=>{
    marker.setMap(null);
  });
}

// Helper functions
// change the marker to show user the selected stop
function createSelectedStopMarker(item, stopsMarkers, selectedMarkers, func) {

  console.log(selectedMarkers);

  var position, img;

  img = {
    url: 'assets/img/bus-stop (4).svg',
    size: new google.maps.Size(20, 20),
    scaledSize: new google.maps.Size(20, 20), // scaled size
    origin: new google.maps.Point(0,0), // origins
    anchor: new google.maps.Point(10, 20) // anchor
  };

  // restore default img
  if (selectedMarkers.length !== 0){

    selectedMarkers.forEach((code)=>{

      stopsMarkers.forEach((marker)=>{
        if (marker.info.code == code){
          marker.setIcon(img);
        }
      });

    });
  }
  // empty the array
  // this won't work
  // selectedMarkers = [];
  selectedMarkers.splice(0, selectedMarkers.length);

  img = {
    url: 'assets/img/pin.svg',
    scaledSize: new google.maps.Size(50, 50), // scaled size
    origin: new google.maps.Point(0,0), // origin
    anchor: new google.maps.Point(25, 50) // anchor
  };

  // set new marker
  item.stop_points.forEach((entry, i)=>{

    position = {lat: entry.stop_lat, lng: entry.stop_lon};

    stopsMarkers.forEach((marker)=>{
      if (marker.info.code == entry.code){
        marker.setIcon(img);
      }
    });

    // store markers
    selectedMarkers.push(entry.code);

  });

  // console.log(markers);
  panTo(position.lat, position.lng);

}

// create markers for all stop
function createStopsMarker(stop, markers, func) {

  var position;
  var stopPoints = stop.stop_points;

  var img = {
    url: 'assets/img/bus-stop (4).svg',
    size: new google.maps.Size(20, 20),
    scaledSize: new google.maps.Size(20, 20), // scaled size
    origin: new google.maps.Point(0,0), // origins
    anchor: new google.maps.Point(10, 20) // anchor
  };


  // the start index of the new stop
  var startIdx = markers.length;

  // add a property as
  // reference index for each stop
  stop.startIdx = startIdx;

  stopPoints.forEach((entry, i)=>{

    position = {lat: entry.stop_lat, lng: entry.stop_lon};

    var marker = new google.maps.Marker({
        // assign the map and location of the marker
        map: map,
        position: position,
        title: entry.stop_name,
        icon: img,
        info: entry,
        index: startIdx + i
    });

    // add evt listener to each marker
    // use closure to ensure the lexical scope wont be the same
    marker.addListener('click', (function(index){
      return function (){
        // show the dialog
        func(index);
      }
    })(startIdx + i));// self invoke, preserve the index

    // store markers
    markers.push(marker);

  });

}

function createBusMarker(busInfo, markers) {

  var img = {
    url: 'assets/img/bus.png',
    scaledSize: new google.maps.Size(25, 25), // scaled size
    origin: new google.maps.Point(0,0), // origin
    anchor: new google.maps.Point(12,0) // anchor
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
      center: {lat: 40.1090, lng: -88.2265},
      scrollwheel: false,
      zoom: 18,
      styles: [
        {
          "featureType": "transit.station.bus",
          "elementType": "labels.icon",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        }
      ]
  });

}

function locateUser(s, m) {

  var img = {
    url: 'assets/img/pin2.svg',
    scaledSize: new google.maps.Size(40, 40), // scaled size
  };
  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    s.showSearchPrompt();
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      map.setCenter(pos);
      // create user marker on map
      if (userMarker === null){
        userMarker = new google.maps.Marker({
            // assign the map and location of the marker
            map: map,
            title: "Your Location",
            position: pos,
            icon: img
        });
      }
      // else just update
      else {
        userMarker.setPosition(pos);
      }
      // hide side nav and prompt
      s.toggleLeft();
      m.hide();
    });
  }
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
