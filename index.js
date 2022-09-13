const express = require('express');
const ejs = require('ejs');
const allRoutes = require('./routes/index.js');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

const app = express();

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(express.static('views'));

app.use('/', allRoutes);

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
