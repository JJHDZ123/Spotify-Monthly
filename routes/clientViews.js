const express = require('express');
const { intro, noPlaylist, home } = require('../controllers/clientViewsControllers.js');

const router = express.Router();

router.get('/', intro);
router.get('/noPlaylist', noPlaylist);
router.get('/home', home);

module.exports = router;
