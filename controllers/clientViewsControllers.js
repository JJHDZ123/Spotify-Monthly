module.exports.intro = (req, res) => {
	res.render('../views/splashScreen');
};

module.exports.loading = (req, res) => {
	// res.render('../views/loading');
	res.redirect('/auth/genPlaylist');
};

module.exports.home = (req, res) => {
	res.render('../views/home');
};
