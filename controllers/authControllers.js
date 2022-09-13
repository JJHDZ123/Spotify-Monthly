const date = require('date-and-time');
const qs = require('qs');
const { got } = require('got-cjs');
const { makeState } = require('../utils/makeState.js');
const { CLIENT_ID, CLIENT_SECRET, redirect_uri } = require('../utils/Constants.js');

const state = makeState(16);
var access_token = '';
var refresh_token = '';

module.exports.login = (req, res) => {
	const scope = 'user-read-private user-read-email user-follow-read';

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
		})
		.catch((err) => {
			console.log(err);
		});

	if (access_token) {
		res.redirect('/loading');
	}
};

module.exports.makeMonthlyPlaylist = async (req, res) => {
	const now = new Date();
	const currYear = date.format(now, 'YYYY');
	const currMonth = '08';
	//const currMonth = date.format(now, 'MM');
	var userArtists = [];
	var currMonthAlbums = [];
	var currMonthSongs = [];
	try {
		//GET FOLLOWED ARTIST FOR USER
		await got
			.get('https://api.spotify.com/v1/me/following?type=artist', {
				headers : {
					Authorization : 'Bearer ' + access_token
				}
			})
			.then((response) => {
				const resArtists = JSON.parse(response.body);

				userArtists = resArtists.artists.items.map((artist) => {
					return artist.id;
				});
			});

		if (userArtists.length <= 0) {
			return res.send('You are not following any Artists!');
		}

		//GET ALBUMS FOR CURRENT MONTH
		await Promise.all(
			userArtists.map(async (currId) => {
				await got
					.get(`https://api.spotify.com/v1/artists/${currId}/albums`, {
						headers : {
							Authorization : 'Bearer ' + access_token
						}
					})
					.then((response) => {
						const artistAlbums = JSON.parse(response.body);
						const currMonthAlbumsFilter = artistAlbums.items.map((album) => {
							const albumRY = album.release_date.substring(0, 4);
							const albumRM = album.release_date.substring(5, 7);

							if (currYear === albumRY && currMonth === albumRM) {
								return album.id;
							}

							return null;
						});

						const currMonthAlbumId = currMonthAlbumsFilter.filter((id) => id !== null);

						if (currMonthAlbumId[0] !== undefined) {
							currMonthAlbums = [ ...currMonthAlbums, ...currMonthAlbumId ];
						}
					});
			})
		);
	} catch (error) {
		console.log('in error');
		console.log(error);
	}
};

module.exports.logout = (req, res) => {};
