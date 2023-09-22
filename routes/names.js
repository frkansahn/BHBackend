var express = require('express');
var router = express.Router();
const passport = require('passport');
const CryptoJS = require("crypto-js");
const SqlString = require('sqlstring');
const { v4: uuidv4 } = require('uuid');
var publicFunction = require('./public.js');

router.post('/', passport.authenticate('admin-rule', { session: false }) , function(req, res, next) {
	let start=req.body?.paging?.start || 0, end=req.body?.paging?.end || 20 ;
    var query = `SELECT * FROM names Where is_deleted = 0 LIMIT ${start},${end};`;

	var queryTotal = `
		Select 
			COUNT(DISTINCT id) as total
		From names
		Where is_deleted=0
	`

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

					  if(results.sss) {
						  results = results.map(result => {
							  	if(result.sss)
								  result.sss = JSON.parse(result.sss)

								if(result.il_il)
								  result.il_il = JSON.parse(result.il_il)
		  
							  	return result
						  });
					  }

					res.send({"status": 200, "success": "success","Fields":fields, "response": {names:results , total:resultTotal[0].total , start:start , end:end}});
				  }
			});
		}
  	});
});

router.get('/:seo_link', function(req, res, next) {
	let seo_link = req.params.seo_link;
	let query = 'Select * From names WHERE is_deleted = 0 and is_active=1 and seo_link=' + SqlString.escape(seo_link);
	connection.query(query , async function (results, error, fields) {
		if(error){
			res.send({"status": 500, "error": error, "response": null}); 
	  	} else {
			if(results && results.length > 0) {
				results = results[0];
			}

			if(results.sss) {
				results.sss = JSON.parse(results.sss);
			}

			if(results.il_il) {
				results.il_il = JSON.parse(results.il_il);
			}

	  		res.send({"status": 200, "success": "success", "response": results});
  		}
  	});
});

router.get('/getNameForAdmin/:id', passport.authenticate('admin-rule', { session: false }) , function(req, res, next) {
	let id = req.params.id;
	let query = 'Select * From names WHERE is_deleted = 0 and id=' + SqlString.escape(id);
	connection.query(query , async function (results, error, fields) {
		if(error){
			res.send({"status": 500, "error": error, "response": null}); 
	  	} else {
			if(results && results.length > 0) {
				results = results[0];
			}

			if(results.sss) {
				results.sss = JSON.parse(results.sss);
			}

			if(results.il_il) {
				results.il_il = JSON.parse(results.il_il);
			}

	  		res.send({"status": 200, "success": "success", "response": results});
  		}
  	});
});

