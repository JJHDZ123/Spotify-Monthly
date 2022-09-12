//const User = require('../models/userModel.js');
const request = require('request');
require('dotenv').config();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const redirect_uri = 'http://localhost:5000/auth/callback';

module.exports.login = (req, res) => {
	const scope = 'user-read-private user-read-email';

	res.redirect(
		'https://accounts.spotify.com/authorize?' +
			new URLSearchParams({
				client_id     : CLIENT_ID,
				response_type : 'code',
				redirect_uri  : redirect_uri,
				scope         : scope
			}).toString()
	);
};

module.exports.callback = (req, res) => {
	var code = req.query.code || null;

	var authOptions = {
		url     : 'https://accounts.spotify.com/api/token',
		form    : {
			code         : code,
			redirect_uri : redirect_uri,
			grant_type   : 'authorization_code'
		},
		headers : {
			Authorization : 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET, 'utf-8').toString('base64')
		},
		json    : true
	};

	request.post(authOptions, function(error, response, body) {
		if (!error && response.statusCode === 200) {
			var access_token = body.access_token;
			res.send({
				access_token : access_token
			});
		}
	});
};

module.exports.handleRefreshToken = (req, res) => {};

module.exports.logout = (req, res) => {};
