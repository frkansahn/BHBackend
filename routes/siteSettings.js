const { json } = require('body-parser');
var express = require('express');
var router = express.Router();
const passport = require('passport');
const SqlString = require('sqlstring');


router.get('/', function(req, res, next) {
	connection.query('SELECT * FROM site_settings ORDER BY createdAt desc LIMIT 1;', function (results, error, fields) {
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

router.post('/update/home_page_slider',passport.authenticate('admin-rule', { session: false }), function(req , res , next){
	var setting  = req.body;
	
	var query = "Update `site_settings` Set home_page_slider="+SqlString.escape(JSON.stringify(setting))+" ORDER BY createdAt desc LIMIT 1;";
	connection.query(query , function(results, error, fields0){
		if(error){
			res.send({"status":500 , "error": error , "response": "Anasayfa slider güncellenemedi."});
		}
		else{
			res.send({"status":200 , "success": "success" , "Ürün" : results, "Fields": fields0, "response": "Anasayfa slider başarıyla güncellendi."});
		}
	});
});

router.post('/update/home_page_slider_1',passport.authenticate('admin-rule', { session: false }), function(req , res , next){
	var setting  = req.body;
	
	var query = "Update `site_settings` Set home_page_slider_1="+SqlString.escape(JSON.stringify(setting))+" ORDER BY createdAt desc LIMIT 1;";
	connection.query(query , function(results, error, fields0){
		if(error){
			res.send({"status":500 , "error": error , "response": "Slider güncellenemedi."});
		}
		else{
			res.send({"status":200 , "success": "success" , "Ürün" : results, "Fields": fields0, "response": "Slider başarıyla güncellendi."});
		}
	});
});

router.post('/update/home_page_slider_2',passport.authenticate('admin-rule', { session: false }), function(req , res , next){
	var setting  = req.body;
	
	var query = "Update `site_settings` Set home_page_slider_2="+SqlString.escape(JSON.stringify(setting))+" ORDER BY createdAt desc LIMIT 1;";
	connection.query(query , function(results, error, fields0){
		if(error){
			res.send({"status":500 , "error": error , "response": "Slider güncellenemedi."});
		}
		else{
			res.send({"status":200 , "success": "success" , "Ürün" : results, "Fields": fields0, "response": "Slider başarıyla güncellendi."});
		}
	});
});

router.post('/update/home_page_slider_3',passport.authenticate('admin-rule', { session: false }), function(req , res , next){
	var setting  = req.body;
	
	var query = "Update `site_settings` Set home_page_slider_3="+SqlString.escape(JSON.stringify(setting))+" ORDER BY createdAt desc LIMIT 1;";
	connection.query(query , function(results, error, fields0){
		if(error){
			res.send({"status":500 , "error": error , "response": "Slider güncellenemedi."});
		}
		else{
			res.send({"status":200 , "success": "success" , "Ürün" : results, "Fields": fields0, "response": "Slider başarıyla güncellendi."});
		}
	});
});

router.post('/update/all',passport.authenticate('admin-rule', { session: false }), function(req , res , next){
	var setting  = req.body;

	var query = "INSERT INTO `site_settings`(`logo`,`social_media`,`contact`,`maps`,`footer_menu`,`additional_field_1`,`additional_field_2`,`additional_field_3`,`additional_field_4`,`additional_field_5`,`site_loaded_html`,`home_page_slider`,`home_page_slider_1`,`home_page_slider_2`,`home_page_slider_3`) Values(" + SqlString.escape(setting.logo) + ","+SqlString.escape(JSON.stringify(setting.social_media))+","+SqlString.escape(JSON.stringify(setting.contact))+","+SqlString.escape(setting.maps) + ","+SqlString.escape(JSON.stringify(setting.footer_menu))+ ","+SqlString.escape(JSON.stringify(setting.additional_field_1))+","+SqlString.escape(JSON.stringify(setting.additional_field_2)) +","+SqlString.escape(JSON.stringify(setting.additional_field_3))+","+SqlString.escape(JSON.stringify(setting.additional_field_4)) +","+ SqlString.escape(JSON.stringify(setting.additional_field_5)) +","+ SqlString.escape(JSON.stringify(setting.site_loaded_html)) +","+ SqlString.escape(JSON.stringify(setting.home_page_slider)) +","+ SqlString.escape(JSON.stringify(setting.home_page_slider_1)) +","+ SqlString.escape(JSON.stringify(setting.home_page_slider_2)) +","+ SqlString.escape(JSON.stringify(setting.home_page_slider_3)) +")";
	connection.query(query , function(results, error, fields0){
		if(error){
			res.send({"status":500 , "error": error , "response": "Ayarlar güncellenemedi."});
		}
		else{
			res.send({"status":200 , "success": "success" , "Ürün" : results, "Fields": fields0, "response": "Ayarlar başarıyla güncellendi."});
		}
	});
});



module.exports = router;
