require('dotenv').config();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const redirect_uri = 'https://spotify-monthly-1.herokuapp.com/auth/callback';

module.exports = { CLIENT_ID, CLIENT_SECRET, redirect_uri };
