const usersauth = require(appBasePath + 'models/users');
const session = require(appBasePath + 'models/auth');
const logger = require(appBasePath + 'controllers/logger');
const sqlite = require(appBasePath + 'controllers/db');

exports.authauth = async (req, res, next) => {
	try {
		if (req.session.userdata === undefined || req.session.userdata.status == 0) {

			var now = new Date();
			if (req.cookies.REMME) {
				var userData = JSON.parse(atob(req.cookies.REMME));
				var payload = {formUser : userData.data.userid, formSecret : userData.data.unencsecret};

				if (((parseInt(userData.data.cookieTime) + parseInt(userData.data.maxage)) - (now.getTime()/1000).toFixed(0)) > 0) {
					let result = await usersauth.verifyUser(sqlite.sqlDB, payload, (now.getTime()/1000).toFixed(0));
					if (result.status == true) {
						req.session.userdata = JSON.stringify(result);
						logger.logEvent("info","User authenticated by cookie");
						res.redirect('/app/index');
					}
					else {  
						res.clearCookie('REMME');
						await res.render("logon", { ACTIVE: 0, PAGE: "Logon", MODE: 0, MESSAGE : result.message, LANG : lang[langId] });
						logger.logEvent("info","Cookie is invalid, rendering logon page");
					}
				}
				else {
					res.clearCookie('REMME');
					await res.render("logon", { ACTIVE: 0, PAGE: "Logon", MODE: 0, MESSAGE : "", LANG : lang[langId] });
					logger.logEvent("info","Cookie is expired, rendering logon page");
				}
			}
			else {
				if (req.body.formUser === undefined || req.body.formSecret  === undefined) {
					await res.render("logon", { ACTIVE: 0, PAGE: "Logon", MODE: 0, MESSAGE : "", LANG : lang[langId] });
					logger.logEvent("info","Missing username or password, rendering logon page");
				}
				else {
					var now = new Date();
					let result = await usersauth.verifyUser(sqlite.sqlDB, req.body, (now.getTime()/1000).toFixed(0));
					
					if (result.status == true) {
						req.session.userdata = JSON.stringify(result);

						if (!(req.body.formRemember === undefined))
							res.cookie('REMME', btoa(req.session.userdata), {maxAge : 15552000000, sameSite: 'lax' });
						else
							res.clearCookie('REMME');
						logger.logEvent("info","User logged on successfully, rendering home page");
						res.redirect('/app/index');
					}
					else {  
						await res.render("logon", { ACTIVE: 0, PAGE: "Logon", MODE: 0, MESSAGE : result.message, LANG : lang[langId] });
						logger.logEvent("info","Bad username or password, rendering logon page");
					}
				}
			}
		}
		else {
			next();
		}
	}
	catch(ex) {
		logger.logEvent("error", "Auth Controller: " + ex.message);
	}
}

exports.expiredSessions = 
	async () => {
		try {  
			let result = await session.initSession(sqlite.sqlDB);
			if (result.status == true) {
				if (result.data.changes > 0) 
					logger.logEvent("info","Closed/Expired Sessions command");
			}
			else
				logger.logEvent("error", "Expired/Closed Sessions message: " + result.message);
		}
		catch(ex) {
			logger.logEvent("error", "Expired/Closed Sessions message: " + ex.message);
		}
}

