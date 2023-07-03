var express = require('express');
var router = express.Router();
const passport = require('passport');
const CryptoJS = require("crypto-js");
const SqlString = require('sqlstring');
const { v4: uuidv4 } = require('uuid');
var publicFunction = require('./public.js');


// Attribute Start

router.post('/', passport.authenticate('admin-rule', { session: false }) , function(req, res, next) {
    var language = req.query.language,start=req.body?.paging?.start || 0, end=req.body?.paging?.end || 20, query, queryTotal;
    if(language) {
        query = `SELECT a.id, 
            IF ((SELECT name FROM attribute_language WHERE attribute_id = a.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT name FROM attribute_language WHERE attribute_id = a.id and language = `+SqlString.escape(language)+` ) , a.name)  as name, 
            IF ((SELECT name FROM attribute_category_language WHERE attribute_category_id = a.attribute_category_id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT name FROM attribute_category_language WHERE attribute_category_id = a.attribute_category_id and language = `+SqlString.escape(language)+` ) , (SELECT name FROM attribute_category WHERE id = a.attribute_category_id)) as attribute_category_name, 
            a.attribute_category_id,
            a.image, 
            a.code,
            a.is_active,
            a.updated_user_id,
            a.created_user_id,
            a.updatedAt,
            a.createdAt
        FROM attribute as a
		Where a.is_deleted = 0
        LIMIT ${start},${end}`
    }
    else {
        query = `SELECT a.id, 
            a.name, 
            (SELECT name FROM attribute_category WHERE id = a.attribute_category_id) as attribute_category_name, 
            a.attribute_category_id,
            a.image, 
            a.code,
            a.is_active,
            a.updated_user_id,
            a.created_user_id,
            a.updatedAt,
            a.createdAt
        FROM attribute as a
        Where a.is_deleted = 0
        LIMIT ${start},${end}`;
    }

    queryTotal = `
        SELECT COUNT(*) as total
        FROM attribute as a
        Where a.is_deleted = 0`;
	connection.query(query, function (results, error, fields) {
		if(error){
			res.send({"status": 500, "error": error.sqlMessage, "response": null}); 
	  	}
	  	else {
            connection.query(queryTotal, function (resultTotal, errorTotal) {
				if(errorTotal){
					res.send({"status": 500, "error": errorTotal.sqlMessage, "response": null}); 
				}
				else {
					res.send({"status": 200, "success": "success", "response": {attributes:results , total:resultTotal[0].total , start:start , end:end}});
				}
			});
  		}
  	});
});

router.get('/:id', passport.authenticate('admin-rule', { session: false }) , function(req, res, next) {
    var id = req.params.id, language = req.query.language, query;
    if(language) {
        query = `SELECT a.id, 
            IF ((SELECT name FROM attribute_language WHERE attribute_id = a.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT name FROM attribute_language WHERE attribute_id = a.id and language = `+SqlString.escape(language)+` ) , a.name)  as name, 
            IF ((SELECT name FROM attribute_category_language WHERE attribute_category_id = a.attribute_category_id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT name FROM attribute_category_language WHERE attribute_category_id = a.attribute_category_id and language = `+SqlString.escape(language)+` ) , (SELECT name FROM attribute_category WHERE id = a.attribute_category_id)) as attribute_category_name, 
            a.attribute_category_id,
            a.image, 
            a.code,
            a.is_active,
            a.updated_user_id,
            a.created_user_id,
            a.updatedAt,
            a.createdAt
        FROM attribute as a
		Where a.is_deleted = 0 and a.id = ${id}`
    }
    else {
        query = `SELECT a.id, 
            a.name, 
            (SELECT name FROM attribute_category WHERE id = a.attribute_category_id) as attribute_category_name, 
            a.attribute_category_id,
            a.image, 
            a.code,
            a.is_active,
            a.updated_user_id,
            a.created_user_id,
            a.updatedAt,
            a.createdAt
        FROM attribute as a
        Where a.is_deleted = 0 and a.id = ${id}`;
    }
	connection.query(query, function (results, error) {
		if(error){
			res.send({"status": 500, "error": error.sqlMessage, "response": null}); 
	  	}
	  	else {
            res.send({"status": 200, "success": "success", "response": results});
  		}
  	});
});