router.post('/add', passport.authenticate('admin-rule', { session: false }) , async function(req , res , next){
	var name = req.body, user = await req.user;

	let blogCategoryByseoLink = await publicFunction.mysqlQuery("Select * From `blog_category` Where is_deleted = 0 and seo_link = " + SqlString.escape(name.seo_link));
	if(blogCategoryByseoLink && blogCategoryByseoLink.data.length > 0) {
		name.seo_link = name.seo_link + "-" + uuidv4();
	}

	let blogByseoLink = await publicFunction.mysqlQuery("Select * From `blogs` Where is_deleted = 0 and seo_link = " + SqlString.escape(name.seo_link));
	if(blogByseoLink && blogByseoLink.data.length > 0) {
		name.seo_link = name.seo_link + "-" + uuidv4();
	}

	let contentByseoLink = await publicFunction.mysqlQuery("Select * From `contents` Where seo_link = " + SqlString.escape(name.seo_link));
	if(contentByseoLink && contentByseoLink.data.length > 0) {
		name.seo_link = name.seo_link + "-" + uuidv4();
	}

	let nameByseoLink = await publicFunction.mysqlQuery("Select * From `names` Where is_deleted = 0 and seo_link = " + SqlString.escape(name.seo_link));
	if(nameByseoLink && nameByseoLink.data.length > 0) {
		name.seo_link = name.seo_link + "-" + uuidv4();
	}

	if(name) {
		var query = `Insert Into names(
			name,
			seo_link,
			ismin_anlami_1,
			ismin_anlami_2,
			tdk_anlami,
			ismin_cinsiyeti,
			ismin_kokeni,
			tellaffuz_zorluk_derecesi,
			ismin_benzeyenleri,
			uyumlu_isimler,
			ismin_sembolleri,
			ismin_rengi,
			sansli_numaralar,
			sansli_gunu,
			sansli_ayi,
			isme_sahip_unluler,
			kuranda_geciyormu,
			caizmi,
			ismin_istatikleri,
			turkiyede_kac_kisi_var,
			turkiyede_siralama,
			kullanim_sikligi,
			karakter_ozellikleri,
			ismin_notasyonu,
			tdk_notasyonu,
			hava_kuvvetleri_notasyonu,
			kara_kuvvetleri_notasyonu,
			deniz_kuvvetleri_notasyonu,
			harf_analizi,
			numeroloji_analizi,
			numeroloji_ozellikleri,
			kader_sayisi_analizi,
			sss,
			html,
			is_active,
			seo_title,
			seo_description,
			arapca,
			cince,
			japonca,
			korece,
			il_il
		) 
		Values(
			${SqlString.escape(name.name)},
			${SqlString.escape(name.seo_link)},
			${SqlString.escape(name.ismin_anlami_1)},
			${SqlString.escape(name.ismin_anlami_2)},
			${SqlString.escape(name.tdk_anlami)},
			${SqlString.escape(name.ismin_cinsiyeti)},
			${SqlString.escape(name.ismin_kokeni)},
			${SqlString.escape(name.tellaffuz_zorluk_derecesi)},
			${SqlString.escape(name.ismin_benzeyenleri)},
			${SqlString.escape(name.uyumlu_isimler)},
			${SqlString.escape(name.ismin_sembolleri)},
			${SqlString.escape(name.ismin_rengi)},
			${SqlString.escape(name.sansli_numaralar)},
			${SqlString.escape(name.sansli_gunu)},
			${SqlString.escape(name.sansli_ayi)},
			${SqlString.escape(name.isme_sahip_unluler)},
			${SqlString.escape(name.kuranda_geciyormu)},
			${SqlString.escape(name.caizmi)},
			${SqlString.escape(name.ismin_istatikleri)},
			${SqlString.escape(name.turkiyede_kac_kisi_var)},
			${SqlString.escape(name.turkiyede_siralama)},
			${SqlString.escape(name.kullanim_sikligi)},
			${SqlString.escape(name.karakter_ozellikleri)},
			${SqlString.escape(name.ismin_notasyonu)},
			${SqlString.escape(name.tdk_notasyonu)},
			${SqlString.escape(name.hava_kuvvetleri_notasyonu)},
			${SqlString.escape(name.kara_kuvvetleri_notasyonu)},
			${SqlString.escape(name.deniz_kuvvetleri_notasyonu)},
			${SqlString.escape(name.harf_analizi)},
			${SqlString.escape(name.numeroloji_analizi)},
			${SqlString.escape(name.numeroloji_ozellikleri)},
			${SqlString.escape(name.kader_sayisi_analizi)},
			${SqlString.escape(JSON.stringify(name.sss))},
			${SqlString.escape(name.html)},
			${SqlString.escape(name.is_active)},
			${SqlString.escape(name.seo_title)},
			${SqlString.escape(name.seo_description)},
			${SqlString.escape(name.arapca)},
			${SqlString.escape(name.cince)},
			${SqlString.escape(name.japonca)},
			${SqlString.escape(name.korece)},
			${SqlString.escape(JSON.stringify(name.il_il))}
		)`;
		
		connection.query(query, function(results, error, fields){
			if(error)
			{
				res.send({ error: error.sqlMessage, code: 'error', message: 'Name not added.' });
			}
			else
			{
				name['id'] = results?.insertId;
				res.send({ success: "success", code: 'category_added' , data: name, message: 'Name added.'});
			}	
		});	
	}
	else {
		res.send({"status":500 , "error": "missing_information" , "response": "Missing information."});
	}
});

