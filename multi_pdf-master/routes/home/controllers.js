
// const services = require('./services')
module.exports = {
	Home, Login, LoginHome
} 

function Home(req, res){
	if(!req.user) {
		return res.redirect('/login')
	}

	// Logged
	res.status(200).render('home',{
		title: 'Home page',
		assets: null,
		data:{
			username:req.user.name
		}
	})
	
}

function Login(req, res, next) {

	/**
	 * Usuarios deben estar en base de datos
	 */
	const username = req.body.username;
	const user = { name: username}
	
	const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn:"60m"})
	
	return res.json({accessToken})
}

function LoginHome(req, res) {
	res.status(200).render('login',{title:'Login page'})
}