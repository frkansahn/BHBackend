var express = require('express');
var router = express.Router();
const passport = require('passport');
const CryptoJS = require("crypto-js");
const SqlString = require('sqlstring');
const { v4: uuidv4 } = require('uuid');
var publicFunction = require('./public.js');

router.get('/getHeaderMenuForAdmin', passport.authenticate('admin-rule', { session: false }) , function(req, res, next) {
    var language = req.query.language;
    var query;
    if(language) {
        query = `SELECT h_m.id, 
            IF ((SELECT name FROM header_menu_language WHERE header_menu_id = h_m.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT name FROM header_menu_language WHERE header_menu_id = h_m.id and language = `+SqlString.escape(language)+` ) , h_m.name) as name, 
            IF ((SELECT url FROM header_menu_language WHERE header_menu_id = h_m.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT url FROM header_menu_language WHERE header_menu_id = h_m.id and language = `+SqlString.escape(language)+` ) , h_m.url) as url, 
            IF ((SELECT image FROM header_menu_language WHERE header_menu_id = h_m.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT image FROM header_menu_language WHERE header_menu_id = h_m.id and language = `+SqlString.escape(language)+` ) , h_m.image) as image, 
            IF ((SELECT banners FROM header_menu_language WHERE header_menu_id = h_m.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT banners FROM header_menu_language WHERE header_menu_id = h_m.id and language = `+SqlString.escape(language)+` ) , h_m.banners)  as banners, 
            IF ((SELECT field1 FROM header_menu_language WHERE header_menu_id = h_m.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT field1 FROM header_menu_language WHERE header_menu_id = h_m.id and language = `+SqlString.escape(language)+` ) , h_m.field1)  as field1,
            IF ((SELECT field2 FROM header_menu_language WHERE header_menu_id = h_m.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT field2 FROM header_menu_language WHERE header_menu_id = h_m.id and language = `+SqlString.escape(language)+` ) , h_m.field2)  as field2, 
            IF ((SELECT field3 FROM header_menu_language WHERE header_menu_id = h_m.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT field3 FROM header_menu_language WHERE header_menu_id = h_m.id and language = `+SqlString.escape(language)+` ) , h_m.field3)  as field3, 
            IF ((SELECT field4 FROM header_menu_language WHERE header_menu_id = h_m.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT field4 FROM header_menu_language WHERE header_menu_id = h_m.id and language = `+SqlString.escape(language)+` ) , h_m.field4)  as field4,  
            h_m.parent_id,
            h_m.sort,
            h_m.is_active,
			h_m.type,
			h_m.type_id
        FROM header_menu as h_m 
        WHERE h_m.is_deleted = 0 ORDER BY h_m.sort`;
    }
    else {
        query = `SELECT id, 
            name, 
            url, 
            image, 
            banners, 
            field1,
            field2,
            field3,
            field4,
            parent_id,
            sort,
            is_active,
			type,
			type_id
        FROM header_menu 
        WHERE is_deleted = 0 ORDER BY sort`;
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

router.get('/getHeaderMenu' , function(req, res, next) {
    var language = req.query.language;
    var query;
    if(language) {
        query = `SELECT h_m.id, 
            IF ((SELECT name FROM header_menu_language WHERE header_menu_id = h_m.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT name FROM header_menu_language WHERE header_menu_id = h_m.id and language = `+SqlString.escape(language)+` ) , h_m.name) as name, 
            IF ((SELECT url FROM header_menu_language WHERE header_menu_id = h_m.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT url FROM header_menu_language WHERE header_menu_id = h_m.id and language = `+SqlString.escape(language)+` ) , h_m.url) as url, 
            IF ((SELECT image FROM header_menu_language WHERE header_menu_id = h_m.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT image FROM header_menu_language WHERE header_menu_id = h_m.id and language = `+SqlString.escape(language)+` ) , h_m.image) as image, 
            IF ((SELECT banners FROM header_menu_language WHERE header_menu_id = h_m.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT banners FROM header_menu_language WHERE header_menu_id = h_m.id and language = `+SqlString.escape(language)+` ) , h_m.banners)  as banners, 
            IF ((SELECT field1 FROM header_menu_language WHERE header_menu_id = h_m.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT field1 FROM header_menu_language WHERE header_menu_id = h_m.id and language = `+SqlString.escape(language)+` ) , h_m.field1)  as field1,
            IF ((SELECT field2 FROM header_menu_language WHERE header_menu_id = h_m.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT field2 FROM header_menu_language WHERE header_menu_id = h_m.id and language = `+SqlString.escape(language)+` ) , h_m.field2)  as field2, 
            IF ((SELECT field3 FROM header_menu_language WHERE header_menu_id = h_m.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT field3 FROM header_menu_language WHERE header_menu_id = h_m.id and language = `+SqlString.escape(language)+` ) , h_m.field3)  as field3, 
            IF ((SELECT field4 FROM header_menu_language WHERE header_menu_id = h_m.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT field4 FROM header_menu_language WHERE header_menu_id = h_m.id and language = `+SqlString.escape(language)+` ) , h_m.field4)  as field4,  
            h_m.parent_id,
            h_m.sort,
            h_m.is_active,
			h_m.type,
			h_m.type_id
        FROM header_menu as h_m 
        WHERE h_m.is_deleted = 0 and h_m.is_active = 1 ORDER BY h_m.sort`;
    }
    else {
        query = `SELECT id, 
            name, 
            url, 
            image, 
            banners, 
            field1,
            field2,
            field3,
            field4,
            parent_id,
            sort,
            is_active,
			type,
			type_id
        FROM header_menu 
        WHERE is_deleted = 0 and h_m.is_active = 1 ORDER BY sort`;
    }

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
					if(node.type == 1) {
						let categoryQuery = '';
						if(language) {
							categoryQuery =	`SELECT c.id, 
								IF ((SELECT title FROM category_language WHERE category_id = c.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT title FROM category_language WHERE category_id = c.id and language = `+SqlString.escape(language)+` ) , c.title)  as name, 
								IF ((SELECT short_description FROM category_language WHERE category_id = c.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT short_description FROM category_language WHERE category_id = c.id and language = `+SqlString.escape(language)+` ) , c.short_description)  as short_description, 
								IF ((SELECT description FROM category_language WHERE category_id = c.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT description FROM category_language WHERE category_id = c.id and language = `+SqlString.escape(language)+` ) , c.description)  as description, 
								IF ((SELECT seo_title FROM category_language WHERE category_id = c.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT seo_title FROM category_language WHERE category_id = c.id and language = `+SqlString.escape(language)+` ) , c.seo_title)  as seo_title, 
								IF ((SELECT seo_keywords FROM category_language WHERE category_id = c.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT seo_keywords FROM category_language WHERE category_id = c.id and language = `+SqlString.escape(language)+` ) , c.seo_keywords)  as seo_keywords, 
								IF ((SELECT seo_description FROM category_language WHERE category_id = c.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT seo_description FROM category_language WHERE category_id = c.id and language = `+SqlString.escape(language)+` ) , c.seo_description)  as seo_description, 
								c.parent_id,
								c.sort,
								CONCAT('category/', c.seo_link) as url, 
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
							WHERE c.is_deleted = 0 and c.is_active = 1 and (c.id = ${node.type_id} or c.parent_id = ${node.type_id}) ORDER BY c.sort`
						}
						else {
							categoryQuery = `SELECT id,title as name,short_description,description,parent_id,sort,CONCAT('category/', seo_link) as url,seo_title,seo_keywords,seo_description,show_in_menu,show_in_mobile,show_category,field1,field2,field3,field4,image,icon From category Where is_deleted = 0 and is_active = 1 and (id = ${node.type_id} or parent_id = ${node.type_id}) ORDER BY sort`;
						}

						let categories = await publicFunction.mysqlQuery(categoryQuery);

						if(categories && categories.result) {
							var mapCategories = {}, nodeCategories, rootsCategories = [], j;
		
							for (j = 0; j < categories.data.length; j += 1) {
								mapCategories[categories.data[j].id] = j;
								categories.data[j]["children"] = [];
							}
							
							for (j = 0; j < categories.data.length; j += 1) {
								nodeCategories = categories.data[j];
								if (nodeCategories.parent_id !== null) {
									categories.data[mapCategories[nodeCategories.parent_id]]?.children?.push(nodeCategories);
								} 
								else {
									rootsCategories.push(nodeCategories);
								}
							}

							if(rootsCategories && rootsCategories.length > 0)
							roots.push(rootsCategories[0]);
						}						
					}
					else {
						if (node.parent_id !== null) {
							results[map[node.parent_id]]?.children?.push(node);
						} 
						else {
							roots.push(node);
						}
					}
                }
            }
            
	  		res.send({"status": 200, "success": "success", "response": roots});
  		}
  	});
});

