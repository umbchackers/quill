angular.module('reg')
  .controller('AdminUsersCtrl',[
    '$scope',
    '$state',
    '$stateParams',
    'UserService',
    function($scope, $state, $stateParams, UserService){

      $scope.sortType = 'name'; // set the default sort type
      $scope.sortReverse  = false;

      $scope.users = [];
      $scope.numPages = 0;
      $scope.pageSize = 50;
      $scope.currentPage = 0;
      $scope.pageIndexes = [];
      $scope.start = 0;

      UserService
        .getAll()
        .success(function(data) {
          $scope.users = data;

          getNumPages();
        });

      // Whenever pageSize changes, update the paginator
     // $scope.$watch('pageSize', getNumPages);
      $scope.$watch('currentPage', getNumPages);

      $scope.$watch('queryText', function(queryText) {
        // If it is just loaded or no search param
        if (queryText == undefined || queryText == "") {
          UserService
          .getAll()
          .success(function(data) {
            $scope.users = data;

            getNumPages();
          });
        }
        // If there is a search param
        else {
          // TODO Create getAll with Query param
          UserService
          .getPage($scope.currentPage, $scope.pageSize, queryText)
          .success(function(data) {
            $scope.users = data.users;

            getNumPages();
          });
        }
      });

      // Get the number of pages to be shown in the paginator
      function getNumPages() {
        $scope.numPages = Math.ceil($scope.users.length / $scope.pageSize);

        // TODO Make this skip numbers and show "..." if there are too many numbers
        // TODO Add ng-disabled="pageIndex == '...'" on the paginator
        $scope.pageIndexes = [];

        if ($scope.numPages > 5) {
          if ($scope.currentPage > 1) {
            $scope.pageIndexes.push($scope.currentPage);

            if ($scope.currentPage + 2 <= $scope.numPages) {
              $scope.pageIndexes.push($scope.currentPage + 1); 
              $scope.pageIndexes.push($scope.currentPage + 2);
            }
          }
          else {
            $scope.pageIndexes.push(0);
            $scope.pageIndexes.push(1);
            $scope.pageIndexes.push(2);
          }
          $scope.pageIndexes.push("...");
           
          $scope.pageIndexes.push($scope.numPages - 2);
          $scope.pageIndexes.push($scope.numPages - 1);
        }
        else {
          for (var i = 0; i < $scope.numPages; i++) 
            $scope.pageIndexes.push(i);
        }
      }

      // Change the page number and shift the Angular ng-repeat filter
      $scope.goToPage = function(page) {
        $scope.currentPage = page;

        $scope.start = $scope.currentPage * $scope.pageSize;
      };

      // Semantic-UI moves modal content into a dimmer at the top level.
      // While this is usually nice, it means that with our routing will generate
      // multiple modals if you change state. Kill the top level dimmer node on initial load
      // to prevent this.
      $('.ui.dimmer').remove();

      // Populate the size of the modal for when it appears, with an arbitrary user.
      $scope.selectedUser = {};
      $scope.selectedUser.sections = generateSections({status: '', confirmation: {
        dietaryRestrictions: []
      }, profile: ''});

      $scope.goUser = function($event, user){
        $event.stopPropagation();

        $('.long.user.modal').modal('hide');

        $state.go('app.admin.user', {
          id: user._id
        });
      };

      $scope.toggleCheckIn = function($event, user, index) {
        $event.stopPropagation();

        if (!user.status.checkedIn){
          swal({
            title: "Whoa, wait a minute!",
            text: "You are about to check in " + user.profile.name + "!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, check them in.",
            closeOnConfirm: false
            },
            function(){
              UserService
                .checkIn(user._id)
                .success(function(user){
                  $scope.users[index] = user;
                  swal("Accepted", user.profile.name + ' has been checked in.', "success");
                });
            }
          );
        } else {
          UserService
            .checkOut(user._id)
            .success(function(user){
              $scope.users[index] = user;
              swal("Accepted", user.profile.name + ' has been checked out.', "success");
            });
        }
      };

      $scope.acceptUser = function($event, user, index) {
        $event.stopPropagation();

        swal({
          title: "Whoa, wait a minute!",
          text: "You are about to accept " + user.profile.name + "!",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Yes, accept them.",
          closeOnConfirm: false
          }, function(){

            swal({
              title: "Are you sure?",
              text: "Your account will be logged as having accepted this user. " +
                "Remember, this power is a privilege.",
              type: "warning",
              showCancelButton: true,
              confirmButtonColor: "#DD6B55",
              confirmButtonText: "Yes, accept this user.",
              closeOnConfirm: false
              }, function(){

                UserService
                  .admitUser(user._id)
                  .success(function(user){
                    $scope.users[index] = user;
                    swal("Accepted", user.profile.name + ' has been admitted.', "success");
                  });

              });

          });

      };

      function formatTime(time){
        if (time) {
          return moment(time).format('MMMM Do YYYY, h:mm:ss a');
        }
      }

      $scope.rowClass = function(user) {
        if (user.status == undefined)
          return '';
        if (user.admin)
          return 'admin';
        if (user.status.confirmed) 
          return 'positive';
        if (user.status.admitted && !user.status.confirmed) 
          return 'warning';
      };

      function selectUser(user){
        $scope.selectedUser = user;
        $scope.selectedUser.sections = generateSections(user);
        $('.long.user.modal').modal('show');
      }

      function generateSections(user){
        return [
          {
            name: 'Basic Info',
            fields: [
              {
                name: 'Created On',
                value: formatTime(user.timestamp)
              },{
                name: 'Last Updated',
                value: formatTime(user.lastUpdated)
              },{
                name: 'Confirm By',
                value: formatTime(user.status.confirmBy) || 'N/A'
              },{
                name: 'Checked In',
                value: formatTime(user.status.checkInTime) || 'N/A'
              },{
                name: 'Email',
                value: user.email
              },
              // {
              //   name: 'Team',
              //   value: user.teamCode || 'None'
              // }
            ]
          },{
            name: 'Profile',
            fields: [
              {
                name: 'Name',
                value: user.profile.name || "N/A"
              },{
                name: 'Phone Number',
                value: user.profile.phoneNumber || "N/A"
              },{
                name: 'Birthdate',
                value: formatTime(user.profile.birthdate) || "N/A"
              },{
                name: 'Gender',
                value: user.profile.gender || "N/A"
              },{
                name: 'Race / Ethnicity',
                value: user.profile.race || "N/A"
              },{
                name: 'School',
                value: user.profile.school || "N/A"
              },{
                name: 'Graduation Year',
                value: user.profile.graduationYear || "N/A"
              },{
                name: 'Description',
                value: user.profile.description || "N/A"
              },{
                name: 'Essay',
                value: user.profile.essay || "N/A"
              },{
                name: 'What is your favorite city in the world?',
                value: user.profile.question1 || "N/A"
              },{
                name: "Who's the best school in the universe?",
                value: user.profile.question2 || "N/A"
              },{
                name: 'How are you doing today?',
                value: user.profile.question3 || "N/A"
              }
            ]
          },{
            name: 'Confirmation',
            fields: [
              {
                name: 'Dietary Restrictions',
                value: user.confirmation.dietaryRestrictions.join(', ') || "N/A"
              },{
                name: 'Shirt Size',
                value: user.confirmation.shirtSize || "N/A"
              },{
                name: 'Website',
                value: user.confirmation.website || "N/A"
              },{
                name: 'Needs Hardware',
                value: user.confirmation.wantsHardware,
                type: 'boolean'
              },{
                name: 'Hardware Requested',
                value: user.confirmation.hardware || "N/A"
              },{
                name: 'Interested in Volunteering',
                value: user.confirmation.volunteer,
                type: 'boolean'
              }
            ]
          }
          // ,{
          //   name: 'Travel',
          //   fields: [
          //     {
          //       name: 'Needs Reimbursement',
          //       value: user.confirmation.needsReimbursement,
          //       type: 'boolean'
          //     },{
          //       name: 'Received Reimbursement',
          //       value: user.confirmation.needsReimbursement && user.status.reimbursementGiven
          //     },{
          //       name: 'Address',
          //       value: user.confirmation.address ? [
          //         user.confirmation.address.line1,
          //         user.confirmation.address.line2,
          //         user.confirmation.address.city,
          //         ',',
          //         user.confirmation.address.state,
          //         user.confirmation.address.zip,
          //         ',',
          //         user.confirmation.address.country,
          //       ].join(' ') : ''
          //     },{
          //       name: 'Additional Notes',
          //       value: user.confirmation.notes
          //     }
          //   ]
          // }
        ];
      }

      $scope.selectUser = selectUser;

    }]);
