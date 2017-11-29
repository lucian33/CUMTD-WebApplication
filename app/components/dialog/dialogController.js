myApp.controller('dialogController', ['$scope', '$mdDialog', '$http', 'stopInfo', 'vehicleService', function($scope, $mdDialog, $http, stopInfo, vehicleService){

  // availableRoutes in this stop
  // stores availabeRoutes info
  $scope.availableRoutes = [];
  // get the information of stop clicked
  $scope.stopInfo = stopInfo;
  $scope.getDeparturesByStop = function(stopID){
    var url = 'https://developer.cumtd.com/api/v2.2/json/getdeparturesbystop';
    var departures = [];
    console.log($scope.stopInfo.stop_id);
    $http.get(url, {params: {'key': key, 'stop_id': stopID, 'pt': 60 }}).then((res) => {
      $scope.availableRoutes = res.data.departures;
    });
  };
  $scope.getDeparturesByStop($scope.stopInfo.stop_id);

  // get the vehicles location and route information
  // update the shared service
  // then update the main map view
  $scope.getVehicleLocation = function (obj){
    //console.log(obj);
    let route = obj.route;
    //let vehicleID = obj.vehicle_id;
    // console.log(route);
    // console.log(vehicleID);
    vehicleService.id = obj.vehicle_id;
    vehicleService.route = obj;
    //console.log(vehicleService.id + " dialog val");
    $mdDialog.hide();
  }


  // satisfication rate functions
  $scope.upVote = Math.round(Math.random() * 100);
  $scope.downVote = Math.round(Math.random() * 100);

}]);
