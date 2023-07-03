var express = require('express');
var router = express.Router();
const passport = require('passport');
const SqlString = require('sqlstring');


router.get('/', function(req, res, next) {
	connection.query('SELECT category,category_code,sub_category,sub_category_code,type,name,description,code,display,value FROM settings', function (results, error, fields) {
		if(error){
			res.send({"status": 500, "error": error, "response": null}); 
	  		//If there is error, we send the error in the error section with 500 status
	  	}
	  	else {
	  		res.send({"status": 200, "success": "success", "response": results});
  			//If there is no error, all is good and response is 200OK.
  		}
  	});
});

module.exports = router;
