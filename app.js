var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var PoolManager = require('mysql-connection-pool-manager');
var http = require('http');
var cors = require('cors');
require('dotenv').config({ path: __dirname + '/.env' });
const fs = require('fs');
const elFinder = require('elfinder-node');

var app = express();

const uploadsDir = path.resolve(__dirname, './uploads/Data');
const roots = [
  {
    driver: elFinder.LocalFileStorage,
    URL: '/Data/', //Required
    path: uploadsDir, //Required
    permissions: { read: 1, write: 1, lock: 0 },
  }
];


var corsOptions = {
  origin: "*",
  credentials:true,
  optionSuccessStatus:200
}

app.use(cors(corsOptions));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.json({limit: '50mb', type: 'application/json'}));
app.use(bodyParser.urlencoded({ parameterLimit: 100000,limit: '50mb',extended: true }));
app.use(cookieParser());
app.use('/Data' , express.static(path.join(__dirname, 'uploads/Data')));
app.use('/connector', elFinder(roots));

app.get('/elfinder', function (req, res) {
    res.sendFile(path.resolve(__dirname, './elfinder.html'));
});

const mySql = {
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_URL,
  port: process.env.DATABASE_PORT,
  insecureAuth: true,
  debug: false
}
const poolManager = {
  idleCheckInterval: 1000,
  maxConnextionTimeout: 30000,
  idlePoolTimeout: 3000,
  errorLimit: 10,
  preInitDelay: 50,
  sessionTimeout: 60000,
  mySQLSettings: mySql
}

global.connection = PoolManager(poolManager);

var product = require('./routes/product');
var attribute = require('./routes/attribute');
var category = require('./routes/category');
var header_menu = require('./routes/header_menu');
var brand = require('./routes/brand');
var language = require('./routes/language');
var blog = require('./routes/blog');
var blog_category = require('./routes/blog_category');
var contents = require('./routes/contents');
var contents_category = require('./routes/contents_category');
var user = require('./routes/user');
var token = require('./routes/token');
var customer = require('./routes/customer');
var customerToken = require('./routes/customerToken');
var image = require('./routes/image');
var mail = require('./routes/mail');
var html_content = require('./routes/html_content');
var contact_application = require('./routes/contact_application');
var siteSettings = require('./routes/siteSettings');
var settings = require('./routes/settings');
var search = require('./routes/search');
var site_content_data = require('./routes/site_content_data');
var cities = require('./routes/cities');
var page = require('./routes/page');
var names = require('./routes/names');

app.use('/api/v1/product', product);
app.use('/api/v1/attribute', attribute);
app.use('/api/v1/category', category);
app.use('/api/v1/header_menu', header_menu);
app.use('/api/v1/brand', brand);
app.use('/api/v1/language', language);
app.use('/api/v1/blog', blog);
app.use('/api/v1/blog_category', blog_category);
app.use('/api/v1/contents', contents);
app.use('/api/v1/contents_category', contents_category);
app.use('/api/v1/user', user);
app.use('/api/v1/token', token);
app.use('/api/v1/customer', customer);
app.use('/api/v1/customerToken', customerToken);
app.use('/api/v1/mail', mail.router);
app.use('/api/v1/image', image);
app.use('/api/v1/html_content', html_content);
app.use('/api/v1/contact_application', contact_application);
app.use('/api/v1/siteSettings', siteSettings);
app.use('/api/v1/settings', settings);
app.use('/api/v1/search', search);
app.use('/api/v1/site_content_data', site_content_data);
app.use('/api/v1/city', cities);
app.use('/api/v1/page', page);
app.use('/api/v1/names', names);

app.all('*', function (req, res, next) {
  console.log('req start: ', req.secure, req.hostname, req.url, app.get('port'));

  if (req.secure) {
    return next();
  }

  res.redirect('https://' + req.hostname + ':' + app.get('secPort') + req.url);
});

var server = http.createServer(app);
server.listen(process.env.PORT || 4001);