router.post('/add', passport.authenticate('admin-rule', { session: false }) ,async function(req , res , next){
	var attributes = req.body;

	if(attributes) {
        let response = [];
        for (let index = 0; index < attributes.length; index++) {
            var item = attributes[index];
            if(item) {
                if(!item.attribute_category_id) {
                    response.push({
                        status: false,
                        data:item,
                        message: "attribute category id is incorrect"
                    });

                    continue;
                }

                if(!item.name) {
                    response.push({
                        status: false,
                        data:item,
                        message: "name is incorrect"
                    });

                    continue;
                }

                if(!item.user_id) {
                    response.push({
                        status: false,
                        data:item,
                        message: "user id is incorrect"
                    });

                    continue;
                }

                let result = await publicFunction.mysqlQuery("INSERT INTO `attribute`(`name`,`attribute_category_id`,`image`,`code`,`is_active`,`created_user_id`) VALUES("+SqlString.escape(item.name)+","+SqlString.escape(item.attribute_category_id)+","+SqlString.escape(item.image)+","+SqlString.escape(item.code)+","+SqlString.escape(item.is_active)+","+SqlString.escape(item.user_id) + ")");

                response.push({
                    status: result.result,
                    data:item,
                    message: result.result != false ? "created" : "not created"
                });
            }
            else {
                response.push({
                    status: false,
                    data:item,
                    message: "missing_information"
                });
            }
        }	

        res.send({"status":200 , "success": "success" , "response": response});
	}
	else {
		res.send({"status":500 , "error": "missing_information" , "response": "Missing information."});
	}
});

router.post('/update/',passport.authenticate('admin-rule', { session: false }),async function(req , res , next){
    var attributes = req.body;

	if(attributes) {
        let response = [];
        for (let index = 0; index < attributes.length; index++) {
            var item = attributes[index];
            if(item) {

                if(!item.attribute_id) {
                    response.push({
                        status: false,
                        data:item,
                        message: "attribute id is incorrect"
                    });

                    continue;
                }
                
                if(!item.name) {
                    response.push({
                        status: false,
                        data:item,
                        message: "name is incorrect"
                    });

                    continue;
                }

                if(!item.user_id) {
                    response.push({
                        status: false,
                        data:item,
                        message: "user id is incorrect"
                    });

                    continue;
                }

                var query = "Update `attribute` Set name="+SqlString.escape(item.name)+", image="+SqlString.escape(item.image)+", code="+SqlString.escape(item.code)+",is_active="+SqlString.escape(item.is_active)+", updated_user_id="+SqlString.escape(item.user_id)+" Where id=" + item.attribute_id;
                let result = await publicFunction.mysqlQuery(query);

                response.push({
                    status: result.result,
                    data:item,
                    message: result.result != false ? "updated" : "not updated"
                });
            }
            else {
                response.push({
                    status: false,
                    data:item,
                    message: "missing_information"
                });
            }
        }	

        res.send({"status":200 , "success": "success" , "response": response});
	}
	else {
		res.send({"status":500 , "error": "missing_information" , "response": "Missing information."});
	}
});

router.post('/delete/',passport.authenticate('admin-rule', { session: false }),async function(req , res , next){
    var attributes = req.body;

	if(attributes) {
        let response = [];
        for (let index = 0; index < attributes.length; index++) {
            var item = attributes[index];
            if(item) {
                if(!item.attribute_id) {
                    response.push({
                        status: false,
                        data:item,
                        message: "attribute id is incorrect"
                    });

                    continue;
                }

                if(!item.user_id) {
                    response.push({
                        status: false,
                        data:item,
                        message: "user id is incorrect"
                    });

                    continue;
                }

                var query = "Update `attribute` Set is_deleted=1, deletedAt=now(),deleted_user_id="+SqlString.escape(item.user_id)+" Where id=" + item.attribute_id;
                let result = await publicFunction.mysqlQuery(query);

                response.push({
                    status: result.result,
                    data:item,
                    message: result.result != false ? "deleted" : "not deleted"
                });
            }
            else {
                response.push({
                    status: false,
                    data:item,
                    message: "missing_information"
                });
            }
        }	

        res.send({"status":200 , "success": "success" , "response": response});
	}
	else {
		res.send({"status":500 , "error": "missing_information" , "response": "Missing information."});
	}
});

