var express = require('express');
var router = express.Router();
const passport = require('passport');
const CryptoJS = require("crypto-js");
const SqlString = require('sqlstring');
var publicFunction = require('./public.js');
const { v4: uuidv4 } = require('uuid');
var mail = require('./mail.js');

router.get('/',passport.authenticate('admin-rule', { session: false }), function(req, res, next) {
	connection.query('SELECT * from `customers`', function (results, error, fields) {
		if(error){
			res.send({"status": 500, "error": error.sqlMessage, "response": null}); 
	  	}
	  	else {
			if(results?.length > 0)
				results.map(x => x.password = '*****');

	  		res.send({"status": 200, "success": "success", "response": results});
  		}
  	});
});

router.get('/getCustomerById/:id',passport.authenticate('admin-rule', { session: false }), function(req, res, next) {
	let id = req.params.id;

	connection.query('SELECT * from `customers` Where id=' + id , function (results, error, fields) {
		if(error){
			res.send({"status": 500, "error": error.sqlMessage, "response": null}); 
	  	} else {
			if(results?.length > 0)
				results.map(x => x.password = '*****');

	  		res.send({"status": 200, "success": "success","Fields":fields, "response": results});
  		}
  	});
});

router.get('/getCustomer',passport.authenticate('customer-rule', { session: false }),async function(req, res, next) {
	let customer =await req.user;

	connection.query('SELECT * from `customers` Where id=' + customer.id , function (results, error, fields) {
		if(error){
			res.send({"status": 500, "error": error.sqlMessage, "response": null}); 
	  	} else {
			let response;
			if(results?.length > 0) {
				response = results[0];
				response.password = '*****';
			}

	  		res.send({"status": 200, "success": "success","Fields":fields, "response": response});
  		}
  	});
});

router.post('/add' ,async function(req , res , next){
	var customer  = req.body;

	if(customer) {
		var remoteAddress = req.headers['x-forwarded-for'] || req.socket?.remoteAddress;

		if(!publicFunction.isNullOrEmpty(customer.email)) {
			res.send({ "status":422, success: 'unsuccess', code:'email_required' , message: 'Email zolunlu.' });
			return false;
		}

		if(!publicFunction.isNullOrEmpty(customer.password)) {
			res.send({ "status":422, success: 'unsuccess', code:'password_required' , message: 'Şifre zolunlu.' });
			return false;
		}
		else {
			customer.password = CryptoJS.AES.encrypt(customer.password, process.env.CRYPTO_SECRET_KEY).toString();
		}

		if(!publicFunction.isNullOrEmpty(customer.phone)) {
			res.send({ "status":422, success: 'unsuccess', code:'phone_required' , message: 'Telefon zolunlu.' });
			return false;
		}

		if(customer.email) {
			let customerEmailControlResult = await publicFunction.mysqlQuery(`Select * From customers Where email = ${SqlString.escape(customer.email)}`)
			if(customerEmailControlResult && customerEmailControlResult.result && customerEmailControlResult.data.length > 0) {
				res.send({ "status":422, success: 'unsuccess', code: 'email_duplicate', message: 'Email zaten kayıtlı.' });
				return false;
			}
		}

		if(customer.phone) {
			let customerPhoneControlResult = await publicFunction.mysqlQuery(`Select * From customers Where phone = ${SqlString.escape(customer.phone)}`)
			if(customerPhoneControlResult && customerPhoneControlResult.result && customerPhoneControlResult.data.length > 0) {
				res.send({ "status":422, success: 'unsuccess', code: 'phone_duplicate', message: 'Telefon numarası başkası tarafından kullanılmaktadır.' });
				return false;
			}
		}

		if(!publicFunction.isNullOrEmpty(customer.approval_kvkk)) {
			res.send({ "status":200, success: 'unsuccess', code:'kvkk_required' , message: 'Kvkk onayı zolunlu.' });
			return false;
		}

		if(!publicFunction.isNullOrEmpty(customer.approval_membership_aggrement)) {
			res.send({ "status":422, success: 'unsuccess', code:'membership_aggrement_required' , message: 'Üyelik sözleşmesi zolunlu.' });
			return false;
		}


		var query = "Insert into `customers`(`name`,`surname`,`phone`,`email`,`password`,`approval_kvkk`,`approval_membership_aggrement`,`ip`) Values("+SqlString.escape(customer.name)+","+SqlString.escape(customer.surname)+","+SqlString.escape(customer.phone)+","+SqlString.escape(customer.email)+","+SqlString.escape(customer.password)+","+customer.approval_kvkk+","+customer.approval_membership_aggrement+","+SqlString.escape(remoteAddress)+")";	
		connection.query(query, function(results, error, fields){
			if(error)
			{
				res.send({ error: error.sqlMessage, code: 'error', message: 'Kullanıcı eklenemedi.' });
			}
			else
			{
				customer['id'] = results?.insertId;
				customer['password'] = '******';
				res.send({ success: "success", code: 'customer_added' , data: customer, message: 'Kullanıcı eklendi.'});
			}	
		});	
	}
	else {
		res.send({"status":500 , "error": "missing_information" , "response": "Missing information."});
	}
});

