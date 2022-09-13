const express = require('express');
const { intro, loading, home } = require('../controllers/clientViewsControllers.js');

const router = express.Router();

router.get('/', intro);
router.get('/loading', loading);
router.get('/home', home);

module.exports = router;
