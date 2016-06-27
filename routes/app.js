var express = require('express');
var router = express.Router();
var path = require("path");

/* GET home page. */
router.get('/', function(req, res, next) {
	// see if we have a session object - if not go through the OAuth flow
	if (!req.session.user) {
		// no user object in session - send user to authorization
		res.redirect(302, "/oauth20_cb");

	} else {
		// we have a user object in the session
		res.sendFile(path.join(__dirname + "/../views/app.html"));
	}
});

module.exports = router;
