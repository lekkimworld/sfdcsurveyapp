var express = require('express');
var router = express.Router();
var path    = require("path");

/* GET home page. */
router.get('/', function(req, res, next) {
	// verify the setup
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
	
	// show welcome page
	res.sendFile(path.join(__dirname + "/../views/index.html"));
});

module.exports = router;
