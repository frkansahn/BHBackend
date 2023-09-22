var express = require('express');
var router = express.Router();
const passport = require('passport');
const CryptoJS = require("crypto-js");
const SqlString = require('sqlstring');
const { v4: uuidv4 } = require('uuid');
var publicFunction = require('./public.js');

router.get('/', passport.authenticate('admin-rule', { session: false }) , function(req, res, next) {
    var query = `SELECT * FROM blog_category Where is_deleted = 0 ORDER BY sort`;

	connection.query(query, function (results, error, fields) {
		if(error){
			res.send({"status": 500, "error": error.sqlMessage, "response": null}); 
	  	}
	  	else {            
	  		res.send({"status": 200, "success": "success", "response": results});
  		}
  	});
});

router.get('/getBlogCategoriesForAdmin', passport.authenticate('admin-rule', { session: false }) , function(req, res, next) {
    var query = `SELECT b_c.id, 
			b_c.category_name,
			b_c.description, 
			b_c.parent_id,
			b_c.sort,
			b_c.image,
			b_c.is_active,
			b_c.is_menu,
			b_c.is_baby_dictionary,
			b_c.type,
			b_c.seo_link as url,
			b_c.seo_title,
			b_c.seo_keywords,
			b_c.seo_description
        FROM blog_category as b_c 
        WHERE b_c.is_deleted = 0 ORDER BY b_c.sort`;

	connection.query(query, function (results, error, fields) {
		if(error){
			res.send({"status": 500, "error": error.sqlMessage, "response": null}); 
	  	}
	  	else {            
	  		res.send({"status": 200, "success": "success", "response": results});
  		}
  	});
});

router.get('/getBlogCategory' , function(req, res, next) {
    var query = `SELECT b_c.id, 
		b_c.category_name,
		b_c.description, 
		b_c.parent_id,
		b_c.sort,
		b_c.image,
		b_c.is_active,
		b_c.type,
		b_c.seo_link as url,
		b_c.seo_title,
		b_c.seo_keywords,
		b_c.seo_description
	FROM blog_category as b_c 
	WHERE b_c.is_deleted = 0 and b_c.is_active = 1 and b_c.is_menu = 1 ORDER BY b_c.sort`;

	connection.query(query, async function (results, error, fields) {
		if(error){
			res.send({"status": 500, "error": error.sqlMessage, "response": null}); 
	  	}
	  	else {
            if(results && results.length > 0) {
                var map = {}, node, roots = [], i;
            
                for (i = 0; i < results.length; i += 1) {
                    map[results[i].id] = i;
                    results[i]["children"] = [];
                }
                
                for (i = 0; i < results.length; i += 1) {
                    node = results[i];
					if (node.parent_id !== null) {
						results[map[node.parent_id]]?.children?.push(node);
					} 
					else {
						roots.push(node);
					}
                }
            }
            
	  		res.send({"status": 200, "success": "success", "response": roots});
  		}
  	});
});

router.get('/getBabyDistionary' , function(req, res, next) {
    var query = `SELECT b_c.id, 
		b_c.category_name,
		b_c.description, 
		b_c.parent_id,
		b_c.sort,
		b_c.image,
		b_c.is_active,
		b_c.type,
		b_c.seo_link as url,
		b_c.seo_title,
		b_c.seo_keywords,
		b_c.seo_description,
		b_c.baby_dictionary_title,
		b_c.baby_dictionary_description
	FROM blog_category as b_c 
	WHERE b_c.is_deleted = 0 and b_c.is_active = 1 and b_c.parent_id is not null and b_c.is_baby_dictionary = 1`;

	connection.query(query, async function (results, error, fields) {
		if(error){
			res.send({"status": 500, "error": error.sqlMessage, "response": null}); 
	  	}
	  	else {
			if(results) {
				results = results[0];
			}
	  		res.send({"status": 200, "success": "success", "response": results});
  		}
  	});
});

