var express = require('express');
var router = express.Router();
const passport = require('passport');
const CryptoJS = require("crypto-js");
const SqlString = require('sqlstring');
const { v4: uuidv4 } = require('uuid');
var publicFunction = require('./public.js');

router.get('/', passport.authenticate('admin-rule', { session: false }) , function(req, res, next) {
    var language = req.query.language;
    var query;
    if(language) {
        query = `SELECT c.id, 
            IF ((SELECT title FROM category_language WHERE category_id = c.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT title FROM category_language WHERE category_id = c.id and language = `+SqlString.escape(language)+` ) , c.title)  as title, 
            IF ((SELECT short_description FROM category_language WHERE category_id = c.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT short_description FROM category_language WHERE category_id = c.id and language = `+SqlString.escape(language)+` ) , c.short_description)  as short_description, 
            IF ((SELECT description FROM category_language WHERE category_id = c.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT description FROM category_language WHERE category_id = c.id and language = `+SqlString.escape(language)+` ) , c.description)  as description, 
            IF ((SELECT seo_title FROM category_language WHERE category_id = c.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT seo_title FROM category_language WHERE category_id = c.id and language = `+SqlString.escape(language)+` ) , c.seo_title)  as seo_title, 
            IF ((SELECT seo_keywords FROM category_language WHERE category_id = c.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT seo_keywords FROM category_language WHERE category_id = c.id and language = `+SqlString.escape(language)+` ) , c.seo_keywords)  as seo_keywords, 
            IF ((SELECT seo_description FROM category_language WHERE category_id = c.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT seo_description FROM category_language WHERE category_id = c.id and language = `+SqlString.escape(language)+` ) , c.seo_description)  as seo_description, 
            c.parent_id,
            c.is_active, 
            c.sort, 
            c.seo_link, 
            c.show_in_menu, 
            c.show_in_mobile, 
            c.show_category, 
            c.field1, 
            c.field2, 
            c.field3, 
            c.field4,
			c.image,
			c.icon,
            c.updated_user_id,
            c.created_user_id,
            c.updatedAt,
            c.createdAt
        FROM category as c
		Where c.is_deleted = 0;`
    }
    else {
        query = `Select * From category Where is_deleted=0`;
    }
	connection.query(query, function (results, error, fields) {
		if(error){
			res.send({"status": 500, "error": error.sqlMessage, "response": null}); 
	  	}
	  	else {
	  		res.send({"status": 200, "success": "success", "response": results});
  		}
  	});
});

