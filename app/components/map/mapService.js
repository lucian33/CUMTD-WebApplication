
// load availabe routes before application loaded
myApp.service('routeService', ['$http', '$q', function($http, $q){

    var url = 'https://developer.cumtd.com/api/v2.2/json/GetVehicles?key=';
    return{

      getRoutes: function(){
        // get every availabe routes
        var defered = $q.defer();

        var routes = [];

        $http.get(url + key).then(function(res){
          var data = res.data;
          // get the availabe routes information
          for(var i = 0; i < data.vehicles.length; i++){
            var route;
            // get the route id
            route = data.vehicles[i].trip.route_id;
            if (routes.indexOf(route) == -1){
              // add this route information if it does not exist
              routes.push(route);
            }
          }
          defered.resolve(routes);

        });
        return defered.promise;
      }

    }

}]);


// get all available stops
myApp.service('stopsService', ['$http', '$q', function($http, $q){

  var url = 'https://developer.cumtd.com/api/v2.2/json/getStops';
  return {
    getStops: function(){
      var defered = $q.defer();

      $http.get(url, {params: {'key': key}}).then((res) => {
        var stops;
        stops = res.data.stops;
        defered.resolve(stops);
      });

      return defered.promise;
    }
  }
}]);
