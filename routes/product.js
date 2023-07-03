var express = require('express');
var router = express.Router();
const passport = require('passport');
const CryptoJS = require("crypto-js");
const SqlString = require('sqlstring');
const { v4: uuidv4 } = require('uuid');
var publicFunction = require('./public.js');
const jwt = require('jsonwebtoken');

router.post('/', passport.authenticate('admin-rule', { session: false }) , function(req, res, next) {
    var language = req.body.language, filters = req.body.filters, start=req.body?.paging?.start || 0, end=req.body?.paging?.end || 20, query, queryTotal;

	if(filters.brands)
		filters.brands = filters.brands?.split("-").join(",");

	if(filters.price)
		filters.price = filters.price?.split("-");

	if(filters.categories)
		filters.categories = filters.categories?.split("-").join(",");
	
	if(language) {
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
								'id',id,
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
				FROM sub_product as sub_p
				WHERE sub_p.product_id = p.id and sub_p.is_deleted=0 and sub_p.is_active=1
			) as sub_products,
			(
				SELECT 
					JSON_ARRAYAGG(
						JSON_OBJECT(
							'name',name , 
							'attribute_category_id',attribute_category_id, 
							'image',image,
							'code',code
						)
					)
				From (
					SELECT IF ((
						SELECT name 
						FROM attribute_language 
						WHERE attribute_id = a.id and language = `+SqlString.escape(language)+`) IS NOT NULL , 
						( 
							SELECT name 
							FROM attribute_language 
							WHERE attribute_id = a.id and language = `+SqlString.escape(language)+` 
						) , 
						a.name
						) as name , 
						a.attribute_category_id,
						a.image,
						a.code 
					FROM attribute as a 
					JOIN attribute_product as a_p 
					ON a.id = a_p.attribute_id and a_p.product_id = p.id
				) as attribute
			) as attributes,
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
			p.showcase_image,
			p.is_free_cargo_in_cart,
			p.is_display_product,
			p.is_vendor_product,
			p.brand_id,
			(SELECT b.name From brand as b Where b.id = p.brand_id) as brand_name,
			(SELECT b.seo_link From brand as b Where b.id = p.brand_id) as brand_link,
			p.model_id,
			(SELECT m.name From model as m Where m.id = p.model_id) as model_name,
			(SELECT m.seo_link From model as m Where m.id = p.model_id) as model_link,
			b.name as brand_name,
			b.seo_link as brand_url,
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
		Where p.is_deleted = 0 `

		if(filters && filters.categories) {
			query += `and c.id IN (${filters.categories}) `;
		}

		if(filters && filters.property1) {
			query += `and s_p.property1 IN (${filters.property1}) `;
		}
		
		if(filters && filters.property2) {
			query += `and s_p.property2 IN (${filters.property2}) `;
		}

		if(filters && filters.brands) {
			query += `and p.brand_id IN (${filters.brands}) `;
		}

		if(filters && filters.price) {
			if(filters.price[0])
				query += `and (CASE WHEN  p.on_sale = 1 THEN ${filters.price[0]} < p.discounted_selling_price ELSE ${filters.price[0]} < p.selling_price END) `;

			if(filters.price[1])
				query += `and (CASE WHEN  p.on_sale = 1 THEN ${filters.price[1]} > p.discounted_selling_price ELSE ${filters.price[1]} > p.selling_price END) `;
		}

		if(filters && filters.attributes) {
			query += `and _attr.id IN (${filters.attributes}) `;
		}

		if(filters && filters.title) {
			query += `and p.title LIKE ('%${filters.title}%') `;
		}

		if(filters && filters.barcode) {
			query += `and p.barcode LIKE ('%${filters.barcode}%') `;
		}

		if(filters && filters.ws_code) {
			query += `and p.ws_code LIKE ('%${filters.ws_code}%') `;
		}

		if(filters && filters.sku) {
			query += `and p.sku LIKE ('%${filters.sku}%') `;
		}
		
    }
    else {
        query = `SELECT DISTINCT p.id, 
			p.title,
			p.short_description,
			p.description,
			p.seo_title,
			p.seo_keywords,
			p.seo_description,
			(SELECT JSON_ARRAYAGG(JSON_OBJECT('property1_category_id', property1_category_id, 'property1', property1,'property2_category_id', property2_category_id, 'property2', property2, 'barcode', barcode, 'stock', stock, 'is_active', is_active, 'buying_price', buying_price, 'selling_price', selling_price , 'discounted_selling_price', discounted_selling_price)) FROM sub_product Where product_id = p.id and is_deleted=0 and is_active=1) as sub_products,
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
			p.showcase_image,
			p.is_free_cargo_in_cart,
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
		Where p.is_deleted = 0 `

		if(filters && filters.categories) {
			query += `and c.id IN (${filters.categories}) `;
		}
		
		if(filters && filters.property1) {
			query += `and s_p.property1 IN (${filters.property1}) `;
		}
		
		if(filters && filters.property2) {
			query += `and s_p.property2 IN (${filters.property2}) `;
		}

		if(filters && filters.brands) {
			query += `and p.brand_id IN (${filters.brands}) `;
		}

		if(filters && filters.price) {
			if(filters.price[0])
				query += `and (CASE WHEN  p.on_sale = 1 THEN ${filters.price[0]} < p.discounted_selling_price ELSE ${filters.price[0]} < p.selling_price END) `;

			if(filters.price[1])
				query += `and (CASE WHEN  p.on_sale = 1 THEN ${filters.price[1]} > p.discounted_selling_price ELSE ${filters.price[1]} > p.selling_price END) `;
		}

		if(filters && filters.attributes) {
			query += `and _attr.id IN (${filters.attributes}) `;
		}

		if(filters && filters.title) {
			query += `and p.title LIKE ('%${filters.title}%') `;
		}

		if(filters && filters.barcode) {
			query += `and p.barcode LIKE ('%${filters.barcode}%') `;
		}

		if(filters && filters.ws_code) {
			query += `and p.ws_code LIKE ('%${filters.ws_code}%') `;
		}

		if(filters && filters.sku) {
			query += `and p.sku LIKE ('%${filters.sku}%') `;
		}
    }

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
		Where p.is_deleted = 0
	`;

	if(filters && filters.categories) {
		queryTotal += `and c.id IN (${filters.categories}) `;
	}
	
	if(filters && filters.property1) {
		queryTotal += `and s_p.property1 IN (${filters.property1}) `;
	}
	
	if(filters && filters.property2) {
		queryTotal += `and s_p.property2 IN (${filters.property2}) `;
	}

	if(filters && filters.brands) {
		queryTotal += `and p.brand_id IN (${filters.brands}) `;
	}

	if(filters && filters.price) {
		if(filters.price[0])
			queryTotal += `and (CASE WHEN  p.on_sale = 1 THEN ${filters.price[0]} < p.discounted_selling_price ELSE ${filters.price[0]} < p.selling_price END) `;

		if(filters.price[1])
			queryTotal += `and (CASE WHEN  p.on_sale = 1 THEN ${filters.price[1]} > p.discounted_selling_price ELSE ${filters.price[1]} > p.selling_price END) `;
	}

	if(filters && filters.attributes) {
		queryTotal += `and _attr.id IN (${filters.attributes}) `;
	}

	if(filters && filters.title) {
		queryTotal += `and p.title LIKE ('%${filters.title}%') `;
	}

	if(filters && filters.barcode) {
		queryTotal += `and p.barcode LIKE ('%${filters.barcode}%') `;
	}

	if(filters && filters.ws_code) {
		queryTotal += `and p.ws_code LIKE ('%${filters.ws_code}%') `;
	}

	if(filters && filters.sku) {
		queryTotal += `and p.sku LIKE ('%${filters.sku}%') `;
	}

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
});

