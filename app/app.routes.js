myApp.config(function($routeProvider) {
  $routeProvider
  .when("/", {
    templateUrl: "app/components/map/mapView.html",
    controller:"mapController",
    resolve: {
      // routes: function(routeService){
      //   // only when the proomise is sucess
      //   // the page will load
      //   return routeService.getRoutes();
      // }
      stops: function(stopsService){
        return stopsService.loadStops();
      }
    }
  });

});
