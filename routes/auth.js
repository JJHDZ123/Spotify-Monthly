const express = require('express');
const { login, callback, logout, makeMonthlyPlaylist } = require('../controllers/authControllers.js');

const router = express.Router();

router.get('/login', login);
router.get('/callback', callback);
router.get('/genplaylist', makeMonthlyPlaylist);
router.get('/logout', logout);

module.exports = router;
