var express = require('express');
var router = express.Router();

const jwt = require('jsonwebtoken');

const passport = require('passport');
const passportJWT = require('passport-jwt');

let ExtractJwt = passportJWT.ExtractJwt;
let JwtStrategy = passportJWT.Strategy;

let jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = 'admin';

let strategy = new JwtStrategy(jwtOptions, function (jwt_payload, next) {
  let user = getUser({ id: jwt_payload.id });

  if (user) {
    next(null, user);
  } else {
    next(null, false);
  }
});
// use the strategy
passport.use("admin-rule", strategy);

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
  .then(() => console.log('Connection has been established successfully.'))
  .catch(err => console.error('Unable to connect to the database:', err));

const User = sequelize.define('users', {
  name: {
    type: Sequelize.STRING,
  },
  username: {
    type: Sequelize.STRING,
  },
  password: {
    type: Sequelize.STRING,
  },
  phone: {
    type: Sequelize.BIGINT,
  },
  email: {
    type: Sequelize.STRING,
  }
});

const getUser = async obj => {
  return await User.findOne({
    where: obj,
  });
};

router.post('/', async function (req, res, next) {
  const { username, password } = req.body;
  if (username && password) {
    let user = await getUser({ username: username });
    if (user == null) {
      res.json({ msg: 'No such user found' });
      return false;
    }
    if (user?.password === password) {
      // from now on we'll identify the user by the id and the id is the 
      // only personalized value that goes into our token
      let payload = { id: user.id };
      let token = jwt.sign(payload, jwtOptions.secretOrKey, { expiresIn: process.env.AUTH_EXPIRES_IN });
      var newUser = {
        user: user,
        token: token
      }
      res.json({ msg: 'ok', result: newUser });
    } 
    else {
      res.json({ msg: 'Password is incorrect', result: null });
    }
  }
  else {
    res.json({ msg: 'Parametre hatası', result: null });
  }
});

router.get('/control/:token', async function (req, res, next) {
  var token = req.params.token;
  var decoded;
  try {
    decoded = jwt.verify(token, "admin");
  } catch (e) {
    return res.json({ response: { msg: 'error', response: "unauthorized" } });
  }
  var userId = decoded.id;
  let user = await getUser({ id: userId });

  res.json({ response: { msg: 'ok', response: user } });

});

module.exports = router;