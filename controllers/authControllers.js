const date = require('date-and-time');

const qs = require('qs');
const { got } = require('got-cjs');
const { makeState } = require('../utils/makeState.js');
const { CLIENT_ID, CLIENT_SECRET, redirect_uri } = require('../utils/Constants.js');

const state = makeState(16);
var access_token = '';
var refresh_token = '';

module.exports.login = (req, res) => {
	const scope = 'user-read-private user-read-email user-follow-read playlist-read-private playlist-modify-private';

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
		res.redirect('/auth/genPlaylist');
	}
};

module.exports.makeMonthlyPlaylist = async (req, res) => {
	const now = new Date();
	const playListName = date.format(now, 'MMMM, YYYY');
	const currYear = date.format(now, 'YYYY');
	const currMonth = date.format(now, 'MM');

	var userId = '';
	var playlistId = '';
	var existPlaylist = false;
	var userArtists = [];
	var currMonthAlbums = [];
	var filteredAlbums = [];
	var currMonthSongs = [];
	var existPlaylistTracks = [];
	var filteredTracks = [];

	function filterByProperty(array, propertyName) {
		var occurrences = {};

		return array.filter(function(x) {
			var property = x[propertyName];
			if (occurrences[property]) {
				return false;
			}
			occurrences[property] = true;
			return true;
		});
	}

	try {
		//CHECK TO SEE IF PLAYLIST EXISTS
		await got
			.get('https://api.spotify.com/v1/me/playlists', {
				headers : {
					Authorization : 'Bearer ' + access_token
				}
			})
			.then((response) => {
				const res = JSON.parse(response.body);
				res.items.map((playlist) => {
					if (playlist.name === playListName) {
						playlistId = playlist.id;
						existPlaylist = true;
						return;
					}

					return null;
				});
			});

		//GET USER PROFILE ID
		await got
			.get('https://api.spotify.com/v1/me', {
				headers : {
					Authorization : 'Bearer ' + access_token
				}
			})
			.then((response) => {
				const res = JSON.parse(response.body);
				userId = res.id;
			});

		//GET FOLLOWED ARTIST FOR USER
		await got
			.get('https://api.spotify.com/v1/me/following?type=artist', {
				headers : {
					Authorization : 'Bearer ' + access_token
				}
			})
			.then((response) => {
				const res = JSON.parse(response.body);

				userArtists = res.artists.items.map((artist) => {
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
						const res = JSON.parse(response.body);
						const currMonthAlbumsFilter = res.items.map((album) => {
							const albumRY = album.release_date.substring(0, 4);
							const albumRM = album.release_date.substring(5, 7);

							if (currYear === albumRY && currMonth === albumRM) {
								return {
									name : album.name,
									id   : album.id
								};
							}

							return null;
						});

						const currMonthAlbum = currMonthAlbumsFilter.filter((item) => item !== null);

						if (currMonthAlbum[0] !== undefined) {
							currMonthAlbums = [ ...currMonthAlbums, ...currMonthAlbum ];
						}
					});
			})
		);

		if (currMonthAlbums.length === 0) {
			res.redirect('/noPlaylist');
			throw null;
		}
		// MAKE SURE THERE ARE NO DUPLICATES
		filteredAlbums = filterByProperty(currMonthAlbums, 'name');

		//GET ALL SONG URIS THAT WILL BE PUT IN PLAYLIST
		await Promise.all(
			filteredAlbums.map(async (album) => {
				await got
					.get(`https://api.spotify.com/v1/albums/${album.id}/tracks`, {
						headers : {
							Authorization : 'Bearer ' + access_token
						}
					})
					.then((response) => {
						const res = JSON.parse(response.body);
						const albumSongs = res.items.map((song) => {
							return song.uri;
						});

						currMonthSongs = [ ...currMonthSongs, ...albumSongs ];
					});
			})
		);

		if (existPlaylist === false) {
			//CREATE PLAYLIST
			await got
				.post(`https://api.spotify.com/v1/users/${userId}/playlists`, {
					headers : {
						Authorization : 'Bearer ' + access_token
					},
					json    : {
						name        : playListName,
						description : `Playlist for the month of ${date.format(
							now,
							'MMMM'
						)}, curtesy of Spotify Monthly`,
						public      : false
					}
				})
				.then((response) => {
					const res = JSON.parse(response.body);
					playlistId = res.id;
				});
		} else if (existPlaylist === true) {
			//GET EXISTING PLAYLIST TRACKS
			await got
				.get(`https://api.spotify.com/v1/playlists/${playlistId}`, {
					headers : {
						Authorization : 'Bearer ' + access_token
					}
				})
				.then((response) => {
					const res = JSON.parse(response.body);
					existPlaylistTracks = res.tracks.items.map((track) => {
						return track.track.uri;
					});
				});

			filteredTracks = currMonthSongs.filter((x) => !existPlaylistTracks.includes(x));

			currMonthSongs = filteredTracks;
		}

		//UPDATE NEW PLAYLIST TRACKS
		if (currMonthSongs.length > 0) {
			await got.post(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
				headers : {
					Authorization : 'Bearer ' + access_token
				},
				json    : {
					uris : currMonthSongs
				}
			});
		} else if (currMonthSongs.length === 0) {
			res.redirect('/noPlaylist');
			throw null;
		}

		res.redirect('/home');
	} catch (error) {
		if (error !== null) {
			console.log(error);
		}
	}
};

module.exports.logout = (req, res) => {};