router.get('/getBlogCategoryBySeoLink/:seo_link' , function(req, res, next) {
	var seo_link = req.params.seo_link;

    var query = `
		SELECT b_c.id, 
			b_c.category_name,
			b_c.description, 
			b_c.parent_id,
			b_c.sort,
			b_c.image,
			b_c.is_active,
			b_c.type,
			b_c.seo_link as url,
			b_c.seo_title,
			b_c.seo_keywords,
			b_c.seo_description,
			(
				SELECT 
					JSON_ARRAYAGG(
						JSON_OBJECT(
							'id',
							id,
							'parent_id',
							parent_id,
							'category_name',
							category_name, 
							'image',
							image, 
							'url',
							seo_link
						)
					)
				FROM blog_category as o_b_c
				Where o_b_c.is_deleted=0 and o_b_c.is_active = 1 and (
					CASE WHEN b_c.parent_id IS NULL 
					THEN b_c.id = o_b_c.id or b_c.id = o_b_c.parent_id 
					ELSE b_c.parent_id = o_b_c.parent_id or b_c.parent_id = o_b_c.id 
					END
				)
			) as other_categories
		FROM blog_category as b_c 
		WHERE b_c.is_deleted = 0 and b_c.is_active = 1 and b_c.seo_link = ${SqlString.escape(seo_link)}`;

	connection.query(query, async function (results, error, fields) {
		if(error){
			res.send({"status": 500, "error": error.sqlMessage, "response": null}); 
	  	}
	  	else {
            if(results){
				results = results[0];

				if(results && results.other_categories)
					results.other_categories = JSON.parse(results.other_categories);
			}
	  		res.send({"status": 200, "success": "success", "response": results});
  		}
  	});
});

router.post('/add', passport.authenticate('admin-rule', { session: false }) , async function(req , res , next){
	var category = req.body, user = await req.user;

	let blogCategoryByseoLink = await publicFunction.mysqlQuery("Select * From `blog_category` Where is_deleted = 0 and seo_link = " + SqlString.escape(category.seo_link));
	if(blogCategoryByseoLink && blogCategoryByseoLink.data.length > 0) {
		category.seo_link = category.seo_link + "-" + uuidv4();
	}

	let blogByseoLink = await publicFunction.mysqlQuery("Select * From `blogs` Where is_deleted = 0 and seo_link = " + SqlString.escape(category.seo_link));
	if(blogByseoLink && blogByseoLink.data.length > 0) {
		category.seo_link = category.seo_link + "-" + uuidv4();
	}

	let nameByseoLink = await publicFunction.mysqlQuery("Select * From `names` Where is_deleted = 0 and seo_link = " + SqlString.escape(category.seo_link));
	if(nameByseoLink && nameByseoLink.data.length > 0) {
		category.seo_link = category.seo_link + "-" + uuidv4();
	}

	let contentByseoLink = await publicFunction.mysqlQuery("Select * From `contents` Where seo_link = " + SqlString.escape(category.seo_link));
	if(contentByseoLink && contentByseoLink.data.length > 0) {
		category.seo_link = category.seo_link + "-" + uuidv4();
	}

	if(category) {
		var query = "Insert into `blog_category`(`parent_id`,`category_name`,`description`,`type`,`is_active`,`sort`,`image`,`is_menu`,`seo_link`,`seo_title`,`seo_keywords`,`seo_description`,`created_user_id`) Values("+SqlString.escape(category.parent_id)+","+SqlString.escape(category.category_name)+","+SqlString.escape(category.description)+","+SqlString.escape(category.type)+","+SqlString.escape(category.is_active)+","+SqlString.escape(category.sort)+","+SqlString.escape(category.image)+","+SqlString.escape(category.is_menu)+","+SqlString.escape(category.seo_link)+","+SqlString.escape(category.seo_title)+","+SqlString.escape(category.seo_keywords)+","+SqlString.escape(category.seo_description)+","+SqlString.escape(user.id)+")";
		
		connection.query(query, function(results, error, fields){
			if(error)
			{
				res.send({ error: error.sqlMessage, code: 'error', message: 'Category not added.' });
			}
			else
			{
				category['id'] = results?.insertId;
				res.send({ success: "success", code: 'category_added' , data: category, message: 'Category added.'});
			}	
		});	
	}
	else {
		res.send({"status":500 , "error": "missing_information" , "response": "Missing information."});
	}
});

