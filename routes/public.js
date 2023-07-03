const SqlString = require('sqlstring');
const fs = require('fs');
var XML_PATH = (process.env.NODE_ENV == 'production' || process.env.PRODUCTION == 'true') ? process.env.PROD_XML_PATH : process.env.XML_PATH;

module.exports.isNullOrEmpty = (value) => {    
    if(value === null || value === '' || value === undefined || value === 'undefined') return false;
    else return true;
} 

module.exports.convertTurkishCharacter = (text) => {    
    if(text) {
        var trMap = {
            'çÇ': 'c',
            'ğĞ': 'g',
            'şŞ': 's',
            'üÜ': 'u',
            'ıİ': 'i',
            'öÖ': 'o'
        };
        for (var key in trMap) {
            text = text?.replace(new RegExp('[' + key + ']', 'g'), trMap[key]);
        }
        return text?.replace(/[^-a-zA-Z0-9\s]+/ig, '')
            .replace(/\s/gi, "-")
            .replace(/[-]+/gi, "-")
            .toLowerCase();
    }
} 

module.exports.toSnakeCase = (text) => {
    if(text) {
        return text && text.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)?.map(x => x.toLowerCase()).join('-');
    }
}

module.exports.toPriceFormat = (value) => {
    if(value) {
        value = Number(value).toFixed(2);
        return value;
    }
    else
        return null;
}

module.exports.prepareProduct = (product) => {
    if(product) {

        if(product.sub_products) {
            product.sub_products = JSON.parse(product.sub_products);
            var rootsProperty1 = [], rootsProperty2 = [], i;
            for (i = 0; i < product.sub_products.length; i += 1) {
                let subProduct = product.sub_products[i];

                if(this.isNullOrEmpty(product.sub_products[i].selling_price))
                    product.sub_products[i]["selling_price_with_vat"] = parseFloat(product.sub_products[i].selling_price) + parseFloat(product.sub_products[i].selling_price)*parseFloat(product.vat)/100;
                else
                    product.sub_products[i]["selling_price_with_vat"] = null;
  
                if(this.isNullOrEmpty(product.sub_products[i].discounted_selling_price))
                    product.sub_products[i]["discounted_selling_price_with_vat"] = parseFloat(product.sub_products[i].discounted_selling_price) + parseFloat(product.sub_products[i].discounted_selling_price)*parseFloat(product.vat)/100;
                else
                    product.sub_products[i]["discounted_selling_price_with_vat"] = null;
                
                if(this.isNullOrEmpty(subProduct.property1)) {
                    if(rootsProperty1.find(x => x.property_category_id == subProduct.property1_category_id)) {
                        if(!rootsProperty1.find(x => x.property_category_id == subProduct.property1_category_id)?.properties?.find(x => x.property_id == subProduct.property1)) {
                            rootsProperty1.find(x => x.property_category_id == subProduct.property1_category_id).properties.push({
                                property_name: subProduct.property1_name,
                                property_id: subProduct.property1,
                                is_active: true
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
                                    property_id: subProduct.property1,
                                    is_active: true
                                }
                            ]
                        })
                }
                
    
                if(this.isNullOrEmpty(subProduct.property2)) {
                    if(rootsProperty2.find(x => x.property_category_id == subProduct.property2_category_id)) {
                        if(!rootsProperty2?.find(x => x.property_category_id == subProduct.property2_category_id)?.properties?.find(x => x.property_id == subProduct.property2)) {
                            rootsProperty2.find(x => x.property_category_id == subProduct.property2_category_id).properties.push({
                                property_name: subProduct.property2_name,
                                property_id: subProduct.property2,
                                is_active: true
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
                                    property_id: subProduct.property2,
                                    is_active: true
                                }
                            ]
                        })
                }
    
                
            }
            product["property1"] = rootsProperty1[0];
            product["property2"] = rootsProperty2[0];
            product["hasProperty"] = true;
        }
        else
            product["hasProperty"] = false;

        if(product.attributes)
            product.attributes = JSON.parse(product.attributes);

        if(product.categories)
            product.categories = JSON.parse(product.categories);

        if(product.images)
            product.images = JSON.parse(product.images);

        if(product.showcase_image)
            product.showcase_image = JSON.parse(product.showcase_image);

        
        product["selling_price_with_vat"] = parseFloat(product.selling_price) + parseFloat(product.selling_price)*parseFloat(product.vat)/100;
        product["discounted_selling_price_with_vat"] = parseFloat(product.discounted_selling_price) + parseFloat(product.discounted_selling_price)*parseFloat(product.vat)/100;

        return product;
    }
    else
        return null;
}

