var app = angular.module('blog', ['ngMaterial'], function($interpolateProvider){
    $interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');
});

app.controller('BlogCtrl', ['$scope', '$mdSidenav', function($scope, $mdSidenav) {
    $scope.toggleSidenav = function(menuId) {
        $mdSidenav(menuId).toggle();
    };
    $scope.menu = [
    {
        title: 'About Me',
        icon: 'quick_contacts_mail'
    },
    {
        title: 'Contact Me',
        icon: 'quick_contacts_mail'
    }
    ];
    $scope.socials = [
    {
        name: 'Github',
        icon: 'fa-github',
        url:'https://github.com/ethanhan2014'
    },
    {
        name: 'Linkedin',
        icon: 'fa-linkedin',
        url:'https://www.linkedin.com/in/ziyihan'
    }
    ];
}]);


//Theming
app.config(function($mdThemingProvider, $mdIconProvider) {

    $mdThemingProvider.theme('default')
        .primaryPalette('teal')
        .accentPalette('purple');
});