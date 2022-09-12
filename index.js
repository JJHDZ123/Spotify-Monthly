const express = require('express');
const allRoutes = require('./routes/index.js');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.static('views'));
app.use('/', allRoutes);

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