module.exports.mysqlQuery = (query) => {
    if(query) {
        return new Promise(resolve => {
            connection.query(query, function(result, error){
                if(error)
                    resolve({
                        result:false,
                        data:null,
                        message:error.sqlMessage
                    });
                else
                    resolve({
                        result:true,
                        data:result,
                        message:"success"
                    });
            });
        })
    }
}

module.exports.productQueryById = (id,language) => {
    if(id) {
        var query;
        language = language || 'tr';
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
            p.images
        FROM product as p
        Where p.id=` + id;

        return query;
    }
    else 
        return null
}

module.exports.getCartDetails = (customer,language,payment_code) => {
    const _this = this;
    return new Promise(async resolve => {
        var query, cart= {
            cart: {},
            total_count:0,
            currency:null,
            price_cart:0,
            price_cargo:0,
            total_price:0,
            pay_door_price:0,
            wire_transfer_price:0,
            payment_code:payment_code,
            products:[]
        }

        let cartData = await _this.mysqlQuery(`Select c.id,c.delivery_address_id,c.invoice_address_id, c.is_gift_cart, c.is_gift_note_active,c.gift_note,c.cargo_id,c.price_gift_package,c.currency_id,c.general_note,c.price_personalization,c.is_delivery_date_active,c.delivery_date_text,c.delivery_date,c.selected_campaign_list,c.campaign_list, cur.name as currency_name , cur.code as currency_code From cart as c JOIN currency as cur ON c.currency_id = cur.id Where c.is_ordered = 0 and (c.customer_id = ${SqlString.escape(customer)} or c.guest_code = ${SqlString.escape(customer)})`);
    
        if(cartData.result) {
            cart.cart = cartData.data[0];
        }
    
        query = `
            SELECT c_p.* 
            FROM cart as c
            JOIN cart_product as c_p
            ON c.id = c_p.cart_id
            WHERE c.is_ordered = 0 and (c.customer_id = ${SqlString.escape(customer)} or c.guest_code = ${SqlString.escape(customer)})
        `;
    
        connection.query(query, async function (results, error, fields) {
            if(error){
                resolve(false);
            }
            else {
                if(results && results.length > 0) {
                    var totalCount=0,cartPrice=0,cargoPrice=0,cargo_price_result,pay_wire_transfer_price=0,pay_door_price=0;
                    for (let i = 0; i < results.length; i++) {
                        const item = results[i];
                        let result = await _this.mysqlQuery(_this.productQueryById(item.product_id,language));
                        if(result) {
                            var product = result.data[0],price,selling_price,discounted_selling_price;

                            product["cart_product_id"] = item.id;

                            if(product && product.images)
                                product.images = JSON.parse(product.images);

                            if(product && product.attributes)
                                product.attributes = JSON.parse(product.attributes);

                            if(product && product.categories)
                                product.categories = JSON.parse(product.categories);

                            if(product && product.showcase_image)
                                product.showcase_image = JSON.parse(product.showcase_image);
    
                            if(product && product.sub_products) {
                                product.sub_products = JSON.parse(product.sub_products);
                                let subPro = product.sub_products?.find(x => x.id == item.sub_product_id);


                                product["property1"] = subPro?.property1_name;
                                product["property2"] = subPro?.property2_name;
                                product["property1_category_name"] = subPro?.property1_category_name;
                                product["property2_category_name"] = subPro?.property2_category_name;

                                if(_this.isNullOrEmpty(subPro)) {
                                    if(_this.isNullOrEmpty(subPro.discounted_selling_price)) {
                                        price = parseFloat(subPro.discounted_selling_price);
                                        discounted_selling_price = parseFloat(subPro.discounted_selling_price);
                                        selling_price = parseFloat(subPro.selling_price);
                                    } 
                                    else if(_this.isNullOrEmpty(subPro.selling_price)) {
                                        price = parseFloat(subPro.selling_price);
                                        selling_price = parseFloat(subPro.selling_price);
                                    }
                                    else {
                                        price = parseFloat(product.on_sale == 1 ? product.discounted_selling_price : product.selling_price);
                                        discounted_selling_price = parseFloat(product.discounted_selling_price);
                                        selling_price = parseFloat(product.selling_price);
                                    }
                                }
                                else {
                                    discounted_selling_price = parseFloat(product.discounted_selling_price);
                                    selling_price = parseFloat(product.selling_price);
                                    price = parseFloat(product.on_sale == 1 ? product.discounted_selling_price : product.selling_price);
                                }
                            }
                            else {
                                discounted_selling_price = parseFloat(product.discounted_selling_price);
                                selling_price = parseFloat(product.selling_price);
                                price = parseFloat(product.on_sale == 1 ? product.discounted_selling_price : product.selling_price);
                            }
                            
                            product["selling_price_with_vat"] = selling_price + (selling_price*parseFloat(product.vat)/100);
                            product["discounted_selling_price_with_vat"] = discounted_selling_price + (discounted_selling_price*parseFloat(product.vat)/100);
                            
                            withVat = price + (price*parseFloat(product.vat)/100);
                            product["price_with_vat"] = withVat;
                            cartPrice += withVat*parseFloat(item.quantity || 1);
                            totalCount += parseFloat(item.quantity || 1);
                            product["addTime"] = item.createdAt;
                            product["quantity"] = item.quantity;
                            
    
                            cart.products.push(product);
                        }
                    }

                    if(_this.isNullOrEmpty(cart.cart.cargo_id))
                        cargo_price_result = await _this.mysqlQuery("Select * From cargo_price Where is_active=1 and cargo_id = " + cart.cart.cargo_id)
                    else 
                        cargo_price_result = await _this.mysqlQuery("Select * From cargo_price Where is_active=1")

                    
                    if(cargo_price_result && cargo_price_result.data.length > 0) {
                        for (let index = 0; index < cargo_price_result.data.length; index++) {
                            const c_p = cargo_price_result.data[index];

                            if(c_p.start_limit && c_p.end_limit) {
                                if(parseFloat(c_p.start_limit) <= parseFloat(cartPrice) && parseFloat(c_p.end_limit) >= parseFloat(cartPrice)) {
                                    cargoPrice = parseFloat(c_p.price);
                                }
                            }
                            else if(c_p.start_limit) {
                                if(parseFloat(c_p.start_limit) <= parseFloat(cartPrice)) {
                                    cargoPrice = parseFloat(c_p.price);
                                }
                            }
                            else if (c_p.end_limit) {
                                if(parseFloat(c_p.end_limit) >= parseFloat(cartPrice)) {
                                    cargoPrice = parseFloat(c_p.price);
                                }
                            }                            
                        }
                    }

                    // kapıda ödeme
                    if(payment_code == 'pay_door') {
                        var pay_door_result = await _this.mysqlQuery("Select min_limit,max_limit,price_type,price From payment_type Where code='pay_door' and is_active = 1");
                        if(pay_door_result && pay_door_result.result == true && pay_door_result.data?.length > 0) {
                            var pay_door = pay_door_result.data[0];

                            if(pay_door.price)
                                pay_door.price = Math.abs(pay_door.price);
                            else
                                pay_door.price = 0;

                            //price_type  1:yüzdelik oranı, 2:tutar farkı
                            if(pay_door.price_type == 1 && pay_door.price) {
                                pay_door_price = parseFloat(cartPrice) + (parseFloat(cartPrice)*parseFloat(pay_door.price)/100);
                            }

                            if(pay_door.price_type == 2 && pay_door.price) {
                                pay_door_price = parseFloat(pay_door.price);
                            }
                        }
                    }

                    // havale ödeme
                    if(payment_code == 'pay_wire_transfer') {
                        var pay_wire_transfer_result = await _this.mysqlQuery("Select min_limit,max_limit,price_type,price From payment_type Where code='pay_wire_transfer' and is_active = 1");
                        if(pay_wire_transfer_result && pay_wire_transfer_result.result == true && pay_wire_transfer_result.data?.length > 0) {
                            var pay_wire_transfer = pay_wire_transfer_result.data[0];

                            if(pay_wire_transfer.price)
                                pay_wire_transfer.price = Math.abs(pay_wire_transfer.price);
                            else
                                pay_wire_transfer.price = 0;

                            //price_type  1:yüzdelik oranı, 2:tutar farkı
                            if(pay_wire_transfer.price_type == 1 && pay_wire_transfer.price) {
                                pay_wire_transfer_price = (parseFloat(cartPrice)*parseFloat(pay_wire_transfer.price)/100);
                            }

                            if(pay_wire_transfer.price_type == 2 && pay_wire_transfer.price) {
                                pay_wire_transfer_price = parseFloat(pay_wire_transfer.price);
                            }
                        }
                    }

                    cart.currency = cart.cart.currency_code;
                    cart.total_count = totalCount;
                    cart.price_cart = cartPrice;
                    cart.price_cargo = cargoPrice;
                    cart.wire_transfer_price = pay_wire_transfer_price;
                    cart.pay_door_price = pay_door_price;

                    if(!cargoPrice)
                        cargoPrice = 0;

                    if(!pay_door_price)
                        pay_door_price = 0;

                    if(!pay_wire_transfer_price)
                        pay_wire_transfer_price = 0;

                    cart.total_price = cartPrice + cargoPrice + pay_door_price - pay_wire_transfer_price;
                    resolve(cart);
                }
                else {
                    resolve(false);
                }
            }
        });
    });
}

module.exports.getProductById = (id,language) => {
    const _this = this;
    return new Promise(async resolve => {
        if(id) {            
            let productData = await _this.mysqlQuery(_this.productQueryById(id,language));        
            if(productData.result) {
                let product = productData.data[0];
                product = _this.prepareProduct(product)
                resolve(product);
            }
            else
                resolve(false);
        }
        else 
            resolve(false);
    })
}

module.exports.sitemapGenerator = () => {
    const _this = this;
    return new Promise(async resolve => {
        let blogsTotalData = await _this.mysqlQuery(`Select COUNT(id) as total From blogs Where is_active = 1 and is_deleted = 0`);        
        if(blogsTotalData.result) {
            let total = blogsTotalData.data[0].total,page_size = 49999,length = Math.ceil(total/page_size);
            for (let i = 0; i < length; i++) {
                let blogsData = await _this.mysqlQuery(`Select seo_link,createdAt From blogs Where is_active = 1 and is_deleted = 0 LIMIT ${(i)*page_size},${(i+1)*page_size}`);      
                if(blogsData.result) {
                    let blogs = blogsData.data;
                    let xmlData = `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
                    `;
                    for (let j = 0; j < blogs.length; j++) {
                        const blog = blogs[j];
                        let blogDateISO = new Date(blog.createdAt).toISOString();
                        xmlData += `
                            <url>
                                <loc>${process.env.SITE_URL}/${blog.seo_link}</loc>
                                <lastmod>${blogDateISO}</lastmod>
                                <priority>0.80</priority>
                            </url>
                        `
                    }

                    xmlData += `</urlset>`;
                    var file_name = 'post-sitemap'+(i+1)+'.xml';

                    if (!fs.existsSync(XML_PATH)){
                        fs.mkdirSync(XML_PATH);
                    }

                    fs.writeFile(XML_PATH + file_name , xmlData , async function (err,file) {
                        if (err) throw err;
                    })
                }
            }          
        }

        let blogCategoriesData = await _this.mysqlQuery(`Select seo_link,createdAt From blog_category Where is_active = 1 and is_deleted = 0`);      
        if(blogCategoriesData.result) {
            let blog_categories = blogCategoriesData.data;
            let xmlData = `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
            `;
            for (let j = 0; j < blog_categories.length; j++) {
                const blog_category = blog_categories[j];
                let blogCategoryDateISO = new Date(blog_category.createdAt).toISOString();
                xmlData += `
                    <url>
                        <loc>${process.env.SITE_URL}/${blog_category.seo_link}</loc>
                        <lastmod>${blogCategoryDateISO}</lastmod>
                        <priority>0.80</priority>
                    </url>
                `
            }

            xmlData += `</urlset>`;
            var file_name = 'category-sitemap.xml';

            if (!fs.existsSync(XML_PATH)){
                fs.mkdirSync(XML_PATH);
            }

            fs.writeFile(XML_PATH + file_name , xmlData , async function (err,file) {
                if (err) throw err;
            })
        }

        let xmlStaticData = `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
            <url>
                <loc>${process.env.SITE_URL}/yumurtlama-gunu-hesaplama</loc>
                <lastmod>2023-06-24T20:42:37.111Z</lastmod>
                <priority>0.80</priority>
            </url> 
            <url>
                <loc>${process.env.SITE_URL}/dogum-tarihi-hesaplama</loc>
                <lastmod>2023-06-24T20:42:37.111Z</lastmod>
                <priority>0.80</priority>
            </url> 
            <url>
                <loc>${process.env.SITE_URL}/cin-takvimiyle-cinsiyet-hesaplama</loc>
                <lastmod>2023-06-24T20:42:37.111Z</lastmod>
                <priority>0.80</priority>
            </url> 
            <url>
                <loc>${process.env.SITE_URL}/bebek-isim-bulucu</loc>
                <lastmod>2023-06-24T20:42:37.111Z</lastmod>
                <priority>0.80</priority>
            </url> 
            <url>
                <loc>${process.env.SITE_URL}/hamilelik-kilo-hesaplama</loc>
                <lastmod>2023-06-24T20:42:37.111Z</lastmod>
                <priority>0.80</priority>
            </url> 
            <url>
                <loc>${process.env.SITE_URL}/dogum-planlayici</loc>
                <lastmod>2023-06-24T20:42:37.111Z</lastmod>
                <priority>0.80</priority>
            </url> 
            <url>
                <loc>${process.env.SITE_URL}/cocuk-gelisimi-tablosu</loc>
                <lastmod>2023-06-24T20:42:37.111Z</lastmod>
                <priority>0.80</priority>
            </url> 
            <url>
                <loc>${process.env.SITE_URL}/cocuk-boyu-hesaplama</loc>
                <lastmod>2023-06-24T20:42:37.111Z</lastmod>
                <priority>0.80</priority>
            </url> 
            <url>
                <loc>${process.env.SITE_URL}/goz-rengi-tahmini</loc>
                <lastmod>2023-06-24T20:42:37.111Z</lastmod>
                <priority>0.80</priority>
            </url> 
            <url>
                <loc>${process.env.SITE_URL}/sac-rengi-tahmini</loc>
                <lastmod>2023-06-24T20:42:37.111Z</lastmod>
                <priority>0.80</priority>
            </url> 
            <url>
                <loc>${process.env.SITE_URL}/bebek-asi-takvimi-hesaplama</loc>
                <lastmod>2023-06-24T20:42:37.111Z</lastmod>
                <priority>0.80</priority>
            </url>
            <url>
                <loc>${process.env.SITE_URL}/hakkimizda</loc>
                <lastmod>2023-06-24T20:42:37.111Z</lastmod>
                <priority>0.80</priority>
            </url>
            <url>
                <loc>${process.env.SITE_URL}/cerez-politikasi</loc>
                <lastmod>2023-06-24T20:42:37.111Z</lastmod>
                <priority>0.80</priority>
            </url>
            <url>
                <loc>${process.env.SITE_URL}/kisisel-verilerin-korunmasi-politikasi</loc>
                <lastmod>2023-06-24T20:42:37.111Z</lastmod>
                <priority>0.80</priority>
            </url>
            <url>
                <loc>${process.env.SITE_URL}/kullanim-sart-ve-kosullari</loc>
                <lastmod>2023-06-24T20:42:37.111Z</lastmod>
                <priority>0.80</priority>
            </url>
            <url>
                <loc>${process.env.SITE_URL}/iletisim</loc>
                <lastmod>2023-06-24T20:42:37.111Z</lastmod>
                <priority>0.80</priority>
            </url>
            <url>
                <loc>${process.env.SITE_URL}/uye-giris</loc>
                <lastmod>2023-06-24T20:42:37.111Z</lastmod>
                <priority>0.80</priority>
            </url> 
            <url>
                <loc>${process.env.SITE_URL}/uye-kayit</loc>
                <lastmod>2023-06-24T20:42:37.111Z</lastmod>
                <priority>0.80</priority>
            </url> 
            <url>
                <loc>${process.env.SITE_URL}/uye-sifremi-unuttum</loc>
                <lastmod>2023-06-24T20:42:37.111Z</lastmod>
                <priority>0.80</priority>
            </url> 
        </urlset>
        `;

        var file_name_static = 'static-sitemap.xml';

        if (!fs.existsSync(XML_PATH)){
            fs.mkdirSync(XML_PATH);
        }

        fs.writeFile(XML_PATH + file_name_static , xmlStaticData , async function (err,file) {
            if (err) throw err;
        })

        let xmlIndexData = `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
            <url>
                <loc>${process.env.SITE_URL}/post-sitemap1.xml</loc>
                <lastmod>2023-06-24T20:42:37.111Z</lastmod>
                <priority>0.80</priority>
            </url> 
            <url>
                <loc>${process.env.SITE_URL}/category-sitemap.xml</loc>
                <lastmod>2023-06-24T20:42:37.111Z</lastmod>
                <priority>0.80</priority>
            </url> 
            <url>
                <loc>${process.env.SITE_URL}/static-sitemap.xml</loc>
                <lastmod>2023-06-24T20:42:37.111Z</lastmod>
                <priority>0.80</priority>
            </url> 
        </urlset>
        `;

        var file_name_index = 'sitemap.xml';

        if (!fs.existsSync(XML_PATH)){
            fs.mkdirSync(XML_PATH);
        }

        fs.writeFile(XML_PATH + file_name_index , xmlIndexData , async function (err,file) {
            if (err) throw err;
        })

        resolve(true);
    })
}