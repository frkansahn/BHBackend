var express = require('express');
var router = express.Router();
const passport = require('passport');
const SqlString = require('sqlstring');
const { v4: uuidv4 } = require('uuid');
var publicFunction = require('./public.js');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

router.get('/sitemap', async function(req, res, next) {
	var query = 'Select seo_link From blogs WHERE is_deleted = 0 and is_active = 1 LIMIT 50000';
	connection.query(query, function (results, error, fields) {
		if(error){
			res.send({"status": 500, "error": error, "response": null}); 
	  	}
	  	else {
	  		res.send({"status": 200, "success": "success", "response": results});
  		}
  	});
});

router.get('/category/sitemap', async function(req, res, next) {
	var query = 'Select seo_link From blog_category WHERE is_deleted = 0 and is_active = 1 LIMIT 50000';
	connection.query(query, function (results, error, fields) {
		if(error){
			res.send({"status": 500, "error": error, "response": null}); 
	  	}
	  	else {
	  		res.send({"status": 200, "success": "success", "response": results});
  		}
  	});
});

router.get('/otherBlogs/:seo_link', async function(req, res, next) {
	let seo_link = req.params.seo_link;
	var query = 'Select b.id , bc.category_name , bc.description as category_description  ,  bc.seo_link as category_seo_link  , b.subject , b.description , b.sections , b.short_description , b.image,b.showcase_image , b.createdAt , b.updatedAt , b.created_user_id , b.seo_link , b.seo_title , b.seo_keywords , b.seo_description , b.sort , b.is_active , b.is_container From `blogs` as b INNER JOIN `blog_category` as bc ON b.blog_category_id = bc.id WHERE b.is_deleted = 0 and b.is_active = 1 and b.seo_link != ' + SqlString.escape(seo_link) + ' ORDER BY b.sort , b.createdAt desc LIMIT 12;';
	connection.query(query, function (results, error, fields) {
		if(error){
			res.send({"status": 500, "error": error, "response": null}); 
	  	}
	  	else {
	  		res.send({"status": 200, "success": "success", "response": results});
  		}
  	});
});

router.post('/get_most_read', function(req, res, next) {
	var start = req.body.paging?.start || 0, end = req.body.paging?.end || 6
	var query = 'Select b.id , bc.category_name , bc.description as category_description , bc.seo_link as category_seo_link , b.subject , b.description , b.sections , b.short_description , b.image , b.showcase_image , b.createdAt , b.updatedAt , b.created_user_id , b.seo_link , b.seo_title , b.seo_keywords , b.seo_description , b.sort , b.is_active , b.is_container , b.viewed , b.gallery From `blogs` as b INNER JOIN `blog_category` as bc ON b.blog_category_id = bc.id WHERE b.is_deleted = 0 and b.is_active = 1 and b.viewed > 0 ORDER BY b.viewed desc , b.createdAt asc';
	query += ` LIMIT ${start},${end}` 
	
	var queryTotal = `
		Select 
			COUNT(DISTINCT b.id) as total
		From blogs as b 
		INNER JOIN blog_category as bc 
		ON b.blog_category_id = bc.id 
		WHERE b.is_deleted = 0 and b.is_active = 1 and b.viewed > 0
	`
	
	connection.query(query, function (results, error, fields) {
		if(error){
			res.send({"status": 500, "error": error, "response": null}); 
	  	}
	  	else {
			connection.query(queryTotal, function (resultTotal, errorTotal) {
				if(errorTotal){
					res.send({"status": 500, "error": errorTotal.sqlMessage, "response": null}); 
				  }
				  else {

					res.send({"status": 200, "success": "success","Fields":fields, "response": {blogs:results , total:resultTotal[0].total , start:start , end:end}});
				  }
			});
  		}
  	});
});

