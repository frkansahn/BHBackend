var express = require('express');
var router = express.Router();
const passport = require('passport');

router.get('/*', function(req, res, next) {

	let search = req.params[0];

	connection.query("CALL search_prosedur('"+search+"');" , function (results, error, fields) {
		if(error){
			res.send({"status": 500, "error": error, "response": null}); 
	  	} else {
			results = results[0];
			if(results) {
				results = results.map(item => {
					try {
						if(item.image) {
							item.image = JSON.parse(item.image);
						}
					}
					catch(err){}

					return item;
				})
			}
	  		res.send({"status": 200, "success": "success","Fields":fields, "response": results});
  		}
  	});
	
});

module.exports = router;
