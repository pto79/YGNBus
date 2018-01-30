angular.module('starter.controllers', ['angular-jwt'])

.controller('LoginCtrl', function($scope, $ionicPopup, $window, $http, $state, buildconfig) {
    $scope.input = [];
    $scope.input.address = buildconfig.qrServiceUrl;
    $scope.input.username = "marco161763";
    $scope.input.password = "asdfg";

    $scope.login = function() {
      var server = $scope.input.address + "login";
      var res = $http({
          method: "POST",
          url: server,
          headers: {
              'Content-Type': 'application/json'
          },
          data: {
              username: $scope.input.username,
              password: $scope.input.password,
              lastTicketSerial: '2100059'
          }
      })
      res.success(function(data, status, header, config) {
          console.log(data);
          if (data.resultType == 'OK') {
              $window.sessionStorage.setItem("token", data.token);
              $window.sessionStorage.setItem("fullName", data.accountInfo.fullName);
              $window.sessionStorage.setItem("gender", data.accountInfo.gender);
              $window.sessionStorage.setItem("balance", data.accountInfo.balance);
              $window.sessionStorage.setItem("freezedAmount", data.accountInfo.freezedAmount);
              $window.sessionStorage.setItem("tickets", data.accountInfo.tickets);
              $window.sessionStorage.setItem("server", $scope.input.address);
              $window.sessionStorage.setItem("oldpassword", $scope.input.password);
              $state.go('app.main');                
          } else $ionicPopup.alert({
              title: 'Login failed!',
              template: 'Please check your credentials!',
              okText: 'OK'
          });
      });
      res.error(function(data, status, header, config) {
          var alertPopup = $ionicPopup.alert({
              title: 'Server error!',
              template: 'Please check your internet connection!',
              okText: 'OK'
          });
      });
    }
})


.controller('MenuCtrl', function($scope, $window, $ionicSideMenuDelegate, $state, $ionicViewService) {
  $scope.fullName = $window.sessionStorage.getItem("fullName");
  $scope.balance = $window.sessionStorage.getItem("balance");

  $scope.changePass = function() {
    $ionicSideMenuDelegate.toggleLeft();
    $state.go('app.password');
  }

  $scope.editAccount = function() {
    $ionicSideMenuDelegate.toggleLeft();
    $state.go('app.account');
  }

  $scope.logout = function() {
    $window.sessionStorage.clear();
    $ionicViewService.nextViewOptions({
          disableBack: true
      });
    $state.go('login');
  }

  $scope.close = function() {
    ionic.Platform.exitApp();
  }

})


.controller('MainCtrl', function($scope, $window, $state) {
  $scope.balance = $window.sessionStorage.getItem("balance");
  $window.sessionStorage.setItem("viewStatus", 2);

  $scope.ticket = function() {
    $state.go('app.ticket');
  }

  $scope.history = function() {
    $state.go('app.history');
  }

  $scope.transaction = function() {
    $state.go('app.transaction');
  }

  $scope.qrcode = function() {
    $state.go('app.qrcode');
  }

  $scope.slide = {};  
  $scope.slide.template = "templates/ticketdetail.html";
})