router.post('/addEmailSubscription' ,async function(req , res , next){
	var customer  = req.body;

	if(customer) {
		var remoteAddress = req.headers['x-forwarded-for'] || req.socket?.remoteAddress;

		if(!publicFunction.isNullOrEmpty(customer.email)) {
			res.send({ "status":422, success: 'unsuccess', code:'email_required' , message: 'Email zolunlu.' });
			return false;
		}

		if(customer.email) {
			let customerEmailControlResult = await publicFunction.mysqlQuery(`Select * From customers Where email = ${SqlString.escape(customer.email)}`)
			if(customerEmailControlResult && customerEmailControlResult.result && customerEmailControlResult.data.length > 0) {
				res.send({ "status":422, success: 'unsuccess', code: 'email_duplicate', message: 'Email zaten kayıtlı.' });
				return false;
			}
		}


		var query = "Insert into `customers`(`type`,`email`,`ip`) Values(0,"+SqlString.escape(customer.email)+","+SqlString.escape(remoteAddress)+")";	
		connection.query(query, function(results, error, fields){
			if(error)
			{
				res.send({ error: error.sqlMessage, code: 'error', message: 'Abonelik oluşturulamadı.' });
			}
			else
			{
				res.send({ success: "success", code: 'customer_added', message: 'Abonelik oluşturuldu.'});
			}	
		});	
	}
	else {
		res.send({"status":500 , "error": "missing_information" , "response": "Missing information."});
	}
});

router.get('/delete/:id',passport.authenticate('admin-rule', { session: false }) ,async function(req , res , next) {
	let id = req.params.id, user = await req.user;
	connection.query('Update `customers` Set is_deleted=1, deletedAt=now(), deleted_user_id = '+user.id+' Where id='+ id , function(results, error , fields) {
		if(error){
			res.send({"status":500 , "error": error.sqlMessage , "response": "Kullanıcı silinemedi."});
		}
		else{
			res.send({"status":200 , "success": "success" ,"Result":results,"Fields":fields, "response": "Kullanıcı  başarıyla silindi."});
		}
	})
});

router.post('/update',passport.authenticate('customer-rule', { session: false }),async function(req , res , next){
	let customer_info = await req.user;
	var customer  = req.body;

	if(customer) {
		var remoteAddress = req.headers['x-forwarded-for'] || req.socket?.remoteAddress;

		if(!publicFunction.isNullOrEmpty(customer.email)) {
			res.send({ "status":422, success: 'unsuccess', code:'email_required' , message: 'Email zolunlu.' });
			return false;
		}

		if(!publicFunction.isNullOrEmpty(customer.phone)) {
			res.send({ "status":422, success: 'unsuccess', code:'phone_required' , message: 'Telefon zolunlu.' });
			return false;
		}

		if(customer_info.email != customer.email) {
			let customerEmailControlResult = await publicFunction.mysqlQuery(`Select * From customers Where email = ${customer.email}`)
			if(customerEmailControlResult && customerEmailControlResult.result && customerEmailControlResult.data.length > 0) {
				res.send({ "status":422, success: 'unsuccess', code: 'email_duplicate', message: 'Email zaten kayıtlı.' });
				return false;
			}
		}

		if(customer_info.phone != customer.phone) {
			let customerPhoneControlResult = await publicFunction.mysqlQuery(`Select * From customers Where phone = ${customer.phone}`)
			if(customerPhoneControlResult && customerPhoneControlResult.result && customerPhoneControlResult.data.length > 0) {
				res.send({ "status":422, success: 'unsuccess', code: 'phone_duplicate', message: 'Telefon numarası başkası tarafından kullanılmaktadır.' });
				return false;
			}
		}

		if(!publicFunction.isNullOrEmpty(customer.approval_kvkk)) {
			res.send({ "status":200, success: 'unsuccess', code:'kvkk_required' , message: 'Kvkk onayı zolunlu.' });
			return false;
		}

		if(!publicFunction.isNullOrEmpty(customer.approval_membership_aggrement)) {
			res.send({ "status":422, success: 'unsuccess', code:'membership_aggrement_required' , message: 'Üyelik sözleşmesi zolunlu.' });
			return false;
		}

		var query = "Update `customers` Set name="+SqlString.escape(customer.name)+", surname="+SqlString.escape(customer.surname)+",phone="+SqlString.escape(customer.phone)+", ip="+SqlString.escape(remoteAddress)+"  Where id=" + customer_info.id;
		connection.query(query , function(results, error, fields0){
			if(error){
				res.send({"status":500 , "error": error.sqlMessage , "response": "Kullanıcı güncellenemedi."});
			}
			else{
				res.send({"status":200 , "success": "success" , "response": "Kullanıcı başarıyla güncellendi."});
			}
		});
	}
	else {
		res.send({"status":500 , "error": "missing_information" , "response": "Missing information."});
	}
});

