var express = require('express');
var router = express.Router();
const passport = require('passport');
const CryptoJS = require("crypto-js");
const SqlString = require('sqlstring');
const { v4: uuidv4 } = require('uuid');
var publicFunction = require('./public.js');

router.get('/sitemap', async function(req, res, next) {
	var query = 'Select seo_link,updatedAt,createdAt From medicines WHERE is_active = 1 LIMIT 50000';
	connection.query(query, function (results, error, fields) {
		if(error){
			res.send({"status": 500, "error": error, "response": null}); 
	  	}
	  	else {
	  		res.send({"status": 200, "success": "success", "response": results});
  		}
  	});
});

router.post('/', passport.authenticate('admin-rule', { session: false }) , function(req, res, next) {
	let start=req.body?.paging?.start || 0, end=req.body?.paging?.end || 20 ;
    var query = `SELECT * FROM medicines Where is_deleted = 0 LIMIT ${start},${end};`;

	var queryTotal = `
		Select 
			COUNT(DISTINCT id) as total
		From medicines
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
					res.send({"status": 200, "success": "success","Fields":fields, "response": {medicines:results , total:resultTotal[0].total , start:start , end:end}});
				  }
			});
		}
  	});
});

router.get('/getMedicineDetail/:seo_link', function(req, res, next) {
	let seo_link = req.params.seo_link;
	let query = `Select * From medicines WHERE is_deleted = 0 and is_active=1 and seo_link= ${SqlString.escape(seo_link)}`;
	connection.query(query , async function (results, error, fields) {
		if(error){
			res.send({"status": 500, "error": error, "response": null}); 
	  	} else {
			if(results && results.length > 0) {
				results = results[0];
			}

			let otherMedicineResult = await publicFunction.mysqlQuery(`Select * From medicines WHERE is_deleted = 0 and is_active = 1 and seo_link != ${SqlString.escape(seo_link)} ORDER BY RAND() LIMIT 5`)

			if(otherMedicineResult && otherMedicineResult.result && otherMedicineResult.data.length > 0) {
				results["otherMedicines"] = otherMedicineResult.data;
			}

	  		res.send({"status": 200, "success": "success", "response": results});
  		}
  	});
});

router.get('/getMedicineForAdmin/:id', passport.authenticate('admin-rule', { session: false }) , function(req, res, next) {
	let id = req.params.id;
	let query = 'Select * From medicines WHERE is_deleted = 0 and id=' + SqlString.escape(id);
	connection.query(query , async function (results, error, fields) {
		if(error){
			res.send({"status": 500, "error": error, "response": null}); 
	  	} else {
			if(results && results.length > 0) {
				results = results[0];
			}

	  		res.send({"status": 200, "success": "success", "response": results});
  		}
  	});
});

router.post('/add', passport.authenticate('admin-rule', { session: false }) , async function(req , res , next){
	var medicine = req.body, user = await req.user;

	let blogCategoryByseoLink = await publicFunction.mysqlQuery("Select * From `blog_category` Where is_deleted = 0 and seo_link = " + SqlString.escape(medicine.seo_link));
	if(blogCategoryByseoLink && blogCategoryByseoLink.data.length > 0) {
		medicine.seo_link = name.seo_link + "-" + uuidv4();
	}

	let blogByseoLink = await publicFunction.mysqlQuery("Select * From `blogs` Where is_deleted = 0 and seo_link = " + SqlString.escape(medicine.seo_link));
	if(blogByseoLink && blogByseoLink.data.length > 0) {
		medicine.seo_link = name.seo_link + "-" + uuidv4();
	}

	let contentByseoLink = await publicFunction.mysqlQuery("Select * From `contents` Where seo_link = " + SqlString.escape(medicine.seo_link));
	if(contentByseoLink && contentByseoLink.data.length > 0) {
		medicine.seo_link = name.seo_link + "-" + uuidv4();
	}

	let nameByseoLink = await publicFunction.mysqlQuery("Select * From `names` Where is_deleted = 0 and seo_link = " + SqlString.escape(medicine.seo_link));
	if(nameByseoLink && nameByseoLink.data.length > 0) {
		medicine.seo_link = name.seo_link + "-" + uuidv4();
	}

	let medicineByseoLink = await publicFunction.mysqlQuery("Select * From `medicines` Where is_deleted = 0 and seo_link = " + SqlString.escape(medicine.seo_link));
	if(medicineByseoLink && medicineByseoLink.data.length > 0) {
		medicine.seo_link = name.seo_link + "-" + uuidv4();
	}

	if(medicine) {
		var query = `Insert Into medicines(
			name,
			seo_link,
			ne_is_yarar,
			icerik,
			yardimci_madde_uyari,
			nasil_kullanilir,
			yan_etki,
			kullanmadan_dikkat,
			kullanirken_dikkat,
			kullanimda_ozel_durumlar,
			yiyecek_icecek_kullanimi,
			fazla_doz,
			unutma,
			diger_ilac,
			nasil_saklanmali,
			kimler_kullanir,
			bebeklere_verilir,
			yaslilara_verilir,
			gebelik_ve_emzirme,
			receteli_mi,
			fiyat,
			prospektüs,
			sss,
			arac_kullanimi_etki,
			is_active,
			seo_title,
			seo_description,
			category_id,
			image,
			mg,
			etken_madde,
			atc,
			sb_atc,
			recete_durumu,
			ilac_firmasi,
			barkod,
			satis_fiyati
		) 
		Values(
			${SqlString.escape(medicine.name)},
			${SqlString.escape(medicine.seo_link)},
			${SqlString.escape(medicine.ne_is_yarar)},
			${SqlString.escape(medicine.icerik)},
			${SqlString.escape(medicine.yardimci_madde_uyari)},
			${SqlString.escape(medicine.nasil_kullanilir)},
			${SqlString.escape(medicine.yan_etki)},
			${SqlString.escape(medicine.kullanmadan_dikkat)},
			${SqlString.escape(medicine.kullanirken_dikkat)},
			${SqlString.escape(medicine.kullanimda_ozel_durumlar)},
			${SqlString.escape(medicine.yiyecek_icecek_kullanimi)},
			${SqlString.escape(medicine.fazla_doz)},
			${SqlString.escape(medicine.unutma)},
			${SqlString.escape(medicine.diger_ilac)},
			${SqlString.escape(medicine.nasil_saklanmali)},
			${SqlString.escape(medicine.kimler_kullanir)},
			${SqlString.escape(medicine.bebeklere_verilir)},
			${SqlString.escape(medicine.yaslilara_verilir)},
			${SqlString.escape(medicine.gebelik_ve_emzirme)},
			${SqlString.escape(medicine.receteli_mi)},
			${SqlString.escape(medicine.fiyat)},
			${SqlString.escape(medicine.prospektüs)},
			${SqlString.escape(medicine.sss)},
			${SqlString.escape(medicine.arac_kullanimi_etki)},
			${SqlString.escape(medicine.is_active)},
			${SqlString.escape(medicine.seo_title)},
			${SqlString.escape(medicine.seo_description)},
			${SqlString.escape(medicine.category_id)},
			${SqlString.escape(medicine.image)},
			${SqlString.escape(medicine.mg)},
			${SqlString.escape(medicine.etken_madde)},
			${SqlString.escape(medicine.atc)},
			${SqlString.escape(medicine.sb_atc)},
			${SqlString.escape(medicine.recete_durumu)},
			${SqlString.escape(medicine.ilac_firmasi)},
			${SqlString.escape(medicine.barkod)},
			${SqlString.escape(medicine.satis_fiyati)}
		)`;
		
		connection.query(query, function(results, error, fields){
			if(error)
			{
				res.send({ error: error.sqlMessage, code: 'error', message: 'Name not added.' });
			}
			else
			{
				medicine['id'] = results?.insertId;
				res.send({ success: "success", code: 'category_added' , data: medicine, message: 'Name added.'});
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
		connection.query("Update `medicines` Set is_deleted=1 Where id =" + name.id , function(results, error , fields) {
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
	var medicine  = req.body, user = await req.user;

	if(medicine) {
		let medicineData;
		let medicineById = await publicFunction.mysqlQuery("Select * From `medicines` Where id = " + SqlString.escape(medicine.id));

		if(medicineById && medicineById.data && medicineById.data.length > 0) {
			medicineData = medicineById.data[0];
			if(medicine.seo_link != medicineData.seo_link) {

				let medicineBySeoLink = await publicFunction.mysqlQuery(`Select * From medicines Where is_deleted = 0 and id != ${SqlString.escape(medicine.id)} and seo_link = ${SqlString.escape(medicine.seo_link)}`);
				if(medicineBySeoLink && medicineBySeoLink.data && medicineBySeoLink.data.length > 0) {
					medicine.seo_link = medicine.seo_link + "-" + uuidv4();
				}

				let nameBySeoLink = await publicFunction.mysqlQuery(`Select * From blog_category Where is_deleted = 0 and seo_link = ${SqlString.escape(medicine.seo_link)}`);
				if(nameBySeoLink && nameBySeoLink.data && nameBySeoLink.data.length > 0) {
					medicine.seo_link = medicine.seo_link + "-" + uuidv4();
				}

				let blogCategoryBySeoLink = await publicFunction.mysqlQuery(`Select * From blog_category Where is_deleted = 0 and seo_link = ${SqlString.escape(medicine.seo_link)}`);
				if(blogCategoryBySeoLink && blogCategoryBySeoLink.data && blogCategoryBySeoLink.data.length > 0) {
					medicine.seo_link = medicine.seo_link + "-" + uuidv4();
				}

				let blogByseoLink = await publicFunction.mysqlQuery("Select * From `blogs` Where is_deleted = 0 and seo_link = " + SqlString.escape(medicine.seo_link));
				if(blogByseoLink && blogByseoLink.data && blogByseoLink.data.length > 0) {
					medicine.seo_link = medicine.seo_link + "-" + uuidv4();
				}

				let contentByseoLink = await publicFunction.mysqlQuery("Select * From `contents` Where seo_link = " + SqlString.escape(medicine.seo_link));
				if(contentByseoLink && contentByseoLink.data.length > 0) {
					medicine.seo_link = medicine.seo_link + "-" + uuidv4();
				}
			}
		}		

		var query = `
			Update medicines Set 
				name = ${SqlString.escape(medicine.name)},
				seo_link = ${SqlString.escape(medicine.seo_link)},
				seo_title = ${SqlString.escape(medicine.seo_title)},
				seo_description = ${SqlString.escape(medicine.seo_description)},
				ne_is_yarar = ${SqlString.escape(medicine.ne_is_yarar)},
				icerik = ${SqlString.escape(medicine.icerik)},
				yardimci_madde_uyari = ${SqlString.escape(medicine.yardimci_madde_uyari)},
				nasil_kullanilir = ${SqlString.escape(medicine.nasil_kullanilir)},
				yan_etki = ${SqlString.escape(medicine.yan_etki)},
				kullanmadan_dikkat = ${SqlString.escape(medicine.kullanmadan_dikkat)},
				kullanirken_dikkat = ${SqlString.escape(medicine.kullanirken_dikkat)},
				kullanimda_ozel_durumlar = ${SqlString.escape(medicine.kullanimda_ozel_durumlar)},
				yiyecek_icecek_kullanimi = ${SqlString.escape(medicine.yiyecek_icecek_kullanimi)},
				fazla_doz = ${SqlString.escape(medicine.fazla_doz)},
				unutma = ${SqlString.escape(medicine.unutma)},
				diger_ilac = ${SqlString.escape(medicine.diger_ilac)},
				nasil_saklanmali = ${SqlString.escape(medicine.nasil_saklanmali)},
				kimler_kullanir = ${SqlString.escape(medicine.kimler_kullanir)},
				bebeklere_verilir = ${SqlString.escape(medicine.bebeklere_verilir)},
				yaslilara_verilir = ${SqlString.escape(medicine.yaslilara_verilir)},
				gebelik_ve_emzirme = ${SqlString.escape(medicine.gebelik_ve_emzirme)},
				receteli_mi = ${SqlString.escape(medicine.receteli_mi)},
				fiyat = ${SqlString.escape(medicine.fiyat)},
				prospektüs = ${SqlString.escape(medicine.prospektüs)},
				sss = ${SqlString.escape(medicine.sss)},
				arac_kullanimi_etki = ${SqlString.escape(medicine.arac_kullanimi_etki)},
				category_id = ${SqlString.escape(medicine.category_id)},
				image = ${SqlString.escape(medicine.image)},
				mg = ${SqlString.escape(medicine.mg)},
				etken_madde = ${SqlString.escape(medicine.etken_madde)},
				atc = ${SqlString.escape(medicine.atc)},
				sb_atc = ${SqlString.escape(medicine.sb_atc)},
				recete_durumu = ${SqlString.escape(medicine.recete_durumu)},
				ilac_firmasi = ${SqlString.escape(medicine.ilac_firmasi)},
				barkod = ${SqlString.escape(medicine.barkod)},
				satis_fiyati = ${SqlString.escape(medicine.satis_fiyati)}
			Where id= ${medicine.id}
		`;
		connection.query(query , function(results, error, fields0){
			if(error){
				res.send({"status":500 , "error": error.sqlMessage , "response": "Medicine no updated."});
			}
			else{
				res.send({"status":200 , "success": "success" , "Menu" : results,  "response": "Medicine updated"});
			}
		});
	}
	else {
		res.send({"status":500 , "error": "missing_information" , "response": "Missing information."});
	}
});

router.post('/controlLink/:seo_link' , passport.authenticate('admin-rule', { session: false }) , async function(req , res , next){
	var is_available = true, seo_link  = req.params.seo_link , medicine_id = req.body.id | 0;

	let medicineByseoLink = await publicFunction.mysqlQuery(`Select * From medicines Where is_deleted = 0 and id != ${SqlString.escape(medicine_id)} and seo_link = ${SqlString.escape(seo_link)}`);
	if(medicineByseoLink && medicineByseoLink.data && medicineByseoLink.data.length > 0) {
		is_available = false;
	}

	let nameByseoLink = await publicFunction.mysqlQuery(`Select * From names Where is_deleted = 0 and and seo_link = ${SqlString.escape(seo_link)}`);
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
	var query = "Update `medicines` Set is_active="+blog.is_active+" Where id=" + blog.id;
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