router.get('/updateActive/:id/:active',passport.authenticate('admin-rule', { session: false }), function(req , res , next){
	let id = req.params.id;
    let active = req.params.active;

	if(id && active) {
		var query = "Update `attribute` Set is_active="+ SqlString.escape(active) +" Where id=" + id;
		connection.query(query , function(results, error, fields0){
			if(error){
				res.send({"status":500 , "error": error.sqlMessage , "response": "Attribute npt updated."});
			}
			else{
				res.send({"status":200 , "success": "success" , "Attribute" : results, "Fields": fields0, "response": "Attribute updated."});
			}
		});
	}
	else {
		res.send({"status":500 , "error": "missing_information" , "response": "Missing information."});
	}
});

router.post('/updateLanguage',passport.authenticate('admin-rule', { session: false }), async function(req , res , next){
    let attributeLanguages = req.body;

	if(attributeLanguages && attributeLanguages.length > 0) {
		let response = [];
		for (let index = 0; index < attributeLanguages.length; index++) {
			const item = attributeLanguages[index];
			if(item) {
                if(!item.name) {
                    response.push({
                        status: false,
                        data:item,
                        message: "name is incorrect"
                    });

                    continue;
                }

                if(!item.attribute_id) {
                    response.push({
                        status: false,
                        data:item,
                        message: "attribute id is incorrect"
                    });

                    continue;
                }

                if(!item.language) {
                    response.push({
                        status: false,
                        data:item,
                        message: "language is incorrect"
                    });

                    continue;
                }
				let hasLanguage = await publicFunction.mysqlQuery("Select IF(COUNT(*) > 0 ,true,false) as countLanguage From `attribute_language` Where attribute_id = " + SqlString.escape(item.attribute_id) + " and language = " + SqlString.escape(item.language));
				if(hasLanguage && hasLanguage.result == true && hasLanguage.data[0].countLanguage > 0) {
					let query = "Update `attribute_language` Set name = " + SqlString.escape(item.name) + ", updated_user_id = " + SqlString.escape(item.user_id) + " Where attribute_id = " + item.attribute_id + " and language = " + SqlString.escape(item.language);
					let result = await publicFunction.mysqlQuery(query);
					
					response.push({
						status: result.result,
						data:item,
						message: result.result != false ? "updated" : "not updated"
					});
				}
				else {
					let query = "INSERT INTO `attribute_language`(`attribute_id`,`name`,`language`,`created_user_id`) VALUES("+ SqlString.escape(item.attribute_id) +","+ SqlString.escape(item.name) +","+SqlString.escape(item.language)+","+item.user_id+")";
					let result = await publicFunction.mysqlQuery(query);

					response.push({
						status: result.result,
						data:item,
						message: result.result != false ? "created" : "not created"
					});
				}
			}
			else {
				response.push({
					status: false,
					data:item,
					message: "missing_information"
				});
			}
		}

		res.send({"status":200 , "success": "success" , "response": response});
	}
	else {
		res.send({"status":500 , "error": "missing_information" , "response": "Missing information."});
	}
});

// Attribute End


// Attribute Category Start

