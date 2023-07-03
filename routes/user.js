var express = require('express');
var router = express.Router();
const passport = require('passport');


/* GET users listing. */
router.get('/',passport.authenticate('admin-rule', { session: false }), function(req, res, next) {
	connection.query('SELECT * from `users`', function (results, error, fields) {
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

router.get('/:id',passport.authenticate('admin-rule', { session: false }), function(req, res, next) {
	let id = req.params.id;

	connection.query('SELECT * from `users` Where id=' + id , function (results, error, fields) {
		if(error){
			res.send({"status": 500, "error": error, "response": null}); 
	  		//If there is error, we send the error in the error section with 500 status
	  	} else {
	  		res.send({"status": 200, "success": "success","Fields":fields, "response": results});
  			//If there is no error, all is good and response is 200OK.
  		}
  	});
});

router.post('/add',passport.authenticate('admin-rule', { session: false }) , function(req , res , next){
	var user = req.body;

	connection.query("Insert into `users`(`name`,`surname`,`username`,`password`,`phone`,`email`) Values('"+user.name+"','"+user.surname+"','"+user.username+"','"+user.password+"','"+user.phone+"','"+user.email+"')", function(results, error, fields){
		if(error)
		{
			res.send({ error: error, data: results, message: 'Kullanıcı eklenemedi.' });
		} 
		else
		{
			res.send({ success: "success", data: results, message: 'Kullanıcı eklendi.'});
		}	
	});
});

router.get('/delete/:id',passport.authenticate('admin-rule', { session: false }) , function(req , res , next) {
	let id = req.params.id;
	connection.query('Delete From `users` Where id='+ id , function(results, error , fields) {
		if(error){
			res.send({"status":500 , "error": error , "response": "Kullanıcı silinemedi."});
		}
		else{
			res.send({"status":200 , "success": "success" ,"Result":results,"Fields":fields, "response": "Kullanıcı  başarıya silindi."});
		}
	})
});

router.post('/update/:id', passport.authenticate('admin-rule', { session: false }) , function(req , res , next){
	let id = req.params.id;
	var user  = req.body;

	var query = "Update `users` Set name='"+user.name + "', surname='"+user.surname+"', username='"+user.username+"', password='"+user.password+"', phone='"+user.phone+"', email='"+user.email+"'  Where id=" + id;
	connection.query(query , function(results, error, fields0){
		if(error){
			res.send({"status":500 , "error": error , "response": "Kullanıcı gümcellenemedi."});
		}
		else{
			res.send({"status":200 , "success": "success" , "Ürün" : results, "Fields": fields0, "response": "Kullanıcı başarıya güncellendi."});
		}
	});
});

module.exports = router;
