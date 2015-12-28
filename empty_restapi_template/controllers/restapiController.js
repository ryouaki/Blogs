/*
 * resstapiController module 
 * controller 
 */

var apiRoutes       = require('express')();
var config          = require(GLOBAL.basePath+'/config/configuration');
var service         = require(GLOBAL.basePath+'/services/testService').testService;

var routes = [
    { method:'GET'    , path:'/testapi'         , apiFunc:'testapi' }
    // you can add your own api here
    // { method:'GET'    , path:'/testapi2'         , apiFunc:'testapi2' }
];

routes.forEach(function(item){
    if(service[item.apiFunc])
        apiRoutes[item.method.toLowerCase()](item.path, service[item.apiFunc]);
});

module.exports = apiRoutes;