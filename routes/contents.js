var express = require('express');
var router = express.Router();
const passport = require('passport');
const SqlString = require('sqlstring');
const { v4: uuidv4 } = require('uuid');
var publicFunction = require('./public.js');

/* GET users listing. */
router.get('/', function(req, res, next) {
	var query = 'Select c.id , cc.category_name , cc.description  , c.subject , c.description , c.short_description , c.image , c.createdAt , c.updatedAt , c.created_user_id , c.seo_link , c.seo_title , c.seo_keywords , c.seo_description , c.is_index , c.sort From `contents` as c INNER JOIN `contents_category` as cc ON c.contents_category_id = cc.id WHERE c.is_active = true;';
	connection.query(query, function (results, error, fields) {
		if(error){
			res.send({"status": 500, "error": error, "response": null}); 
	  	}
	  	else {
	  		res.send({"status": 200, "success": "success", "response": results});
  		}
  	});
});

router.get('/getContentByCode/:code', function(req, res, next) {
	let code = req.params.code;
	var query = `Select c.id , cc.category_name , c.code , cc.description as category_description  , c.subject , c.description , c.short_description , c.image, c.seo_link , c.seo_title , c.seo_keywords , c.seo_description From contents as c INNER JOIN contents_category as cc ON c.contents_category_id = cc.id WHERE c.code = ${SqlString.escape(code)}`;
	connection.query(query, function (results, error, fields) {
		if(error){
			res.send({"status": 500, "error": error, "response": null}); 
	  	}
	  	else {
			if(results)
				res.send({"status": 200, "success": "success", "response": results[0]});
			else
				res.send({"status": 200, "success": "unsuccess", "response": null});
  		}
  	});
});

router.get('/all',  passport.authenticate('admin-rule', { session: false }) , function(req, res, next) {
	var query = 'Select c.id , cc.id as category_id , cc.category_name , cc.description  , c.subject , c.description , c.short_description , c.image , c.createdAt , c.updatedAt , c.created_user_id , c.seo_link , c.seo_title , c.seo_keywords , c.seo_description , c.is_index , c.sort , c.is_active From `contents` as c INNER JOIN `contents_category` as cc ON c.contents_category_id = cc.id;';
	connection.query(query, function (results, error, fields) {
		if(error){
			res.send({"status": 500, "error": error, "response": null}); 
	  	}
	  	else {
	  		res.send({"status": 200, "success": "success", "response": results});
  		}
  	});
});

router.get('/get_most_read_notice', function(req, res, next) {
	var query = 'Select c.id , cc.category_name , cc.description  , c.subject , c.description , c.short_description , c.image , c.createdAt , c.updatedAt , c.created_user_id , c.seo_link , c.seo_title , c.seo_keywords , c.seo_description , c.is_index , c.sort , c.is_active , c.viewed From `contents` as c INNER JOIN `contents_category` as cc ON c.contents_category_id = cc.id WHERE c.is_active = true and cc.id = 6 ORDER BY c.createdAt asc LIMIT 5;';
	connection.query(query, function (results, error, fields) {
		if(error){
			res.send({"status": 500, "error": error, "response": null}); 
	  	}
	  	else {
	  		res.send({"status": 200, "success": "success", "response": results});
  		}
  	});
});

router.get('/getContentForCategoryId/:id' , function(req, res, next) {
	let id = req.params.id;
	var query = 'Select c.id , cc.category_name , cc.id as `category_id` , cc.description as category_description , c.subject,  c.description , c.short_description , c.image , c.createdAt , c.updatedAt , c.created_user_id , c.seo_link , c.seo_title , c.seo_keywords , c.seo_description , c.is_index , c.sort , c.is_active From `contents` as c INNER JOIN `contents_category` as cc ON c.contents_category_id = cc.id WHERE cc.id ='+id + ' ORDER BY c.sort';
	connection.query(query, function (results, error, fields) {
		if(error){
			res.send({"status": 500, "error": error, "response": null}); 
	  	}
	  	else {
	  		res.send({"status": 200, "success": "success", "response": results});
  		}
  	});
});