router.post('/getAttributeCategory', passport.authenticate('admin-rule', { session: false }) , function(req, res, next) {
    var language = req.query.language,start=req.body?.paging?.start || 0, end=req.body?.paging?.end || 20, query, queryTotal;
    if(language) {
        query = `SELECT a.id, 
            IF ((SELECT name FROM attribute_category_language WHERE attribute_category_id = a.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT name FROM attribute_category_language WHERE attribute_category_id = a.id and language = `+SqlString.escape(language)+` ) , a.name)  as name, 
            (SELECT JSON_ARRAYAGG(JSON_OBJECT('name',name ,'image',image,'code',code)) From (SELECT IF ((SELECT name FROM attribute_language WHERE attribute_id = attr.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT name FROM attribute_language WHERE attribute_id = attr.id and language = `+SqlString.escape(language)+`) , attr.name) as name , attr.image, attr.code , attr.is_active , attr.createdAt FROM attribute as attr WHERE attribute_category_id = a.id) as attri) as attributes,
            a.sort,
            a.is_active,
            a.updated_user_id,
            a.created_user_id,
            a.updatedAt,
            a.createdAt
        FROM attribute_category as a
		Where a.is_deleted = 0
        LIMIT ${start},${end}`
    }
    else {
        query = `SELECT a.id, 
            a.name, 
            (SELECT JSON_ARRAYAGG(JSON_OBJECT('name',name ,'image',image,'code',code)) From (SELECT attr.name , attr.image, attr.code , attr.is_active , attr.createdAt FROM attribute as attr WHERE attribute_category_id = a.id) as attri) as attributes,
            a.sort,
            a.is_active,
            a.updated_user_id,
            a.created_user_id,
            a.updatedAt,
            a.createdAt
        FROM attribute_category as a
		Where a.is_deleted = 0
        LIMIT ${start},${end}`
    }

    queryTotal = `
        SELECT COUNT(*) as total
        FROM attribute_category as a
        Where a.is_deleted = 0`;
	connection.query(query, function (results, error, fields) {
		if(error){
			res.send({"status": 500, "error": error.sqlMessage, "response": null}); 
	  	}
	  	else {
            connection.query(queryTotal, function (resultTotal, errorTotal) {
				if(errorTotal){
					res.send({"status": 500, "error": errorTotal.sqlMessage, "response": null}); 
				}
				else {
                    results = results.map(item => {
                        if(item.attributes)
                            item.attributes = JSON.parse(item.attributes);
        
                        return item
                    });
					res.send({"status": 200, "success": "success", "response": {attribute_categories:results , total:resultTotal[0].total , start:start , end:end}});
				}
			});
  		}
  	});
});

router.get('/getAttributeCategory/:id', passport.authenticate('admin-rule', { session: false }) , function(req, res, next) {
    var id = req.params.id,language = req.query.language, query;
    if(language) {
        query = `SELECT a.id, 
            IF ((SELECT name FROM attribute_category_language WHERE attribute_category_id = a.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT name FROM attribute_category_language WHERE attribute_category_id = a.id and language = `+SqlString.escape(language)+` ) , a.name)  as name, 
            (SELECT JSON_ARRAYAGG(JSON_OBJECT('name',name ,'image',image,'code',code)) From (SELECT IF ((SELECT name FROM attribute_language WHERE attribute_id = attr.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT name FROM attribute_language WHERE attribute_id = attr.id and language = `+SqlString.escape(language)+`) , attr.name) as name , attr.image, attr.code , attr.is_active , attr.createdAt FROM attribute as attr WHERE attribute_category_id = a.id) as attri) as attributes,
            a.sort,
            a.is_active,
            a.updated_user_id,
            a.created_user_id,
            a.updatedAt,
            a.createdAt
        FROM attribute_category as a
		Where a.is_deleted = 0 and a.id = ${id}`
    }
    else {
        query = `SELECT a.id, 
            a.name, 
            (SELECT JSON_ARRAYAGG(JSON_OBJECT('name',name ,'image',image,'code',code)) From (SELECT attr.name , attr.image, attr.code , attr.is_active , attr.createdAt FROM attribute as attr WHERE attribute_category_id = a.id) as attri) as attributes,
            a.sort,
            a.is_active,
            a.updated_user_id,
            a.created_user_id,
            a.updatedAt,
            a.createdAt
        FROM attribute_category as a
		Where a.is_deleted = 0 and a.id = ${id}`
    }
	connection.query(query, function (results, error, fields) {
		if(error){
			res.send({"status": 500, "error": error.sqlMessage, "response": null}); 
	  	}
	  	else {
            results = results.map(item => {
                if(item.attributes)
                    item.attributes = JSON.parse(item.attributes);

                return item
            });
            res.send({"status": 200, "success": "success", "response": results});
  		}
  	});
});