.controller('TicketCtrl', function($scope, $window, $http, $ionicPopup, $state) {
var token = $window.sessionStorage.getItem("token");
var baseserver = $window.sessionStorage.getItem("server");

  function getValidTickets() {
    server = baseserver + "getAvailableTickets";
    var res = $http({
        method: "POST",
        url: server,
        headers: {
            'Content-Type': 'application/json'
        },
        data: {
            token: token
        }
    })
    res.success(function(data, status, header, config) {
        console.log(data);
        if (data.resultType == 'OK')
            $scope.avaibleTickets = data.avaibleTickets;
    });
    res.error(function(data, status, header, config) {
        var alertPopup = $ionicPopup.alert({
            title: 'Server error!',
            template: 'Please check your internet connection!',
            okText: 'OK'
        });
    });
  }

  $scope.buyTicket = function(ticket) {
    var tmp = 'Bus Number: ' + ticket.tripCode + '<br>' 
    + 'From: ' + ticket.sourceStation + '<br>' 
    + 'To: ' + ticket.destinationStation + '<br>' 
    + 'Ticket Price: K ' + ticket.fareQuantity;
    var confirmPopup = $ionicPopup.confirm({
     title: 'Buy Ticket Confirmation',
     okText: 'CONFIRM',
     cancelText: 'CANCEL',
     template: tmp
    });

    confirmPopup.then(function(res) {
     if(res) {
        server = baseserver + "buyTicket";
        var res = $http({
            method: "POST",
            url: server,
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                token: token,
                tripCode: ticket.tripCode,
                ticketType: ticket.ticketCode,
                lastTicketSerial: 0
            }
        })
        res.success(function(data, status, header, config) {
            console.log(data);
            if (data.resultType == 'OK') {

                if(data.ticketResultStatus == "OK")
                  var alertPopup = $ionicPopup.alert({
                        title: '<img src="img\\ic_bus_ok.png" width="100%">',
                        template: 'OK',
                        okText: 'View Ticket'
                    });

                if(data.ticketResultStatus == "NOT_ALLOWED_MORE_TICKET")
                  var alertPopup = $ionicPopup.alert({
                        title: '<img src="img\\ic_bus_not_ok.png" width="100%">',
                        template: 'Not Allowed More Ticket',
                        okText: 'View Ticket'
                    });

                  alertPopup.then(function(res) {
                     console.log(data.ticketResultStatus);
                     $window.sessionStorage.setItem("viewStatus", 0); //View New Ticket
                     $state.go('app.viewticket');
                  });

            } 
        });
        res.error(function(data, status, header, config) {
            var alertPopup = $ionicPopup.alert({
                title: 'Server error!',
                template: 'Please check your internet connection!',
                okText: 'OK'
            });
        });


     } else {
        console.log('Not sure!');
     }
    });

  }

  getValidTickets();
})


.controller('HistoryCtrl', function($scope, $window, $http, $ionicPopup, $state) {
var token = $window.sessionStorage.getItem("token");
var baseserver = $window.sessionStorage.getItem("server");

  function getMyTickets() {
    server = baseserver + "checkTicketsStatus";
    var res = $http({
        method: "POST",
        url: server,
        headers: {
            'Content-Type': 'application/json'
        },
        data: {
            token: token,
            lastTicketSerial: 0,
            ticketSerials: [0]
        }
    })
    res.success(function(data, status, header, config) {
        console.log(data);
        if (data.resultType == 'OK') {
            $scope.TicketsHistory = data.accountInfo.tickets;
        }
    });
    res.error(function(data, status, header, config) {
        var alertPopup = $ionicPopup.alert({
            title: 'Server error!',
            template: 'Please check your internet connection!',
            okText: 'OK'
        });
    });
  }

  $scope.detail = function() {
    $window.sessionStorage.setItem("viewStatus", 1);  //from Ticket History
    $state.go('app.viewticket');
  }

  getMyTickets();
})


.controller('TransactionCtrl', function($scope, $window, $http, $ionicPopup) {
var token = $window.sessionStorage.getItem("token");
var baseserver = $window.sessionStorage.getItem("server");

  function getTransaction() {
    server = baseserver + "getTransactionsHistory";
    var res = $http({
        method: "POST",
        url: server,
        headers: {
            'Content-Type': 'application/json'
        },
        data: {
            token: token
        }
    })
    res.success(function(data, status, header, config) {
        console.log(data);
        if (data.resultType == 'OK') {
            $scope.TransactionsHistory = data.transactions;
        }
    });
    res.error(function(data, status, header, config) {
        var alertPopup = $ionicPopup.alert({
            title: 'Server error!',
            template: 'Please check your internet connection!',
            okText: 'OK'
        });
    });
  }

  getTransaction();
})