router.post('/getActiveAllProductsByLimit/:limit' , function(req, res, next) {
    var limit = req.params.limit, language = req.query.language || 'tr', query,token = req.body.token,customer;
	
	if(token)
		customer = jwt.verify(token, "customer");
	
	query = `SELECT DISTINCT p.id, 
		IF ((SELECT title FROM product_language WHERE product_id = p.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT title FROM product_language WHERE product_id = p.id and language = `+SqlString.escape(language)+` ) , p.title)  as title,
		IF ((SELECT short_description FROM product_language WHERE product_id = p.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT short_description FROM product_language WHERE product_id = p.id and language = `+SqlString.escape(language)+` ) , p.short_description)  as short_description,
		IF ((SELECT description FROM product_language WHERE product_id = p.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT description FROM product_language WHERE product_id = p.id and language = `+SqlString.escape(language)+` ) , p.description)  as description,
		IF ((SELECT seo_title FROM product_language WHERE product_id = p.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT seo_title FROM product_language WHERE product_id = p.id and language = `+SqlString.escape(language)+` ) , p.seo_title)  as seo_title,
		IF ((SELECT seo_keywords FROM product_language WHERE product_id = p.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT seo_keywords FROM product_language WHERE product_id = p.id and language = `+SqlString.escape(language)+` ) , p.seo_keywords)  as seo_keywords,
		IF ((SELECT seo_description FROM product_language WHERE product_id = p.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT seo_description FROM product_language WHERE product_id = p.id and language = `+SqlString.escape(language)+` ) , p.seo_description)  as seo_description,
		(SELECT JSON_ARRAYAGG(JSON_OBJECT('id',id,'property1_category_id', property1_category_id, 'property1', property1,'property2_category_id', property2_category_id, 'property2', property2, 'barcode', barcode, 'stock', stock, 'is_active', is_active, 'buying_price', buying_price, 'selling_price', selling_price , 'discounted_selling_price', discounted_selling_price)) FROM sub_product Where product_id = p.id and is_deleted=0 and is_active=1) as sub_products,
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
		IF ((SELECT COUNT(*) FROM customer_favorite as c_f WHERE c_f.is_deleted = 0 and p.id = c_f.product_id and c_f.customer_id = ${SqlString.escape(customer?.id)}) > 0 , 1 , 0)  as is_favorite,
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
		p.showcase_image,
		p.is_free_cargo_in_cart,
		p.is_display_product,
		p.is_vendor_product,
		p.brand_id,
		(SELECT b.name From brand as b Where b.id = p.brand_id) as brand_name,
		(SELECT b.seo_link From brand as b Where b.id = p.brand_id) as brand_link,
		p.model_id,
		(SELECT m.name From model as m Where m.id = p.model_id) as model_name,
		(SELECT m.seo_link From model as m Where m.id = p.model_id) as model_link,
		b.name as brand_name,
		b.seo_link as brand_url,
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
	Where p.is_deleted = 0 and p.is_active `

	query += ` LIMIT ${limit}`;

	connection.query(query, function (results, error, fields) {
		if(error){
			res.send({"status": 500, "error": error.sqlMessage, "response": null}); 
	  	}
	  	else {
			results = results.map(item => {
				item = publicFunction.prepareProduct(item);
				return item
			});

			res.send({"status": 200, "success": "success", "response": results});
  		}
  	});
});

router.post('/getProductShowCase/:showcase_id' ,async function(req, res, next) {
    var showcase_id = req.params.showcase_id, language = req.query.language || 'tr' ,query,token = req.body.token,customer;
	if(token)
		customer = jwt.verify(token, "customer");

	let showCaseInformation = await publicFunction.mysqlQuery(`Select * From product_showcases Where id=${SqlString.escape(showcase_id)} and is_active=1 and is_deleted=0 and language = ${SqlString.escape(language)}`)
	
	if(showCaseInformation && showCaseInformation.result && showCaseInformation.data.length) {
		let showcaseInfo = showCaseInformation.data[0];
		let language = showcaseInfo.language || language;
		query = `SELECT DISTINCT p.id, 
			IF ((SELECT title FROM product_language WHERE product_id = p.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT title FROM product_language WHERE product_id = p.id and language = `+SqlString.escape(language)+` ) , p.title)  as title,
			IF ((SELECT short_description FROM product_language WHERE product_id = p.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT short_description FROM product_language WHERE product_id = p.id and language = `+SqlString.escape(language)+` ) , p.short_description)  as short_description,
			IF ((SELECT description FROM product_language WHERE product_id = p.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT description FROM product_language WHERE product_id = p.id and language = `+SqlString.escape(language)+` ) , p.description)  as description,
			IF ((SELECT seo_title FROM product_language WHERE product_id = p.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT seo_title FROM product_language WHERE product_id = p.id and language = `+SqlString.escape(language)+` ) , p.seo_title)  as seo_title,
			IF ((SELECT seo_keywords FROM product_language WHERE product_id = p.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT seo_keywords FROM product_language WHERE product_id = p.id and language = `+SqlString.escape(language)+` ) , p.seo_keywords)  as seo_keywords,
			IF ((SELECT seo_description FROM product_language WHERE product_id = p.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT seo_description FROM product_language WHERE product_id = p.id and language = `+SqlString.escape(language)+` ) , p.seo_description)  as seo_description,
			(SELECT JSON_ARRAYAGG(JSON_OBJECT('id',id,'property1_category_id', property1_category_id, 'property1', property1,'property2_category_id', property2_category_id, 'property2', property2, 'barcode', barcode, 'stock', stock, 'is_active', is_active, 'buying_price', buying_price, 'selling_price', selling_price , 'discounted_selling_price', discounted_selling_price)) FROM sub_product Where product_id = p.id and is_deleted=0 and is_active=1) as sub_products,
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
			IF ((SELECT COUNT(*) FROM customer_favorite as c_f WHERE c_f.is_deleted = 0 and p.id = c_f.product_id and c_f.customer_id = ${SqlString.escape(customer?.id)}) > 0 , 1 , 0)  as is_favorite,
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
			p.showcase_image,
			p.is_free_cargo_in_cart,
			p.is_display_product,
			p.is_vendor_product,
			p.brand_id,
			(SELECT b.name From brand as b Where b.id = p.brand_id) as brand_name,
			(SELECT b.seo_link From brand as b Where b.id = p.brand_id) as brand_link,
			p.model_id,
			(SELECT m.name From model as m Where m.id = p.model_id) as model_name,
			(SELECT m.seo_link From model as m Where m.id = p.model_id) as model_link,
			b.name as brand_name,
			b.seo_link as brand_url,
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
		Where p.is_deleted = 0 and p.is_active=1 and p.id IN(${showcaseInfo.products})`
				
		if(showcaseInfo.limit)
			query += ` LIMIT ${showcaseInfo.limit}`;

		connection.query(query, function (results, error, fields) {
			if(error){
				res.send({"status": 500, "success": "unsuccess", "error": error.sqlMessage, "response": null}); 
			}
			else {
				results = results.map(item => {
					item = publicFunction.prepareProduct(item);
					return item
				});

				try {
					if(showcaseInfo.slider_options) {
						showcaseInfo.slider_options = JSON.parse(showcaseInfo.slider_options);
					}
				}
				catch(err){}

				let resData = {
					name: showcaseInfo.name,
					description: showcaseInfo.description,
					products: results,
					is_mobile: showcaseInfo.is_mobile,
					is_tablet: showcaseInfo.is_tablet,
					is_desktop: showcaseInfo.is_desktop,
					is_slider: showcaseInfo.is_slider,
					cart: showcaseInfo.cart,
					component: showcaseInfo.component,
					slider_options: showcaseInfo.slider_options
				}

				res.send({"status": 200, "success": "success", "response": resData});
			}
		});
	}
	else {
		res.send({"status": 200, "success": "unsuccess", "error": "No showcase", "response": null}); 
	}
	
	
});

