const express = require('express');
const { login, callback, logout, handleRefreshToken } = require('../controllers/authControllers.js');

const router = express.Router();

router.get('/login', login);
router.get('/callback', callback);
router.get('/logout', logout);

module.exports = router;