router.post('/changePassword',passport.authenticate('customer-rule', { session: false }), async function(req , res , next){
	let customer = await req.user;
	var oldPassword  = req.body.old_password,newPassword  = req.body.new_password;

	if(!publicFunction.isNullOrEmpty(oldPassword)) {
		res.send({status:500 , success:"unsuccess" , code: "no_old_password"});
		return false;
	}

	if(!publicFunction.isNullOrEmpty(newPassword)) {
		res.send({status:500 , success:"unsuccess" , code: "no_new_password"});
		return false;
	}

	if(CryptoJS.AES.decrypt(customer.password, process.env.CRYPTO_SECRET_KEY).toString(CryptoJS.enc.Utf8) == oldPassword) {
		newPassword = CryptoJS.AES.encrypt(newPassword, process.env.CRYPTO_SECRET_KEY).toString();
		var query = "Update `customers` Set password="+SqlString.escape(newPassword)+"  Where id=" + customer.id;
		connection.query(query , function(results, error, fields0){
			if(error){
				res.send({"status":500 , "success": "unsuccess" , "error": error.sqlMessage , code:"no_password_updated" , "response": "Parola güncellenemedi."});
			}
			else{
				res.send({"status":200 , "success": "success" , code:"password_updated", "response": "Parola başarıyla güncellendi."});
			}
		});
	}
	else {
		res.send({"status":200 , "success": "unsuccess" , code:"error_old_password" , "response": "Parola hatalı."});
	}
});

router.post('/forgotPassword', async function(req , res , next){
	var email  = req.body.email;

	if(!publicFunction.isNullOrEmpty(email)) {
		res.send({status:500 , success:"unsuccess" , code: "no_email"});
		return false;
	}

	let customerByEmail = await publicFunction.mysqlQuery(`Select * From customers Where is_deleted=0 and email= ${SqlString.escape(email)}`);

	if(customerByEmail && customerByEmail.result && customerByEmail.data.length > 0) {
		let customer = customerByEmail.data[0];
		let refreshToken = uuidv4() + '-' + uuidv4();
		var query = `Update customers Set refresh_token=${SqlString.escape(refreshToken)} , refresh_token_date=now()  Where id= ${SqlString.escape(customer.id)}`;
		connection.query(query ,async function(results, error, fields0){
			if(error){
				res.send({"status":500 , "success": "unsuccess" , "error": error.sqlMessage , code:"error"});
			}
			else{
				let mailResult = await mail.mailSend({
					toMail: customer.email,
					subject:"Şifre yenileme",
					text:"Şifre yenileme",
					html:`Şifrenizi yenilemek için <a href="${process.env.SITE_URL}/uye-sifremi-unuttum?refreshToken=${refreshToken}">buraya</a> tıklayınız.`
				});

				if(mailResult && mailResult.accepted && mailResult.accepted[0] == customer.email) {
					res.send({"status":200 , "success": "success" , code:"mail_sended"});
				}
				else {
					res.send({"status":200 , "success": "unsuccess" , code:"no_mail_sended"});
				}
			}
		});
	}
	else {
		res.send({"status":200 , "success": "unsuccess" , code:"no_customer"});
	}
});