.controller('QRCodeCtrl', function($scope, $window, $http, $ionicPopup, jwtHelper) {
  var token = $window.sessionStorage.getItem("token");  
  var tokenPayload = jwtHelper.decodeToken(token);
  $scope.fullName = window.sessionStorage.getItem("fullName");
  $scope.userid = tokenPayload.sub;

  var opts = {
    //errorCorrectionLevel: 'Q',
    //type: 'image/jpeg',
    //rendererOpts: {
    //  quality: 0.3
    //}
    //version: 15
  }
   
  QRCode.toDataURL(tokenPayload.jti, opts, function (err, url) {
    if (err) throw err
    $scope.qrUrl = url;
  })

})


.controller('ViewTicketCtrl', function($scope, $window, $http, $ionicPopup, $state) {
var token = $window.sessionStorage.getItem("token");
var baseserver = $window.sessionStorage.getItem("server");
$scope.viewStatus = $window.sessionStorage.getItem("viewStatus");
$scope.tickets = [];
var opts = {};

  $scope.goMain = function() {
    $state.go('app.main');
  }

  function getActiveTicket() {
   
    server = baseserver + "checkMyTickets";
    var res = $http({
        method: "POST",
        url: server,
        headers: {
            'Content-Type': 'application/json'
        },
        data: {
            token: token,
            lastTicketSerial: 0
        }
    })
    res.success(function(data, status, header, config) {
        console.log(data);
        if (data.resultType == 'OK') {
            angular.forEach(data.accountInfo.tickets, function(ticket) {
                if (ticket.status == 'UNUSED') {
                  $scope.tickets.push(ticket);
                  QRCode.toDataURL(ticket.ticketContent, opts, function (err, url) {
                    if (err) throw err
                    ticket.qrUrl = url;
                  })
                }
            });
        }
    });
    res.error(function(data, status, header, config) {
        var alertPopup = $ionicPopup.alert({
            title: 'Server error!',
            template: 'Please check your internet connection!',
            okText: 'OK'
        });
    });
  }

  function getMyTickets() {
    server = baseserver + "checkTicketsStatus";
    var res = $http({
        method: "POST",
        url: server,
        headers: {
            'Content-Type': 'application/json'
        },
        data: {
            token: token,
            lastTicketSerial: 0,
            ticketSerials: [0]
        }
    })
    res.success(function(data, status, header, config) {
        console.log(data);
        if (data.resultType == 'OK') {
            $scope.tickets = data.accountInfo.tickets;
            angular.forEach(data.accountInfo.tickets, function(ticket) {
                QRCode.toDataURL(ticket.ticketContent, opts, function (err, url) {
                  if (err) throw err
                  ticket.qrUrl = url;
                })
            });
        }
    });
    res.error(function(data, status, header, config) {
        var alertPopup = $ionicPopup.alert({
            title: 'Server error!',
            template: 'Please check your internet connection!',
            okText: 'OK'
        });
    });
  }

  if($scope.viewStatus == 0 || $scope.viewStatus == 2)
    getActiveTicket();
  else if($scope.viewStatus == 1)
    getMyTickets();
})


