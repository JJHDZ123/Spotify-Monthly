//const User = require('../models/userModel.js');
const { got } = require('got-cjs');
const qs = require('qs');
const { makeState } = require('../utils/makeState.js');
const { CLIENT_ID, CLIENT_SECRET, redirect_uri } = require('../utils/Constants.js');

const state = makeState(16);
var access_token = '';
var refresh_token = '';

module.exports.login = (req, res) => {
	const scope = 'user-read-private user-read-email';

	res.redirect(
		'https://accounts.spotify.com/authorize?' +
			new URLSearchParams({
				client_id     : CLIENT_ID,
				response_type : 'code',
				redirect_uri  : redirect_uri,
				show_dialog   : true,
				state         : state,
				scope         : scope
			}).toString()
	);
};

module.exports.callback = async (req, res) => {
	var code = req.query.code || null;
	var reqState = req.query.state || null;

	if (reqState === null || reqState !== state) {
		res.redirect(
			'/#' +
				qs.stringify({
					error : 'state_mismatch'
				})
		);
	} else {
		const bodyOption = {
			json         : true,
			code         : code,
			redirect_uri : redirect_uri,
			grant_type   : 'authorization_code'
		};
		var authOptions = {
			url     : 'https://accounts.spotify.com/api/token',
			headers : {
				Authorization : 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET, 'utf-8').toString('base64')
			},
			form    : bodyOption
		};
	}

	await got
		.post(authOptions)
		.then((response) => {
			const res = JSON.parse(response.body);

			access_token = res.access_token;
			refresh_token = res.refresh_token;
			console.log(access_token);
		})
		.catch((err) => {
			console.log(err);
		});

	if (access_token) {
		res.redirect('/home');
	}
};

module.exports.makeMonthlyPlaylist = (req, res) => {};

module.exports.logout = (req, res) => {};