router.post('/forgotPasswordcontrolRefreshToken', async function(req , res , next){
	var refreshToken  = req.body.refreshToken;

	if(!publicFunction.isNullOrEmpty(refreshToken)) {
		res.send({status:500 , success:"unsuccess" , code: "no_refresh_token"});
		return false;
	}

	let customerByRefreshToken = await publicFunction.mysqlQuery(`Select * From customers Where is_deleted=0 and refresh_token= ${SqlString.escape(refreshToken)}`);

	if(customerByRefreshToken && customerByRefreshToken.result && customerByRefreshToken.data.length > 0) {
		let customer = customerByRefreshToken.data[0];
		let nowDate = new Date(); 
		let refreshTokenDate = new Date(customer.refresh_token_date);
		refreshTokenDate.setMinutes(refreshTokenDate.getMinutes()+30);
		if(refreshTokenDate < nowDate) {
			res.send({"status":500 , "success": "unsuccess", code:"token_expired"});
		}
		else {
			customer.email = customer.email.split('@')[0] + '@*******';
			res.send({"status":200 , "success": "success" , code:"correct_token" , email: customer.email});
		}
	}
	else {
		res.send({"status":200 , "success": "unsuccess" , code:"error_refresh_token"});
	}
});

router.post('/forgotPasswordChangePassword', async function(req , res , next){
	var refreshToken  = req.body.refreshToken,password  = req.body.password;

	if(!publicFunction.isNullOrEmpty(refreshToken)) {
		res.send({status:500 , success:"unsuccess" , code: "no_refresh_token"});
		return false;
	}

	if(!publicFunction.isNullOrEmpty(password)) {
		res.send({status:500 , success:"unsuccess" , code: "no_password"});
		return false;
	}

	if(password.length < 8) {
		res.send({status:500 , success:"unsuccess" , code: "password_must_more_8"});
		return false;
	}

	let customerByRefreshToken = await publicFunction.mysqlQuery(`Select * From customers Where is_deleted=0 and refresh_token= ${SqlString.escape(refreshToken)}`);
	if(customerByRefreshToken && customerByRefreshToken.result && customerByRefreshToken.data.length > 0) {
		let customer = customerByRefreshToken.data[0];
		let nowDate = new Date(); 
		let refreshTokenDate = new Date(customer.refresh_token_date);
		refreshTokenDate.setMinutes(refreshTokenDate.getMinutes()+30);
		if(refreshTokenDate < nowDate) {
			res.send({"status":500 , "success": "unsuccess", code:"token_expired"});
		}
	}

	password = CryptoJS.AES.encrypt(password, process.env.CRYPTO_SECRET_KEY).toString();
	var query = `Update customers Set password=${SqlString.escape(password)} Where is_deleted=0 and refresh_token= ${SqlString.escape(refreshToken)}`;
	connection.query(query , function(results, error, fields0){
		if(error){
			res.send({"status":500 , "success": "unsuccess" , "error": error.sqlMessage , code:"no_password_updated" , "response": "Parola güncellenemedi."});
		}
		else{
			res.send({"status":200 , "success": "success" , code:"password_updated", "response": "Parola başarıyla güncellendi."});
		}
	});
});

router.post('/updateImage/:id',passport.authenticate('customer-rule', { session: false }), function(req , res , next){
	let id = req.params.id;
	var customer  = req.body;

	if(customer.fotograf == null)
		var query = "Update `customers` Set image=null Where id=" + id;
	else
		var query = "Update `customers` Set image='"+customer.fotograf+"' Where id=" + id;

	connection.query(query , function(results, error, fields0){
		if(error){
			res.send({"status":500 , "error": error.sqlMessage , "response": "Kullanıcı güncellenemedi."});
		}
		else{
			res.send({"status":200 , "success": "success" , "Ürün" : results, "Fields": fields0, "response": "Kullanıcı başarıyla güncellendi."});
		}
	});
});

