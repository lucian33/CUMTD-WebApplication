myApp.config(function($routeProvider) {
  $routeProvider
  .when("/", {

    resolve: {
      // routes: function(routeService){
      //   return routeService.getRoutes();
      // }
    }
  });

});