router.get('/getContentsBySeoLink/:seoLink' , function(req, res, next) {
	let seoLink = req.params.seoLink;
	var query = "Select c.id , cc.category_name , cc.id as `category_id` , cc.description  , c.subject , c.description , c.short_description , c.is_index , c.image , c.createdAt , c.updatedAt , c.created_user_id , c.seo_link , c.seo_title , c.seo_keywords , c.seo_description , c.sort , c.is_container From `contents` as c INNER JOIN `contents_category` as cc ON c.contents_category_id = cc.id WHERE c.is_active=1 and c.seo_link='"+seoLink+"'";
	connection.query(query , function (results, error, fields) {
		if(error){
			res.send({"status": 500, "error": error, "response": null}); 
	  	} else {
			if(results) {
				results = results[0];
				var queryOtherCategory = 'Select c.id , cc.category_name , cc.id as `category_id` , cc.description as category_description , c.subject,  c.description , c.short_description , c.image , c.createdAt , c.updatedAt , c.created_user_id , c.seo_link , c.seo_title , c.seo_keywords , c.seo_description , c.is_index , c.sort , c.is_active From `contents` as c INNER JOIN `contents_category` as cc ON c.contents_category_id = cc.id WHERE cc.id ='+results?.category_id + ' ORDER BY c.sort';
				connection.query(queryOtherCategory, function (resultsOtherCategory, errorOtherCategory) {
					if(errorOtherCategory){
						res.send({"status": 500, "error": errorOtherCategory, "response": null}); 
					}
					else {
						results["other_contents"] = resultsOtherCategory;
						res.send({"status": 200, "success": "success", "response": results});
					}
				});
			}
			else {
				res.send({"status": 200, "success": "unsuccess", "response": "no_content"});
			}
  		}
  	});
});

router.get('/:id' , function(req, res, next) {
	let id = req.params.id;
	var query = 'Select c.id , cc.category_name , cc.description  , c.subject , c.description , c.short_description , c.image , c.createdAt , c.updatedAt , c.created_user_id , c.seo_link , c.seo_title , c.seo_keywords , c.seo_description , c.is_index , c.sort From `contents` as c INNER JOIN `contents_category` as cc ON c.contents_category_id = cc.id WHERE c.id='+id;
	connection.query(query , function (results, error, fields) {
		if(error){
			res.send({"status": 500, "error": error, "response": null}); 
	  	} else {
	  		res.send({"status": 200, "success": "success","Fields":fields, "response": results});
  		}
  	});
});

router.get('/ForAdmin/:id', passport.authenticate('admin-rule', { session: false }) , function(req, res, next) {
	let id = req.params.id;
	var query = 'Select c.id , cc.id as category_id , cc.category_name , cc.description  , c.subject , c.description , c.short_description , c.image , c.createdAt , c.updatedAt , c.created_user_id , c.seo_link , c.seo_title , c.seo_keywords , c.seo_description , c.is_index , c.sort , c.is_active , c.is_container From `contents` as c INNER JOIN `contents_category` as cc ON c.contents_category_id = cc.id WHERE c.id='+id;
	connection.query(query , function (results, error, fields) {
		if(error){
			res.send({"status": 500, "error": error, "response": null}); 
	  	} else {
	  		res.send({"status": 200, "success": "success","Fields":fields, "response": results});
  		}
  	});
});

router.post('/controlLink' , passport.authenticate('admin-rule', { session: false }) , function(req , res , next){
	var data  = req.body;	
	var query = `Select COUNT(*) as total From contents Where id != ${SqlString.escape(data.id)} and seo_link = ${SqlString.escape(data.seo_link)}`;
	connection.query(query, function(results, error, fields){
		if(error)
		{
			res.send({ error: error, data: results, message: 'Link can not use.' });
		} 
		else
		{
			if(results[0].total == 0)
				res.send({ use: true, data: results, message: 'Link can use.'});
			else
				res.send({ use: false, data: results, message: 'Link can not use.'});
		}	
	});
});

