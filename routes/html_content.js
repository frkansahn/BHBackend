var express = require('express');
var router = express.Router();
const request = require('request');
var cors = require('cors');

var corsOptions = {
  origin: 'https://b2b.pinartekstil.com.tr',
  optionssuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

router.post('/', function(req, res, next) {
	var url = req.body.url
	request(url, {"headers": {"Content-Type":"application/json"}} ,  function (error, response, body) {	
		res.send({"status": 200, "response": body}); 
	});
});

router.get('/zoho', cors(corsOptions) , function(req, res, next) {
	var name = req.query.name;
	var surname = req.query.surname;
	var email = req.query.email;
	var city = req.query.city;
	var country = req.query.country;
	var state = req.query.state;
	var state = req.query.state;
	var phone = req.query.phone;
	var field2 = req.query.field2;
	var field3 = req.query.field3;

	console.log(req.query);
	var optionsAuth = { 
		method: 'POST',
		url: 'https://accounts.zoho.com/oauth/v2/token',
		headers: 
		{ 
			'postman-token': 'ecbc586f-aad6-4d2d-d3c0-818690f10a50',
		    'cache-control': 'no-cache',
		    'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW' 
		},
		formData: 
		{ 
			grant_type: 'refresh_token',
		    client_id: '1000.MSOT6A7FVMDCGB8ITAR26FRN87YGMH',
		    client_secret: 'd0344ce22f6f34c67f45bcec1cbbbaad9f2e85213f',
		    redirect_uri: 'b2b.pinartekstil.com.tr',
		    refresh_token: '1000.e07b3455d078a60d259551460ed463de.53b04a11582579774ee726ddec85b37b' 
		} 
	};

	request(optionsAuth, function (error, response, body) {
	  	if (error) throw new Error(error);

	  	var token = JSON.parse(body).access_token
	  	var sendData = {
	        data: [ 
	            { 
	                Company: 'Linenya',
	                Last_Name: name,
	                First_Name: surname,
	                Email: email,
	                City: city,
	                Country: country,
	                State: state,
	                Phone: phone,
	                urun_cesitleri: field2,
	                satis_kanali: field3
	            } 
	        ],
	        trigger: [ 'approval', 'workflow', 'blueprint' ] 
	    };

	  	var options = { 
			method: 'POST',
		  	url: 'https://www.zohoapis.com/crm/v2/Leads',
		  	headers: 
		   	{ 
		   		'postman-token': 'd754c503-4c5d-b97d-6564-d43d25b18443',
		     	'cache-control': 'no-cache',
		     	'content-type': 'application/json',
		     	authorization: 'Bearer ' + token 
		    },
		  	body: sendData,
		  	json: true 
		};

		request(options, function (error1, response1, body1) {
		  if (error1) throw new Error(error1);

		  res.send({"status": 200, "response": body1});
		});
	});
});

module.exports = router;