router.post('/get_new_blogs', function(req, res, next) {
	var start = req.body.paging?.start || 0, end = req.body.paging?.end || 6;
	var query = 'Select b.id , bc.category_name , bc.description as category_description , bc.seo_link as category_seo_link , b.subject , b.description , b.sections , b.short_description , b.image , b.showcase_image , b.createdAt , b.updatedAt , b.created_user_id , b.seo_link , b.seo_title , b.seo_keywords , b.seo_description , b.sort , b.is_active , b.is_container , b.viewed , b.gallery From `blogs` as b INNER JOIN `blog_category` as bc ON b.blog_category_id = bc.id WHERE b.is_deleted = 0 and b.is_active = 1 ORDER BY b.createdAt desc';
	query += ` LIMIT ${start},${end}`;

	var queryTotal = `
		Select 
			COUNT(DISTINCT b.id) as total
		From blogs as b 
		INNER JOIN blog_category as bc 
		ON b.blog_category_id = bc.id 
		WHERE b.is_deleted = 0 and b.is_active = 1
	`

	connection.query(query, function (results, error, fields) {
		if(error){
			res.send({"status": 500, "error": error, "response": null}); 
	  	}
	  	else {
			connection.query(queryTotal, function (resultTotal, errorTotal) {
				if(errorTotal){
					res.send({"status": 500, "error": errorTotal.sqlMessage, "response": null}); 
				  }
				  else {

					res.send({"status": 200, "success": "success","Fields":fields, "response": {blogs:results , total:resultTotal[0].total , start:start , end:end}});
				  }
			});
  		}
  	});
});

router.get('/active_all_by_category/:seo_link', function(req, res, next) {
	let seo_link = req.params.seo_link;
	var query = 'Select b.id , bc.category_name , bc.description as category_description , bc.seo_link as category_seo_link , b.subject , b.description , b.sections , b.short_description , b.image , b.showcase_image , b.createdAt , b.updatedAt , b.created_user_id , b.seo_link , b.seo_title , b.seo_keywords , b.seo_description , b.sort , b.is_container , b.gallery From `blogs` as b INNER JOIN `blog_category` as bc ON b.blog_category_id = bc.id WHERE b.is_deleted = 0 and b.is_active = 1 and bc.seo_link='+ seo_link +' ORDER BY b.sort desc';
	connection.query(query, function (results, error, fields) {
		if(error){
			res.send({"status": 500, "error": error, "response": null}); 
	  	}
	  	else {
	  		res.send({"status": 200, "success": "success", "response": results});
  		}
  	});
});

router.post('/get_blogs_by_category', async function(req, res, next) {
	var query,seo_link = req.body.seo_link, start = req.body.paging.start || 0, end = req.body.paging.end || 10 , sort = req.body.sort || 'new';

	query = `
		Select 
			b.id , 
			(SELECT category_name From blog_category Where id = b.blog_category_id) as category_name,
			(SELECT description From blog_category Where id = b.blog_category_id) as description,
			(SELECT seo_link From blog_category Where id = b.blog_category_id) as category_seo_link,
			b.subject , 
			b.description , 
			b.sections , 
			b.short_description , 
			b.image , 
			b.showcase_image , 
			b.createdAt , 
			b.updatedAt , 
			b.created_user_id , 
			b.seo_link , 
			b.seo_title , 
			b.seo_keywords , 
			b.seo_description , 
			b.sort , 
			b.is_container , 
			b.gallery 
		From blogs as b 
		WHERE b.is_deleted = 0 and b.is_active = 1 and b.blog_category_id IN(
			Select DISTINCT id 
			From blog_category as b_c 
			Where (
				CASE WHEN (
					Select parent_id 
					From blog_category 
					Where seo_link = ${SqlString.escape(seo_link)}
				) IS NULL 
				THEN 
					b_c.id = (
						Select id 
						From blog_category 
						Where seo_link = ${SqlString.escape(seo_link)}
					) 
					or 
					b_c.parent_id = (
						Select id 
						From blog_category 
						Where seo_link = ${SqlString.escape(seo_link)}
					) 
				ELSE 
					b_c.id = (
						Select id 
						From blog_category 
						Where seo_link = ${SqlString.escape(seo_link)}
					)
				END
			) 
		)
	`;

	if(sort == 'new')
		query += ` ORDER BY b.createdAt desc `;
	else if(sort == 'popular')
		query += ` ORDER BY b.viewed desc `;

	query += ` LIMIT ${start},${end} `;

	var queryTotal = `
		Select 
			COUNT(DISTINCT b.id) as total 
		From blogs as b 
		WHERE b.is_deleted = 0 and b.is_active = 1 and b.blog_category_id IN(
			Select DISTINCT id 
			From blog_category as b_c 
			Where (
				CASE WHEN (
					Select parent_id 
					From blog_category 
					Where seo_link = ${SqlString.escape(seo_link)}
				) IS NULL 
				THEN 
				b_c.id = (
					Select id 
					From blog_category 
					Where seo_link = ${SqlString.escape(seo_link)}
				) 
				or 
				b_c.parent_id = (
					Select id 
					From blog_category 
					Where seo_link = ${SqlString.escape(seo_link)}
				) 
				ELSE 
					b_c.id = (
						Select id 
						From blog_category 
						Where seo_link = ${SqlString.escape(seo_link)}
					)
				END
			) 
		)
	`
	
	connection.query(query, function (results, error, fields) {
		if(error){
			res.send({"status": 500, "error": error, "response": null}); 
	  	}
	  	else {
			connection.query(queryTotal, function (resultTotal, errorTotal) {
				if(errorTotal){
					res.send({"status": 500, "error": errorTotal.sqlMessage, "response": null}); 
				  }
				  else {

					res.send({"status": 200, "success": "success", "response": {blogs:results , total:resultTotal[0].total , start:start , end:end}});
				  }
			});
  		}
  	});
});

