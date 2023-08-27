var express = require('express');
var router = express.Router();
const passport = require('passport');

router.post('/*', function(req, res, next) {
	var start = req.body.start || 0 , end = req.body.end || 20;
	let search = req.params[0];

	connection.query("CALL search_prosedur('"+search+"' , "+start+", "+end+");" , function (results, error, fields) {
		if(error){
			res.send({"status": 500, "error": error, "response": null}); 
	  	} else {
			results = results[0];
	  		res.send({"status": 200, "success": "success","Fields":fields, "response": results});
  		}
  	});
	
});

module.exports = router;
