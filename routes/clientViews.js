const express = require('express');
const { intro, home } = require('../controllers/clientViewsControllers.js');

const router = express.Router();

router.get('/', intro);
router.get('/home', home);

module.exports = router;