router.get('/:seo_link', function(req, res, next) {
	let seo_link = req.params.seo_link;
	let blogQuery = 'Select b.id , bc.id as category_id , bc.category_name , bc.description as category_description , bc.seo_link as category_seo_link  , b.subject , b.description , b.sections , b.short_description , b.image , b.showcase_image , b.createdAt , b.updatedAt , b.created_user_id , b.seo_link , b.seo_title , b.seo_keywords , b.seo_description , b.sort , b.is_active , b.is_container , b.gallery From `blogs` as b INNER JOIN `blog_category` as bc ON b.blog_category_id = bc.id';
	var query = blogQuery + ' WHERE b.is_deleted = 0 and b.is_active=1 and b.seo_link='+SqlString.escape(seo_link);
	connection.query(query , async function (results, error, fields) {
		if(error){
			res.send({"status": 500, "error": error, "response": null}); 
	  	} else {
			if(results && results.length > 0) {
				results = results[0];
			}

			if(results.sections) {
				results.sections = JSON.parse(results.sections);

				results["articleBody"] = "";
				results["images"] = [];

				if(results.image)
					results["images"].push('https://api.bebegimlehayat.com/Data/image/small/' + results.image + '.jpeg');

				for (let index = 0; index < results.sections.length; index++) {
					let section = results.sections[index];

					if(section.type == 'product')
					{
						let productResult = await publicFunction.mysqlQuery(publicFunction.productQueryById(section.value));

						if(productResult && productResult.result && productResult.data.length > 0) {
							section["product"] = productResult[0];
						}
					}

					

					const dom = new JSDOM(section.value);

					let images = dom.window.document.querySelectorAll("img");
					dom.window.document.querySelectorAll('script').forEach(x => x.remove());
					
					if(images) {
						for (let index = 0; index < images.length; index++) {
							const element = images[index];
							if(element.getAttribute("src").indexOf("http") > -1) {
								results["images"].push(element.getAttribute("src"));
							}
							else {
								results["images"].push('https://bebegimlehayat.com' + element.getAttribute("src"));
							}

							element.remove();
						}
						

						results["articleBody"] += dom.window.document.body.innerHTML.replace(/(<([^>]+)>)/gi, "");
					}
					else {
						results["articleBody"] += dom.window.document.body.innerHTML.replace(/(<([^>]+)>)/gi, "");
					}
					
				}


			}

			let otherBlogResult = await publicFunction.mysqlQuery(blogQuery + ` Where b.is_deleted = 0 and b.is_active = 1 and b.seo_link != ${SqlString.escape(seo_link)} and b.blog_category_id = ${SqlString.escape(results.category_id)} LIMIT 5`)

			if(otherBlogResult && otherBlogResult.result && otherBlogResult.data.length > 0) {
				results["otherBlogs"] = otherBlogResult.data;
			}
			else {
				let newBlogsResult = await publicFunction.mysqlQuery(`Select b.id , bc.category_name , bc.description as category_description , bc.seo_link as category_seo_link , b.subject , b.description , b.sections , b.short_description , b.image , b.showcase_image , b.createdAt , b.updatedAt , b.created_user_id , b.seo_link , b.seo_title , b.seo_keywords , b.seo_description , b.sort , b.is_active , b.is_container , b.viewed , b.gallery From blogs as b INNER JOIN blog_category as bc ON b.blog_category_id = bc.id WHERE b.seo_link != ${SqlString.escape(seo_link)} and b.is_deleted = 0 and b.is_active = 1 ORDER BY b.createdAt asc LIMIT 5;`);
				if(newBlogsResult && newBlogsResult.result && newBlogsResult.data.length > 0) {
					results["otherBlogs"] = newBlogsResult.data;
				}
			}

	  		res.send({"status": 200, "success": "success","Fields":fields, "response": results , "otherBlogResult":otherBlogResult});
  		}
  	});
});