router.post('/delete',passport.authenticate('admin-rule', { session: false }) , async function(req , res , next) {
    var category  = req.body, user = await req.user;

	if(category) {
		connection.query("Update `blog_category` Set is_deleted=1 , deletedAt=now() , deleted_user_id="+user.id+" Where id =" + category.id , function(results, error , fields) {
			if(error){
				res.send({"status":500 , "error": error.sqlMessage , "response": "Category no deleted."});
			}
			else{
				res.send({"status":200 , "success": "success" ,"Result":results,"Fields":fields, "response": "Category deleted."});
			}
		})
	}
	else {
		res.send({"status":200, code:"there_is_product", "success": "unsuccess", "message": "There are products belonging to the category."});
	}
	
});

router.post('/update/',passport.authenticate('admin-rule', { session: false }),async function(req , res , next){
	var category  = req.body, user = await req.user;

	if(category) {
		let blog;
		let blogCategoryById = await publicFunction.mysqlQuery("Select * From `blog_category` Where id = " + SqlString.escape(category.id));

		if(blogCategoryById && blogCategoryById.data && blogCategoryById.data.length > 0) {
			blog = blogCategoryById.data[0];
			if(blog.category_name != category.category_name) {

				let blogCategoryBySeoLink = await publicFunction.mysqlQuery(`Select * From blog_category Where is_deleted = 0 and id != ${SqlString.escape(category.id)} and seo_link = ${SqlString.escape(category.seo_link)}`);
				if(blogCategoryBySeoLink && blogCategoryBySeoLink.data && blogCategoryBySeoLink.data.length > 0) {
					category.seo_link = category.seo_link + "-" + uuidv4();
				}

				let blogByseoLink = await publicFunction.mysqlQuery("Select * From `blogs` Where is_deleted = 0 and seo_link = " + SqlString.escape(category.seo_link));
				if(blogByseoLink && blogByseoLink.data && blogByseoLink.data.length > 0) {
					category.seo_link = category.seo_link + "-" + uuidv4();
				}

				let nameByseoLink = await publicFunction.mysqlQuery("Select * From `names` Where is_deleted = 0 and seo_link = " + SqlString.escape(category.seo_link));
				if(nameByseoLink && nameByseoLink.data && nameByseoLink.data.length > 0) {
					category.seo_link = category.seo_link + "-" + uuidv4();
				}

				let contentByseoLink = await publicFunction.mysqlQuery("Select * From `contents` Where seo_link = " + SqlString.escape(category.seo_link));
				if(contentByseoLink && contentByseoLink.data.length > 0) {
					category.seo_link = category.seo_link + "-" + uuidv4();
				}
			}
		}		

		var query = "Update `blog_category` Set parent_id="+ SqlString.escape(category.parent_id) +", category_name="+SqlString.escape(category.category_name)+", description="+SqlString.escape(category.description)+" , seo_link = " + SqlString.escape(category.seo_link) +" , seo_title="+SqlString.escape(category.seo_title)+" , seo_keywords="+SqlString.escape(category.seo_keywords)+" , seo_description="+SqlString.escape(category.seo_description)+",type="+SqlString.escape(category.type)+",is_menu="+SqlString.escape(category.is_menu)+",baby_dictionary_title="+SqlString.escape(category.baby_dictionary_title)+",baby_dictionary_description="+SqlString.escape(category.baby_dictionary_description)+",image="+SqlString.escape(category.image)+",sort="+SqlString.escape(category.sort)+",is_active="+SqlString.escape(category.is_active)+", updated_user_id="+SqlString.escape(user.id)+" Where id=" + category.id;
		connection.query(query , function(results, error, fields0){
			if(error){
				res.send({"status":500 , "error": error.sqlMessage , "response": "Category no updated."});
			}
			else{
				res.send({"status":200 , "success": "success" , "Menu" : results, "Fields": fields0, "response": "Category updated"});
			}
		});
	}
	else {
		res.send({"status":500 , "error": "missing_information" , "response": "Missing information."});
	}
});

