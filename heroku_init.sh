#!/bin/sh
heroku creat sfdcsurveyapp
heroku addons:create heroku-postgresql:hobby-dev
heroku addons:create sendgrid:starter
