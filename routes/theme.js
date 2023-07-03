var express = require('express');
var router = express.Router();
const passport = require('passport');
const fs = require('fs');
var path = require('path');
const fileName = './theme.json';

router.get('/getTheme' , passport.authenticate('admin-rule', { session: false }) , function(req , res , next){
	try{
		let rawdata = fs.readFileSync(fileName);
		let selectedTheme = JSON.parse(rawdata)
		fs.readdir("./theme", (err, files) => {
		  	if (err)
		    	res.send({ success: "unsuccess", message: 'Tema getirme başarısız'});
		  	else {
		    	res.send({ success: "success", message: 'Tema getirme başarılı' , response:{theme:files , selected:selectedTheme}});	
		  	}
		})		
	}
	catch(err){
		res.send({ success: "unsuccess", message: 'Tema getirme başarısız'});
	}	
});

router.post('/add' , passport.authenticate('admin-rule', { session: false }) , function(req , res , next){
	var theme = req.body;
	try{
		fs.writeFile(fileName, JSON.stringify({"theme":theme.theme}), (err) => {
		  	if (err)
		  		res.send({ success: "unsuccess", message: 'Tema seçimi başarısız'});

		  	res.send({ success: "success", message: 'Tema seçimi başarılı'});
		  	process.exit(1);
		});		
	}
	catch(err){
		res.send({ success: "unsuccess", message: 'Tema seçimi başarısız'});
	}	
});

module.exports = router;
