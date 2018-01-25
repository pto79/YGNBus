// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'ngCordova', 'starter.controllers'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.constant('buildconfig', {
    qrServiceUrl: 'http://192.168.1.250:8080/afc/services/qrService/',
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('login', {
    url: "/login",
    // abstract: true,
    templateUrl: "templates/login.html",
    controller: 'LoginCtrl'
  })

  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'MenuCtrl'
  })

  .state('app.main', {
    url: '/main',
    views: {
      'menuContent': {
        templateUrl: 'templates/main.html',
        controller: 'MainCtrl'
      }
    }
  })

  .state('app.account', {
    url: '/account',
    views: {
      'menuContent': {
        templateUrl: 'templates/account.html',
        controller: 'AccountCtrl'
      }
    }
  })

  .state('app.password', {
    url: '/password',
    views: {
      'menuContent': {
        templateUrl: 'templates/password.html',
        controller: 'PasswordCtrl'
      }
    }
  })

  .state('app.ticket', {
    url: '/ticket',
    views: {
      'menuContent': {
        templateUrl: 'templates/ticket.html',
        controller: 'TicketCtrl'
      }
    }
  })

  .state('app.history', {
    url: '/history',
    views: {
      'menuContent': {
        templateUrl: 'templates/history.html',
        controller: 'HistoryCtrl'
      }
    }
  })

  .state('app.transaction', {
    url: '/transaction',
    views: {
      'menuContent': {
        templateUrl: 'templates/transaction.html',
        controller: 'TransactionCtrl'
      }
    }
  })

  .state('app.qrcode', {
    url: '/qrcode',
    views: {
      'menuContent': {
        templateUrl: 'templates/qrcode.html',
        controller: 'QRCodeCtrl'
      }
    }
  })

  .state('app.viewticket', {
    url: '/viewticket',
    views: {
      'menuContent': {
        templateUrl: 'templates/viewticket.html',
        controller: 'ViewTicketCtrl'
      }
    }
  })

  ;
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');
})