router.post('/update/admin/:id',passport.authenticate('admin-rule', { session: false }), function(req , res , next){
	let id = req.params.id;
	var customer  = req.body;
	
	if(customer) {
		var remoteAddress = req.headers['x-forwarded-for'] || req.socket?.remoteAddress;
		var query = "Update `customers` Set type="+customer.type+", name="+SqlString.escape(customer.name)+", surname="+SqlString.escape(customer.surname)+", image="+SqlString.escape(customer.image)+", identity_number="+SqlString.escape(customer.identity_number)+", phone="+SqlString.escape(customer.phone)+",  email="+SqlString.escape(customer.email)+", address="+SqlString.escape(customer.address)+", birthday="+SqlString.escape(customer.birthday)+", home_phone="+SqlString.escape(customer.home_phone)+", office_phone="+SqlString.escape(customer.office_phone)+", fax="+SqlString.escape(customer.fax)+", zip_code="+SqlString.escape(customer.zip_code)+", company_name="+SqlString.escape(customer.company_name)+", tax_office="+SqlString.escape(customer.tax_office)+", tax_number="+SqlString.escape(customer.tax_number)+", gender="+SqlString.escape(customer.gender)+", country_id="+customer.country_id+", state_id="+customer.state_id+", city_id="+customer.city_id+", email_notification="+customer.email_notification+", sms_notification="+customer.sms_notification+", call_notification="+customer.call_notification+", approval_kvkk="+customer.approval_kvkk+", approval_membership_aggrement="+customer.approval_membership_aggrement+", ip="+SqlString.escape(remoteAddress)+"  Where id=" + id;
		connection.query(query , function(results, error, fields0){
			if(error){
				res.send({"status":500 , "error": error.sqlMessage , "response": "Kullanıcı güncellenemedi."});
			}
			else{
				res.send({"status":200 , "success": "success" , "Ürün" : results, "Fields": fields0, "response": "Kullanıcı başarıyla güncellendi."});
			}
		});
	}
	else {
		res.send({"status":500 , "error": "missing_information", "response": "Missing information."});
	}
	
});

router.post('/getCustomerFavorites' , passport.authenticate('customer-rule', {failureRedirect: '/uye-giris', session: false }) ,async function(req , res , next){
	var language = req.query.language || 'tr', start=req.body?.paging?.start || 0, end=req.body?.paging?.end || 20, query, queryTotal, customer = await req.user;

	if(customer) {
		query = `SELECT DISTINCT p.id, 
			IF ((SELECT title FROM product_language WHERE product_id = p.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT title FROM product_language WHERE product_id = p.id and language = `+SqlString.escape(language)+` ) , p.title)  as title,
			IF ((SELECT short_description FROM product_language WHERE product_id = p.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT short_description FROM product_language WHERE product_id = p.id and language = `+SqlString.escape(language)+` ) , p.short_description)  as short_description,
			IF ((SELECT description FROM product_language WHERE product_id = p.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT description FROM product_language WHERE product_id = p.id and language = `+SqlString.escape(language)+` ) , p.description)  as description,
			IF ((SELECT seo_title FROM product_language WHERE product_id = p.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT seo_title FROM product_language WHERE product_id = p.id and language = `+SqlString.escape(language)+` ) , p.seo_title)  as seo_title,
			IF ((SELECT seo_keywords FROM product_language WHERE product_id = p.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT seo_keywords FROM product_language WHERE product_id = p.id and language = `+SqlString.escape(language)+` ) , p.seo_keywords)  as seo_keywords,
			IF ((SELECT seo_description FROM product_language WHERE product_id = p.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT seo_description FROM product_language WHERE product_id = p.id and language = `+SqlString.escape(language)+` ) , p.seo_description)  as seo_description,
			(
				SELECT 
					JSON_ARRAYAGG(
						JSON_OBJECT(
							'property1_category_id', property1_category_id, 
							'property1', property1,
							'property2_category_id', property2_category_id, 
							'property2', property2, 
							'barcode', barcode, 
							'stock', stock, 
							'is_active', is_active, 
							'buying_price', buying_price, 
							'selling_price', selling_price , 
							'discounted_selling_price', discounted_selling_price
						)
					)
				FROM sub_product 
				Where product_id = p.id
			) as sub_products,
			(SELECT JSON_ARRAYAGG(JSON_OBJECT('name',name , 'attribute_category_id',attribute_category_id, 'image',image,'code',code)) From (SELECT IF ((SELECT name FROM attribute_language WHERE attribute_id = a.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT name FROM attribute_language WHERE attribute_id = a.id and language = `+SqlString.escape(language)+` ) , a.name) as name , a.attribute_category_id,a.image,a.code FROM attribute as a JOIN attribute_product as a_p ON a.id = a_p.attribute_id and a_p.product_id = p.id) as attribute) as attributes,
			(
				SELECT 
					JSON_ARRAYAGG(
						JSON_OBJECT(
							'id',
							id, 
							'title',
							title, 
							'seo_link',
							seo_link
						)
					)
				From 
				(
					SELECT 
						c.id ,
						c.title ,
						c.seo_link
					FROM category as c 
					JOIN product_category as p_c 
					ON c.id = p_c.category_id and p_c.product_id = p.id 
					Where c.is_deleted=0
				) as category
			) as categories,
			p.supplier_product_code,
			p.ws_code, 
			p.barcode, 
			p.stock, 
			p.stock_code, 
			p.stock_unit, 
			p.sku, 
			p.desi, 
			p.is_active, 
			p.vat, 
			p.currency_id, 
			(SELECT cur.code From currency as cur Where cur.id = p.currency_id) as currency_code,
			(SELECT cur.name From currency as cur Where cur.id = p.currency_id) as currency_name,
			p.buying_price,
			p.selling_price,
			p.discounted_selling_price,
			p.on_sale,
			p.search_keywords,
			p.is_new_product,
			(Select 1) as is_favorite,
			p.showcase_image,
			p.is_display_product,
			p.is_vendor_product,
			p.brand_id,
			(SELECT b.name From brand as b Where b.id = p.brand_id) as brand_name,
			(SELECT b.seo_link From brand as b Where b.id = p.brand_id) as brand_link,
			p.model_id,
			(SELECT m.name From model as m Where m.id = p.model_id) as model_name,
			(SELECT m.seo_link From model as m Where m.id = p.model_id) as model_link,
			p.supplier_id,
			p.member_min_order,
			p.member_max_order,
			p.seo_link,
			p.symbols,
			p.sort,
			p.delivery_time,
			p.images,
			p.updated_user_id,
			p.created_user_id,
			p.updatedAt,
			p.createdAt
		FROM product as p
		INNER JOIN product_category as p_c
		ON p.id = p_c.product_id
		INNER JOIN category as c
		ON p_c.category_id = c.id
		LEFT JOIN sub_product as s_p
		ON p.id = s_p.product_id
		LEFT JOIN attribute_product as attr_pro
		ON attr_pro.product_id = p.id
		LEFT JOIN attribute as _attr
		ON _attr.id = attr_pro.attribute_id
		LEFT JOIN brand as b
		ON b.id = p.brand_id
		Where p.is_deleted = 0 and p.is_active = 1 and p.id IN(
			SELECT c_f.product_id FROM customer_favorite as c_f Where c_f.is_deleted = 0 and c_f.customer_id = ${SqlString.escape(customer.id)}
		)`;

		query += ` LIMIT ${start},${end}`;

		queryTotal = `SELECT COUNT(DISTINCT p.id) as total
			FROM product as p
			INNER JOIN product_category as p_c
			ON p.id = p_c.product_id
			INNER JOIN category as c
			ON p_c.category_id = c.id
			LEFT JOIN sub_product as s_p
			ON p.id = s_p.product_id
			LEFT JOIN attribute_product as attr_pro
			ON attr_pro.product_id = p.id
			LEFT JOIN attribute as _attr
			ON _attr.id = attr_pro.attribute_id
			LEFT JOIN brand as b
			ON b.id = p.brand_id
			Where p.is_deleted = 0 and p.is_active = 1 and p.id IN(
				SELECT c_f.product_id FROM customer_favorite as c_f Where c_f.is_deleted = 0 and c_f.customer_id = ${SqlString.escape(customer.id)}
			)
		`;

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
							item = publicFunction.prepareProduct(item);		
							return item
						});
	
						res.send({"status": 200, "success": "success", "response": {products:results , total:resultTotal[0].total , start:start , end:end}});
					}
				});
			}
		});	
	}
	else {
		res.send({"status":500 , "error": "missing_information" , "response": "Missing information."});
	}
});

