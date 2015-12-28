/*
 * main module 
 * You initialize your application here
 */

// Nodejs Middleware 
var cluster         = require('cluster');
var express         = require('express');
var app             = express();
var methodOverride  = require('method-override');
var bodyParser      = require('body-parser');
var session         = require('client-sessions');
var logger          = require('morgan');

// You can use basePath everywhere ,and do not care if current path is execute path.
GLOBAL.basePath = __dirname;

var logHelper  = require('./helpers/utils');

if(cluster.isMaster) {

    require('os').cpus().forEach(function(){
        cluster.fork();
    });
    
    cluster.on('exit', function(worker, code, signal) {
        logHelper.LOG('worker ' + worker.process.pid + ' died');
        cluster.fork();
        logHelper.LOG('Recreate a new Web Server !');
    });
    
    cluster.on('listening', function(worker, address) {  
        logHelper.LOG('A worker with #'+worker.id+' is now connected to ' + 
                    address.address + ':' + address.port);  
    }); 
    
} else {
    
    // Custom Module
    var	config          = require(GLOBAL.basePath+"/config/configuration");
    var loginHelper     = require(GLOBAL.basePath+"/helpers/loginHelper");
    
    GLOBAL.config = config;
    
    // configuration
    app.set('port', process.env.PORT || config.port);
    app.use(logger('dev'));
    app.use(methodOverride());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));
    
    app.use(session({
          cookieName: 'session',
          secret: randomString(32),
          duration: 30 * 60 * 1000,
          activeDuration: 5 * 60 * 1000,
    }));
    
    //Generate SECRET_KEY
    function randomString(len) {
        len = len || 32;
        var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'; 
        var maxPos = $chars.length;
        var pwd = '';
        for (i = 0; i < len; i++) {
            pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
        }
        return pwd;
    }
    
    app.use('/', (req, res, next) => {
        if(req.originalUrl == '/login'&&req.method == 'POST'){
            next();
        } else if(loginHelper.checkLogin(req) == true){
            next();
        } else {
            res.json({success:'false', status:401, message:'Authentication failed!'});
        }
    });
    
    app.post('/login', (req, res, next) => {
        loginHelper.doLogin(req, res, next);
    });
    
    app.get('/logout', (req, res, next) => {
        loginHelper.doLogout(req, res, next);
    });
    
    var routes = require(GLOBAL.basePath+"/controllers/restapiController");
    
    if(routes != undefined) {
        app.use('/api',routes);   
    }
    
    app.use('*', (req, res) => {
        res.status(404).send({success:'false', status:404, message:'No api found!'});
    });
    
    logHelper.LOG('restapi : starting with port :' + config.port);
    
    app.listen(config.port);
}