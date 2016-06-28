var express = require('express');
var router = express.Router();

router.post('/', function(req, res, next) {
	// make sure we have a user object in the session
	if (!req.session.user) {
		// no user object
		res.json({
			"Status": "ERROR", 
			"Error": "NoUser"
		});
		return;
	}

	// get product to save
	req.session.selectedProduct = req.body;

	// return
	res.json({
		"Status": "OK"
	});
});

module.exports = router;