router.post('/add' , passport.authenticate('admin-rule', { session: false }) , async function(req , res , next){
	var contents = req.body , user = await req.user;

	let blogByseoLink = await publicFunction.mysqlQuery("Select * From `blogs` Where is_deleted = 0 and seo_link = " + SqlString.escape(contents.seo_link));
	if(blogByseoLink && blogByseoLink.data.length > 0) {
		contents.seo_link = contents.seo_link + "-" + uuidv4();
	}

	let blogCategoryByseoLink = await publicFunction.mysqlQuery("Select * From `blog_category` Where is_deleted = 0 and seo_link = " + SqlString.escape(contents.seo_link));
	if(blogCategoryByseoLink && blogCategoryByseoLink.data.length > 0) {
		contents.seo_link = contents.seo_link + "-" + uuidv4();
	}

	let nameByseoLink = await publicFunction.mysqlQuery("Select * From `name` Where is_deleted = 0 and seo_link = " + SqlString.escape(contents.seo_link));
	if(nameByseoLink && nameByseoLink.data.length > 0) {
		contents.seo_link = contents.seo_link + "-" + uuidv4();
	}

	let contentByseoLink = await publicFunction.mysqlQuery("Select * From `contents` Where seo_link = " + SqlString.escape(contents.seo_link));
	if(contentByseoLink && contentByseoLink.data.length > 0) {
		contents.seo_link = contents.seo_link + "-" + uuidv4();
	}


	var query = "INSERT INTO `contents`(`contents_category_id`,`subject`,`description`,`short_description`,`image`,`created_user_id`,`seo_link`,`seo_title`,`seo_keywords`,`seo_description` , `is_index` ,`sort`,`is_active`,`is_container`) VALUES("+contents.category_id+","+SqlString.escape(contents.subject)+","+SqlString.escape(contents.description)+","+SqlString.escape(contents.short_description)+","+SqlString.escape(contents.image)+",'"+user.id+"',"+SqlString.escape(contents.seo_link)+","+SqlString.escape(contents.seo_title)+","+SqlString.escape(contents.seo_keywords)+","+SqlString.escape(contents.seo_description)+","+contents.is_index+","+contents.sort+","+contents.is_active+","+contents.is_container+")";
	connection.query(query, function(results, error, fields){
		if(error)
		{

			res.send({ error: error, data: results, message: 'Contents no added.' });
		} 
		else
		{
			res.send({ success: "success", data: results, message: 'Contents added.'});
		}	
	});
});

router.get('/delete/:id' , passport.authenticate('admin-rule', { session: false }) , function(req , res , next) {
	let id = req.params.id;
	connection.query('Delete From `contents` Where id='+ id , function(results, error , fields) {
		if(error){
			res.send({response : {"status":500 , "success": false , "error": error , "response": "Contents no delete."}});
		}
		else{
			res.send({response : {"status":200 , "success": true ,"Result":results,"Fields":fields, "response": "Contents deleted."}});
		}
	})
});

