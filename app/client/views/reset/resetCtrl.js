angular.module('reg')
  .controller('ResetCtrl', [
    '$scope',
    '$stateParams',
    'currentUser',
    '$state',
    'AuthService',
    function($scope, $stateParams, currentUser, $state, AuthService){
      var token = $stateParams.token;

      $scope.loading = true;

      $scope.changePassword = function(){
        var password = $scope.password;
        var confirm = $scope.confirm;

        if (password !== confirm){
          $scope.error = "Passwords don't match!";
          $scope.confirm = "";
          return;
        }

        if (currentUser && currentUser.data.needsPassChange) {
          AuthService.newPassword(
            $scope.password,
            function (message) {
              sweetAlert({
                title: "Neato!",
                text: "Your password has been changed!",
                type: "success",
                confirmButtonColor: "#e76482"
              }, function () {
                $state.go('login');
              });
            },
            function (data) {
              $scope.error = data.message;
              $scope.loading = false;
            });
        }
        else {
          AuthService.resetPassword(
            token,
            $scope.password,
            function (message) {
              sweetAlert({
                title: "Neato!",
                text: "Your password has been changed!",
                type: "success",
                confirmButtonColor: "#e76482"
              }, function () {
                $state.go('login');
              });
            },
            function (data) {
              $scope.error = data.message;
              $scope.loading = false;
            });
        }

      };

    }]);