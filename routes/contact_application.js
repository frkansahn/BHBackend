var express = require('express');
var router = express.Router();
const passport = require('passport');


router.get('/',passport.authenticate('admin-rule', { session: false }), function(req, res, next) {
	connection.query('Select * From `contact_application` Where is_read=0', function (results, error, fields) {
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

router.get('/getAllMessages',passport.authenticate('admin-rule', { session: false }), function(req, res, next) {
	connection.query('Select * From `contact_application` ORDER BY is_read;', function (results, error, fields) {
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

router.get('/getContactById/:id',passport.authenticate('admin-rule', { session: false }), function(req, res, next) {
	let id = req.params.id;

	connection.query('Select * From `contact_application` Where id=' + id , function (results, error, fields) {
		if(error){
			res.send({"status": 500, "error": error, "response": null}); 
	  		//If there is error, we send the error in the error section with 500 status
	  	} else {
	  		res.send({"status": 200, "success": "success","Fields":fields, "response": results});
  			//If there is no error, all is good and response is 200OK.
  		}
  	});
});

router.post('/add' , function(req , res , next){
	var contact_application = req.body;

	connection.query("Insert into `contact_application`(`name`,`email`,`subject`,`message`) Values('"+contact_application.name+"','"+contact_application.email+"','"+contact_application.subject+"','"+contact_application.message+"')", function(results, error, fields){
		if(error)
		{
			res.send({ error: error, data: results, message: 'Başvuru eklenemedi.' });
		} 
		else
		{
			res.send({ success: "success", data: results, message: 'Başvuru eklendi.'});
		}	
	});
});

router.get('/isRead', passport.authenticate('admin-rule', { session: false }) ,function(req , res , next){
	let id = req.params.id;
	var query = "UPDATE `contact_application` SET is_read = 1 WHERE id!=0";
	connection.query(query , function(results, error, fields0){
		if(error){
			res.send({response:{"status":500 , "error": error , "response": "Contacts no update."}});
		}
		else{
			res.send({response:{"status":200 , "success": "success" , "Ürün" : results, "Fields": fields0, "response": "Contacts updated."}});
		}
	});
});

module.exports = router;
