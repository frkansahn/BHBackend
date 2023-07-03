var express = require('express');
var router = express.Router();
const passport = require('passport');

/* GET users listing. */
router.get('/getByType/:type', function(req, res) {
	let type = req.params.type;
	var query = 'Select * From `contents_category` Where type = ' + type;
	connection.query(query, function (results, error, fields) {
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

router.get('/all', passport.authenticate('admin-rule', { session: false }) , function(req, res) {
	var query = 'Select * From contents_category';
	connection.query(query, function (results, error, fields) {
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

router.post('/add' , passport.authenticate('admin-rule', { session: false }) , function(req , res , next){
	var contents_category = req.body;
	var query = "INSERT INTO `contents_category`(`category_name`,`description`,`created_user_id`,`type`) VALUES('"+contents_category.category_name+"','"+contents_category.description+"','"+contents_category.created_user_id+"','"+contents_category.type+"')";
	connection.query(query, function(results, error, fields){
		if(error)
		{
			res.send({ error: error, data: results, message: 'Contents category no added.' });
		} 
		else
		{
			res.send({ success: "success", data: results, message: 'Contents category added.'});
		}	
	});
});

router.get('/delete/:id' , passport.authenticate('admin-rule', { session: false }) , function(req , res , next) {
	let id = req.params.id;
	connection.query('Delete From `contents_category` Where id='+ id , function(results, error , fields) {
		if(error){
			res.send({"status":500 , "error": error , "response": "Contents Category no delete."});
		}
		else{
			res.send({"status":200 , "success": "success" ,"Result":results,"Fields":fields, "response": "Contents Category deleted."});
		}
	})
});

router.post('/update/:id', passport.authenticate('admin-rule', { session: false }) , function(req , res , next){
	let id = req.params.id;
	var contents_category  = req.body;
	var query = "Update `contents_category` Set category_name='"+contents_category.category_name+"', description='"+contents_category.description+"' , updatedAt=now() , created_user_id='"+contents_category.created_user_id+"' Where id=" + id;
	connection.query(query , function(results, error, fields0){
		if(error){
			res.send({"status":500 , "error": error , "response": "Contents category no update."});
		}
		else{
			res.send({"status":200 , "success": "success" , "Ürün" : results, "Fields": fields0, "response": "Contents category updated."});
		}
	});
});

module.exports = router;
