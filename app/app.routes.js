myApp.config(function($routeProvider) {
  $routeProvider
  .when("/a", {
    templateUrl: "app/components/map/mapView.html",
    controller:"mapController",
    resolve: {
      routes: function(routeService){
        // only when the proomise is sucess
        // the page will load
        return routeService.getRoutes();
      }
    }
  });

});
