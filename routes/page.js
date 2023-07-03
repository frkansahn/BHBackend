var express = require('express');
var router = express.Router();
const SqlString = require('sqlstring');
const publicFunction = require('./public');


router.get('/getTypeBySeoLink/:seoLink', async function(req, res, next) {
	let seoLink = req.params.seoLink;
	let seoLinkResult =  await publicFunction.mysqlQuery(`Select TypeBySeoLink(${SqlString.escape(seoLink)}) as result;`);
	if(seoLinkResult && seoLinkResult.data && seoLinkResult.data.length > 0) {
		res.send({"status": 200, "success": "success", "response": seoLinkResult.data[0].result});
	}
	else {
		res.send({"status": 200, "success": "unsuccess", "response": null});
	}
});

module.exports = router;
