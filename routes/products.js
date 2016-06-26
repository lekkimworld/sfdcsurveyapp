var express = require('express');
var router = express.Router();

/* GET products listing. */
router.get('/', function(req, res, next) {
	res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({a: 1, b: 2, c: 3}));
	
});

module.exports = router;
