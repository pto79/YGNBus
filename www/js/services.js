angular.module('starter.services', [])

.factory('QRService', function($http, $q, buildconfig) {

  return {
    send: function(req) {
      console.log(req);
      var deferred = $q.defer();
      $http({
        method: "POST",
        url: buildconfig.qrServiceUrl + req.service,
        headers: {'Content-Type': 'application/json'},
        data: req.data 
      }).then(function(res) {
        console.log(res);
        if(typeof(res.data) == 'object') {
          deferred.resolve(res.data);
        } else {
          deferred.reject(res);
        }
      }, function(res) {
        console.log(res);
        deferred.reject(res);
      })
      return deferred.promise;
    },
  };
});