router.get('/getCategoryTree', function(req, res, next) {
    var language = req.query.language;
    var query;
    if(language) {
        query = `SELECT c.id, 
            IF ((SELECT title FROM category_language WHERE category_id = c.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT title FROM category_language WHERE category_id = c.id and language = `+SqlString.escape(language)+` ) , c.title)  as title, 
            IF ((SELECT short_description FROM category_language WHERE category_id = c.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT short_description FROM category_language WHERE category_id = c.id and language = `+SqlString.escape(language)+` ) , c.short_description)  as short_description, 
            IF ((SELECT description FROM category_language WHERE category_id = c.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT description FROM category_language WHERE category_id = c.id and language = `+SqlString.escape(language)+` ) , c.description)  as description, 
            IF ((SELECT seo_title FROM category_language WHERE category_id = c.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT seo_title FROM category_language WHERE category_id = c.id and language = `+SqlString.escape(language)+` ) , c.seo_title)  as seo_title, 
            IF ((SELECT seo_keywords FROM category_language WHERE category_id = c.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT seo_keywords FROM category_language WHERE category_id = c.id and language = `+SqlString.escape(language)+` ) , c.seo_keywords)  as seo_keywords, 
            IF ((SELECT seo_description FROM category_language WHERE category_id = c.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT seo_description FROM category_language WHERE category_id = c.id and language = `+SqlString.escape(language)+` ) , c.seo_description)  as seo_description, 
            c.parent_id,
            c.sort,
            c.seo_link, 
            c.show_in_menu, 
            c.show_in_mobile, 
            c.show_category, 
            c.field1, 
            c.field2, 
            c.field3, 
            c.field4,
			c.image,
			c.icon
        FROM category as c 
        WHERE c.is_deleted = 0 and c.is_active = 1 ORDER BY c.sort`
    }
    else {
        query = 'SELECT `id`,`title`,`short_description`,`description`,`parent_id`,`sort`,`seo_link`,`seo_title`,`seo_keywords`,`seo_description`,`show_in_menu`,`show_in_mobile`,`show_category`,`field1`,`field2`,`field3`,`field4`,`image`,`icon` From `category` Where is_deleted = 0 and is_active = 1 ORDER BY sort';
    }

	connection.query(query, function (results, error, fields) {
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

router.get('/:id',passport.authenticate('admin-rule', { session: false }), function(req, res, next) {
	let id = req.params.id;
	var language = req.query.language;
    var query;
    if(language) {
        query = `SELECT c.id, 
            IF ((SELECT title FROM category_language WHERE category_id = c.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT title FROM category_language WHERE category_id = c.id and language = `+SqlString.escape(language)+` ) , c.title)  as title, 
            IF ((SELECT short_description FROM category_language WHERE category_id = c.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT short_description FROM category_language WHERE category_id = c.id and language = `+SqlString.escape(language)+` ) , c.short_description)  as short_description, 
            IF ((SELECT description FROM category_language WHERE category_id = c.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT description FROM category_language WHERE category_id = c.id and language = `+SqlString.escape(language)+` ) , c.description)  as description, 
            IF ((SELECT seo_title FROM category_language WHERE category_id = c.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT seo_title FROM category_language WHERE category_id = c.id and language = `+SqlString.escape(language)+` ) , c.seo_title)  as seo_title, 
            IF ((SELECT seo_keywords FROM category_language WHERE category_id = c.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT seo_keywords FROM category_language WHERE category_id = c.id and language = `+SqlString.escape(language)+` ) , c.seo_keywords)  as seo_keywords, 
            IF ((SELECT seo_description FROM category_language WHERE category_id = c.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT seo_description FROM category_language WHERE category_id = c.id and language = `+SqlString.escape(language)+` ) , c.seo_description)  as seo_description, 
            c.parent_id,
            c.is_active, 
            c.sort, 
            c.seo_link, 
            c.show_in_menu, 
            c.show_in_mobile, 
            c.show_category, 
            c.field1, 
            c.field2, 
            c.field3, 
            c.field4,
			c.image,
			c.icon,
            c.updated_user_id,
            c.created_user_id,
            c.updatedAt,
            c.createdAt
        FROM category as c
		Where c.id = ` + id
    }
    else {
        query = `Select * From category Where id = ` + id;
    }
	connection.query(query, function (results, error, fields) {
		if(error){
			res.send({"status": 500, "error": error.sqlMessage, "response": null}); 
	  	}
	  	else {
	  		res.send({"status": 200, "success": "success", "response": results});
  		}
  	});
});

router.get('/getBySeoLink/:seo_link', function(req, res, next) {
	let seo_link = req.params.seo_link;
	var language = req.query.language || 'tr';
    var query;
    query = `SELECT c.id, 
		IF ((SELECT title FROM category_language WHERE category_id = c.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT title FROM category_language WHERE category_id = c.id and language = `+SqlString.escape(language)+` ) , c.title)  as title, 
		IF ((SELECT short_description FROM category_language WHERE category_id = c.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT short_description FROM category_language WHERE category_id = c.id and language = `+SqlString.escape(language)+` ) , c.short_description)  as short_description, 
		IF ((SELECT description FROM category_language WHERE category_id = c.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT description FROM category_language WHERE category_id = c.id and language = `+SqlString.escape(language)+` ) , c.description)  as description, 
		IF ((SELECT seo_title FROM category_language WHERE category_id = c.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT seo_title FROM category_language WHERE category_id = c.id and language = `+SqlString.escape(language)+` ) , c.seo_title)  as seo_title, 
		IF ((SELECT seo_keywords FROM category_language WHERE category_id = c.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT seo_keywords FROM category_language WHERE category_id = c.id and language = `+SqlString.escape(language)+` ) , c.seo_keywords)  as seo_keywords, 
		IF ((SELECT seo_description FROM category_language WHERE category_id = c.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT seo_description FROM category_language WHERE category_id = c.id and language = `+SqlString.escape(language)+` ) , c.seo_description)  as seo_description, 
		c.parent_id,
		c.sort, 
		concat('/category/' , c.seo_link) as seo_link, 
		c.show_in_menu, 
		c.show_in_mobile, 
		c.show_category, 
		c.field1, 
		c.field2, 
		c.field3, 
		c.field4,
		c.image,
		c.icon
	FROM category as c
	Where c.seo_link = '${seo_link}'`

	connection.query(query, function (results, error, fields) {
		if(error){
			res.send({"status": 500, "error": error.sqlMessage, "response": null}); 
	  	}
	  	else {
	  		res.send({"status": 200, "success": "success", "response": results});
  		}
  	});
});

router.post('/add', passport.authenticate('admin-rule', { session: false }) , async function(req , res , next){
	var category = req.body;

	if(category) {
        let seo_link;
        seo_link = publicFunction.toSnakeCase(publicFunction.convertTurkishCharacter(category.title));
        let categoryByseoLink = await publicFunction.mysqlQuery("Select * From `category` Where seo_link = " + SqlString.escape(seo_link));

        if(categoryByseoLink && categoryByseoLink.data.length > 0) {
            seo_link = seo_link + "-" + uuidv4();;
        }

		var query = "Insert into `category`(`title`,`short_description`,`description`,`parent_id`,`sort`,`is_active`,`seo_link`,`seo_title`,`seo_keywords`,`seo_description`,`show_in_menu`,`show_in_mobile`,`show_category`,`field1`,`field2`,`field3`,`field4`,`image`,`icon`,`created_user_id`) Values("+SqlString.escape(category.title)+","+SqlString.escape(category.short_description)+","+SqlString.escape(category.description)+","+category.parent_id+","+category.sort+","+category.is_active+","+SqlString.escape(seo_link)+","+SqlString.escape(category.seo_title)+","+SqlString.escape(category.seo_keywords)+","+SqlString.escape(category.seo_description)+","+category.show_in_menu+","+category.show_in_mobile+","+category.show_category+","+SqlString.escape(category.field1)+","+SqlString.escape(category.field2)+","+SqlString.escape(category.field3)+","+SqlString.escape(category.field4)+","+SqlString.escape(category.image)+","+SqlString.escape(category.icon)+","+category.user_id+")";
		
		connection.query(query, function(results, error, fields){
			if(error)
			{
				res.send({ error: error.sqlMessage, code: 'error', message: 'Kategori eklenemedi.' });
			}
			else
			{
				category['id'] = results?.insertId;
                category['seo_link'] = seo_link;
				res.send({ success: "success", code: 'category_added' , data: category, message: 'Kategori eklendi.'});
			}	
		});	
	}
	else {
		res.send({"status":500 , "error": "missing_information" , "response": "Missing information."});
	}
});

router.post('/delete/:id',passport.authenticate('admin-rule', { session: false }) , async function(req , res , next) {
	let id = req.params.id;
    var category  = req.body;

    let categories = await publicFunction.mysqlQuery("Select COUNT(*) as total From `product_category` Where category_id = " + SqlString.escape(id));
	if(!categories?.data[0]?.total > 0) {
		connection.query("Update `category` Set is_deleted=1 , deletedAt=now() , deleted_user_id="+category.user_id+" Where id =" + id , function(results, error , fields) {
			if(error){
				res.send({"status":500 , "error": error.sqlMessage , "response": "Kategori silinemedi."});
			}
			else{
				res.send({"status":200 , "success": "success" ,"Result":results,"Fields":fields, "response": "Kategori başarıyla silindi."});
			}
		})
	}
	else {
		res.send({"status":200, code:"there_is_product", "success": "unsuccess", "message": "There are products belonging to the category."});
	}
	
});

router.post('/update/:id',passport.authenticate('admin-rule', { session: false }), function(req , res , next){
	let id = req.params.id;
	var category  = req.body;

	if(category) {
		var query = "Update `category` Set title="+ SqlString.escape(category.title) +", short_description="+SqlString.escape(category.short_description)+", description="+SqlString.escape(category.description)+",sort="+category.sort+",is_active="+category.is_active+", seo_title="+SqlString.escape(category.seo_title)+",seo_description="+SqlString.escape(category.seo_description)+", seo_keywords="+SqlString.escape(category.seo_keywords)+", show_in_menu="+category.show_in_menu+", show_in_mobile="+category.show_in_mobile+", show_category="+category.show_category+", field1="+SqlString.escape(category.field1)+", field2="+SqlString.escape(category.field2)+", field3="+SqlString.escape(category.field3)+", field4="+SqlString.escape(category.field4)+",image="+SqlString.escape(category.image)+",icon="+SqlString.escape(category.icon)+", updated_user_id="+SqlString.escape(category.user_id)+" Where id=" + id;
		connection.query(query , function(results, error, fields0){
			if(error){
				res.send({"status":500 , "error": error.sqlMessage , "response": "Kategori güncellenemedi."});
			}
			else{
				res.send({"status":200 , "success": "success" , "Kategori" : results, "Fields": fields0, "response": "Kategori başarıyla güncellendi."});
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
		var query = "Update `category` Set is_active="+ SqlString.escape(active) +" Where id=" + id;
		connection.query(query , function(results, error, fields0){
			if(error){
				res.send({"status":500 , "error": error.sqlMessage , "response": "Kategori güncellenemedi."});
			}
			else{
				res.send({"status":200 , "success": "success" , "Kategori" : results, "Fields": fields0, "response": "Kategori başarıyla güncellendi."});
			}
		});
	}
	else {
		res.send({"status":500 , "error": "missing_information" , "response": "Missing information."});
	}
});

router.post('/updateLanguage',passport.authenticate('admin-rule', { session: false }), async function(req , res , next){
    let categoryLanguages = req.body;

	if(categoryLanguages && categoryLanguages.length > 0) {
		let response = [];
		for (let index = 0; index < categoryLanguages.length; index++) {
			const item = categoryLanguages[index];
			if(item.category_id && item.language) {
				let hasLanguage = await publicFunction.mysqlQuery("Select IF(COUNT(*) > 0 ,true,false) as countLanguage From `category_language` Where category_id = " + SqlString.escape(item.category_id) + " and language = " + SqlString.escape(item.language));
				if(hasLanguage && hasLanguage.result == true && hasLanguage.data[0].countLanguage > 0) {
					let query = "Update `category_language` Set title = " + SqlString.escape(item.title) + ", short_description = " + SqlString.escape(item.short_description) + ", description = " + SqlString.escape(item.description) + ", seo_title = " + SqlString.escape(item.seo_title) + ", seo_keywords = " + SqlString.escape(item.seo_keywords) + ", seo_description = " + SqlString.escape(item.seo_description) + ", updated_user_id = " + SqlString.escape(item.user_id) + " Where category_id = " + item.category_id + " and language = " + SqlString.escape(item.language);
					let result = await publicFunction.mysqlQuery(query);
					
					response.push({
						status: result.result,
						category_id:item.category_id,
						language:item.language,
						process:"update",
						message: result.result != false ? "updated" : "not updated"
					});
				}
				else {
					let query = "INSERT INTO `category_language`(`category_id`,`title`,`short_description`,`description`,`seo_title`,`seo_keywords`,`seo_description`,`language`,`created_user_id`) VALUES("+ item.category_id +","+ SqlString.escape(item.title) +","+SqlString.escape(item.short_description)+","+SqlString.escape(item.description)+","+SqlString.escape(item.seo_title)+","+SqlString.escape(item.seo_keywords)+","+SqlString.escape(item.seo_description)+","+SqlString.escape(item.language)+","+item.user_id+")";
					let result = await publicFunction.mysqlQuery(query);

					response.push({
						status: result.result,
						category_id:item.category_id,
						language:item.language,
						process:"create",
						message: result.result != false ? "created" : "not created"
					});
				}
			}
			else {
				response.push({
					status: false,
					category_id:item.category_id,
					language:item.language,
					process:"",
					message: "Category id or language missing"
				});
			}
		}

		res.send({"status":200 , "success": "success" , "response": response});
	}
	else {
		res.send({"status":500 , "error": "missing_information" , "response": "Missing information."});
	}
});

router.get('/getCategoryByLanguage/:category_id/:language',passport.authenticate('admin-rule', { session: false }), function(req, res, next) {
	let category_id = req.params.category_id;
	let language = req.params.language;
    var query = "Select * From `category_language` Where category_id = " + SqlString.escape(category_id) + " and language = " + SqlString.escape(language);

	connection.query(query, function (results, error, fields) {
		if(error){
			res.send({"status": 500, "error": error.sqlMessage, "response": null}); 
	  	}
	  	else {
	  		res.send({"status": 200, "success": "success", "response": results});
  		}
  	});
});

module.exports = router;