router.post('/getSameProducts/:seo_link' ,async function(req, res, next) {
    var seo_link = req.params.seo_link, language = req.query.language || 'tr' ,query,token = req.body.token,customer;
	if(token)
		customer = jwt.verify(token, "customer");

	let productResult = await publicFunction.mysqlQuery(`
		SELECT 
			brand_id,
			p_c.category_id as categories
		FROM product as p 
		JOIN product_category as p_c
		ON p.id = p_c.product_id
		WHERE p.seo_link = ${SqlString.escape(seo_link)}
	`)
	
	if(productResult && productResult.result && productResult.data.length) {
		let brand_id = productResult.data[0].brand_id;
		let categories = productResult.data.map(x => x.categories).join(",");
		query = `SELECT DISTINCT p.id, 
			IF ((SELECT title FROM product_language WHERE product_id = p.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT title FROM product_language WHERE product_id = p.id and language = `+SqlString.escape(language)+` ) , p.title)  as title,
			IF ((SELECT short_description FROM product_language WHERE product_id = p.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT short_description FROM product_language WHERE product_id = p.id and language = `+SqlString.escape(language)+` ) , p.short_description)  as short_description,
			IF ((SELECT description FROM product_language WHERE product_id = p.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT description FROM product_language WHERE product_id = p.id and language = `+SqlString.escape(language)+` ) , p.description)  as description,
			IF ((SELECT seo_title FROM product_language WHERE product_id = p.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT seo_title FROM product_language WHERE product_id = p.id and language = `+SqlString.escape(language)+` ) , p.seo_title)  as seo_title,
			IF ((SELECT seo_keywords FROM product_language WHERE product_id = p.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT seo_keywords FROM product_language WHERE product_id = p.id and language = `+SqlString.escape(language)+` ) , p.seo_keywords)  as seo_keywords,
			IF ((SELECT seo_description FROM product_language WHERE product_id = p.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT seo_description FROM product_language WHERE product_id = p.id and language = `+SqlString.escape(language)+` ) , p.seo_description)  as seo_description,
			(SELECT JSON_ARRAYAGG(JSON_OBJECT('id',id,'property1_category_id', property1_category_id, 'property1', property1,'property2_category_id', property2_category_id, 'property2', property2, 'barcode', barcode, 'stock', stock, 'is_active', is_active, 'buying_price', buying_price, 'selling_price', selling_price , 'discounted_selling_price', discounted_selling_price)) FROM sub_product Where product_id = p.id and is_deleted=0 and is_active=1) as sub_products,
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
			IF ((SELECT COUNT(*) FROM customer_favorite as c_f WHERE c_f.is_deleted = 0 and p.id = c_f.product_id and c_f.customer_id = ${SqlString.escape(customer?.id)}) > 0 , 1 , 0)  as is_favorite,
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
			p.showcase_image,
			p.is_free_cargo_in_cart,
			p.is_display_product,
			p.is_vendor_product,
			p.brand_id,
			(SELECT b.name From brand as b Where b.id = p.brand_id) as brand_name,
			(SELECT b.seo_link From brand as b Where b.id = p.brand_id) as brand_link,
			p.model_id,
			(SELECT m.name From model as m Where m.id = p.model_id) as model_name,
			(SELECT m.seo_link From model as m Where m.id = p.model_id) as model_link,
			b.name as brand_name,
			b.seo_link as brand_url,
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
		Where p.is_deleted = 0 and p.is_active=1 and (p_c.id IN(${SqlString.escape(categories)}) or p.brand_id = ${SqlString.escape(brand_id)}) LIMIT 15`;

		connection.query(query, function (results, error, fields) {
			if(error){
				res.send({"status": 500, "success": "unsuccess", "error": error.sqlMessage, "response": null}); 
			}
			else {
				results = results.map(item => {
					item = publicFunction.prepareProduct(item);
					return item
				});

				res.send({"status": 200, "success": "success", "response": results});
			}
		});
	}
	else {
		res.send({"status": 200, "success": "unsuccess", "error": "No product", "response": null}); 
	}
	
	
});

router.get('/getProductById/:id',passport.authenticate('admin-rule', { session: false }), function(req, res, next) {
	let id = req.params.id;

    var query;
    query = `SELECT DISTINCT p.id, 
		p.title,
		p.short_description,
		p.description,
		p.seo_title,
		p.seo_keywords,
		p.seo_description,
		(
			SELECT 
				JSON_ARRAYAGG(
					JSON_OBJECT(
						'id',id,
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
			FROM sub_product Where product_id = p.id and is_deleted=0
		) as sub_products,
		(
			SELECT 
				JSON_ARRAYAGG(
					JSON_OBJECT(
						'name',name , 
						'attribute_category_id',attribute_category_id, 
						'image',image,
						'code',code
					)
				)
			From (
				SELECT 
					a.name , 
					a.attribute_category_id,
					a.image,
					a.code 
				FROM attribute as a 
				JOIN attribute_product as a_p 
				ON a.id = a_p.attribute_id and a_p.product_id = p.id 
				Where a_p.is_deleted=0
			) as attribute
		) as attributes,
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
		p.buying_price,
		p.selling_price,
		p.discounted_selling_price,
		p.on_sale,
		p.search_keywords,
		p.is_new_product,
		p.showcase_image,
		p.is_free_cargo_in_cart,
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
	Where p.id=` + id;

	connection.query(query, function (results, error, fields) {
		if(error){
			res.send({"status": 500, "error": error.sqlMessage, "response": null}); 
	  	}
	  	else {
			results = results.map(item => {
				item = publicFunction.prepareProduct(item);
				return item
			});

	  		res.send({"status": 200, "success": "success", "response": results});
  		}
  	});
});

