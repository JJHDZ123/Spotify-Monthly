const express = require('express');
const authRoutes = require('./auth.js');
//const checkAuth = require('../utils/checkAuth.js');

const router = express.Router();

router.use('/auth', authRoutes);

module.exports = router;
