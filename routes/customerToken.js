var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');
const passportLocal = require('passport-local');
const passportJWT = require('passport-jwt');
const FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth20').Strategy;
const CryptoJS = require("crypto-js");
const SqlString = require('sqlstring');
var publicFunction = require('./public.js');

router.use(passport.initialize());

const Sequelize = require('sequelize');

const sequelize = new Sequelize(
    process.env.DATABASE_URL,
    process.env.DATABASE_USER,
    process.env.DATABASE_PASSWORD,
    {
        host: process.env.DATABASE_HOST,
        port: process.env.DATABASE_PORT,
        dialect: 'mysql',
        dialectOptions: {
            insecureAuth: true
        }
    }
);

sequelize
    .authenticate()
    .then(() => console.log())
    .catch(err => console.error('Unable to connect to the database:', err));

const User = sequelize.define('customers', {
    id: {
        primaryKey: true,
        type: Sequelize.BIGINT
    },
    type: {
        type: Sequelize.TINYINT,
    },
    facebookId: {
        type: Sequelize.STRING, 
    },
    googleId: {
        type: Sequelize.STRING, 
    },
    name: {
        type: Sequelize.STRING,
    },
    surname: {
        type: Sequelize.STRING,
    },
    image: {
        type: Sequelize.STRING,
    },
    identity_number: {
        type: Sequelize.STRING,
    },
    password: {
        type: Sequelize.STRING,
    },
    phone: {
        type: Sequelize.STRING,
    },
    email: {
        type: Sequelize.STRING,
    },
    address: {
        type: Sequelize.STRING,
    },
    birthday: {
        type: Sequelize.DATE,
    },
    home_phone: {
        type: Sequelize.STRING,
    },
    office_phone: {
        type: Sequelize.STRING,
    },
    fax: {
        type: Sequelize.STRING,
    },
    zip_code: {
        type: Sequelize.INTEGER,
    },
    company_name: {
        type: Sequelize.INTEGER,
    },
    tax_office: {
        type: Sequelize.INTEGER,
    },
    tax_number: {
        type: Sequelize.STRING,
    },
    gender: {
        type: Sequelize.INTEGER,
    },
    country_id: {
        type: Sequelize.INTEGER,
    },
    state_id: {
        type: Sequelize.INTEGER,
    },
    city_id: {
        type: Sequelize.INTEGER,
    },
    email_notification: {
        type: Sequelize.TINYINT,
    },
    sms_notification: {
        type: Sequelize.TINYINT,
    },
    call_notification: {
        type: Sequelize.TINYINT,
    },
    approval_membership_aggrement: {
        type: Sequelize.TINYINT,
    },
    ip: {
        type: Sequelize.STRING,
    },
});

let ExtractJwt = passportJWT.ExtractJwt;
let JwtStrategy = passportJWT.Strategy;

let jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = 'customer';

let strategy = new JwtStrategy(jwtOptions, function (jwt_payload, next) {
    let user = getUser({ id: jwt_payload.id });

    if (user) {
        next(null, user);
    } else {
        next(null, false);
    }
});
// use the strategy
passport.use("customer-rule", strategy);
passport.use(new FacebookStrategy(
    {
        clientID: '273260455131014',
        clientSecret: '228711bb592db017ad40e832ababf2f8',
        callbackURL: process.env.API_SITE_URL + "/api/v1/customerToken/facebook/callback",
        graphAPIVersion:'v16.0'
    },
    async function (accessToken, refreshToken, profile, cb) {

        const [user, created] = await User.findOrCreate(
            { 
                where : {facebookId: profile.id},
                defaults: { 
                    facebookId: profile.id,
                    name: profile.name.givenName, 
                    surname: profile.name.familyName 
                }
            }
        )
        
        cb(null,user);
    }
));

passport.use(new GoogleStrategy({
    clientID: '47797117803-1ps0ppsstpmuoscdknjh2heh9crm4afe.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: process.env.API_SITE_URL + "/api/v1/customerToken/google/callback"
  },
  async function(accessToken, refreshToken, profile, cb) {
    const [user, created] = await User.findOrCreate(
        { 
            where : {googleId: profile.id},
            defaults: { 
                googleId: profile.id,
                name: profile.name.givenName, 
                surname: profile.name.familyName 
            }
        }
    )
    cb(null,user);
  }
));



const getUser = async obj => {
    return await User.findOne({
        where: obj,
    });
};

router.post('/', async function (req, res, next) {
    const { email, phone, password } = req.body;
    if ((email || phone) && password) {
        let user = null;
        if (phone) {
            user = await getUser({ phone: phone });
        }

        if (email) {
            user = await getUser({ email: email });
        }
        if (!user) {
            res.send({ status: 401, success: "unsuccess", code: "no_user" });
        }
        if (CryptoJS.AES.decrypt(user.password, process.env.CRYPTO_SECRET_KEY).toString(CryptoJS.enc.Utf8) === password) {
            let payload = { id: user.id };
            let token = jwt.sign(payload, jwtOptions.secretOrKey, { expiresIn: process.env.AUTH_EXPIRES_IN });
            user.password = "*****";
            var userData = {
                user: user,
                token: token
            }
            res.send({ status: 401, success: "success", code: "logged_in", result: userData });
        } else {
            res.send({ status: 401, success: "unsuccess", code: "password_incorrect" });
        }
    }
    else {
        res.send({ status: 401, success: "unsuccess", code: "missing_information" });
    }
});