router.post('/addAttributeCategory', passport.authenticate('admin-rule', { session: false }) ,async function(req , res , next){
	var attributeCategories = req.body;

	if(attributeCategories) {
        let response = [];
        for (let index = 0; index < attributeCategories.length; index++) {
            var item = attributeCategories[index];
            if(item) {
                if(!item.name) {
                    response.push({
                        status: false,
                        data:item,
                        message: "name is incorrect"
                    });

                    continue;
                }

                if(!item.user_id) {
                    response.push({
                        status: false,
                        data:item,
                        message: "user id is incorrect"
                    });

                    continue;
                }

                let result = await publicFunction.mysqlQuery("INSERT INTO `attribute_category`(`name`,`sort`,`is_active`,`created_user_id`) VALUES("+SqlString.escape(item.name)+","+SqlString.escape(item.sort)+","+SqlString.escape(item.is_active)+","+SqlString.escape(item.user_id) + ")");

                response.push({
                    status: result.result,
                    data:item,
                    message: result.result != false ? "created" : "not created"
                });
            }
            else {
                response.push({
                    status: false,
                    data:item,
                    message: "missing_information"
                });
            }
        }	

        res.send({"status":200 , "success": "success" , "response": response});
	}
	else {
		res.send({"status":500 , "error": "missing_information" , "response": "Missing information."});
	}
});

router.post('/updateAttributeCategory/',passport.authenticate('admin-rule', { session: false }),async function(req , res , next){
    var attributeCategories = req.body;

	if(attributeCategories) {
        let response = [];
        for (let index = 0; index < attributeCategories.length; index++) {
            var item = attributeCategories[index];
            if(item) {

                if(!item.attribute_category_id) {
                    response.push({
                        status: false,
                        data:item,
                        message: "user id is incorrect"
                    });

                    continue;
                }

                if(!item.name) {
                    response.push({
                        status: false,
                        data:item,
                        message: "name is incorrect"
                    });

                    continue;
                }

                if(!item.user_id) {
                    response.push({
                        status: false,
                        data:item,
                        message: "user id is incorrect"
                    });

                    continue;
                }

                var query = "Update `attribute_category` Set name="+SqlString.escape(item.name)+", sort="+SqlString.escape(item.sort)+", is_active="+SqlString.escape(item.is_active)+", updated_user_id="+SqlString.escape(item.user_id)+" Where id=" + item.attribute_category_id;
                let result = await publicFunction.mysqlQuery(query);

                response.push({
                    status: result.result,
                    data:item,
                    message: result.result != false ? "updated" : "not updated"
                });
            }
            else {
                response.push({
                    status: false,
                    data:item,
                    message: "missing_information"
                });
            }
        }	

        res.send({"status":200 , "success": "success" , "response": response});
	}
	else {
		res.send({"status":500 , "error": "missing_information" , "response": "Missing information."});
	}
});