router.post('/getProductBySeoLink/:seo_link', async function(req, res, next) {
	var seo_link = req.params.seo_link, language = req.query.language || 'tr',token = req.body.token, query,customer;

	if(token)
		customer = jwt.verify(token, "customer");

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
						'id', sub_pro.id, 
						'property1_category_id', sub_pro.property1_category_id, 
						'property1_category_name', sub_pro.property1_category_name, 
						'property1', sub_pro.property1,
						'property1_name', sub_pro.property1_name,
						'property2_category_id', sub_pro.property2_category_id, 
						'property2_category_name', sub_pro.property2_category_name, 
						'property2', sub_pro.property2,
						'property2_name', sub_pro.property2_name,
						'barcode', sub_pro.barcode, 
						'stock', sub_pro.stock, 
						'buying_price', sub_pro.buying_price, 
						'selling_price', sub_pro.selling_price , 
						'discounted_selling_price', sub_pro.discounted_selling_price
					)
				)
			FROM (
				SELECT 
					s_pro.id,
					s_pro.product_id,
					s_pro.property1_category_id ,
					(
						SELECT IF (
							(
								SELECT name 
								FROM property_category_language 
								WHERE id = s_pro.property1_category_id and language = `+SqlString.escape(language)+`
							) IS NOT NULL , 
							( 
								SELECT name 
								FROM property_category_language 
								WHERE id = s_pro.property1_category_id and language = `+SqlString.escape(language)+` 
							) , 
							prop_cat.name 
						)  as name 
						From property_category as prop_cat
						Where prop_cat.id = s_pro.property1_category_id
					) as property1_category_name,
					s_pro.property1,
					(
						SELECT IF (
							(
								SELECT name 
								FROM property_language 
								WHERE property_id = s_pro.property1 and language = `+SqlString.escape(language)+`
							) IS NOT NULL , 
							( 
								SELECT name 
								FROM property_language 
								WHERE property_id = s_pro.property1 and language = `+SqlString.escape(language)+` 
							) , 
							prop.name 
						)  as name 
						From property as prop
						Where prop.id = s_pro.property1
					) as property1_name,
					s_pro.property2_category_id,
					(
						SELECT IF (
							(
								SELECT name 
								FROM property_category_language 
								WHERE id = s_pro.property2_category_id and language = `+SqlString.escape(language)+`
							) IS NOT NULL , 
							( 
								SELECT name 
								FROM property_category_language 
								WHERE id = s_pro.property2_category_id and language = `+SqlString.escape(language)+` 
							) , 
							prop_cat.name 
						)  as name 
						From property_category as prop_cat
						Where prop_cat.id = s_pro.property2_category_id
					) as property2_category_name,
					s_pro.property2,
					(
						SELECT IF (
							(
								SELECT name 
								FROM property_language 
								WHERE property_id = s_pro.property2 and language = `+SqlString.escape(language)+`
							) IS NOT NULL , 
							( 
								SELECT name 
								FROM property_language 
								WHERE property_id = s_pro.property2 and language = `+SqlString.escape(language)+` 
							) , 
							prop.name 
						)  as name 
						From property as prop
						Where prop.id = s_pro.property2
					) as property2_name,
					s_pro.barcode,
					s_pro.stock,
					s_pro.selling_price,
					s_pro.buying_price,
					s_pro.discounted_selling_price
				FROM sub_product as s_pro
				WHERE s_pro.is_deleted = 0 and s_pro.is_active = 1
			) as sub_pro 
			Where sub_pro.product_id = p.id
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
		IF ((SELECT COUNT(*) FROM customer_favorite as c_f WHERE c_f.is_deleted = 0 and p.id = c_f.product_id and c_f.customer_id = ${SqlString.escape(customer?.id)}) > 0 , 1 , 0)  as is_favorite,
		p.buying_price,
		p.selling_price,
		p.discounted_selling_price,
		p.on_sale,
		p.search_keywords,
		p.is_new_product,
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
	Where p.is_deleted = 0 and p.is_active = 1 and p.seo_link = ${SqlString.escape(seo_link)}`

	connection.query(query, function (results, error, fields) {
		if(error){
			res.send({"status": 500, "error": error.sqlMessage, "response": null}); 
	  	}
	  	else {

			try {
				let product;

				if(results && results.length > 0) {
					product = results[0];
					product = publicFunction.prepareProduct(product);

					res.send({"status": 200, "success": "success", "response": product});
				}
				else {
					res.send({"status": 200, "code":"no_product" , "success": "unsuccess", "response": null});
				}	
			}
			catch(err) {
				res.send({"status": 200, "code":"error" , "success": "unsuccess", "response": null});
			}

						
  		}
  	});
});

router.post('/add', passport.authenticate('admin-rule', { session: false }) , async function(req , res , next){
	var product = req.body;

	if(product) {
		if(!product.category_ids || product.category_ids.length == 0) {
			res.send({ error: "error", code: 'no_category', message: 'Ürünün kategorisi olmalı.' });
			return false;
		}

        let seo_link;
        seo_link = publicFunction.toSnakeCase(publicFunction.convertTurkishCharacter(product.title));
        let productByseoLink = await publicFunction.mysqlQuery("Select * From `product` Where seo_link = " + SqlString.escape(seo_link));

        if(productByseoLink && productByseoLink.result == true && productByseoLink.data.length > 0) {
            seo_link = seo_link + "-" + uuidv4();
        }

		var query = "Insert into `product`(`title`,`supplier_product_code`,`ws_code`,`barcode`,`stock`,`stock_code`,`stock_unit`,`sku`,`desi`,`is_active`,`vat`,`currency_id`,`buying_price`,`selling_price`,`discounted_selling_price`,`on_sale`,`search_keywords`,`is_new_product`,`showcase_image`,`is_free_cargo_in_cart`,`is_display_product`,`is_vendor_product`,`brand_id`,`supplier_id`,`member_min_order`,`member_max_order`,`short_description`,`description`,`seo_link`,`seo_title`,`seo_keywords`,`seo_description`,`symbols`,`sort`,`delivery_time`,`images`,`created_user_id`) Values("+SqlString.escape(product.title)+","+SqlString.escape(product.supplier_product_code)+","+SqlString.escape(product.ws_code)+","+SqlString.escape(product.barcode)+","+SqlString.escape(product.stock)+","+SqlString.escape(product.stock_code)+","+SqlString.escape(product.stock_unit)+","+SqlString.escape(product.sku)+","+SqlString.escape(product.desi)+","+SqlString.escape(product.is_active)+","+SqlString.escape(product.vat)+","+SqlString.escape(product.currency_id)+","+SqlString.escape(product.buying_price)+","+SqlString.escape(product.selling_price)+","+SqlString.escape(product.discounted_selling_price)+","+SqlString.escape(product.on_sale)+","+SqlString.escape(product.search_keywords)+","+SqlString.escape(product.is_new_product)+","+SqlString.escape(product.showcase_image)+","+SqlString.escape(product.is_free_cargo_in_cart)+","+SqlString.escape(product.is_display_product)+","+SqlString.escape(product.is_vendor_product)+","+SqlString.escape(product.brand_id)+","+SqlString.escape(product.supplier_id)+","+SqlString.escape(product.member_min_order)+","+SqlString.escape(product.member_max_order)+","+SqlString.escape(product.short_description)+","+SqlString.escape(product.description)+","+SqlString.escape(seo_link)+","+SqlString.escape(product.seo_title)+","+SqlString.escape(product.seo_keywords)+","+SqlString.escape(product.seo_description)+","+SqlString.escape(product.symbols)+","+SqlString.escape(product.sort)+","+SqlString.escape(product.delivery_time)+","+SqlString.escape(product.images)+","+SqlString.escape(product.user_id)+")";
		
		connection.query(query, async function(results, error, fields){
			if(error)
			{
				res.send({ error: error.sqlMessage, code: 'error', message: 'Ürün eklenemedi.' });
			}
			else
			{
				product['id'] = results?.insertId;
                product['seo_link'] = seo_link;

				if(results?.insertId) {
					for (let index = 0; index < product.category_ids.length; index++) {
						if(product.category_ids[index])
							await publicFunction.mysqlQuery("INSERT INTO `product_category`(`product_id`,`category_id`,`created_user_id`) VALUES("+results?.insertId+","+SqlString.escape(product.category_ids[index])+","+product.user_id+")");
					}
				}

				res.send({ success: "success", code: 'product_added' , data: product, message: 'Ürün eklendi.'});
			}	
		});	
	}
	else {
		res.send({"status":500 , "error": "missing_information" , "response": "Missing information."});
	}
});

router.post('/delete/:id',passport.authenticate('admin-rule', { session: false }) , async function(req , res , next) {
	let id = req.params.id;
    var product  = req.body;
	let productById = await publicFunction.mysqlQuery("Select * From `product` Where id = " + id);

	if(productById && productById.result == true && productById.data.length > 0) {
		connection.query("Update `product` Set is_deleted=1 , deletedAt=now() , deleted_user_id="+product.user_id+" Where id =" + id , function(results, error , fields) {
			if(error){
				res.send({"status":500 , "error": error.sqlMessage , "response": "Ürün silinemedi."});
			}
			else{
				res.send({"status":200 , "success": "success" ,"result":results, "response": "Ürün başarıyla silindi."});
			}
		})
	}
	else {
		res.send({"status":200 , "success": "unsuccess" ,"result":results, "response": "Ürün bulunamadı."});
	}
});

router.post('/update/:id',passport.authenticate('admin-rule', { session: false }), function(req , res , next){
	let id = req.params.id;
	var product  = req.body;

	if(product) {
		if(!product.category_ids || product.category_ids.length == 0) {
			res.send({ error: "error", code: 'no_category', message: 'Ürünün kategorisi olmalı.' });
			return false;
		}
		var query = "Update `product` Set title="+ SqlString.escape(product.title) +", supplier_product_code="+ SqlString.escape(product.supplier_product_code) +", ws_code="+ SqlString.escape(product.ws_code) +", barcode="+ SqlString.escape(product.barcode) +", stock="+ SqlString.escape(product.stock) +",stock_code="+ SqlString.escape(product.stock_code) +", stock_unit="+ SqlString.escape(product.stock_unit) +", sku="+ SqlString.escape(product.sku) +", desi="+ SqlString.escape(product.desi) +", is_active="+ SqlString.escape(product.is_active) +", vat="+ SqlString.escape(product.vat) +", currency_id="+ SqlString.escape(product.currency_id) +", buying_price="+ SqlString.escape(product.buying_price) +", selling_price="+ SqlString.escape(product.selling_price) +", discounted_selling_price="+ SqlString.escape(product.discounted_selling_price) +", on_sale="+ SqlString.escape(product.on_sale) +", search_keywords="+ SqlString.escape(product.seo_keywords) +", is_new_product="+ SqlString.escape(product.is_new_product) +", showcase_image="+ SqlString.escape(JSON.stringify(product.showcase_image)) +", is_free_cargo_in_cart="+ SqlString.escape(product.is_free_cargo_in_cart) +", is_display_product="+ SqlString.escape(product.is_display_product) +", is_vendor_product="+ SqlString.escape(product.is_vendor_product) +", brand_id="+ SqlString.escape(product.brand_id) +", supplier_id="+ SqlString.escape(product.supplier_id) +", member_min_order="+ SqlString.escape(product.member_min_order) +", member_max_order="+ SqlString.escape(product.member_max_order) +", short_description="+ SqlString.escape(product.short_description) +", description="+ SqlString.escape(product.description) +", seo_title="+ SqlString.escape(product.seo_title) +", seo_keywords="+ SqlString.escape(product.seo_keywords) +", seo_description="+ SqlString.escape(product.seo_description) +", symbols="+ SqlString.escape(product.symbols) +", sort="+ SqlString.escape(product.sort) +", delivery_time="+ SqlString.escape(product.delivery_time) +", images="+ SqlString.escape(JSON.stringify(product.images)) +", updated_user_id="+SqlString.escape(product.user_id)+" Where id=" + id;
		connection.query(query , async function(results, error, fields0){
			if(error){
				res.send({"status":500 , "error": error.sqlMessage , "response": "Ürün güncellenemedi."});
			}
			else{
				await publicFunction.mysqlQuery("DELETE FROM product_category WHERE product_id = " + id);
				for (let index = 0; index < product.category_ids.length; index++) {
					if(product.category_ids[index])
						await publicFunction.mysqlQuery("INSERT INTO `product_category`(`product_id`,`category_id`,`created_user_id`) VALUES("+id+","+SqlString.escape(product.category_ids[index])+","+product.user_id+")");
				}

				res.send({"status":200 , "success": "success" , "Ürün" : results, "response": "Ürün başarıyla güncellendi."});
			}
		});
	}
	else {
		res.send({"status":500 , "error": "missing_information" , "response": "Missing information."});
	}
});

router.post('/updateProductImage/:id',passport.authenticate('admin-rule', { session: false }), function(req , res , next){
	let id = req.params.id;
	var images  = req.body;

	if(images) {
		var query = "Update `product` Set images="+ SqlString.escape(JSON.stringify(images)) +" Where id=" + id;
		connection.query(query , async function(results, error, fields0){
			if(error){
				res.send({"status":500 , "error": error.sqlMessage , "response": "Product images no updated."});
			}
			else{
				res.send({"status":200 , "success": "success" , "Data" : results, "response": "Product images updated."});
			}
		});
	}
	else {
		res.send({"status":500 , "error": "missing_information" , "response": "Missing information."});
	}
});

router.post('/updatePrice/:id',passport.authenticate('admin-rule', { session: false }), function(req , res , next){
	let id = req.params.id , fields = [];
	var product  = req.body;

	if(product) {
		if(publicFunction.isNullOrEmpty(product.buying_price))
			fields.push(`buying_price=${SqlString.escape(product.buying_price)}`)

		if(publicFunction.isNullOrEmpty(product.selling_price))
			fields.push(`selling_price=${SqlString.escape(product.selling_price)}`)

		if(publicFunction.isNullOrEmpty(product.discounted_selling_price))
			fields.push(`discounted_selling_price=${SqlString.escape(product.discounted_selling_price)}`)

		if(fields.length > 0) {
			var query = "Update `product` Set "+ fields.join(",") +" , updated_user_id="+SqlString.escape(product.user_id)+" Where id=" + id;
			
			connection.query(query , function(results, error, fields0){
				if(error){
					res.send({"status":500 , "error": error.sqlMessage , "response": "Ürün güncellenemedi."});
				}
				else{
					res.send({"status":200 , "success": "success" , "Ürün" : results, "response": "Ürün başarıyla güncellendi."});
				}
			});
		}
		else {
			res.send({"status":500 , "error": "missing_information" , "response": "Missing information."});
		}	
	}
	else {
		res.send({"status":500 , "error": "missing_information" , "response": "Missing information."});
	}
});

router.post('/updateSort/:id',passport.authenticate('admin-rule', { session: false }), function(req , res , next){
	let id = req.params.id;
	var product  = req.body;

	if(product) {
		var query = "Update `product` Set sort="+SqlString.escape(product.sort)+" , updated_user_id="+SqlString.escape(product.user_id)+" Where id=" + id;
			
		connection.query(query , function(results, error, fields0){
			if(error){
				res.send({"status":500 , "error": error.sqlMessage , "response": "Product sort no updated successfully."});
			}
			else{
				res.send({"status":200 , "success": "success" , "Ürün" : results, "response": "Product sort updated successfully."});
			}
		});
	}
	else {
		res.send({"status":500 , "error": "missing_information" , "response": "Missing information."});
	}
});

router.get('/updateActive/:id/:active',passport.authenticate('admin-rule', { session: false }), async function(req , res , next){
	let id = req.params.id;
    let active = req.params.active;

	if(id && active) {
		let productById = await publicFunction.mysqlQuery("Select * From `product` Where id = " + id);
		if(productById && productById.result == true && productById.data.length > 0) {
			var query = "Update `product` Set is_active="+ SqlString.escape(active) +" Where id=" + id;
			connection.query(query , function(results, error, fields0){
				if(error){
					res.send({"status":500 , "error": error.sqlMessage , "response": "Ürün güncellenemedi."});
				}
				else{
					res.send({"status":200 , "success": "success" , "Ürün" : results, "Fields": fields0, "response": "Ürün başarıyla güncellendi."});
				}
			});	
		}
		else {
			res.send({"status":200 , "success": "unsuccess" ,"result":results, "response": "Ürün bulunamadı."});
		}
	}
	else {
		res.send({"status":500 , "error": "missing_information" , "response": "Missing information."});
	}
});

router.post('/updateLanguage',passport.authenticate('admin-rule', { session: false }), async function(req , res , next){
    let productLanguages = req.body;

	if(productLanguages && productLanguages.length > 0) {
		let response = [];
		for (let index = 0; index < productLanguages.length; index++) {
			const item = productLanguages[index];
			if(item.product_id && item.language) {
				let hasLanguage = await publicFunction.mysqlQuery("Select IF(COUNT(*) > 0 ,true,false) as countLanguage From `product_language` Where product_id = " + SqlString.escape(item.product_id) + " and language = " + SqlString.escape(item.language));
				if(hasLanguage && hasLanguage.result == true && hasLanguage[0].countLanguage > 0) {
					let query = "Update `product_language` Set title = " + SqlString.escape(item.title) + ", short_description = " + SqlString.escape(item.short_description) + ", description = " + SqlString.escape(item.description) + ", seo_title = " + SqlString.escape(item.seo_title) + ", seo_keywords = " + SqlString.escape(item.seo_keywords) + ", seo_description = " + SqlString.escape(item.seo_description) + ", updated_user_id = " + SqlString.escape(item.user_id) + " Where product_id = " + item.product_id + " and language = " + SqlString.escape(item.language);
					let result = await publicFunction.mysqlQuery(query);
					
					response.push({
						status: result.result,
						product_id:item.product_id,
						language:item.language,
						process:"update",
						message: result.result != false ? "updated" : "not updated"
					});
				}
				else {
					let query = "INSERT INTO `product_language`(`product_id`,`title`,`short_description`,`description`,`seo_title`,`seo_keywords`,`seo_description`,`language`,`created_user_id`) VALUES("+ item.product_id +","+ SqlString.escape(item.title) +","+SqlString.escape(item.short_description)+","+SqlString.escape(item.description)+","+SqlString.escape(item.seo_title)+","+SqlString.escape(item.seo_keywords)+","+SqlString.escape(item.seo_description)+","+SqlString.escape(item.language)+","+item.user_id+")";
					let result = await publicFunction.mysqlQuery(query);

					response.push({
						status: result.result,
						product_id:item.product_id,
						language:item.language,
						process:"create",
						message: result.result != false ? "created" : "not created"
					});
				}
			}
			else {
				response.push({
					status: result != null ? true : false,
					product_id:item.product_id,
					language:item.language,
					process:"",
					message: "Product id or language missing"
				});
			}
		}

		res.send({"status":200 , "success": "success" , "response": response});
	}
	else {
		res.send({"status":500 , "error": "missing_information" , "response": "Missing information."});
	}
});

router.get('/getProductByLanguage/:product_id/:language',passport.authenticate('admin-rule', { session: false }), function(req, res, next) {
	let product_id = req.params.product_id;
	let language = req.params.language;
    var query = "Select * From `product_language` Where product_id = " + SqlString.escape(product_id) + " and language = " + SqlString.escape(language);

	connection.query(query, function (results, error, fields) {
		if(error){
			res.send({"status": 500, "error": error.sqlMessage, "response": null}); 
	  	}
	  	else {
	  		res.send({"status": 200, "success": "success", "response": results});
  		}
  	});
});

router.post('/getCategoryProductsForAdmin/', passport.authenticate('admin-rule', { session: false }) , function(req, res, next) {
	var language = req.body.language, filters = req.body.filters, category_id = req.body.category_id, start=req.body?.paging?.start || 0, end=req.body?.paging?.end || 20, query, queryTotal;
    
	if(filters.property1)
		filters.property1 = filters.property1?.split("-").join(",");

	if(filters.property2)
		filters.property2 = filters.property2?.split("-").join(",");

	if(filters.brands)
		filters.brands = filters.brands?.split("-").join(",");

	if(filters.price)
		filters.price = filters.price?.split("-");

	if(filters.categories)
		filters.categories = filters.categories?.split("-").join(",");

	if(filters.attributes) {
		filters.attributes = filters.attributes?.split("-").map(item => {
			return item.split("-")[0];
		});

		filters.attributes.join(",");

	}
	
	if(language) {
        query = `SELECT DISTINCT p.id, 
			IF ((SELECT title FROM product_language WHERE product_id = p.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT title FROM product_language WHERE product_id = p.id and language = `+SqlString.escape(language)+` ) , p.title)  as title,
			IF ((SELECT short_description FROM product_language WHERE product_id = p.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT short_description FROM product_language WHERE product_id = p.id and language = `+SqlString.escape(language)+` ) , p.short_description)  as short_description,
			IF ((SELECT description FROM product_language WHERE product_id = p.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT description FROM product_language WHERE product_id = p.id and language = `+SqlString.escape(language)+` ) , p.description)  as description,
			IF ((SELECT seo_title FROM product_language WHERE product_id = p.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT seo_title FROM product_language WHERE product_id = p.id and language = `+SqlString.escape(language)+` ) , p.seo_title)  as seo_title,
			IF ((SELECT seo_keywords FROM product_language WHERE product_id = p.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT seo_keywords FROM product_language WHERE product_id = p.id and language = `+SqlString.escape(language)+` ) , p.seo_keywords)  as seo_keywords,
			IF ((SELECT seo_description FROM product_language WHERE product_id = p.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT seo_description FROM product_language WHERE product_id = p.id and language = `+SqlString.escape(language)+` ) , p.seo_description)  as seo_description,
			(SELECT JSON_ARRAYAGG(JSON_OBJECT('property1_category_id', property1_category_id, 'property1', property1,'property2_category_id', property2_category_id, 'property2', property2, 'barcode', barcode, 'stock', stock, 'is_active', is_active, 'buying_price', buying_price, 'selling_price', selling_price , 'discounted_selling_price', discounted_selling_price)) FROM sub_product Where product_id = p.id) as sub_products,
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
		Where p.is_deleted = 0`

		if(filters && filters.categories) {
			filters.categories += `,${category_id}`
			query += `and c.id IN (${filters.categories}) `;
		}
		else {
			query += `and c.id IN (${category_id}) `;
		}
		
		if(filters && filters.property1) {
			query += `and s_p.property1 IN (${filters.property1}) `;
		}
		
		if(filters && filters.property2) {
			query += `and s_p.property2 IN (${filters.property2}) `;
		}

		if(filters && filters.brands) {
			query += `and p.brand_id IN (${filters.brands}) `;
		}

		if(filters && filters.price) {
			if(filters.price[0])
				query += `and (CASE WHEN  p.on_sale = 1 THEN ${filters.price[0]} < p.discounted_selling_price ELSE ${filters.price[0]} < p.selling_price END) `;

			if(filters.price[1])
				query += `and (CASE WHEN  p.on_sale = 1 THEN ${filters.price[1]} > p.discounted_selling_price ELSE ${filters.price[1]} > p.selling_price END) `;
		}

		if(filters && filters.attributes) {
			query += `and _attr.id IN (${filters.attributes}) `;
		}
		
    }
    else {
        query = `SELECT DISTINCT p.id, 
			p.title,
			p.short_description,
			p.description,
			p.seo_title,
			p.seo_keywords,
			p.seo_description,
			(SELECT JSON_ARRAYAGG(JSON_OBJECT('property1_category_id', property1_category_id, 'property1', property1,'property2_category_id', property2_category_id, 'property2', property2, 'barcode', barcode, 'stock', stock, 'is_active', is_active, 'buying_price', buying_price, 'selling_price', selling_price , 'discounted_selling_price', discounted_selling_price)) FROM sub_product Where product_id = p.id) as sub_products,
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
		Where p.is_deleted = 0`

		if(filters && filters.categories) {
			filters.categories += `,${category_id}`
			query += `and c.id IN (${filters.categories}) `;
		}
		else {
			query += `and c.id IN (${category_id}) `;
		}
		
		if(filters && filters.property1) {
			query += `and s_p.property1 IN (${filters.property1}) `;
		}
		
		if(filters && filters.property2) {
			query += `and s_p.property2 IN (${filters.property2}) `;
		}

		if(filters && filters.brands) {
			query += `and p.brand_id IN (${filters.brands}) `;
		}

		if(filters && filters.price) {
			if(filters.price[0])
				query += `and (CASE WHEN  p.on_sale = 1 THEN ${filters.price[0]} < p.discounted_selling_price ELSE ${filters.price[0]} < p.selling_price END) `;

			if(filters.price[1])
				query += `and (CASE WHEN  p.on_sale = 1 THEN ${filters.price[1]} > p.discounted_selling_price ELSE ${filters.price[1]} > p.selling_price END) `;
		}

		if(filters && filters.attributes) {
			query += `and _attr.id IN (${filters.attributes}) `;
		}
    }

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
		Where p.is_deleted = 0
	`;

	if(filters && filters.categories) {
		filters.categories += `,${category_id}`
		queryTotal += `and c.id IN (${filters.categories}) `;
	}
	else {
		queryTotal += `and c.id IN (${category_id}) `;
	}
	
	if(filters && filters.property1) {
		queryTotal += `and s_p.property1 IN (${filters.property1}) `;
	}
	
	if(filters && filters.property2) {
		queryTotal += `and s_p.property2 IN (${filters.property2}) `;
	}

	if(filters && filters.brands) {
		queryTotal += `and p.brand_id IN (${filters.brands}) `;
	}

	if(filters && filters.price) {
		if(filters.price[0])
			queryTotal += `and (CASE WHEN  p.on_sale = 1 THEN ${filters.price[0]} < p.discounted_selling_price ELSE ${filters.price[0]} < p.selling_price END) `;

		if(filters.price[1])
			queryTotal += `and (CASE WHEN  p.on_sale = 1 THEN ${filters.price[1]} > p.discounted_selling_price ELSE ${filters.price[1]} > p.selling_price END) `;
	}

	if(filters && filters.attributes) {
		queryTotal += `and _attr.id IN (${filters.attributes}) `;
	}

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
});

