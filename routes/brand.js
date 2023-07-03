var express = require('express');
var router = express.Router();
const passport = require('passport');
const CryptoJS = require("crypto-js");
const SqlString = require('sqlstring');
const { v4: uuidv4 } = require('uuid');
var publicFunction = require('./public.js');

router.get('/getAll', passport.authenticate('admin-rule', { session: false }) , function(req, res, next) {
    var query = `SELECT id, name,logo,seo_link,seo_title,seo_keywords,seo_description,is_active,updatedAt,createdAt FROM brand Where is_deleted = 0`

	connection.query(query, function (results, error, fields) {
		if(error){
			res.send({"status": 500, "error": error.sqlMessage, "response": null}); 
	  	}
	  	else {
            res.send({"status": 200, "success": "success", "response": results});
  		}
  	});
});

router.post('/getBrandByFilter', passport.authenticate('admin-rule', { session: false }) , function(req, res, next) {
    var search = req.body.search, start=req.body?.paging?.start || 0, end=req.body?.paging?.end || 20, query, queryTotal;
    query = `SELECT id, name,logo,seo_link,seo_title,seo_keywords,seo_description,is_active,updatedAt,createdAt FROM brand Where is_deleted = 0`;
    if(publicFunction.isNullOrEmpty(search))
        query += ` and LOWER(name) LIKE LOWER('%${search}%')`;

    query += ` LIMIT ${start},${end}`

    queryTotal = `SELECT COUNT(*) as total FROM brand Where is_deleted = 0`;
    if(publicFunction.isNullOrEmpty(search))
        queryTotal += `and LOWER(name) LIKE LOWER('%${search}%')`;

	connection.query(query, function (results, error, fields) {
		if(error){
			res.send({"status": 500, "error": error.sqlMessage, "response": null}); 
	  	}
	  	else {
            connection.query(query, function (resultTotal, errorTotal, fieldTotal) {
                if(errorTotal){
                    res.send({"status": 500, "error": errorTotal.sqlMessage, "response": null}); 
                }
                else {
                    res.send({"status": 200, "success": "success", "response": {brands:results , total:resultTotal[0].total , start:start , end:end}});
                }
            });
  		}
  	});
});

router.post('/' , function(req, res, next) {
    var query,queryTotal,start=req.body?.paging?.start || 0, end=req.body?.paging?.end || 20;
    query = `SELECT id, name,logo,seo_link,seo_title,seo_keywords,seo_description,updatedAt,createdAt FROM brand Where is_deleted = 0 and is_active = 1 LIMIT ${start},${end}`
    queryTotal = `SELECT COUNT(*) as total FROM brand Where is_deleted = 0 and is_active = 1`

	connection.query(query, function (results, error, fields) {
		if(error){
			res.send({"status": 500, "error": error.sqlMessage, "response": null}); 
	  	}
	  	else {
            connection.query(queryTotal, function (resultTotal, errorTotal, fields) {
                if(errorTotal)
                    res.send({"status": 500, "error": errorTotal.sqlMessage, "response": null}); 
                else
                    res.send({"status": 200, "success": "success", "response": {brands:results , total:resultTotal[0].total , start:start , end:end}});
            });
  		}
  	});
});

