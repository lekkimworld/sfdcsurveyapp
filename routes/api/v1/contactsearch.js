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
	// make sure user selected a product
	if (!req.session.selectedProduct) {
		// no user object
		res.json({
			"Status": "ERROR", 
			"Error": "NoProductSelected"
		});
		return;
	}

	// get arguments from body
	var fromDate = req.body.fromDate;
	var toDate = req.body.toDate;
	var productCode = req.session.selectedProduct.ProductCode;

	// product code take precedence
	var query = "select contactid, opportunityid, opportunitycontactrole.opportunity.name, " + 
		"opportunitycontactrole.contact.firstname, " +
		"opportunitycontactrole.contact.lastname, opportunitycontactrole.contact.email, " +
		"opportunitycontactrole.contact.account.id,opportunitycontactrole.contact.account.name " +
		"from opportunitycontactrole where opportunitycontactrole.contact.email != null and " + 
		"opportunitycontactrole.opportunity.iswon=true and opportunitycontactrole.opportunity.isclosed=true " + 
		"and opportunitycontactrole.opportunity.closedate >= " + fromDate + 
		" and opportunitycontactrole.opportunity.closedate < " + toDate + 
		" and opportunitycontactrole.opportunityid in (select opportunityid from opportunitylineitem " + 
		"where productcode='" + productCode + "')";

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
