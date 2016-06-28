var express = require('express');
var router = express.Router();
var path = require("path");

router.get('/', function(req, res, next) {
	// see if we have a session object - if not go through the OAuth flow
	if (!req.session.user) {
		// no user object in session - send user to authorization
		res.redirect(302, "/");

	} else {
		// we have a user object in the session
		res.sendFile(path.join(__dirname + "/../views/products.html"));
	}
});

module.exports = router;
