var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	// verify the setup
	console.log(process.env);
	if (!process.env.OAUTH_CLIENT_ID || !process.env.OAUTH_CLIENT_SECRET || !process.env.OAUTH_REDIRECT_URI) {
		// invalid setup
		res.render("error", {
			"message": "Missing OAuth configuration for application",
			"error": {
				"status": "missing_oauth_config"
			}
		});
		return;
	}
	if (!req.session.user) {
		// no user object - send user to authorization
		res.redirect(302, "/oauth20_cb");
	} else {
		res.render('index', {
			"title": 'Express', 
			"username": req.session.user.salesforce.username, 
			"display_name": req.session.user.salesforce.display_name
		});
	}
});

module.exports = router;