router.post('/getAllForAdmin', passport.authenticate('admin-rule', { session: false }) , function(req, res, next) {
	let start=req.body?.paging?.start || 0, end=req.body?.paging?.end || 20;
	var query = `
		Select 
			b.id , 
			bc.id as category_id , 
			bc.category_name , 
			bc.description as category_description , 
			b.subject , 
			b.description , 
			b.sections , 
			b.short_description , 
			b.image , 
			b.showcase_image,
			b.createdAt , 
			b.updatedAt , 
			b.created_user_id , 
			(SELECT u.name From users as u Where u.id = b.created_user_id) as created_user_name,
			b.seo_link , 
			b.seo_title , 
			b.seo_keywords , 
			b.seo_description , 
			b.sort , 
			b.is_active , 
			b.is_container , 
			b.gallery 
		From blogs as b 
		INNER JOIN blog_category as bc 
		ON b.blog_category_id = bc.id
		Where b.is_deleted=0 
		LIMIT ${start},${end}
	`;

	var queryTotal = `
		Select 
			COUNT(DISTINCT b.id) as total
		From blogs as b 
		INNER JOIN blog_category as bc 
		ON b.blog_category_id = bc.id
		Where b.is_deleted=0
	`

	connection.query(query , function (results, error, fields) {
		if(error){
			res.send({"status": 500, "error": error, "response": null}); 
	  	} else {
			connection.query(queryTotal, function (resultTotal, errorTotal) {
				if(errorTotal){
					res.send({"status": 500, "error": errorTotal.sqlMessage, "response": null}); 
				  }
				  else {

					res.send({"status": 200, "success": "success","Fields":fields, "response": {blogs:results , total:resultTotal[0].total , start:start , end:end}});
				  }
			});
  		}
  	});
});

router.get('/getByIdForAdmin/:id', passport.authenticate('admin-rule', { session: false }) , function(req, res, next) {
	let id = req.params.id;
	var query = `
		Select 
			b.id , 
			bc.id as category_id , 
			bc.category_name , 
			bc.description as category_description, 
			b.subject , 
			b.description , 
			b.sections , 
			b.short_description , 
			b.image , 
			b.showcase_image,
			b.createdAt , 
			b.updatedAt , 
			b.created_user_id , 
			(SELECT u.name From users as u Where u.id = b.created_user_id) as created_user_name,
			b.seo_link , 
			b.seo_title , 
			b.seo_keywords , 
			b.seo_description , 
			b.sort , 
			b.is_active , 
			b.is_container , 
			b.gallery 
		From blogs as b 
		INNER JOIN blog_category as bc 
		ON b.blog_category_id = bc.id 
		WHERE b.is_deleted=0 and b.id= ${id}
	`;
	connection.query(query , function (results, error, fields) {
		if(error){
			res.send({"status": 500, "error": error, "response": null}); 
	  	} else {
			if(results && results.length > 0) {
				results = results[0];
			}

			if(results.sections) {
				results.sections = JSON.parse(results.sections);
			}

			if(results.gallery) {
				results.gallery = JSON.parse(results.gallery);
			}

	  		res.send({"status": 200, "success": "success","Fields":fields, "response": results});
  		}
  	});
});

