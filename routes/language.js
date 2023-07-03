var express = require('express');
var router = express.Router();
const passport = require('passport');

router.get('/' , function(req, res, next) {
    var query;
    query = `SELECT * FROM language Where is_active = 1`

	connection.query(query, function (results, error, fields) {
		if(error){
			res.send({"status": 500, "error": error.sqlMessage, "response": null}); 
	  	}
	  	else {
            res.send({"status": 200, "success": "success", "response": results});
  		}
  	});
});

router.get('/all', passport.authenticate('admin-rule', { session: false }) , function(req, res, next) {
    var query;
    query = `SELECT * FROM language Where is_default != 1`;

	connection.query(query, function (results, error, fields) {
		if(error){
			res.send({"status": 500, "error": error.sqlMessage, "response": null}); 
	  	}
	  	else {
            res.send({"status": 200, "success": "success", "response": results});
  		}
  	});
});

module.exports = router;