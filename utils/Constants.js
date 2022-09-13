require('dotenv').config();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const redirect_uri = 'http://localhost:5000/auth/callback';

module.exports = { CLIENT_ID, CLIENT_SECRET, redirect_uri };