router.post('/add' , passport.authenticate('admin-rule', { session: false }) ,async function(req , res , next){
	var blog = req.body, user = await req.user;

	let blogByseoLink = await publicFunction.mysqlQuery("Select * From `blogs` Where seo_link = " + SqlString.escape(blog.seo_link));
	if(blogByseoLink && blogByseoLink.data.length > 0) {
		blog.seo_link = blog.seo_link + "-" + uuidv4();
	}

	let blogCategoryByseoLink = await publicFunction.mysqlQuery("Select * From `blog_category` Where seo_link = " + SqlString.escape(blog.seo_link));
	if(blogCategoryByseoLink && blogCategoryByseoLink.data.length > 0) {
		blog.seo_link = blog.seo_link + "-" + uuidv4();
	}

	let contentByseoLink = await publicFunction.mysqlQuery("Select * From `contents` Where seo_link = " + SqlString.escape(blog.seo_link));
	if(contentByseoLink && contentByseoLink.data.length > 0) {
		blog.seo_link = blog.seo_link + "-" + uuidv4();
	}

	var query = "INSERT INTO `blogs`(`blog_category_id`,`subject`,`description` , `sections`,`short_description`,`image`,`showcase_image`,`created_user_id`,`seo_link`,`seo_title`,`seo_keywords`,`seo_description`,`sort`,`is_active`,`is_container`,`gallery`) VALUES("+SqlString.escape(blog.category_id)+","+SqlString.escape(blog.subject)+","+SqlString.escape(blog.description)+","+SqlString.escape(JSON.stringify(blog.sections))+","+SqlString.escape(blog.short_description)+","+SqlString.escape(blog.image)+","+SqlString.escape(blog.showcase_image)+","+SqlString.escape(user.id)+","+SqlString.escape(blog.seo_link)+","+SqlString.escape(blog.seo_title)+","+SqlString.escape(blog.seo_keywords)+","+SqlString.escape(blog.seo_description)+","+SqlString.escape(blog.sort)+","+SqlString.escape(blog.is_active)+","+SqlString.escape(blog.is_container)+","+SqlString.escape(JSON.stringify(blog.gallery))+")";
	connection.query(query, function(results, error, fields){
		if(error)
		{
			res.send({ success: "unsuccess",error: error, message: 'blog no added.' });
		} 
		else
		{
			publicFunction.sitemapGenerator();
			res.send({ success: "success", response: results, message: 'blog added.'});
		}	
	});
});

router.get('/delete/:id' , passport.authenticate('admin-rule', { session: false }) , async function(req , res , next) {
	let id = req.params.id,user = await req.user;
	connection.query('Update blogs Set is_deleted=1,deletedAt=now(),deleted_user_id= '+SqlString.escape(user.id)+' Where id='+ id , function(results, error , fields) {
		if(error){
			res.send({"success": "unsuccess" , "status":500 , "error": error , "response": "blog no delete."});
		}
		else{
			res.send({"status":200 , "success": "success" ,"Result":results,"Fields":fields, "result": "blog deleted."});
		}
	})
});

