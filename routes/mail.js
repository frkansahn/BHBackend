var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');


function mailSend(mail){
	return new Promise(function(res, rej) {
		var transporter = nodemailer.createTransport({
			host: "cp62.servername.co",
			port: 465,
			secure: true,
			auth: {
				user: "info@bebegimlehayat.com",
				pass: "InfoBebek2023*",
			},
			tls: {
				rejectUnauthorized: false,
			},
		});

		var mailOptions = {
			from: '"Bebeğimle Hayat 😊" <info@bebegimlehayat.com>',
			to: mail.toMail,
			subject: mail.subject,
			text: mail.text,
			html:mail.html
		};

		transporter.sendMail(mailOptions, function(error, info){
			if (error)
				res(error);
			else
				res(info);

		});
	    
	})
	
}

router.post('/send' , async function(req , res , next){
	var mail = req.body;
	mailSend(mail).then(response => {
		console.log(response);
		res.send({"result":response});
	});	
});

module.exports = {
    router : router,
    mailSend : mailSend
};
