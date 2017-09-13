myApp.controller('dialogController', ['$scope', '$mdDialog', function($scope, $mdDialog){

  // availableRoutes in this stop
  $scope.availableRoutes = ["NAVI", "BLUE", "ILLINI", "YELLOW", "NAVI2", "BLUE3", "ILLINI4", "YELLOW5"];

  $scope.getDeparturesByStop = function(stopID){
    var url = 'https://developer.cumtd.com/api/v2.2/json/getdeparturesbystop';
    var departures = [];

    $http.get(url, {params: {'key': key, 'stop_id': stopID }}).then((res) => {

      stops = res.data.stops;
      defered.resolve(); // resolve promise

    });

  }

}]);