router.get('/customer/:token', async function (req, res, next) {
    var token = req.params.token;
    var decoded;
    try {
        decoded = jwt.verify(token, "customer");
    } catch (e) {
        return res.json({ msg: 'error', response: "unauthorized" });
    }
    var userId = decoded.id;
    let user = await getUser({ id: userId });

    user.password = "*****";
    res.json({ msg: 'ok', response: user });

});

router.get('/me', passport.authenticate('customer-rule', { session: false }) , async function (req, res, next) {
    var user = await req.user;
    user.password = "*****";
    res.send({ status: 200, success: "success", code: "logged_in", result: user });
});

router.get('/login/facebook', passport.authenticate('facebook' ,{scope: [ 'email', 'user_location' ]}));

router.get('/facebook/callback',passport.authenticate('facebook', { session: false }),function(req, res) {
    let payload = { id: req.user.id };
    let token = jwt.sign(payload, jwtOptions.secretOrKey, { expiresIn: process.env.AUTH_EXPIRES_IN });
    res.redirect(process.env.SITE_URL + `?platform=facebook&token=${token}`);
});

router.get('/login/google', passport.authenticate('google', { scope: ['profile'] }));

router.get('/google/callback', passport.authenticate('google', { session: false}), function(req, res) {
    let payload = { id: req.user.id };
    let token = jwt.sign(payload, jwtOptions.secretOrKey, { expiresIn: process.env.AUTH_EXPIRES_IN });
    res.redirect(process.env.SITE_URL + `?platform=google&token=${token}`);
});


router.post('/cartGuestToCustomer', async function (req, res, next) {
    try {
        var data = req.body;

        if (data.guest_code && data.token) {
            var token = data.token;
            var decoded;
            try {
                decoded = jwt.verify(token, "customer");
            } catch (e) {
                return res.json({ msg: 'error', response: "unauthorized" });
            }
            var customer_id = decoded.id;
            let cartByCustomerId = await publicFunction.mysqlQuery(`Select * From cart Where customer_id = ${SqlString.escape(customer_id)}`);
            if (cartByCustomerId && cartByCustomerId.result && cartByCustomerId.data.length > 0) {
                cartByCustomerId.data[0].id
                await publicFunction.mysqlQuery(`Update cart_product Set cart_id = ${SqlString.escape(cartByCustomerId.data[0].id)} Where cart_id = (SELECT id FROM cart Where guest_code = ${SqlString.escape(data.guest_code)})`);
                await publicFunction.mysqlQuery(`Delete FROM cart Where guest_code = ${SqlString.escape(data.guest_code)}`);

                let productsByCartId = await publicFunction.mysqlQuery(`Select * From cart_product Where cart_id = ${SqlString.escape(cartByCustomerId.data[0].id)}`);

                if (productsByCartId && productsByCartId.result && productsByCartId.data.length > 0) {
                    productsByCartId.data.map(async item => {
                        let findProduct = productsByCartId.data.find(x => x.product_id == item.product_id && x.sub_product_id == item.sub_product_id && x.id != item.id)
                        if (findProduct) {
                            await publicFunction.mysqlQuery(`Delete FROM cart_product Where id = ${SqlString.escape(item.id)}`);
                            let productQuantity = item.quantity + findProduct[0]?.quantity;

                            let hasSubProduct = false;
                            let subProductData = await publicFunction.mysqlQuery(`Select id,stock From sub_product Where is_deleted=0 and is_active=1 and product_id = ${SqlString.escape(findProduct.product_id)}`);
                            if (subProductData && subProductData.result && subProductData.data.length > 0) {
                                hasSubProduct = true;
                                if (subProductData.data.find(x => x.id == findProduct.sub_product_id).stock < productQuantity) {
                                    productQuantity = subProductData.data.find(x => x.id == findProduct.sub_product_id).stock;
                                }
                            }

                            if (!hasSubProduct) {
                                let productData = await publicFunction.mysqlQuery(`Select id,stock From product Where is_deleted=0 and is_active=1 and id = ${SqlString.escape(findProduct.product_id)}`);

                                if (productData && productData.result && productData.data.length > 0) {
                                    if (productData.data[0].stock < productQuantity) {
                                        productQuantity = productData.data[0].stock;
                                    }
                                }
                            }

                            await publicFunction.mysqlQuery(`Update cart_product Set quantity = ${SqlString.escape(productQuantity)} Where id = ${SqlString.escape(findProduct[0].id)}`);
                        }
                    })
                }
            }
            else {
                await publicFunction.mysqlQuery(`Update cart Set customer_id = ${SqlString.escape(customer_id)} , is_guest = 0 , guest_code = null Where guest_code = ${SqlString.escape(data.guest_code)}`);
            }
        }

        res.send({ "status": 200, "success": "success" });
    }
    catch (err) {
        res.send({ "status": 500, "error": "error" });
    }
});

module.exports = router;