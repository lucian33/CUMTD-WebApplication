myApp.controller('dialogController', ['$scope', '$mdDialog', '$http', 'stopInfo', function($scope, $mdDialog, $http, stopInfo){

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
}]);
