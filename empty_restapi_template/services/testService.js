/*
 * Service module 
 * You can do some logic like Update/Select/Delete/Insert 
 */
var http            = require('http');
var logHelper       = require(GLOBAL.basePath+'/helpers/utils');

/*
 * name  : service module
 * param : id = email(e.x)
 *        res = nodejs request object
 * return: {
 *              success : false = failed, true = OK
 *              status  : http.status
 *              message : additional message
 *              data    : result object
 *         }
 */

module.exports.testService = {
    testapi : function(param, res) {
        if(param)
            res.json({success:'true', status:200, message:'', data:'success!'});
        else
            res.json({success:'false', status:500, message:'Error happened!'});
    }
}