router.post('/getCategoryProducts/', async function(req, res, next) {
	var language = req.body.language || 'tr', sort = req.body.sort, filters = req.body.filters, category_id, start=req.body?.paging?.start || 0, end=req.body?.paging?.end || 20, token = req.body.token, customer, query, queryTotal;
    
	if(token)
		customer = jwt.verify(token, "customer");

	let categoryData = await publicFunction.mysqlQuery("Select id From category Where seo_link = '" + req.body.category_seo_link + "'")
	if(categoryData && categoryData.data && categoryData.data.length > 0)
		category_id = categoryData?.data[0]?.id;

	if(filters.property1)
		filters.property1 = filters.property1?.split("-").join(",");

	if(filters.property2)
		filters.property2 = filters.property2?.split("-").join(",");

	if(filters.brands)
		filters.brands = filters.brands?.split("-").join(",");

	if(filters.price)
		filters.price = filters.price?.split("-");

	if(filters.categories)
		filters.categories = filters.categories?.split("-").join(",");

	if(filters.attributes) {
		filters.attributes = filters.attributes?.split("-").map(item => {
			return item.split("-")[0];
		});

		filters.attributes.join(",");

	}
	
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
		IF ((SELECT COUNT(*) FROM customer_favorite as c_f WHERE c_f.is_deleted = 0 and p.id = c_f.product_id and c_f.customer_id = ${SqlString.escape(customer?.id)}) > 0 , 1 , 0)  as is_favorite,
		(SELECT cur.code From currency as cur Where cur.id = p.currency_id) as currency_code,
		(SELECT cur.name From currency as cur Where cur.id = p.currency_id) as currency_name,
		p.buying_price,
		p.selling_price,
		p.discounted_selling_price,
		p.on_sale,
		p.search_keywords,
		p.is_new_product,
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
	Where p.is_deleted = 0 and p.is_active = 1 `

	if(filters && filters.categories) {
		filters.categories += `,${category_id}`
		query += ` and c.id IN (${filters.categories}) `;
	}
	else {
		query += ` and c.id IN (${category_id}) `;
	}
	
	if(filters && filters.property1) {
		query += ` and s_p.property1 IN (${filters.property1}) `;
	}
	
	if(filters && filters.property2) {
		query += ` and s_p.property2 IN (${filters.property2}) `;
	}

	if(filters && filters.brands) {
		query += ` and p.brand_id IN (${filters.brands}) `;
	}

	if(filters && filters.price) {
		if(filters.price[0])
			query += ` and (CASE WHEN  p.on_sale = 1 THEN ${parseFloat(filters.price[0])} < p.discounted_selling_price ELSE ${parseFloat(filters.price[0])} < p.selling_price END) `;

		if(filters.price[1])
			query += ` and (CASE WHEN  p.on_sale = 1 THEN ${parseFloat(filters.price[1])} > p.discounted_selling_price ELSE ${parseFloat(filters.price[1])} > p.selling_price END) `;
	}

	if(filters && filters.attributes) {
		query += ` and _attr.id IN (${filters.attributes}) `;
	}

	if(sort) {
		switch(sort) {
			case '1':
				query += ` ORDER BY (CASE WHEN  p.on_sale = 1 THEN  p.discounted_selling_price ELSE p.selling_price END) asc `;
				break;

			case '2':
				query += ` ORDER BY (CASE WHEN  p.on_sale = 1 THEN  p.discounted_selling_price ELSE p.selling_price END) desc `;
				break;

			case '3':
				query += ` ORDER BY p.createdAt asc `;
				break;

			case '4':
				query += ` ORDER BY p.createdAt desc `;
				break;

			case '5':
				query += ` ORDER BY p.title asc `;
				break;

			case '6':
				query += ` ORDER BY p.title desc `;
				break;
		}
	}

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
		Where p.is_deleted = 0 and p.is_active = 1
	`;

	if(filters && filters.categories) {
		filters.categories += `,${category_id}`
		queryTotal += ` and c.id IN (${filters.categories}) `;
	}
	else {
		queryTotal += ` and c.id IN (${category_id}) `;
	}
	
	if(filters && filters.property1) {
		queryTotal += ` and s_p.property1 IN (${filters.property1}) `;
	}
	
	if(filters && filters.property2) {
		queryTotal += ` and s_p.property2 IN (${filters.property2}) `;
	}

	if(filters && filters.brands) {
		queryTotal += ` and p.brand_id IN (${filters.brands}) `;
	}

	if(filters && filters.price) {
		if(filters.price[0])
			queryTotal += ` and (CASE WHEN  p.on_sale = 1 THEN ${parseFloat(filters.price[0])} < p.discounted_selling_price ELSE ${parseFloat(filters.price[0])} < p.selling_price END) `;

		if(filters.price[1])
			queryTotal += ` and (CASE WHEN  p.on_sale = 1 THEN ${parseFloat(filters.price[1])} > p.discounted_selling_price ELSE ${parseFloat(filters.price[1])} > p.selling_price END) `;
	}

	if(filters && filters.attributes) {
		queryTotal += ` and _attr.id IN (${filters.attributes}) `;
	}

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
});

