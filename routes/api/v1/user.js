var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
	if (req.session.user) {
		// return user data
		res.json({
			"displayName": req.session.user.salesforce.display_name,
			"username": req.session.user.salesforce.username
		});
	} else {
		// no user object
		res.json({
			"Status": "ERROR", 
			"ErrorCode": "NoUser"
		})
	}
});

module.exports = router;
