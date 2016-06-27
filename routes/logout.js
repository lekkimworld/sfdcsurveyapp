var express = require('express');
var router = express.Router();

/* GET logout */
router.get('/', function(req, res, next) {
	// remove any user object from session
	delete req.session.user;

	// send to root
	res.redirect(302, "/");
});

module.exports = router;