router.get('/updateActive/:id/:active',passport.authenticate('admin-rule', { session: false }), function(req , res , next){
	let id = req.params.id;
    let active = req.params.active;

	if(id && active) {
		var query = "Update `blog_category` Set is_active="+ SqlString.escape(active) +" Where id=" + id;
		connection.query(query , function(results, error, fields0){
			if(error){
				res.send({"status":500 , "error": error.sqlMessage , "response": "Category no updated."});
			}
			else{
				res.send({"status":200 , "success": "success" , "Menu" : results, "Fields": fields0, "response": "Category updated."});
			}
		});
	}
	else {
		res.send({"status":500 , "error": "missing_information" , "response": "Missing information."});
	}
});

router.get('/updateBabyDictionary/:id/:value',passport.authenticate('admin-rule', { session: false }), async function(req , res , next){
	let id = req.params.id;
	let value = req.params.value;

	if(id) {

		if(value == '1') {
			await publicFunction.mysqlQuery(`Update blog_category Set is_baby_dictionary = 0 Where id != ${SqlString.escape(id)}`);
			await publicFunction.mysqlQuery(`Update blog_category Set is_baby_dictionary = 1 Where id = ${SqlString.escape(id)}`);
		}
		else {
			await publicFunction.mysqlQuery(`Update blog_category Set is_baby_dictionary = 0 Where id = ${SqlString.escape(id)}`);
		}

		res.send({"status":200 , "success": "success" , "response": "Category updated."});
	}
	else {
		res.send({"status":500 , "error": "missing_information" , "response": "Missing information."});
	}
});

router.post('/controlLink/:seo_link' , passport.authenticate('admin-rule', { session: false }) , async function(req , res , next){
	var is_available = true, seo_link  = req.params.seo_link , blog_category_id = req.body.id | 0;


	let blogByseoLink = await publicFunction.mysqlQuery(`Select * From blogs Where is_deleted = 0 and seo_link = ${SqlString.escape(seo_link)}`);
	if(blogByseoLink && blogByseoLink.data && blogByseoLink.data.length > 0) {
		is_available = false;
	}

	let blogCategoryByseoLink = await publicFunction.mysqlQuery(`Select * From blog_category Where is_deleted = 0 and id != ${SqlString.escape(blog_category_id)} and seo_link = ${SqlString.escape(seo_link)}`);
	if(blogCategoryByseoLink && blogCategoryByseoLink.data && blogCategoryByseoLink.data.length > 0) {
		is_available = false;
	}

	let nameByseoLink = await publicFunction.mysqlQuery(`Select * From names Where is_deleted = 0 and seo_link = ${SqlString.escape(seo_link)}`);
	if(nameByseoLink && nameByseoLink.data && nameByseoLink.data.length > 0) {
		is_available = false;
	}

	let contentByseoLink = await publicFunction.mysqlQuery(`Select * From contents Where seo_link = ${SqlString.escape(seo_link)}`);
	if(contentByseoLink && contentByseoLink.data && contentByseoLink.data.length > 0) {
		is_available = false;
	}

	if(is_available)
		res.send({status:200, use: true, message: 'Link can use.'});
	else
		res.send({status:401, use: false, message: 'Link can not use.'});
});

module.exports = router;