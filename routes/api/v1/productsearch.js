var express = require('express');
var router = express.Router();
var async = require("async");
var request = require('request');

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

	// get arguments from body
	var searchfor = req.body.searchFor;
	var query = req.body.query;

	// product code take precedence
	if (searchfor == "code") {
		var query = "select id,productcode,name from product2 where productcode='" + query + "'";
	} else if (searchfor == "name") {
		var query = "select id,productcode,name from product2 where name like '" + query + "%'";
	} else {
		res.json({
			"Status": "ERROR",
			"ErrorCode": "InvalidRequest"
		});
		return;
	}

	// do request
	async.parallel([
		function(callback) {
			request.get({
				"headers": {
					"Authorization": "Bearer " + req.session.user.oauth.access_token,
					"Accept": "application/json"
				},
				"url": req.session.user.salesforce.urls.query,
				"qs": {
					"q": query
				}
			}, function(error, response, body) {
				if (response.statusCode != 200) {
					res.json({
						"Status": "ERROR",
						"ErrorCode": "InvalidQuery",
						"Error": body
					});
				} else {
					var obj = JSON.parse(body);
					callback(false, obj);
				}
			});
		}
	], function(err, results) {
		var obj = results[0];
		res.json(obj.records);
	});

});

module.exports = router;