router.post('/update', passport.authenticate('admin-rule', { session: false }) , async function(req , res , next){
	var contents  = req.body, user = await req.user;

	let blogByseoLink = await publicFunction.mysqlQuery(`Select * From blogs Where is_deleted = 0 and seo_link = ${SqlString.escape(contents.seo_link)}`);
	if(blogByseoLink && blogByseoLink.data && blogByseoLink.data.length > 0) {
		contents.seo_link = contents.seo_link + "-" + uuidv4();
	}

	let blogCategoryBySeoLink = await publicFunction.mysqlQuery(`Select * From blog_category Where is_deleted = 0 and seo_link = ${SqlString.escape(contents.seo_link)}`);
	if(blogCategoryBySeoLink && blogCategoryBySeoLink.data && blogCategoryBySeoLink.data.length > 0) {
		contents.seo_link = contents.seo_link + "-" + uuidv4();
	}

	let nameBySeoLink = await publicFunction.mysqlQuery(`Select * From name Where is_deleted = 0 and seo_link = ${SqlString.escape(contents.seo_link)}`);
	if(nameBySeoLink && nameBySeoLink.data && nameBySeoLink.data.length > 0) {
		contents.seo_link = contents.seo_link + "-" + uuidv4();
	}

	let contentByseoLink = await publicFunction.mysqlQuery(`Select * From contents Where id != ${SqlString.escape(contents.id)} and  seo_link = ${SqlString.escape(contents.seo_link)}`);
	if(contentByseoLink && contentByseoLink.data.length > 0 && contentByseoLink.data[0].id != contents.id) {
		contents.seo_link = contents.seo_link + "-" + uuidv4();
	}

	var query = "Update `contents` Set contents_category_id="+SqlString.escape(contents.category_id) + ", subject="+SqlString.escape(contents.subject)+" , description="+SqlString.escape(contents.description)+" , short_description="+SqlString.escape(contents.short_description)+" , image="+SqlString.escape(contents.image)+" , updatedAt=now() , seo_link="+SqlString.escape(contents.seo_link)+" , seo_title="+SqlString.escape(contents.seo_title)+" , seo_keywords="+SqlString.escape(contents.seo_keywords)+" , seo_description="+SqlString.escape(contents.seo_description)+" , is_index="+SqlString.escape(contents.is_index)+" , sort="+SqlString.escape(contents.sort)+" , is_active="+SqlString.escape(contents.is_active)+", is_container="+SqlString.escape(contents.is_container)+" Where id=" + SqlString.escape(contents.id);
	connection.query(query , function(results, error, fields0){
		if(error){
			res.send({"status":500 , "error": error , "response": "Contents no update."});
		}
		else{
			res.send({"status":200 , "success": "success" , "Ürün" : results, "Fields": fields0, "response": "Contents updated."});
		}
	});
});

router.post('/updateStatus', passport.authenticate('admin-rule', { session: false }) , function(req , res , next){
	var contents  = req.body;
	var query = "Update `contents` Set is_active="+contents.is_active+" Where id=" + contents.id;
	connection.query(query , function(results, error, fields0){
		if(error){
			res.send({"status":500 , "error": error , "response": "Contents no update."});
		}
		else{
			res.send({"status":200 , "success": "success" , "content" : results, "Fields": fields0, "response": "Contents updated."});
		}
	});
});

router.get('/viewed/:seoLink', function(req , res , next){
	let seoLink = req.params.seoLink;
	var query = "UPDATE `contents` SET viewed = viewed+1 WHERE seo_link=" + seoLink;
	connection.query(query , function(results, error, fields0){
		if(error){
			res.send({response:{"status":500 , "error": error , "response": "Contents no update."}});
		}
		else{
			res.send({response:{"status":200 , "success": "success" , "Ürün" : results, "Fields": fields0, "response": "Contents updated."}});
		}
	});
});

router.post('/controlLink/:seo_link' , passport.authenticate('admin-rule', { session: false }) , async function(req , res , next){
	var is_available = true, seo_link  = req.params.seo_link , id = req.body.id | 0;


	let blogByseoLink = await publicFunction.mysqlQuery(`Select * From blogs Where is_deleted = 0 and seo_link = ${SqlString.escape(seo_link)}`);
	if(blogByseoLink && blogByseoLink.data && blogByseoLink.data.length > 0) {
		is_available = false;
	}

	let blogCategoryByseoLink = await publicFunction.mysqlQuery(`Select * From blog_category Where is_deleted = 0 and seo_link = ${SqlString.escape(seo_link)}`);
	if(blogCategoryByseoLink && blogCategoryByseoLink.data && blogCategoryByseoLink.data.length > 0) {
		is_available = false;
	}

	let contentByseoLink = await publicFunction.mysqlQuery(`Select * From contents Where id != ${SqlString.escape(id)} and seo_link = ${SqlString.escape(seo_link)}`);
	if(contentByseoLink && contentByseoLink.data && contentByseoLink.data.length > 0) {
		is_available = false;
	}

	if(is_available)
		res.send({status:200, use: true, message: 'Link can use.'});
	else
		res.send({status:401, use: false, message: 'Link can not use.'});
});

module.exports = router;
