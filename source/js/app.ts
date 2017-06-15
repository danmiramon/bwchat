angular.module("chatApp", ["ngRoute", "ngMaterial", "pascalprecht.translate", "angularMoment"])
.constant("EMAIL_RE", /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
.config(["$routeProvider", "$translateProvider",
    function(
        $routeProvider:angular.route.IRouteProvider,
        $translateProvider:angular.translate.ITranslateProvider
    ){

    //Routing
    $routeProvider
    .when('/', {
        templateUrl: 'views/login.html',
        resolve: {
            logged: function(RESTapi) {
                RESTapi.checkLoggedIn('/');
            }
        }
    })
    .when('/chat', {
        templateUrl: 'views/chat.html',
        resolve: {
            logged: function(RESTapi) {
                RESTapi.checkLoggedIn('/chat');
            }
        }
    })
    .otherwise({
        redirectTo: '/'
    });



    //Translations
    $translateProvider
    .useStaticFilesLoader({
        prefix:'locale/locale-',
        suffix:'.json'
    })
    .determinePreferredLanguage(function(){
        let lang:string = navigator.language.substr(0,2);
        if(lang.toLowerCase() !== 'en' || lang.toLowerCase() !== 'es'){
            lang = 'en';
        }
        return lang;
    });
}]);