router.post('/add', passport.authenticate('admin-rule', { session: false }) , async function(req , res , next){
	var menu = req.body;

	if(menu) {
		var query = "Insert into `header_menu`(`parent_id`,`name`,`url`,`image`,`banners`,`field1`,`field2`,`field3`,`field4`,`sort`,`created_user_id`,`is_active`,`type`,`type_id`) Values("+SqlString.escape(menu.parent_id)+","+SqlString.escape(menu.name)+","+SqlString.escape(menu.url)+","+SqlString.escape(menu.image)+","+SqlString.escape(menu.banners)+","+SqlString.escape(menu.field1)+","+SqlString.escape(menu.field2)+","+SqlString.escape(menu.field3)+","+SqlString.escape(menu.field4)+","+SqlString.escape(menu.sort)+","+SqlString.escape(menu.user_id)+","+SqlString.escape(menu.is_active)+","+SqlString.escape(menu.type)+","+SqlString.escape(menu.type_id)+")";
		
		connection.query(query, function(results, error, fields){
			if(error)
			{
				res.send({ error: error.sqlMessage, code: 'error', message: 'Menu not added.' });
			}
			else
			{
				menu['id'] = results?.insertId;
				res.send({ success: "success", code: 'menu_added' , data: menu, message: 'Menu added.'});
			}	
		});	
	}
	else {
		res.send({"status":500 , "error": "missing_information" , "response": "Missing information."});
	}
});