router.get('/addCustomerFavorite/:product_id' , passport.authenticate('customer-rule', { session: false }) ,async function(req , res , next){
	var product_id = req.params.product_id,customer = await req.user;
	
	if(product_id) {
		if(!publicFunction.isNullOrEmpty(product_id)){
			res.send({ success:'unsuccess', code: 'no_product', message: 'Ürün bulunamadı.' });
			return false;
		}

		let customerFavoriteByProduct = await publicFunction.mysqlQuery(`Select * From customer_favorite Where is_deleted = 0 and product_id = ${product_id} and customer_id = ${customer.id}`)

		if(customerFavoriteByProduct && customerFavoriteByProduct.result && customerFavoriteByProduct.data.length > 0) {
			res.send({ error:"", code: 'has_favorite_product', message: 'Has favorite product.' });
		}
		else {
			var query = `
				INSERT INTO customer_favorite
				(customer_id,product_id)
				VALUES(${SqlString.escape(customer.id)},${SqlString.escape(product_id)});
			`;
			
			connection.query(query, function(results, error, fields){
				if(error)
				{
					res.send({ error: error.sqlMessage, code: 'favorite_no_added', message: 'Favorite no added.' });
				}
				else
				{
					res.send({ success: "success", code: 'favorite_added', message: 'Favorite added.'});
				}	
			});	
		}

	}
	else {
		res.send({"status":500 , "error": "missing_information" , "response": "Missing information."});
	}
});

