module.exports.intro = (req, res) => {
	res.redirect('/auth/login');
};

module.exports.home = (req, res) => {
	res.render('../views/home');
};