router.post('/getFilters/', async function(req, res, next) {
	var language = req.body.language || 'tr', filters = req.body.filters, category_id, querySubProduct,queryBrand,queryCategory,queryPrice;
    let response = {
		properties:null,
		categories:null,
		brands:null,
		attributes:null,
		price: {
			max:null,
			min:null
		}
	}

	let categoryData = await publicFunction.mysqlQuery("Select id From category Where seo_link = '" + req.body.category_seo_link + "'")
	if(categoryData && categoryData.data && categoryData.data.length > 0)
		category_id = categoryData?.data[0]?.id;

	if(filters.property1)
		filters.property1 = filters.property1?.split("-").join(",");

	if(filters.property2)
		filters.property2 = filters.property2?.split("-").join(",");

	if(filters.brands)
		filters.brands = filters.brands?.split("-").join(",");

	if(filters.price)
		filters.price = filters.price?.split("-");

	if(filters.categories)
		filters.categories = filters.categories?.split("-").join(",");

	if(filters.attributes) {
		filters.attributes = filters.attributes?.split("-").map(item => {
			return item.split("-")[0];
		});

		filters.attributes.join(",");

	}
	
	querySubProduct = `
	SELECT 
		DISTINCT s_p.id,
		s_p.property1_category_id ,
		(
			SELECT IF (
				(
					SELECT name 
					FROM property_category_language 
					WHERE id = s_p.property1_category_id and language = `+SqlString.escape(language)+`
				) IS NOT NULL , 
				( 
					SELECT name 
					FROM property_category_language 
					WHERE id = s_p.property1_category_id and language = `+SqlString.escape(language)+` 
				) , 
				prop_cat.name 
			)  as name 
			From property_category as prop_cat
			Where prop_cat.id = s_p.property1_category_id
		) as property1_category_name,
		s_p.property1,
		(
			SELECT IF (
				(
					SELECT name 
					FROM property_language 
					WHERE property_id = s_p.property1 and language = `+SqlString.escape(language)+`
				) IS NOT NULL , 
				( 
					SELECT name 
					FROM property_language 
					WHERE property_id = s_p.property1 and language = `+SqlString.escape(language)+` 
				) , 
				prop.name 
			)  as name 
			From property as prop
			Where prop.id = s_p.property1
		) as property1_name,
		s_p.property2_category_id,
		(
			SELECT IF (
				(
					SELECT name 
					FROM property_category_language 
					WHERE id = s_p.property2_category_id and language = `+SqlString.escape(language)+`
				) IS NOT NULL , 
				( 
					SELECT name 
					FROM property_category_language 
					WHERE id = s_p.property2_category_id and language = `+SqlString.escape(language)+` 
				) , 
				prop_cat.name 
			)  as name 
			From property_category as prop_cat
			Where prop_cat.id = s_p.property2_category_id
		) as property2_category_name,
		s_p.property2,
		(
			SELECT IF (
				(
					SELECT name 
					FROM property_language 
					WHERE property_id = s_p.property2 and language = `+SqlString.escape(language)+`
				) IS NOT NULL , 
				( 
					SELECT name 
					FROM property_language 
					WHERE property_id = s_p.property2 and language = `+SqlString.escape(language)+` 
				) , 
				prop.name 
			)  as name 
			From property as prop
			Where prop.id = s_p.property2
		) as property2_name,
		s_p.barcode,
		s_p.stock `;

	queryBrand = `
		SELECT 
		DISTINCT b.id,
		b.name `;

	queryPrice = `
		SELECT 
			max(IF (p.on_sale = true , p.discounted_selling_price,p.selling_price )) as max,
			min(IF (p.on_sale = true , p.discounted_selling_price,p.selling_price )) as min 
		FROM product as p
		JOIN product_category as p_c
		ON p.id = p_c.product_id
		JOIN category as c
		ON p_c.category_id = c.id
		Where p.is_deleted = 0 and p.is_active = 1 and c.id IN (${category_id})`;

	queryCategory = `SELECT c.id, 
		IF ((SELECT title FROM category_language WHERE category_id = c.id and language = `+SqlString.escape(language)+`) IS NOT NULL , ( SELECT title FROM category_language WHERE category_id = c.id and language = `+SqlString.escape(language)+` ) , c.title)  as title, 
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
	WHERE c.is_deleted = 0 and c.is_active = 1 and (c.id = ${category_id} or c.parent_id = ${category_id}) ORDER BY c.sort `

	let filterQuery = `
		FROM product as p
		JOIN product_category as p_c
		ON p.id = p_c.product_id
		JOIN category as c
		ON p_c.category_id = c.id
		LEFT JOIN sub_product as s_p
		ON p.id = s_p.product_id
		LEFT JOIN attribute_product as attr_pro
		ON attr_pro.product_id = p.id
		LEFT JOIN attribute as _attr
		ON _attr.id = attr_pro.attribute_id
		LEFT JOIN brand as b
		ON b.id = p.brand_id
		Where p.is_deleted = 0 and p.is_active = 1 
	`;

	if(filters && filters.categories) {
		filters.categories += `,${category_id}`
		filterQuery += ` and c.id IN (${filters.categories}) `;
	}
	else {
		filterQuery += ` and c.id IN (${category_id}) `;
	}
	
	if(filters && filters.property1) {
		filterQuery += ` and s_p.property1 IN (${filters.property1}) `;
	}
	
	if(filters && filters.property2) {
		filterQuery += ` and s_p.property2 IN (${filters.property2}) `;
	}

	if(filters && filters.brands) {
		filterQuery += ` and p.brand_id IN (${filters.brands}) `;
	}

	if(filters && filters.price) {
		if(filters.price[0])
			filterQuery += ` and (CASE WHEN  p.on_sale = 1 THEN ${parseFloat(filters.price[0])} <= p.discounted_selling_price ELSE ${parseFloat(filters.price[0])} <= p.selling_price END) `;

		if(filters.price[1])
			filterQuery += ` and (CASE WHEN  p.on_sale = 1 THEN ${parseFloat(filters.price[1])} >= p.discounted_selling_price ELSE ${parseFloat(filters.price[1])} >= p.selling_price END) `;
	}

	if(filters && filters.attributes) {
		filterQuery += ` and _attr.id IN (${filters.attributes}) `;
	}


	querySubProduct += filterQuery;
	let subProducts = await publicFunction.mysqlQuery(querySubProduct)

	if(subProducts && subProducts.result == true && subProducts.data.length > 0) {
		var rootsProperty1 = [], rootsProperty2 = [], i;
            
		for (i = 0; i < subProducts.data.length; i += 1) {
			let subProduct = subProducts.data[i];

			if(publicFunction.isNullOrEmpty(subProduct.property1)) {
				if(rootsProperty1.find(x => x.property_category_id == subProduct.property1_category_id)) {
					if(!rootsProperty1.find(x => x.property_category_id == subProduct.property1_category_id)?.properties?.find(x => x.property_id == subProduct.property1)) {
						rootsProperty1.find(x => x.property_category_id == subProduct.property1_category_id).properties.push({
							property_name: subProduct.property1_name,
							property_id: subProduct.property1
						})
					}	
				}
				else
					rootsProperty1.push({
						property_category_name: subProduct.property1_category_name,
						property_category_id: subProduct.property1_category_id ,
						properties:[
							{
								property_name: subProduct.property1_name,
								property_id: subProduct.property1
							}
						]
					})
			}
			

			if(publicFunction.isNullOrEmpty(subProduct.property2)) {
				if(rootsProperty2.find(x => x.property_category_id == subProduct.property2_category_id)) {
					if(!rootsProperty2?.find(x => x.property_category_id == subProduct.property2_category_id)?.properties?.find(x => x.property_id == subProduct.property2)) {
						rootsProperty2.find(x => x.property_category_id == subProduct.property2_category_id).properties.push({
							property_name: subProduct.property2_name,
							property_id: subProduct.property2
						})
					}
				}
				else
					rootsProperty2.push({
						property_category_name: subProduct.property2_category_name,
						property_category_id: subProduct.property2_category_id ,
						properties:[
							{
								property_name: subProduct.property2_name,
								property_id: subProduct.property2
							}
						]
					})
			}

			
		}

		response.properties = {
			property1:rootsProperty1,
			property2:rootsProperty2
		}
	}

	queryBrand += filterQuery;
	let brands = await publicFunction.mysqlQuery(queryBrand)

	if(brands && brands.result == true && brands.data.length > 0) {
		response.brands = brands.data;
	}

	let prices = await publicFunction.mysqlQuery(queryPrice)

	if(prices && prices.result == true && prices.data.length > 0) {
		response.price.min = prices.data[0].min;
		response.price.max = prices.data[0].max;
	}

	let categories = await publicFunction.mysqlQuery(queryCategory)

	if(categories && categories.result == true && categories.data.length > 0) {
		var map = {}, node, roots = [], i;
		
		for (i = 0; i < categories.data.length; i += 1) {
			map[categories.data[i].id] = i;
			categories.data[i]["children"] = [];
		}
		
		for (i = 0; i < categories.data.length; i += 1) {
			node = categories.data[i];
			if (node.parent_id !== null) {
				categories.data[map[node.parent_id]]?.children?.push(node);
			} 
			else {
				roots.push(node);
			}
		}
		response.categories = roots;
	}

	res.send({"status": 200, "success": "success", "response": response});
});

