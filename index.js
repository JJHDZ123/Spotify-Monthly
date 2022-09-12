const request = require('request');
const express = require('express');
require('dotenv').config();

const PORT = process.env.PORT || 5000;
const CLIENT_ID = process.env.CLIENT_ID;
const redirect_uri = 'http://localhost:5000/callback';
const app = express();

app.use(express.static('views'));

app.get('/', function(req, res) {
	res.render('index.html');
});

app.get('/login', function(req, res) {
	function makeState(length) {
		var result = '';
		var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		var charactersLength = characters.length;
		for (var i = 0; i < length; i++) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}
		return result;
	}

	const state = makeState(16);
	const reqState = state;
	console.log(reqState);
	const scope = 'user-read-private user-read-email';

	res.redirect(
		'https://accounts.spotify.com/authorize?' +
			new URLSearchParams({
				client_id     : CLIENT_ID,
				response_type : 'code',
				redirect_uri  : redirect_uri,
				scope         : scope,
				state         : state
			}).toString()
	);
});

app.get('/callback', function(req, res, next) {
	var code = req.query.code || null;
	var state = req.query.state || null;

	if (state === null) {
		res.redirect(
			'/#' +
				new URLSearchParams({
					error : 'state_mismatch'
				}).toString()
		);
	} else {
		var authOptions = {
			url     : 'https://accounts.spotify.com/api/token',
			form    : {
				code         : code,
				redirect_uri : redirect_uri,
				grant_type   : 'authorization_code'
			},
			headers : {
				Authorization :
					'Basic ' + Buffer.from(CLIENT_ID + ':' + process.env.CLIENT_SECRET, 'utf-8').toString('base64')
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
	}
});

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