router.get('/deleteCustomerFavorite/:product_id' , passport.authenticate('customer-rule', { session: false }) ,async function(req , res , next){
	var product_id = req.params.product_id,customer = await req.user;

	if(product_id) {
		if(!publicFunction.isNullOrEmpty(product_id)){
			res.send({ success:'unsuccess', code: 'no_product', message: 'Ürün bulunamadı.' });
			return false;
		}

		var query = `
			UPDATE customer_favorite
			SET
			is_deleted = 1,
			deletedAt = now()
			WHERE customer_id = ${SqlString.escape(customer.id)} and product_id = ${SqlString.escape(product_id)};
		`;
		
		connection.query(query, function(results, error, fields){
			if(error)
			{
				res.send({ error: error.sqlMessage, code: 'favorite_no_deleted', message: 'Favorite no deleted.' });
			}
			else
			{
				res.send({ success: "success", code: 'favorite_deleted', message: 'Favorite deleted.'});
			}	
		});	
	}
	else {
		res.send({"status":500 , "error": "missing_information" , "response": "Missing information."});
	}
});

router.get('/getCustomerAddress' , passport.authenticate('customer-rule', { session: false }) ,async function(req , res , next){
	var customer = await req.user;
	if(customer) {
		var query = `
			SELECT 
			a.id,
			a.type,
			a.name_surname,
			a.customer_id,
			a.country_id,
			(Select c.name From countries as c Where c.id = a.country_id) as country_name,
			a.state_id,
			(Select s.name From states as s Where s.id = a.state_id) as state_name,
			a.city_id,
			(Select c.name From cities as c Where c.id = a.city_id) as city_name,
			a.title,
			a.address,
			a.zip_code,
			a.is_delivery_address,
			a.is_invoice_address,
			a.company_name,
			a.tax_office,
			a.tax_number
			FROM address as a
			WHERE a.customer_id = ${SqlString.escape(customer.id)}
		`;
		
		connection.query(query, function(results, error, fields){
			if(error)
			{
				res.send({ error: error.sqlMessage, code: 'address_error', message: 'No address.' });
			}
			else
			{
				res.send({ success: "success", code: 'address' , data: results, message: 'Address'});
			}	
		});	
	}
	else {
		res.send({"status":500 , "error": "missing_information" , "response": "Missing information."});
	}
});

router.post('/addCustomerAddress',passport.authenticate('customer-rule', { session: false }) ,async function(req , res , next){
	var address = req.body.address,customer = await req.user;
	if(customer && address) {
		if(!publicFunction.isNullOrEmpty(address.title)){
			res.send({ success:'unsuccess', code: 'no_title', message: 'Adres başlığı eksik.' });
			return false;
		}

		if(!publicFunction.isNullOrEmpty(address.address)){
			res.send({ success:'unsuccess', code: 'no_address', message: 'Adres eksik.' });
			return false;
		}

		if(!publicFunction.isNullOrEmpty(address.name_surname)){
			res.send({ success:'unsuccess', code: 'no_name_surname', message: 'Adres isim soyisim eksik.' });
			return false;
		}

		if(address.type == 1) {
			if(!publicFunction.isNullOrEmpty(address.company_name)){
				res.send({ success:'unsuccess', code: 'no_company_name', message: 'Firma adı eksik.' });
				return false;
			}

			if(!publicFunction.isNullOrEmpty(address.tax_office)){
				res.send({ success:'unsuccess', code: 'no_tax_office', message: 'Vergi dairesi eksik.' });
				return false;
			}

			if(!publicFunction.isNullOrEmpty(address.tax_number)){
				res.send({ success:'unsuccess', code: 'no_tax_number', message: 'Vergi numarası eksik.' });
				return false;
			}
		}

		var query = `
			INSERT INTO address
			(
				customer_id,
				country_id,
				state_id,
				city_id,
				title,
				name_surname,
				address,
				zip_code,
				is_delivery_address,
				is_invoice_address,
				type,
				company_name,
				tax_office,
				tax_number
			)
			VALUES
			(
				${SqlString.escape(customer.id)},
				${SqlString.escape(address.country_id)},
				${SqlString.escape(address.state_id)},
				${SqlString.escape(address.city_id)},
				${SqlString.escape(address.title)},
				${SqlString.escape(address.name_surname)},
				${SqlString.escape(address.address)},
				${SqlString.escape(address.zip_code)},
				${SqlString.escape(address.is_delivery_address)},
				${SqlString.escape(address.is_invoice_address)},
				${SqlString.escape(address.type)},
				${SqlString.escape(address.company_name)},
				${SqlString.escape(address.tax_office)},
				${SqlString.escape(address.tax_number)}
			);
		`;
		
		connection.query(query, function(results, error, fields){
			if(error)
			{
				res.send({ error: error.sqlMessage, code: 'address_no_added', message: 'Address no added.' });
			}
			else
			{
				address['id'] = results?.insertId;
				res.send({ success: "success", code: 'address_added' , data: address, message: 'Address added.'});
			}	
		});	
	}
	else {
		res.send({"status":500 , "error": "missing_information" , "response": "Missing information."});
	}
});