router.post('/deleteAttributeCategory/',passport.authenticate('admin-rule', { session: false }),async function(req , res , next){
    var attributeCategories = req.body;

	if(attributeCategories) {
        let response = [];
        for (let index = 0; index < attributeCategories.length; index++) {
            var item = attributeCategories[index];
            if(item) {
                if(!item.attribute_category_id) {
                    response.push({
                        status: false,
                        data:item,
                        message: "attribute category id is incorrect"
                    });

                    continue;
                }

                if(!item.user_id) {
                    response.push({
                        status: false,
                        data:item,
                        message: "user id is incorrect"
                    });

                    continue;
                }

                var query = "Update `attribute_category` Set is_deleted=1, deletedAt=now(),deleted_user_id="+SqlString.escape(item.user_id)+" Where id=" + item.attribute_category_id;
                
                if(result.result) {
                    await publicFunction.mysqlQuery("Update `attribute` Set is_deleted=1, deletedAt=now(),deleted_user_id="+SqlString.escape(item.user_id)+" Where attribute_category_id=" + item.attribute_category_id);
                }

                let result = await publicFunction.mysqlQuery(query);

                response.push({
                    status: result.result,
                    data:item,
                    message: result.result != false ? "deleted" : "not deleted"
                });
            }
            else {
                response.push({
                    status: false,
                    data:item,
                    message: "missing_information"
                });
            }
        }	

        res.send({"status":200 , "success": "success" , "response": response});
	}
	else {
		res.send({"status":500 , "error": "missing_information" , "response": "Missing information."});
	}
});

router.get('/updateActiveAttributeCategory/:id/:active',passport.authenticate('admin-rule', { session: false }), function(req , res , next){
	let id = req.params.id;
    let active = req.params.active;

	if(id && active) {
		var query = "Update `attribute_category` Set is_active="+ SqlString.escape(active) +" Where id=" + id;
		connection.query(query , function(results, error, fields0){
			if(error){
				res.send({"status":500 , "error": error.sqlMessage , "response": "Attribute category not updated."});
			}
			else{
				res.send({"status":200 , "success": "success" , "AttributeCategory" : results, "Fields": fields0, "response": "Attribute category updated."});
			}
		});
	}
	else {
		res.send({"status":500 , "error": "missing_information" , "response": "Missing information."});
	}
});

router.post('/updateLanguageAttributeCategory',passport.authenticate('admin-rule', { session: false }), async function(req , res , next){
    let attributeCategoryLanguages = req.body;

	if(attributeCategoryLanguages && attributeCategoryLanguages.length > 0) {
		let response = [];
		for (let index = 0; index < attributeCategoryLanguages.length; index++) {
			const item = attributeCategoryLanguages[index];
			if(item) {
                if(!item.name) {
                    response.push({
                        status: false,
                        data:item,
                        message: "name is incorrect"
                    });

                    continue;
                }

                if(!item.attribute_category_id) {
                    response.push({
                        status: false,
                        data:item,
                        message: "attribute category id is incorrect"
                    });

                    continue;
                }

                if(!item.language) {
                    response.push({
                        status: false,
                        data:item,
                        message: "language is incorrect"
                    });

                    continue;
                }
				let hasLanguage = await publicFunction.mysqlQuery("Select IF(COUNT(*) > 0 ,true,false) as countLanguage From `attribute_category_language` Where attribute_category_id = " + SqlString.escape(item.attribute_id) + " and language = " + SqlString.escape(item.language));
				if(hasLanguage && hasLanguage.result == true && hasLanguage.data[0].countLanguage > 0) {
					let query = "Update `attribute_category_language` Set name = " + SqlString.escape(item.name) + ", updated_user_id = " + SqlString.escape(item.user_id) + " Where attribute_category_id = " + item.attribute_id + " and language = " + SqlString.escape(item.language);
					let result = await publicFunction.mysqlQuery(query);
					
					response.push({
						status: result.result,
						data:item,
						message: result.result != false ? "updated" : "not updated"
					});
				}
				else {
					let query = "INSERT INTO `attribute_category_language`(`attribute_category_id`,`name`,`language`,`created_user_id`) VALUES("+ SqlString.escape(item.attribute_category_id) +","+ SqlString.escape(item.name) +","+SqlString.escape(item.language)+","+item.user_id+")";
					let result = await publicFunction.mysqlQuery(query);

					response.push({
						status: result.result,
						data:item,
						message: result.result != false ? "created" : "not created"
					});
				}
			}
			else {
				response.push({
					status: false,
					data:item,
					message: "missing_information"
				});
			}
		}

		res.send({"status":200 , "success": "success" , "response": response});
	}
	else {
		res.send({"status":500 , "error": "missing_information" , "response": "Missing information."});
	}
});

// Attribute Category End

module.exports = router;