router.post('/delete',passport.authenticate('admin-rule', { session: false }) , async function(req , res , next) {
    var menu  = req.body;

	if(menu) {
		connection.query("Update `header_menu` Set is_deleted=1 , deletedAt=now() , deleted_user_id="+menu.user_id+" Where id =" + menu.id , function(results, error , fields) {
			if(error){
				res.send({"status":500 , "error": error.sqlMessage , "response": "Menu no deleted."});
			}
			else{
				res.send({"status":200 , "success": "success" ,"Result":results,"Fields":fields, "response": "Menu deleted."});
			}
		})
	}
	else {
		res.send({"status":200, code:"there_is_product", "success": "unsuccess", "message": "There are products belonging to the category."});
	}
	
});

router.post('/update/',passport.authenticate('admin-rule', { session: false }), function(req , res , next){
	var menu  = req.body;

	if(menu) {
		var query = "Update `header_menu` Set name="+ SqlString.escape(menu.name) +", url="+SqlString.escape(menu.url)+", image="+SqlString.escape(menu.image)+",banners="+SqlString.escape(menu.banners)+",field1="+SqlString.escape(menu.field1)+", field2="+SqlString.escape(menu.field2)+", field3="+SqlString.escape(menu.field3)+", field4="+SqlString.escape(menu.field4)+",sort="+SqlString.escape(menu.sort)+",is_active="+SqlString.escape(menu.is_active)+",type="+SqlString.escape(menu.type)+",type_id="+SqlString.escape(menu.type_id)+", updated_user_id="+SqlString.escape(menu.user_id)+" Where id=" + menu.id;
		connection.query(query , function(results, error, fields0){
			if(error){
				res.send({"status":500 , "error": error.sqlMessage , "response": "Menu no updated."});
			}
			else{
				res.send({"status":200 , "success": "success" , "Menu" : results, "Fields": fields0, "response": "Menu updated"});
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
		var query = "Update `header_menu` Set is_active="+ SqlString.escape(active) +" Where id=" + id;
		connection.query(query , function(results, error, fields0){
			if(error){
				res.send({"status":500 , "error": error.sqlMessage , "response": "Menu no updated."});
			}
			else{
				res.send({"status":200 , "success": "success" , "Menu" : results, "Fields": fields0, "response": "Menu updated."});
			}
		});
	}
	else {
		res.send({"status":500 , "error": "missing_information" , "response": "Missing information."});
	}
});

router.post('/updateLanguage',passport.authenticate('admin-rule', { session: false }), async function(req , res , next){
    let menuLanguages = req.body;

	if(menuLanguages && menuLanguages.length > 0) {
		let response = [];
		for (let index = 0; index < menuLanguages.length; index++) {
			const item = menuLanguages[index];
			if(item.category_id && item.language) {
				let hasLanguage = await publicFunction.mysqlQuery("Select IF(COUNT(*) > 0 ,true,false) as countLanguage From `header_menu_language` Where header_menu_id = " + SqlString.escape(item.header_menu_id) + " and language = " + SqlString.escape(item.language));
				if(hasLanguage && hasLanguage.result == true && hasLanguage.data[0].countLanguage > 0) {
					let query = "Update `header_menu_language` Set name = " + SqlString.escape(item.name) + ", image = " + SqlString.escape(item.image) + ", url = " + SqlString.escape(item.url) + ", banners = " + SqlString.escape(item.banners) + ", field1 = " + SqlString.escape(item.field1) + ", field2 = " + SqlString.escape(item.field2) + ", field3 = " + SqlString.escape(item.field3) + ", field4 = " + SqlString.escape(item.field4) + ", updated_user_id = " + SqlString.escape(item.user_id) + " Where header_menu_id = " + item.header_menu_id + " and language = " + SqlString.escape(item.language);
					let result = await publicFunction.mysqlQuery(query);
					
					response.push({
						status: result.result,
						header_menu_id:item.header_menu_id,
						language:item.language,
						process:"update",
						message: result.result != false ? "updated" : "not updated"
					});
				}
				else {
					let query = "INSERT INTO `header_menu_language`(`header_menu_id`,`name`,`url`,`image`,`banners`,`field1`,`field2`,`field3`,`field4`,`language`,`created_user_id`) VALUES("+ SqlString.escape(item.header_menu_id) +","+ SqlString.escape(item.name) +","+ SqlString.escape(item.url) +","+SqlString.escape(item.image)+","+SqlString.escape(item.banners)+","+SqlString.escape(item.field1)+","+SqlString.escape(item.field2)+","+SqlString.escape(item.field3)+","+SqlString.escape(item.field4)+","+SqlString.escape(item.language)+","+SqlString.escape(item.user_id)+")";
					let result = await publicFunction.mysqlQuery(query);

					response.push({
						status: result.result,
						header_menu_id:item.header_menu_id,
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
					message: "Header menu id or language missing"
				});
			}
		}

		res.send({"status":200 , "success": "success" , "response": response});
	}
	else {
		res.send({"status":500 , "error": "missing_information" , "response": "Missing information."});
	}
});

router.get('/getMenuByLanguage/:header_menu_id/:language',passport.authenticate('admin-rule', { session: false }), function(req, res, next) {
	let header_menu_id = req.params.header_menu_id;
	let language = req.params.language;
    var query = "Select * From `header_menu_language` Where header_menu_id = " + SqlString.escape(header_menu_id) + " and language = " + SqlString.escape(language);

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