router.post('/addAttributeToProduct', passport.authenticate('admin-rule', { session: false }) ,async function(req , res , next){
	var attributeProducts = req.body;

	if(attributeProducts) {
        let response = [];
        for (let index = 0; index < attributeProducts.length; index++) {
            var item = attributeProducts[index];
            if(item) {
                if(!item.attribute_id) {
                    response.push({
                        status: false,
                        data:item,
                        message: "attribute id is incorrect"
                    });

                    continue;
                }

                if(!item.product_id) {
                    response.push({
                        status: false,
                        data:item,
                        message: "product id is incorrect"
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

                let result = await publicFunction.mysqlQuery("INSERT INTO `attribute_product`(`product_id`,`attribute_id`,`created_user_id`) VALUES("+SqlString.escape(item.product_id)+","+SqlString.escape(item.attribute_id)+","+SqlString.escape(item.user_id) + ")");

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

router.post('/removeAttributeToProduct', passport.authenticate('admin-rule', { session: false }) ,async function(req , res , next){
	var attributeProducts = req.body;

	if(attributeProducts) {
        let response = [];
        for (let index = 0; index < attributeProducts.length; index++) {
            var item = attributeProducts[index];
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

				var query = "Update `attribute_product` Set is_deleted=1, deletedAt=now(),deleted_user_id="+SqlString.escape(item.user_id)+" Where id=" + item.id;
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

router.get('/getCurrencyList' , function(req, res, next) {
    var query = `SELECT * FROM currency Where is_deleted = 0 and is_active = 1`

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