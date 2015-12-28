/*
 * helper module 
 * Example module for login
 */

var sprintf         = require('util').format;
var	config          = require(GLOBAL.basePath+"/config/configuration");


module.exports = {
    checkLogin : function(req) {
        return !(req.session.isLogin==undefined||req.session.isLogin==false);
    },
    
    doLogin : function(req, res, next) {
        var username = req.body.username;
        var password = req.body.password;
        if(username == 'admin' && password == 'admin') {
            req.session.isLogin = true;
            res.json({success:'true', status:200,message:'login successfully!'});
        } else {
            res.json({success:'false', status:400,message:'login failed! Wrong password or username!'});
        }
    },
    
    doLogout : function(req, res, next) {
        req.session.isLogin = false;
        res.json({success:'true', status:200,message:'logout successfully!'});
    }
}