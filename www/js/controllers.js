function errorAlert(msg,duration)
{
  var el = document.createElement("div");
  el.setAttribute("class", "msg");
  el.setAttribute("style", "padding-left: 20px; padding-right: 20px; padding-top: 10px; padding-bottom: 10px");
  el.innerHTML = "Unable to connect server";
  setTimeout(function(){
    el.parentNode.removeChild(el);
  },3900);
  //var network = document.getElementsByTagName("ion-content");
  var network = document.getElementsByName("forMsg");
  network[network.length-1].appendChild(el);
}  

angular.module('starter.controllers', ['angular-jwt'])

.controller('LoginCtrl', function($scope, $ionicPopup, $window, $state, buildconfig, QRService, $ionicLoading) {
  $scope.input = {};
  $scope.input.address = buildconfig.qrServiceUrl;
  $scope.input.username = "marco161763";
  $scope.input.password = "asdfg";

  $scope.login = function() {
    $window.sessionStorage.setItem("server", $scope.input.address);
    var req = {}
    req.service = "login";
    req.data = {
            username: $scope.input.username,
            password: $scope.input.password,
            lastTicketSerial: '2100059'
        };
    $ionicLoading.show({
      template: '<ion-spinner></ion-spinner>'
    })
    QRService.send(req).then(function(data) {
      $ionicLoading.hide();
        if (data.resultType == 'OK') {
            $window.sessionStorage.setItem("token", data.token);
            $window.sessionStorage.setItem("fullName", data.accountInfo.fullName);
            //$window.sessionStorage.setItem("gender", data.accountInfo.gender);
            $window.sessionStorage.setItem("balance", data.accountInfo.balance);
            //$window.sessionStorage.setItem("freezedAmount", data.accountInfo.freezedAmount);
            //$window.sessionStorage.setItem("tickets", data.accountInfo.tickets);
            //$window.sessionStorage.setItem("server", $scope.input.address);
            $window.sessionStorage.setItem("oldpassword", $scope.input.password);
            $state.go('app.main');                
        } else $ionicPopup.alert({
            title: 'Login failed!',
            template: 'Please check your credentials!',
            okText: 'OK'
        });
    }, function(error) {
      $ionicLoading.hide();
      errorAlert("Can't connect to server",4000);
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


.controller('MainCtrl', function($scope, $window, $state, QRService, $ionicLoading, $interval) {
  var token = $window.sessionStorage.getItem("token");
  $scope.balance = $window.sessionStorage.getItem("balance");
  var AvailableTickets = false;
  var TicketsStatus = false;
  var TransactionsHistory = false;

  function getAvailableTickets() {
    var req = {}
    req.service = "getAvailableTickets";
    req.data = {
            token: token
        };
    QRService.send(req).then(function(data) {
        console.log(data);
        if (data.resultType == 'OK') {
          $window.localStorage.setItem("avaibleTickets", JSON.stringify(data.avaibleTickets));
          AvailableTickets = true;
        }
    }, function(data, status, header, config) {
        errorAlert("Can't connect to server",4000);
    });    
  }

  $scope.ticket = function() {
    if(AvailableTickets) {
      $state.go('app.ticket');
    } else {
      getAvailableTickets();
    }
  }

  function checkTicketsStatus() {
    var req = {}
    req.service = "checkTicketsStatus";
    req.data = {
            token: token,
            lastTicketSerial: 0,
            ticketSerials: [0]
        };
    QRService.send(req).then(function(data) {
        console.log(data);
        if (data.resultType == 'OK') {
            $window.localStorage.setItem("ticketsStatus", JSON.stringify(data.accountInfo.tickets));
            $window.sessionStorage.setItem("balance", data.accountInfo.balance);
            TicketsStatus = true;
            $scope.tickets = [];
            angular.forEach(data.accountInfo.tickets, function(ticket) {
                if (ticket.status == 'UNUSED') {
                  $scope.tickets.push(ticket);
                  QRCode.toDataURL(ticket.ticketContent, {}, function (err, url) {
                    if (err) throw err
                    ticket.qrUrl = url;
                  })
                }
            });
        }
    }, function(data, status, header, config) {
        errorAlert("Can't connect to server",4000);
    });
  }

  $scope.history = function() {
    if(TicketsStatus) {
      $state.go('app.history');
    } else {
      checkTicketsStatus();
    }
  }

  function getTransactionsHistory() {
    var req = {}
    req.service = "getTransactionsHistory";
    req.data = {
            token: token
        };
    QRService.send(req).then(function(data) {
        console.log(data);
        if (data.resultType == 'OK') {
            $window.localStorage.setItem("transactionsHistory", JSON.stringify(data.transactions));
            TransactionsHistory = true;
        }
    }, function(data, status, header, config) {
        errorAlert("Can't connect to server",4000);
    });
  }

  $scope.transaction = function() {
    if(TransactionsHistory) {
      $state.go('app.transaction');
    } else {
      getTransactionsHistory();
    }
  }

  $scope.qrcode = function() {
    $state.go('app.qrcode');
  }

  getAvailableTickets();
  getTransactionsHistory();
  checkTicketsStatus();

  $interval(function() {
    checkTicketsStatus();
  }, 10000)

})


.controller('TicketCtrl', function($scope, $window, $ionicPopup, $state, QRService, $ionicLoading) {
  var token = $window.sessionStorage.getItem("token");
  var localTickets = localStorage.getItem("avaibleTickets");
  $scope.avaibleTickets = JSON.parse(localTickets);

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
          var req = {}
          req.service = "buyTicket";
          req.data = {
                      token: token,
                      tripCode: ticket.tripCode,
                      ticketType: ticket.ticketCode,
                      lastTicketSerial: 0
              };
          $ionicLoading.show({
            template: '<ion-spinner></ion-spinner>',
            noBackdrop: true,
            hideOnStateChange: true
          })
          QRService.send(req).then(function(data) {
            $ionicLoading.hide();
            console.log(data);
            if (data.resultType == 'OK') {

                if(data.ticketResultStatus == "OK") {
                  $window.localStorage.setItem("ticketsStatus", JSON.stringify(data.accountInfo.tickets));
                  var alertPopup = $ionicPopup.alert({
                        title: '<img src="img\\ic_bus_ok.png" width="100%">',
                        template: 'OK',
                        okText: 'View Ticket'
                    });
                }

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
        }, function(data, status, header, config) {
          $ionicLoading.hide();
          errorAlert("Can't connect to server",4000);
        });
     } else {
        console.log('Not sure!');
     }
    });

  }

})


.controller('HistoryCtrl', function($scope, $window, $state) {
  var ticketsStatus = localStorage.getItem("ticketsStatus");
  $scope.TicketsHistory = JSON.parse(ticketsStatus);

  $scope.detail = function() {
    $window.sessionStorage.setItem("viewStatus", 1);  //from Ticket History
    $state.go('app.viewticket');
  }
})


.controller('TransactionCtrl', function($scope, $window) {
  var transactionsHistory = localStorage.getItem("transactionsHistory");
  $scope.TransactionsHistory = JSON.parse(transactionsHistory);
})


.controller('QRCodeCtrl', function($scope, $window, jwtHelper) {
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


.controller('ViewTicketCtrl', function($scope, $window, $state) {

  $scope.goMain = function() {
    $state.go('app.main');
  }

  function getMyTickets() {
    $scope.viewStatus = $window.sessionStorage.getItem("viewStatus");
    $scope.ticketsStatus = localStorage.getItem("ticketsStatus");
    var localTickets = JSON.parse($scope.ticketsStatus);
    $scope.tickets = [];

    if($window.sessionStorage.getItem("viewStatus") == 0) {
      console.log('view active ticket');
      angular.forEach(localTickets, function(ticket) {
        if(ticket.status == "UNUSED") {
          QRCode.toDataURL(ticket.ticketContent, {}, function (err, url) {
            if (err) throw err
            ticket.qrUrl = url;
          })
          $scope.tickets.push(ticket);
        }
      });
    }
    else if($window.sessionStorage.getItem("viewStatus") == 1) {
      console.log('view ticket history');
      angular.forEach(localTickets, function(ticket) {
          QRCode.toDataURL(ticket.ticketContent, {}, function (err, url) {
            if (err) throw err
            ticket.qrUrl = url;
          })
      });
      $scope.tickets = localTickets;
    }
  }

  $scope.$on('$ionicView.beforeEnter', function(e) {
    getMyTickets();
  })

  getMyTickets();
})


.controller('PasswordCtrl', function($scope, $window, $ionicPopup, $state, QRService, $ionicLoading){
  var token = $window.sessionStorage.getItem("token");
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

    var req = {}
    req.service = "changePassword";
    req.data = {
            token: token,
            oldPassword: $scope.input.oldpassword,
            newPassword: $scope.input.newpassword
        };
    $ionicLoading.show({
      template: '<ion-spinner></ion-spinner>'
    })
    QRService.send(req).then(function(data) {
      $ionicLoading.hide();
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
    }, function(data, status, header, config) {
      $ionicLoading.hide();
      errorAlert("Can't connect to server",4000);
    });
  }

})


.controller('AccountCtrl', function($scope, $window, $ionicPopup, $state, QRService, $ionicLoading){
  var token = $window.sessionStorage.getItem("token");

  function getAccount() {
    $scope.input = {};

    var req = {}
    req.service = "getPassengerInfo";
    req.data = {
            token: token
        };
    $ionicLoading.show({
      template: '<ion-spinner></ion-spinner>'
    })
    QRService.send(req).then(function(data) {
      $ionicLoading.hide();
        console.log(data);
        if (data.resultType == 'OK') {
          $scope.input = data;
        }
    }, function(data, status, header, config) {
      $ionicLoading.hide();
      errorAlert("Can't connect to server",4000);
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

    var req = {}
    req.service = "editInfo";
    req.data = {
            token: token,
            phoneNumber: $scope.input.phoneNumber,
            email: $scope.input.email
        };
    $ionicLoading.show({
      template: '<ion-spinner></ion-spinner>'
    })
    QRService.send(req).then(function(data) {
      $ionicLoading.hide();
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
    }, function(data, status, header, config) {
      $ionicLoading.hide();
      errorAlert("Can't connect to server",4000);
    });
  }

  getAccount();
})


;