router.post('/update/:id', passport.authenticate('admin-rule', { session: false }) , async function(req , res , next){
	let id = req.params.id, user= await req.user;
	var blog  = req.body;
		
	let blogByseoLink = await publicFunction.mysqlQuery(`Select * From blogs Where id != ${SqlString.escape(blog.id)} and seo_link = ${SqlString.escape(blog.seo_link)}`);
	if(blogByseoLink && blogByseoLink.data && blogByseoLink.data.length > 0 && blogByseoLink.data[0].id != blog.id) {
		blog.seo_link = blog.seo_link + "-" + uuidv4();
	}

	let blogCategoryBySeoLink = await publicFunction.mysqlQuery(`Select * From blog_category Where seo_link = ${SqlString.escape(blog.seo_link)}`);
	if(blogCategoryBySeoLink && blogCategoryBySeoLink.data && blogCategoryBySeoLink.data.length > 0) {
		blog.seo_link = blog.seo_link + "-" + uuidv4();
	}

	let contentByseoLink = await publicFunction.mysqlQuery("Select * From `contents` Where seo_link = " + SqlString.escape(blog.seo_link));
	if(contentByseoLink && contentByseoLink.data.length > 0) {
		blog.seo_link = blog.seo_link + "-" + uuidv4();
	}

	var query = "Update `blogs` Set subject="+SqlString.escape(blog.subject)+" , description="+SqlString.escape(blog.description)+", blog_category_id="+SqlString.escape(blog.category_id)+" , sections="+SqlString.escape(JSON.stringify(blog.sections))+" , short_description="+SqlString.escape(blog.short_description)+" , image="+SqlString.escape(blog.image)+", showcase_image="+SqlString.escape(blog.showcase_image)+" , seo_link="+SqlString.escape(blog.seo_link)+" , seo_title="+SqlString.escape(blog.seo_title)+" , seo_keywords="+SqlString.escape(blog.seo_keywords)+" , seo_description="+SqlString.escape(blog.seo_description)+" , sort="+SqlString.escape(blog.sort)+" , is_container="+SqlString.escape(blog.is_container)+" , gallery="+SqlString.escape(JSON.stringify(blog.gallery))+" Where id=" + id;
	connection.query(query , function(results, error, fields0){
		if(error){
			res.send({"status":500 , "error": error , "response": "blog no update."});
		}
		else{
			publicFunction.sitemapGenerator();
			res.send({"status":200 , "success": "success" , "Ürün" : results, "Fields": fields0, "response": "blog updated."});
		}
	});
});

router.post('/updateStatus', passport.authenticate('admin-rule', { session: false }) , function(req , res , next){
	var blog  = req.body;
	var query = "Update `blogs` Set is_active="+blog.is_active+" Where id=" + blog.id;
	connection.query(query , function(results, error, fields0){
		if(error){
			res.send({"status":500 , "error": error , "response": "blog no update."});
		}
		else{
			res.send({"status":200 , "success": "success" , "Ürün" : results, "Fields": fields0, "response": "blog updated."});
		}
	});
});

router.get('/viewed/:seo_link', function(req , res , next){
	let seo_link = req.params.seo_link;
	var query = "UPDATE `blogs` SET viewed = viewed+1 WHERE seo_link=" + SqlString.escape(seo_link);
	connection.query(query , function(results, error, fields0){
		if(error){
			res.send({response:{"status":500 , "error": error , "response": "blog no update."}});
		}
		else{
			res.send({response:{"status":200 , "success": "success" , "Ürün" : results, "Fields": fields0, "response": "blog updated."}});
		}
	});
});

router.post('/controlLink/:seo_link' , passport.authenticate('admin-rule', { session: false }) , async function(req , res , next){
	var is_available = true, seo_link  = req.params.seo_link , blog_id = req.body.id | 0;


	let blogByseoLink = await publicFunction.mysqlQuery(`Select * From blogs Where is_deleted = 0 and id != ${SqlString.escape(blog_id)} and seo_link = ${SqlString.escape(seo_link)}`);
	if(blogByseoLink && blogByseoLink.data && blogByseoLink.data.length > 0) {
		is_available = false;
	}

	let blogCategoryByseoLink = await publicFunction.mysqlQuery(`Select * From blog_category Where is_deleted = 0 and seo_link = ${SqlString.escape(seo_link)}`);
	if(blogCategoryByseoLink && blogCategoryByseoLink.data && blogCategoryByseoLink.data.length > 0) {
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
