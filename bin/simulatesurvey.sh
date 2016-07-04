#!/usr/bin/env node
var products = require("./products.js").products;
var context = require("./context.js").context;
var request = require('request');
var async = require('async');
var querystring = require('querystring');

function getRandomInt(min, max) {
    var r = (Math.random() * (max - min)) + min;
    return Math.round(r);
}
function getRandomObject(arr) {
	var min = 0;
	var max = arr.length - 1;
    var random = getRandomInt(min, max);
    var obj = arr[random];
    return obj;
}

function getAccessToken() {
	// get oauth data
	var clientId = process.env.OAUTH_CLIENT_ID;
	var clientSecret = process.env.OAUTH_CLIENT_SECRET;
	var username = process.env.OAUTH_USERNAME;
	var password = process.env.OAUTH_PASSWORD;	
	
	// create request and post
	var postData = querystring.stringify({
		"grant_type": "password", 
		"client_id": clientId, 
		"client_secret": clientSecret, 
		"username": username, 
		"password": password
	});
	var contentLength = postData.length;
	request.post({
		"url": context.urls.oauth_token, 
		"body": postData,
		"headers": {
			'Content-Length': contentLength,
			'Content-Type': 'application/x-www-form-urlencoded'
		}
	}, function(error, response, body) {
		// get access token and store in context
		var obj = JSON.parse(body);
		var access_token = obj.access_token;
		var instance_url = obj.instance_url;
		context.access_token = access_token;
		context.instance_url = instance_url;

		// create survey
		chooseProductAndCreateSurvey();
	});
}

function createAnswersForSurvey(survey, survey_id, answers) {
	async.each(answers, function(answer, callback) {
		request.post({
			"headers": {
				"Authorization": "Bearer " + context.access_token,
				"Accept": "application/json"
			},
			"url": context.instance_url + context.urls.sobjects + "survey_answer__c",
			"json": answer
		}, function(error, response, body) {
			callback(error);
		});
	}, function(err) {
		// all done
		console.log("Created <" + answers.length + "> answers to survey with id <" + survey_id + ">");
	});
}

function chooseProductAndCreateSurvey() {
	// get product
	var product = getRandomObject(products);

	// query for opporunity info
	var query = "select contactid, opportunityid, opportunitycontactrole.opportunity.name, opportunitycontactrole.contact.firstname, opportunitycontactrole.contact.lastname, opportunitycontactrole.contact.email, opportunitycontactrole.contact.account.id,opportunitycontactrole.contact.account.name from opportunitycontactrole where opportunitycontactrole.contact.email != null and opportunitycontactrole.opportunity.iswon=true and opportunitycontactrole.opportunity.isclosed=true and opportunitycontactrole.opportunity.closedate >= 2016-01-01 and opportunitycontactrole.opportunity.closedate < 2018-12-31 and opportunitycontactrole.opportunityid in (select opportunityid from opportunitylineitem where productcode='" + product.ProductCode + "')";
	request.get({
		"headers": {
			"Authorization": "Bearer " + context.access_token,
			"Accept": "application/json"
		},
		"url": context.instance_url + context.urls.query,
		"qs": {
			"q": query
		}
	}, function(error, response, body) {
		if (response.statusCode != 200) {
			console.log({
				"Status": "ERROR",
				"ErrorCode": "InvalidQuery",
				"Error": body
			});
			return;
		}

		// parse
		var obj = JSON.parse(body);
		
		// get random opporunity record
		var op = getRandomObject(obj.records);
		if (!op) {
			console.log("No opportunities with product (" + product.ProductCode + "/" + product.Name + ") - searching again...");
			for (var idx in products) {
				if (products[idx].ProductCode == product.ProductCode) {
					products.splice(idx, 1);
					chooseProductAndCreateSurvey();
					return;		
				}
			}
			return;
		}

		// create survey and answers
		var survey = {
		    "Name": "Product survey Q3-2016: " + op.Contact.FirstName + " " + op.Contact.LastName + " (" + (op.Contact.Account ? op.Contact.Account.Name : "no account") + ")",
		    "Contact__c": op.ContactId,
		    "Account__c": op.Contact.Account ? op.Contact.Account.Id : null,
		    "Opportunity__c": op.OpportunityId,
		    "Product__c": product.Id
		};
		var answers = [
			{"Name": "QID-21233", "Question__c": "How likely are you to buy from us again?", "Answer__c": "75%"},
			{"Name": "QID-35633", "Question__c": "Did you find what you were looking for?", "Answer__c": "Yes"},
			{"Name": "QID-23718", "Question__c": "On a scale from 1-5 rate your owerall impression of the store", "Answer__c": "4"},
			{"Name": "QID-92347", "Question__c": "On a scale from 1-5 how difficult was the store to use?", "Answer__c": "1"},
			{"Name": "QID-23710", "Question__c": "Did you use the product configurator?", "Answer__c": "Yes"}
		];

		// post survey and grab id
		request.post({
			"headers": {
				"Authorization": "Bearer " + context.access_token,
				"Accept": "application/json"
			},
			"url": context.urls.sobjects + "survey__c",
			"json": survey
		}, function(error, response, body) {
			var obj = body;
			var survey_id = obj.id;
			console.log("Created survey with id <" + survey_id + ">: " + survey.Name);
			answers.forEach(function(a) {
				a.Survey__c = survey_id;
			});
			
			// create answers
			createAnswersForSurvey(survey, survey_id, answers);
		});
	});
}
getAccessToken();