router.post('/updateCustomerAddress' , passport.authenticate('customer-rule', { session: false }) ,async function(req , res , next){
	var address = req.body.address,customer = await req.user;

	if(customer && address) {
		if(!publicFunction.isNullOrEmpty(address.title)){
			res.send({ success:'unsuccess', code: 'no_title', message: 'Adres başlığı eksik.' });
			return false;
		}

		if(!publicFunction.isNullOrEmpty(address.address)){
			res.send({ success:'unsuccess', code: 'no_address', message: 'Adres eksik.' });
			return false;
		}

		if(!publicFunction.isNullOrEmpty(address.name_surname)){
			res.send({ success:'unsuccess', code: 'no_name_surname', message: 'Adres isim soyisim eksik.' });
			return false;
		}

		if(address.type == 1) {
			if(!publicFunction.isNullOrEmpty(address.company_name)){
				res.send({ success:'unsuccess', code: 'no_company_name', message: 'Firma adı eksik.' });
				return false;
			}

			if(!publicFunction.isNullOrEmpty(address.tax_office)){
				res.send({ success:'unsuccess', code: 'no_tax_office', message: 'Vergi dairesi eksik.' });
				return false;
			}

			if(!publicFunction.isNullOrEmpty(address.tax_number)){
				res.send({ success:'unsuccess', code: 'no_tax_number', message: 'Vergi numarası eksik.' });
				return false;
			}
		}

		var query = `
			UPDATE address
			SET
			country_id = ${SqlString.escape(address.country_id)},
			state_id = ${SqlString.escape(address.state_id)},
			city_id = ${SqlString.escape(address.city_id)},
			title = ${SqlString.escape(address.title)},
			name_surname = ${SqlString.escape(address.name_surname)},
			address = ${SqlString.escape(address.address)},
			zip_code = ${SqlString.escape(address.zip_code)},
			is_delivery_address = ${SqlString.escape(address.is_delivery_address)},
			is_invoice_address = ${SqlString.escape(address.is_invoice_address)} ,
			type = ${SqlString.escape(address.type)},
			company_name = ${SqlString.escape(address.company_name)},
			tax_office = ${SqlString.escape(address.tax_office)},
			tax_number = ${SqlString.escape(address.tax_number)}
			WHERE id = ${SqlString.escape(address.id)};
		`;
		
		connection.query(query, function(results, error, fields){
			if(error) {
				res.send({ error: error.sqlMessage, code: 'address_no_updated', message: 'Address no updated.' });
			}
			else {
				res.send({ success: "success", code: 'address_updated' , data: address, message: 'Address updated.'});
			}	
		});	
	}
	else {
		res.send({"status":500 , "error": "missing_information" , "response": "Missing information."});
	}
});

router.post('/deleteCustomerAddress' , passport.authenticate('customer-rule', { session: false }) ,async function(req , res , next){
	var address = req.body.address,customer = await req.user;

	if(customer && address) {
		if(!publicFunction.isNullOrEmpty(address.id)){
			res.send({ success:'unsuccess', code: 'no_address', message: 'Adres bulunamadı.' });
			return false;
		}

		var query = `
			DELETE FROM address
			WHERE id = ${SqlString.escape(address.id)};
		`;
		
		connection.query(query, function(results, error, fields){
			if(error) {
				res.send({ error: error.sqlMessage, code: 'address_no_deleted', message: 'Address no deleted.' });
			}
			else {
				res.send({ success: "success", code: 'address_deleted' , data: address, message: 'Address deleted.'});
			}	
		});	
	}
	else {
		res.send({"status":500 , "error": "missing_information" , "response": "Missing information."});
	}
});

module.exports = router;