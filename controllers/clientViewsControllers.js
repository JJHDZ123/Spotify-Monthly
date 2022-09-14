module.exports.intro = (req, res) => {
	res.render('../views/splashScreen');
};

module.exports.noPlaylist = (req, res) => {
	res.render('../views/noPlaylist');
};

module.exports.home = (req, res) => {
	res.render('../views/home');
};
