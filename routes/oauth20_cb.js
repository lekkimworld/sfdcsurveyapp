var express = require('express');
var router = express.Router();
var request = require('request');
var async = require('async');

/* GET products listing. */
router.get('/', function(req, res, next) {
	// get oauthn config from environment
	var clientId = process.env.OAUTH_CLIENT_ID;
	var clientSecret = process.env.OAUTH_CLIENT_SECRET;
	var redirectUri = encodeURIComponent(process.env.OAUTH_REDIRECT_URI);

	// get url arguments if any
	var errorCode = req.query.error;
	var authCode = req.query.code;
	if (!authCode && !errorCode) {
		// send to authorize...
		res.redirect(302, "https://login.salesforce.com/services/oauth2/authorize?response_type=code&client_id=" 
			+ clientId + "&redirect_uri=" + redirectUri + "&prompt=login%20consent");
		return;
	}

	if (errorCode) {
		// we received an error code - send to error page
		res.render('error', {message: 'Unable to authorize application - error code ' + errorCode});
		
	} else if (authCode) {
		// we received a code - exchange for auth url
		async.parallel([
    		function(callback) {
				var url = "https://login.salesforce.com/services/oauth2/token";
				var post_data = "grant_type=authorization_code&client_id=" + clientId + "&client_secret=" + clientSecret + 
					"&redirect_uri=" + redirectUri + "&code=" + authCode;
				request.post({
					headers: {'content-type': 'application/x-www-form-urlencoded'},
					url: url,
					body: post_data
				}, function(error, response, body) {
					var obj = JSON.parse(body);
					callback(false, obj);
				});
			}
		], function(err, results) {
			if(err) { console.log(err); res.send(500,"Server Error"); return; }
			var obj = results[0];
			var id_url = obj.id;
			var instance_url = obj.instance_url;
			var access_token = obj.access_token;

			// get userdata and save access_token
			async.parallel([
				function(callback) {
					request.get({
						"headers": {
							"Authorization": "Bearer " + access_token,
							"Accept": "application/json"
						},
						"url": id_url,
						"qs": {
							"version": "latest"
						}
					}, function(error, response, body) {
						var obj = JSON.parse(body);
						callback(false, obj);
					});
				}
			], function(err, results) {
				if(err) { console.log(err); res.send(500,"Server Error"); return; }
				var obj = results[0];

				// save object in session
				req.session.user = {
					"oauth": {
						"access_token": access_token,
						"id_url": id_url,
						"instance_url": instance_url
					},
					"salesforce": obj
				};

				// send redirect back to application
				res.redirect(302, "/app");
			});
		});

	} else {
		// unexpected error
		res.render('error', {message: 'Unable to authorize application due to unexpected error'});
	}
});

module.exports = router;
