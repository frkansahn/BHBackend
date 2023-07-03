var express = require('express');
var router = express.Router();
const passport = require('passport');
const axios = require('axios');

router.get('/getAllCity', function (req, res, next) {
	var query = `SELECT * FROM city;`

	connection.query(query, function (results, error, fields) {
		if (error) {
			res.send({ "status": 500, "error": error.sqlMessage, "response": null });
		}
		else {
			res.send({ "status": 200, "success": "success", "response": results });
		}
	});
});

router.get('/getWeatherCity/:id', function (req, res, next) {
	var query = `SELECT * FROM city Where id = ${req.params.id};`

	connection.query(query, function (results, error, fields) {
		if (error) {
			res.send({ "status": 500, "error": error.sqlMessage, "response": null });
		}
		else {
			if(results && results.length > 0) {
				results = results[0];
				let url =  'https://api.open-meteo.com/v1/forecast?latitude='+results.latitude+'&longitude='+results.longitude+'&current_weather=true';
				let config = {
					method: 'GET',
					url: url,
					headers: {
						'Content-Type': 'application/json'
					}
				};
	
				axios.request(config)
				.then((response) => {
					res.send({ "status": 200, "success": "success", "response": response.data });
					return true;
				})
				.catch((error) => {
					res.send({ "status": 200, "success": "unsuccess", "response": null });
					return false;
				});
			}
			else {
				res.send({ "status": 200, "success": "unsuccess", "response": null });
				return false;
			}
		}
	});
});

module.exports = router;