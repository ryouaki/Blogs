/*
 * utils module 
 * Common function or other helpful function 
 */

var config = require(GLOBAL.basePath+'/config/configuration');

var LOG_FLG = config.log_mode;

function logDataTime() {
	var date = new Date();
	var month = date.getMonth() + 1;
	var hour = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
	var minute = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
	var second = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
	return date.getFullYear()+"-"+month+"-"+date.getDate()+"-"+hour+"-"+minute+"-"+second+"-"+date.getMilliseconds();
}

exports.LOG = function(msg) {
	if(LOG_FLG == "ALL"||LOG_FLG == "LOG") {
        console.log(logDataTime()+" #"+process.pid+" LOG: " + msg);
    }
};

exports.ERR = function(msg) {
	if(LOG_FLG == "ALL"||LOG_FLG == "ERR") {
        console.log(logDataTime()+" #"+process.pid+" ERR: " + msg);
    }
};