const express = require('express');
const splashScreen = require('./clientViews.js');
const authRoutes = require('./auth.js');
//const checkAuth = require('../utils/checkAuth.js');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/', splashScreen);

module.exports = router;