router.get('/:id', passport.authenticate('admin-rule', { session: false }) , function(req, res, next) {
    var query,id = req.params.id
    query = `SELECT id, name,logo,seo_link,seo_title,seo_keywords,seo_description,updatedAt,createdAt FROM brand Where id = ${id} and is_deleted = 0`

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
	var brands = req.body;

	if(brands) {
        let response = [];
        for (let index = 0; index < brands.length; index++) {
            var item = brands[index];
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

                let seo_link;
                seo_link = publicFunction.toSnakeCase(publicFunction.convertTurkishCharacter(item.name));
                let brandBySeoLink = await publicFunction.mysqlQuery("Select * From `brand` Where seo_link = " + SqlString.escape(seo_link));

                if(brandBySeoLink && brandBySeoLink.result == true && brandBySeoLink.data.length > 0) {
                    seo_link = seo_link + "-" + uuidv4();;
                }

                let result = await publicFunction.mysqlQuery("INSERT INTO `brand`(`name`,`logo`,`seo_link`,`seo_title`,`seo_keywords`,`seo_description`,`is_active`,`created_user_id`) VALUES("+SqlString.escape(item.name)+","+SqlString.escape(item.logo)+","+SqlString.escape(seo_link)+","+SqlString.escape(item.seo_title)+","+SqlString.escape(item.seo_keywords)+","+SqlString.escape(item.seo_description) + ","+SqlString.escape(item.is_active) + ","+SqlString.escape(item.user_id) + ")");

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

router.post('/delete/',passport.authenticate('admin-rule', { session: false }) , async function(req , res , next) {
	var brands = req.body;

	if(brands) {
        let response = [];
        for (let index = 0; index < brands.length; index++) {
            var item = brands[index];
            if(item) {
                if(!item.id) {
                    response.push({
                        status: false,
                        data:item,
                        message: "id is incorrect"
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

                var query = "Update `brand` Set is_deleted=1, deletedAt=now(),deleted_user_id="+SqlString.escape(item.user_id)+" Where id=" + item.id;
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

router.post('/update',passport.authenticate('admin-rule', { session: false }),async function(req , res , next){
	var brands = req.body;

	if(brands) {
        let response = [];
        for (let index = 0; index < brands.length; index++) {
            var item = brands[index];
            if(item) {

                if(!item.id) {
                    response.push({
                        status: false,
                        data:item,
                        message: "id is incorrect"
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

                var query = "Update `brand` Set name="+SqlString.escape(item.name)+", logo="+SqlString.escape(item.logo)+", seo_title="+SqlString.escape(item.seo_title)+",seo_keywords="+SqlString.escape(item.seo_keywords)+",seo_description="+SqlString.escape(item.seo_description)+",is_active="+SqlString.escape(item.is_active)+", updated_user_id="+SqlString.escape(item.user_id)+" Where id=" + item.id;
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

router.get('/updateActive/:id/:active',passport.authenticate('admin-rule', { session: false }), function(req , res , next){
	let id = req.params.id;
    let active = req.params.active;

	if(id && active) {
		var query = "Update `brand` Set is_active="+ SqlString.escape(active) +" Where id=" + id;
		connection.query(query , function(results, error, fields0){
			if(error){
				res.send({"status":500 , "error": error.sqlMessage , "response": "Brand no updated."});
			}
			else{
				res.send({"status":200 , "success": "success" , "Brand" : results, "Fields": fields0, "response": "Brand updated."});
			}
		});
	}
	else {
		res.send({"status":500 , "error": "missing_information" , "response": "Missing information."});
	}
});

router.post('/updateLanguage',passport.authenticate('admin-rule', { session: false }), async function(req , res , next){
    let brandLanguages = req.body;

	if(brandLanguages && brandLanguages.length > 0) {
		let response = [];
		for (let index = 0; index < brandLanguages.length; index++) {
			const item = brandLanguages[index];
			if(item.brand_id && item.language) {
				let hasLanguage = await publicFunction.mysqlQuery("Select IF(COUNT(*) > 0 ,true,false) as countLanguage From `category_language` Where brand_id = " + SqlString.escape(item.brand_id) + " and language = " + SqlString.escape(item.language));
				if(hasLanguage && hasLanguage.result == true && hasLanguage.data[0].countLanguage > 0) {
					let query = "Update `category_language` Set title = " + SqlString.escape(item.title) + ", short_description = " + SqlString.escape(item.short_description) + ", description = " + SqlString.escape(item.description) + ", seo_title = " + SqlString.escape(item.seo_title) + ", seo_keywords = " + SqlString.escape(item.seo_keywords) + ", seo_description = " + SqlString.escape(item.seo_description) + ", updated_user_id = " + SqlString.escape(item.user_id) + " Where brand_id = " + item.brand_id + " and language = " + SqlString.escape(item.language);
					let result = await publicFunction.mysqlQuery(query);
					
					response.push({
						status: result.result,
						brand_id:item.brand_id,
						language:item.language,
						process:"update",
						message: result.result != false ? "updated" : "not updated"
					});
				}
				else {
					let query = "INSERT INTO `category_language`(`brand_id`,`title`,`short_description`,`description`,`seo_title`,`seo_keywords`,`seo_description`,`language`,`created_user_id`) VALUES("+ item.brand_id +","+ SqlString.escape(item.title) +","+SqlString.escape(item.short_description)+","+SqlString.escape(item.description)+","+SqlString.escape(item.seo_title)+","+SqlString.escape(item.seo_keywords)+","+SqlString.escape(item.seo_description)+","+SqlString.escape(item.language)+","+item.user_id+")";
					let result = await publicFunction.mysqlQuery(query);

					response.push({
						status: result.result,
						brand_id:item.brand_id,
						language:item.language,
						process:"create",
						message: result.result != false ? "created" : "not created"
					});
				}
			}
			else {
				response.push({
					status: false,
					brand_id:item.brand_id,
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

module.exports = router;