.controller('PasswordCtrl', function($scope, $window, $http, $ionicPopup, $state){
var token = $window.sessionStorage.getItem("token");
var baseserver = $window.sessionStorage.getItem("server");
var oldpassword = $window.sessionStorage.getItem("oldpassword");
$scope.input = {};

  $scope.changePass = function() {
    console.log($scope.input);
    if($scope.input.oldpassword == undefined) {
      document.getElementById("oldpassword").setCustomValidity("This field is required");
      return;
    }
    else if($scope.input.oldpassword != oldpassword) {
      document.getElementById("oldpassword").setCustomValidity("The old password is wrong");
      return;
    }
    else {
      document.getElementById("oldpassword").setCustomValidity("");
    }

    if($scope.input.newpassword == undefined) {
      document.getElementById("newpassword").setCustomValidity("This field is required");
      return;
    }
    else if($scope.input.newpassword.length < 5) {
      document.getElementById("newpassword").setCustomValidity("Password is too short (minimum is 5 characters)");
      return;
    }
    else {
      document.getElementById("newpassword").setCustomValidity("");
    }

    if($scope.input.newpassword2 == undefined) {
      document.getElementById("newpassword2").setCustomValidity("This field is required");
      return;
    }
    else if($scope.input.newpassword != $scope.input.newpassword2) {
      document.getElementById("newpassword2").setCustomValidity("New Password Mismatch.");
      return;
    }
    else {
      document.getElementById("newpassword2").setCustomValidity("");
    }

    server = baseserver + "changePassword";
    var res = $http({
        method: "POST",
        url: server,
        headers: {
            'Content-Type': 'application/json'
        },
        data: {
            token: token,
            oldPassword: $scope.input.oldpassword,
            newPassword: $scope.input.newpassword
        }
    })
    res.success(function(data, status, header, config) {
        console.log(data);
        if (data.resultType == 'OK') {
          $window.sessionStorage.setItem("token", data.newToken);
          $window.sessionStorage.setItem("oldpassword", $scope.input.newpassword);
          var alertPopup = $ionicPopup.alert({
                title: '<img src="img\\ic_bus_ok.png" width="100%">',
                template: 'Change Password Success.',
                okText: 'Back To Home'
            });
          alertPopup.then(function(res) {
             $state.go('app.main');
          });
        }
    });
    res.error(function(data, status, header, config) {
        var alertPopup = $ionicPopup.alert({
            title: 'Server error!',
            template: 'Please check your internet connection!',
            okText: 'OK'
        });
    });
  }

})


.controller('AccountCtrl', function($scope, $window, $http, $ionicPopup, $state){
var token = $window.sessionStorage.getItem("token");
var baseserver = $window.sessionStorage.getItem("server");

  function getAccount() {
    $scope.input = {};

    server = baseserver + "getPassengerInfo";
    var res = $http({
        method: "POST",
        url: server,
        headers: {
            'Content-Type': 'application/json'
        },
        data: {
            token: token        }
    })
    res.success(function(data, status, header, config) {
        console.log(data);
        if (data.resultType == 'OK') {
          $scope.input = data;
        }
    });
    res.error(function(data, status, header, config) {
        var alertPopup = $ionicPopup.alert({
            title: 'Server error!',
            template: 'Please check your internet connection!',
            okText: 'OK'
        });
    });
  }

  $scope.editAccount = function() {
    console.log($scope.input);
    if($scope.input.email == undefined) {
      document.getElementById("email").setCustomValidity("This field is required");
      return;
    }
    else {
      document.getElementById("email").setCustomValidity("");
    }

    if($scope.input.phoneNumber == undefined) {
      document.getElementById("phonenumber").setCustomValidity("This field is required");
      return;
    }
    else {
      document.getElementById("phonenumber").setCustomValidity("");
    }

    server = baseserver + "editInfo";
    var res = $http({
        method: "POST",
        //url: buildconfig.qrServiceUrl + "login",
        url: server,
        headers: {
            'Content-Type': 'application/json'
        },
        data: {
            token: token,
            phoneNumber: $scope.input.phoneNumber,
            email: $scope.input.email
        }
    })
    res.success(function(data, status, header, config) {
        console.log(data);
        if (data.resultType == 'OK') {
          var alertPopup = $ionicPopup.alert({
                title: '<img src="img\\ic_bus_ok.png" width="100%">',
                template: 'Edit Account Info Success.',
                okText: 'Back To Home'
            });
          alertPopup.then(function(res) {
             $state.go('app.main');
          });
        }
    });
    res.error(function(data, status, header, config) {
        var alertPopup = $ionicPopup.alert({
            title: 'Server error!',
            template: 'Please check your internet connection!',
            okText: 'OK'
        });
    });
  }

  getAccount();
})


;