router.post('/delete',passport.authenticate('admin-rule', { session: false }) , async function(req , res , next) {
    var name  = req.body;

	if(name) {
		connection.query("Update `names` Set is_deleted=1 Where id =" + name.id , function(results, error , fields) {
			if(error){
				res.send({"status":500 , "error": error.sqlMessage , "response": "Name no deleted."});
			}
			else{
				res.send({"status":200 , "success": "success" ,"Result":results,"Fields":fields, "response": "Name deleted."});
			}
		})
	}
	else {
		res.send({"status":200, code:"there_is_product", "success": "unsuccess", "message": "There are products belonging to the Name."});
	}
	
});

router.post('/update/',passport.authenticate('admin-rule', { session: false }),async function(req , res , next){
	var name  = req.body, user = await req.user;

	if(name) {
		let nameData;
		let nameById = await publicFunction.mysqlQuery("Select * From `blog_category` Where id = " + SqlString.escape(name.id));

		if(nameById && nameById.data && nameById.data.length > 0) {
			nameData = nameById.data[0];
			if(name.seo_link != nameData.seo_link) {

				let nameBySeoLink = await publicFunction.mysqlQuery(`Select * From blog_category Where is_deleted = 0 and id != ${SqlString.escape(name.id)} and seo_link = ${SqlString.escape(name.seo_link)}`);
				if(nameBySeoLink && nameBySeoLink.data && nameBySeoLink.data.length > 0) {
					name.seo_link = name.seo_link + "-" + uuidv4();
				}

				let blogCategoryBySeoLink = await publicFunction.mysqlQuery(`Select * From blog_category Where is_deleted = 0 and seo_link = ${SqlString.escape(name.seo_link)}`);
				if(blogCategoryBySeoLink && blogCategoryBySeoLink.data && blogCategoryBySeoLink.data.length > 0) {
					name.seo_link = name.seo_link + "-" + uuidv4();
				}

				let blogByseoLink = await publicFunction.mysqlQuery("Select * From `blogs` Where is_deleted = 0 and seo_link = " + SqlString.escape(name.seo_link));
				if(blogByseoLink && blogByseoLink.data && blogByseoLink.data.length > 0) {
					name.seo_link = name.seo_link + "-" + uuidv4();
				}

				let contentByseoLink = await publicFunction.mysqlQuery("Select * From `contents` Where seo_link = " + SqlString.escape(name.seo_link));
				if(contentByseoLink && contentByseoLink.data.length > 0) {
					name.seo_link = name.seo_link + "-" + uuidv4();
				}
			}
		}		

		var query = `
			Update names Set 
				name = ${SqlString.escape(name.name)},
				seo_link = ${SqlString.escape(name.seo_link)},
				ismin_anlami_1 = ${SqlString.escape(name.ismin_anlami_1)},
				ismin_anlami_2 = ${SqlString.escape(name.ismin_anlami_2)},
				tdk_anlami = ${SqlString.escape(name.tdk_anlami)},
				ismin_cinsiyeti = ${SqlString.escape(name.ismin_cinsiyeti)},
				ismin_kokeni = ${SqlString.escape(name.ismin_kokeni)},
				tellaffuz_zorluk_derecesi = ${SqlString.escape(name.tellaffuz_zorluk_derecesi)},
				ismin_benzeyenleri = ${SqlString.escape(name.ismin_benzeyenleri)},
				uyumlu_isimler = ${SqlString.escape(name.uyumlu_isimler)},
				ismin_sembolleri = ${SqlString.escape(name.ismin_sembolleri)},
				ismin_rengi = ${SqlString.escape(name.ismin_rengi)},
				sansli_numaralar = ${SqlString.escape(name.sansli_numaralar)},
				sansli_gunu = ${SqlString.escape(name.sansli_gunu)},
				sansli_ayi = ${SqlString.escape(name.sansli_ayi)},
				isme_sahip_unluler = ${SqlString.escape(name.isme_sahip_unluler)},
				kuranda_geciyormu = ${SqlString.escape(name.kuranda_geciyormu)},
				caizmi = ${SqlString.escape(name.caizmi)},
				ismin_istatikleri = ${SqlString.escape(name.ismin_istatikleri)},
				turkiyede_kac_kisi_var = ${SqlString.escape(name.turkiyede_kac_kisi_var)},
				turkiyede_siralama = ${SqlString.escape(name.turkiyede_siralama)},
				kullanim_sikligi = ${SqlString.escape(name.kullanim_sikligi)},
				karakter_ozellikleri = ${SqlString.escape(name.karakter_ozellikleri)},
				ismin_notasyonu = ${SqlString.escape(name.ismin_notasyonu)},
				tdk_notasyonu = ${SqlString.escape(name.tdk_notasyonu)},
				hava_kuvvetleri_notasyonu = ${SqlString.escape(name.hava_kuvvetleri_notasyonu)},
				kara_kuvvetleri_notasyonu = ${SqlString.escape(name.kara_kuvvetleri_notasyonu)},
				deniz_kuvvetleri_notasyonu = ${SqlString.escape(name.deniz_kuvvetleri_notasyonu)},
				harf_analizi = ${SqlString.escape(name.harf_analizi)},
				numeroloji_analizi = ${SqlString.escape(name.numeroloji_analizi)},
				numeroloji_ozellikleri = ${SqlString.escape(name.numeroloji_ozellikleri)},
				kader_sayisi_analizi = ${SqlString.escape(name.kader_sayisi_analizi)},
				sss = ${SqlString.escape(JSON.stringify(name.sss))},
				html = ${SqlString.escape(name.html)},
				is_active = ${SqlString.escape(name.is_active)},
				seo_title = ${SqlString.escape(name.seo_title)},
				seo_description = ${SqlString.escape(name.seo_description)},
				arapca = ${SqlString.escape(name.arapca)},
				cince = ${SqlString.escape(name.cince)},
				japonca = ${SqlString.escape(name.japonca)},
				korece = ${SqlString.escape(name.korece)},
				il_il = ${SqlString.escape(JSON.stringify(name.il_il))}
			Where id= ${name.id}
		`;
		connection.query(query , function(results, error, fields0){
			if(error){
				res.send({"status":500 , "error": error.sqlMessage , "response": "Name no updated."});
			}
			else{
				res.send({"status":200 , "success": "success" , "Menu" : results,  "response": "Name updated"});
			}
		});
	}
	else {
		res.send({"status":500 , "error": "missing_information" , "response": "Missing information."});
	}
});

router.post('/controlLink/:seo_link' , passport.authenticate('admin-rule', { session: false }) , async function(req , res , next){
	var is_available = true, seo_link  = req.params.seo_link , name_id = req.body.id | 0;

	let nameByseoLink = await publicFunction.mysqlQuery(`Select * From names Where is_deleted = 0 and id != ${SqlString.escape(name_id)} and seo_link = ${SqlString.escape(seo_link)}`);
	if(nameByseoLink && nameByseoLink.data && nameByseoLink.data.length > 0) {
		is_available = false;
	}
	
	let blogByseoLink = await publicFunction.mysqlQuery(`Select * From blogs Where is_deleted = 0 and seo_link = ${SqlString.escape(seo_link)}`);
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

router.post('/updateStatus', passport.authenticate('admin-rule', { session: false }) , function(req , res , next){
	var blog  = req.body;
	var query = "Update `names` Set is_active="+blog.is_active+" Where id=" + blog.id;
	connection.query(query , function(results, error, fields0){
		if(error){
			res.send({"status":500 , "error": error , "response": "blog no update."});
		}
		else{
			res.send({"status":200 , "success": "success" , "Ürün" : results, "Fields": fields0, "response": "blog updated."});
		}
	});
});

module.exports = router;