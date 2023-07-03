var express = require('express');
var router = express.Router();
const passport = require('passport');

/* Province Start */
router.get('/getProvince', function(req, res, next) {
	var query = 'Select * From `province`';
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

router.get('/getProvinceById/:id', passport.authenticate('admin-rule', { session: false }) , function(req, res, next) {
	let id = req.params.id;
	var query = 'Select * From `province` WHERE id='+id;
	connection.query(query , function (results, error, fields) {
		if(error){
			res.send({"status": 500, "error": error, "response": null}); 
	  		//If there is error, we send the error in the error section with 500 status
	  	} else {
	  		res.send({"status": 200, "success": "success","Fields":fields, "response": results});
  			//If there is no error, all is good and response is 200OK.
  		}
  	});
});

router.post('/addProvince' , passport.authenticate('admin-rule', { session: false }) , function(req , res , next){
	var data = req.body;
	var query = "INSERT INTO `province`(`province_name`,`province_number_plate`) VALUES('"+data.province_name+"',"+data.province_number_plate+")";
	connection.query(query, function(results, error, fields){
		if(error)
		{
			res.send({ error: error, data: results, message: 'No added.' });
		} 
		else
		{
			res.send({ success: "success", data: results, message: 'Added.'});
		}	
	});
});

router.get('/deleteProvince/:id' , passport.authenticate('admin-rule', { session: false }) , function(req , res , next) {
	let id = req.params.id;
	connection.query('Delete From `province` Where id='+ id , function(results, error , fields) {
		if(error){
			res.send({response:{"status":500 , "error": error , "response": "No delete."}});
		}
		else{
			res.send({response:{"status":200 , "success": "success" ,"Result":results,"Fields":fields, "response": "Deleted."}});
		}
	})
});

router.post('/updateProivnce/:id', passport.authenticate('admin-rule', { session: false }) , function(req , res , next){
	let id = req.params.id;
	var data  = req.body;
	var query = "Update `province` Set province_name='" + data.province_name + "' Where id=" + id;
	connection.query(query , function(results, error, fields0){
		if(error){
			res.send({"status":500 , "error": error , "response": "No update."});
		}
		else{
			res.send({"status":200 , "success": "success" , "Ürün" : results, "Fields": fields0, "response": "Updated."});
		}
	});
});

/* Province End */

/* District Start */
router.get('/getDistrict', function(req, res, next) {
	var query = 'Select * From `district`';
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

router.get('/getDistrictByProvinceId/:id', function(req, res, next) {
    let id = req.params.id;
	var query = 'Select D.id as district_id , P.province_name , D.district_name , D.province_number_plate From `district` as D INNER JOIN `province` as P ON D.province_number_plate = P.province_number_plate WHERE P.province_number_plate =' + id;
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

router.get('/getDistrictById/:id', passport.authenticate('admin-rule', { session: false }) , function(req, res, next) {
	let id = req.params.id;
	var query = 'Select * From `prodistrictvince` WHERE id='+id;
	connection.query(query , function (results, error, fields) {
		if(error){
			res.send({"status": 500, "error": error, "response": null}); 
	  		//If there is error, we send the error in the error section with 500 status
	  	} else {
	  		res.send({"status": 200, "success": "success","Fields":fields, "response": results});
  			//If there is no error, all is good and response is 200OK.
  		}
  	});
});

router.post('/addDistrict' , passport.authenticate('admin-rule', { session: false }) , function(req , res , next){
	var data = req.body;
	var query = "INSERT INTO `district`(`district_name`,`province_number_plate`) VALUES('"+data.district_name+"',"+data.province_number_plate+")";
	connection.query(query, function(results, error, fields){
		if(error)
		{
			res.send({ error: error, data: results, message: 'No added.' });
		} 
		else
		{
			res.send({ success: "success", data: results, message: 'Added.'});
		}	
	});
});

router.get('/deleteDistrict/:id' , passport.authenticate('admin-rule', { session: false }) , function(req , res , next) {
	let id = req.params.id;
	connection.query('Delete From `district` Where id='+ id , function(results, error , fields) {
		if(error){
			res.send({response:{"status":500 , "error": error , "response": "No delete."}});
		}
		else{
			res.send({response:{"status":200 , "success": "success" ,"Result":results,"Fields":fields, "response": "Deleted."}});
		}
	})
});

router.post('/updateDistrict/:id', passport.authenticate('admin-rule', { session: false }) , function(req , res , next){
	let id = req.params.id;
	var data  = req.body;
	var query = "Update `district` Set district_name='" + data.district_name + "', province_number_plate="+ data.province_number_plate +"  Where id=" + id;
	connection.query(query , function(results, error, fields0){
		if(error){
			res.send({"status":500 , "error": error , "response": "No update."});
		}
		else{
			res.send({"status":200 , "success": "success" , "Ürün" : results, "Fields": fields0, "response": "Updated."});
		}
	});
});

/* District End */


/* Language Start */
router.get('/getLanguages', function(req, res, next) {
	var query = 'Select * From `languages` ORDER BY sort';
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

router.post('/addLanguage' , passport.authenticate('admin-rule', { session: false }) , function(req , res , next){
	var data = req.body;
	var query = "INSERT INTO `languages`(`name`,`sort`) VALUES('"+data.name+"',"+data.sort+")";
	connection.query(query, function(results, error, fields){
		if(error)
		{
			res.send({ error: error, data: results, message: 'No added.' });
		} 
		else
		{
			res.send({ success: "success", data: results, message: 'Added.'});
		}	
	});
});

router.get('/deleteLanguage/:id' , passport.authenticate('admin-rule', { session: false }) , function(req , res , next) {
	let id = req.params.id;
	connection.query('Delete From `languages` Where id='+ id , function(results, error , fields) {
		if(error){
			res.send({response:{"status":500 , "error": error , "response": "No delete."}});
		}
		else{
			res.send({response:{"status":200 , "success": "success" ,"Result":results,"Fields":fields, "response": "Deleted."}});
		}
	})
});

router.post('/updateLanguage/:id', passport.authenticate('admin-rule', { session: false }) , function(req , res , next){
	let id = req.params.id;
	var data  = req.body;
	var query = "Update `languages` Set name='" + data.name + "', sort="+ data.sort +"  Where id=" + id;
	connection.query(query , function(results, error, fields0){
		if(error){
			res.send({"status":500 , "error": error , "response": "No update."});
		}
		else{
			res.send({"status":200 , "success": "success" , "Ürün" : results, "Fields": fields0, "response": "Updated."});
		}
	});
});

/* Language End */

/* Universite Start */
router.get('/getUniversiteList', function(req, res, next) {
	var query = 'Select * From `universite` ORDER BY name';
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

router.post('/addUniversite' , passport.authenticate('admin-rule', { session: false }) , function(req , res , next){
	var data = req.body;
	var query = "INSERT INTO `universite`(`name`,`status`) VALUES('"+data.name+"',"+data.status+")";
	connection.query(query, function(results, error, fields){
		if(error)
		{
			res.send({ error: error, data: results, message: 'No added.' });
		} 
		else
		{
			res.send({ success: "success", data: results, message: 'Added.'});
		}	
	});
});

router.get('/deleteUniversite/:id' , passport.authenticate('admin-rule', { session: false }) , function(req , res , next) {
	let id = req.params.id;
	connection.query('Delete From `universite` Where id='+ id , function(results, error , fields) {
		if(error){
			res.send({response:{"status":500 , "error": error , "response": "No delete."}});
		}
		else{
			res.send({response:{"status":200 , "success": "success" ,"Result":results,"Fields":fields, "response": "Deleted."}});
		}
	})
});

router.post('/updateUniversite/:id', passport.authenticate('admin-rule', { session: false }) , function(req , res , next){
	let id = req.params.id;
	var data  = req.body;
	var query = "Update `universite` Set name='" + data.name + "', status="+ data.status +"  Where id=" + id;
	connection.query(query , function(results, error, fields0){
		if(error){
			res.send({"status":500 , "error": error , "response": "No update."});
		}
		else{
			res.send({"status":200 , "success": "success" , "Ürün" : results, "Fields": fields0, "response": "Updated."});
		}
	});
});

/* Universite End */

/* Fakulte Start */
router.get('/getFakulteByUniversiteId/:id', function(req, res, next) {
	let id = req.params.id;
	var query = 'Select * From `universite_fakulte` Where universite_id = '+ id +' ORDER BY name';
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

router.post('/addFakulte' , passport.authenticate('admin-rule', { session: false }) , function(req , res , next){
	var data = req.body;
	var query = "INSERT INTO `universite_fakulte`(`name`,`tip`,`universite_id`,`status`) VALUES('"+data.name+"',"+data.tip+","+data.universite_id+","+data.status+")";
	connection.query(query, function(results, error, fields){
		if(error)
		{
			res.send({ error: error, data: results, message: 'No added.' });
		} 
		else
		{
			res.send({ success: "success", data: results, message: 'Added.'});
		}	
	});
});

router.get('/deleteFakulte/:id' , passport.authenticate('admin-rule', { session: false }) , function(req , res , next) {
	let id = req.params.id;
	connection.query('Delete From `universite_fakulte` Where id='+ id , function(results, error , fields) {
		if(error){
			res.send({response:{"status":500 , "error": error , "response": "No delete."}});
		}
		else{
			res.send({response:{"status":200 , "success": "success" ,"Result":results,"Fields":fields, "response": "Deleted."}});
		}
	})
});

router.post('/updateFakulte/:id', passport.authenticate('admin-rule', { session: false }) , function(req , res , next){
	let id = req.params.id;
	var data  = req.body;
	var query = "Update `universite_fakulte` Set name='" + data.name + "', tip="+ data.tip +", universite_id="+ data.universite_id +", status="+ data.status +"  Where id=" + id;
	connection.query(query , function(results, error, fields0){
		if(error){
			res.send({"status":500 , "error": error , "response": "No update."});
		}
		else{
			res.send({"status":200 , "success": "success" , "Ürün" : results, "Fields": fields0, "response": "Updated."});
		}
	});
});

/* Fakulte End */

/* Bolum Start */
router.get('/getBolumByUniversiteIdAndFakulteId/:universite_id/:fakulte_id', function(req, res, next) {
	let universite_id = req.params.universite_id;
	let fakulte_id = req.params.fakulte_id;

	var query = 'Select * From `universite_bolum` Where universite_id = '+ universite_id +' and fakulte_id = '+ fakulte_id +' ORDER BY name';
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

router.post('/addBolum' , passport.authenticate('admin-rule', { session: false }) , function(req , res , next){
	var data = req.body;
	var query = "INSERT INTO `universite_bolum`(`name`,`fakulte_id`,`universite_id`,`status`) VALUES('"+data.name+"',"+data.fakulte_id+","+data.universite_id+","+data.status+")";
	connection.query(query, function(results, error, fields){
		if(error)
		{
			res.send({ error: error, data: results, message: 'No added.' });
		} 
		else
		{
			res.send({ success: "success", data: results, message: 'Added.'});
		}	
	});
});

router.get('/deleteBolum/:id' , passport.authenticate('admin-rule', { session: false }) , function(req , res , next) {
	let id = req.params.id;
	connection.query('Delete From `universite_bolum` Where id='+ id , function(results, error , fields) {
		if(error){
			res.send({response:{"status":500 , "error": error , "response": "No delete."}});
		}
		else{
			res.send({response:{"status":200 , "success": "success" ,"Result":results,"Fields":fields, "response": "Deleted."}});
		}
	})
});

router.post('/updateBolum/:id', passport.authenticate('admin-rule', { session: false }) , function(req , res , next){
	let id = req.params.id;
	var data  = req.body;
	var query = "Update `universite_bolum` Set name='" + data.name + "', fakulte_id="+ data.fakulte_id +", universite_id="+ data.universite_id +", status="+ data.status +"  Where id=" + id;
	connection.query(query , function(results, error, fields0){
		if(error){
			res.send({"status":500 , "error": error , "response": "No update."});
		}
		else{
			res.send({"status":200 , "success": "success" , "Ürün" : results, "Fields": fields0, "response": "Updated."});
		}
	});
});

/* Bolum End */

module.exports = router;
