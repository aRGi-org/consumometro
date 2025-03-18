const sqlite = require(appBasePath + 'controllers/db');
const Auths = require(appBasePath + 'models/auth');
const commands = require(appBasePath + 'models/commands');
const logger = require(appBasePath + 'controllers/logger');

exports.indexView = 
	async (req, res, next) => {
		try {  
			if (req.session.userdata === undefined) {
				await res.render("logon", { MESSAGE : '', LANG : lang[langId]});
			}
			else {
				var discrimina = JSON.parse(req.session.userdata);
				var userLang = discrimina.data.lang;
				if (discrimina.data.role == 0) {
					await res.render("index", { ACTIVE: 1, MESSAGE : '', DATA: discrimina, LANG : lang[userLang]});
				}
				else {
					await res.render("home", { ACTIVE: 1, MESSAGE : '', DATA: discrimina, LANG : lang[userLang]});
				}
			}
			logger.logEvent("info","Accessing home controller indexView");
		}
		catch(ex) {
			logger.logEvent("error", "Accessing home controller indexView: " + ex.message);
		}
	}

exports.contactView = 
	async (req, res, next) => {
		try {  
			var userLang = langId;
			if (!(req.session.userdata === undefined)) {
				var sessionData = JSON.parse(req.session.userdata);
				userLang = sessionData.data.lang;
			}
			await res.render("mcontactus", { MESSAGE : '', LANG : lang[userLang]});
			logger.logEvent("info","Accessing home controller contactView");
		}
		catch(ex) {
			logger.logEvent("error", "Accessing home controller contactView: " + ex.message);
		}
	}


exports.fileView = 
	async (req, res, next) => {
		try { 
			var userLang = langId;
			if (!(req.session.userdata === undefined)) {
				var sessionData = JSON.parse(req.session.userdata);
				userLang = sessionData.data.lang;
			}
			await res.render("file", { ACTIVE: 2, PAGE: "Caricamento Dati", MODE: 1, MESSAGE : '', DATA: JSON.parse(req.session.userdata), LANG : lang[userLang]});
			logger.logEvent("INFO","Accessing home controller fileView");
		}
		catch(ex) {
			logger.logEvent("ERROR", "Accessing home controller fileView: " + ex.message);
		}
	}


exports.secretView = 
	async (req, res, next) => {
		try {  
			var userLang = langId;
			if (!(req.session.userdata === undefined)) {
				var sessionData = JSON.parse(req.session.userdata);
				userLang = sessionData.data.lang;
			}
			await res.render("secret", { ACTIVE: 4, PAGE: "Cambio Password", MODE: 1, MESSAGE : '', DATA: JSON.parse(req.session.userdata), LANG : lang[userLang]});
			logger.logEvent("info","Accessing home controller secretView");
		}
		catch(ex) {
			logger.logEvent("error", "Accessing home controller secretView: " + ex.message);
		}
	}

exports.mrefillView =
	async (req, res, next) => {
		try {  
			var userLang = langId;
			if (!(req.session.userdata === undefined)) {
				var sessionData = JSON.parse(req.session.userdata);
				userLang = sessionData.data.lang;
			}
			await res.render("mrefill", { MODE: 1, MESSAGE : '', DATA: JSON.parse(req.session.userdata), LANG : lang[userLang] });
			logger.logEvent("info","Rendering Refills Page");
		}
		catch(ex) {
			var queryError = {"err_code": 500, err_text: ex.message};
			var	reply = ({ result: queryError, selections : {}});
			res.status(500).json((reply));
			logger.logEvent("error", "GET /app/pieno: " + ex.message);
		}
}

exports.mcostsView =
	async (req, res, next) => {
		try {  
			var userLang = langId;
			if (!(req.session.userdata === undefined)) {
				var sessionData = JSON.parse(req.session.userdata);
				userLang = sessionData.data.lang;
			}
			await res.render("mcosts", { MODE: 1, MESSAGE : '', DATA: JSON.parse(req.session.userdata), LANG : lang[userLang] });
			logger.logEvent("info","Rendering Expenses Page");
		}
		catch(ex) {
			var queryError = {"err_code": 500, err_text: ex.message};
			var	reply = ({ result: queryError, selections : {}});
			res.status(500).json((reply));
			logger.logEvent("error", "GET /app/mcosts: " + ex.message);
		}
}

exports.mconsView =
	async (req, res, next) => {
		try {  
			var userLang = langId;
			if (!(req.session.userdata === undefined)) {
				var sessionData = JSON.parse(req.session.userdata);
				userLang = sessionData.data.lang;
			}
			await res.render("mcons", { MODE: 1, MESSAGE : '', DATA: JSON.parse(req.session.userdata), LANG : lang[userLang] });
			logger.logEvent("info","Rendering Consumi Page");
		}
		catch(ex) {
			var queryError = {"err_code": 500, err_text: ex.message};
			var	reply = ({ result: queryError, selections : {}});
			res.status(500).json((reply));
			logger.logEvent("error", "GET /app/mcons: " + ex.message);
		}
}

exports.mrequestsView =
	async (req, res, next) => {
		try {  
			var userLang = langId;
			if (!(req.session.userdata === undefined)) {
				var sessionData = JSON.parse(req.session.userdata);
				userLang = sessionData.data.lang;
			}
			await res.render("mrequests", { MODE: 1, MESSAGE : '', DATA: JSON.parse(req.session.userdata), LANG : lang[userLang] });
			logger.logEvent("info","Rendering Refills Page");
		}
		catch(ex) {
			var queryError = {"err_code": 500, err_text: ex.message};
			var	reply = ({ result: queryError, selections : {}});
			res.status(500).json((reply));
			logger.logEvent("error", "GET /app/pieno: " + ex.message);
		}
}

exports.mautoView =
	async (req, res, next) => {
		try {  
			var userLang = langId;
			if (!(req.session.userdata === undefined)) {
				var sessionData = JSON.parse(req.session.userdata);
				userLang = sessionData.data.lang;
			}
			await res.render("mauto", { MODE: 1, MESSAGE : '', DATA: JSON.parse(req.session.userdata), LANG : lang[userLang] });
			logger.logEvent("info","Rendering Cars Page");
		}
		catch(ex) {
			var queryError = {"err_code": 500, err_text: ex.message};
			var	reply = ({ result: queryError, selections : {}});
			res.status(500).json((reply));
			logger.logEvent("error", "GET /app/auto: " + ex.message);
		}
}

exports.mdriverView =
	async (req, res, next) => {
		try {  
			var userLang = langId;
			if (!(req.session.userdata === undefined)) {
				var sessionData = JSON.parse(req.session.userdata);
				userLang = sessionData.data.lang;
			}
			await res.render("mdriver", { ACTIVE: 4, PAGE: "Auto", MODE: 1, MESSAGE : '', DATA: JSON.parse(req.session.userdata), LANG : lang[userLang] });
			logger.logEvent("info","Rendering Drivers Page");
		}
		catch(ex) {
			var queryError = {"err_code": 500, err_text: ex.message};
			var	reply = ({ result: queryError, selections : {}});
			res.status(500).json((reply));
			logger.logEvent("error", "GET /app/driver: " + ex.message);
		}
}

exports.minviteView =
	async (req, res, next) => {
		try {  
			var userLang = langId;
			if (!(req.session.userdata === undefined)) {
				var sessionData = JSON.parse(req.session.userdata);
				userLang = sessionData.data.lang;
			}
			await res.render("minvite", { MESSAGE : '', DATA: JSON.parse(req.session.userdata), LANG : lang[userLang] });
			logger.logEvent("info","Rendering Invite Page");
		}
		catch(ex) {
			var queryError = {"err_code": 500, err_text: ex.message};
			var	reply = ({ result: queryError, selections : {}});
			res.status(500).json((reply));
			logger.logEvent("error", "GET /minvite: " + ex.message);
		}
}

exports.minviteDoneView =
	async (req, res, next) => {
		try {  
			var userLang = langId;
			if (!(req.session.userdata === undefined)) {
				var sessionData = JSON.parse(req.session.userdata);
				userLang = sessionData.data.lang;
			}
			await res.render("minvite_done", { MESSAGE : '', DATA: JSON.parse(req.session.userdata), LANG : lang[userLang] });
			logger.logEvent("info","Rendering Invite Done Page");
		}
		catch(ex) {
			var queryError = {"err_code": 500, err_text: ex.message};
			var	reply = ({ result: queryError, selections : {}});
			res.status(500).json((reply));
			logger.logEvent("error", "GET /minvitedone: " + ex.message);
		}
}

exports.mprofileView =
	async (req, res, next) => {
		try {  
			var userLang = langId;
			if (!(req.session.userdata === undefined)) {
				var sessionData = JSON.parse(req.session.userdata);
				userLang = sessionData.data.lang;
			}
			await res.render("mprofile", { ACTIVE: 4, PAGE: "Auto", MODE: 1, MESSAGE : '', DATA: JSON.parse(req.session.userdata), LANG : lang[userLang] });
			logger.logEvent("info","Rendering Profile Page");
		}
		catch(ex) {
			var queryError = {"err_code": 500, err_text: ex.message};
			var	reply = ({ result: queryError, selections : {}});
			res.status(500).json((reply));
			logger.logEvent("error", "GET /app/profile: " + ex.message);
		}
}

exports.mresetView =
	async (req, res, next) => {
		try {  
			var userLang = langId;
			await res.render("mresetsecret", { MESSAGE : '', LANG : lang[userLang] });
			logger.logEvent("info","Rendering Reset Password Page");
		}
		catch(ex) {
			var queryError = {"err_code": 500, err_text: ex.message};
			var	reply = ({ result: queryError, selections : {}});
			res.status(500).json((reply));
			logger.logEvent("error", "GET /reset: " + ex.message);
		}
}

exports.mresetsecretView =
	async (req, res, next) => {
		try {  
			var message;
			var error = 0;
			var userLang = langId;
			let resultReset = await commands.checkResets(sqlite.sqlDB, req.query.who, lang[userLang])
			if (resultReset.status == false) {
				message = resultReset.message;
				error = 1;
			}
			else {
				userLang = resultReset.data.lang;
				if (resultReset.data.intime == 1 && resultReset.data.instatus == 1) {
					message = '';
				}
				else {
					error = 1;
					if (resultReset.data.intime == 0) 
						message = lang[userLang]['str00000164'];
					if (resultReset.data.instatus == 0)
						message = lang[userLang]['str00000165'];
				}
			}
			await res.render("msecretreset", { MESSAGE : message, LANG : lang[userLang], DATA: req.query.who, STATUS : error });
			logger.logEvent("info","Rendering Reset Password Page");
		}
		catch(ex) {
			var queryError = {"err_code": 500, err_text: ex.message};
			var	reply = ({ result: queryError, selections : {}});
			res.status(500).json((reply));
			logger.logEvent("error", "GET /reset: " + ex.message);
		}
}

exports.login = 
	async (req, res, next) => {
		try {  
			var userLang = langId;
			if (!(req.session.userdata === undefined)) {
				var sessionData = JSON.parse(req.session.userdata);
				userLang = sessionData.data.lang;
			}
			await res.render("logon", { PAGE: "Home", MODE: 0, MESSAGE : '', LANG : lang[userLang] });
			logger.logEvent("info","Accessing home controller login");
		}
		catch(ex) {
			logger.logEvent("error", "Accessing home controller login: " + ex.message);
		}
	}

exports.logout = 
	async (req, res, next) => {
		try {  
			var userLang = langId;
			if (!(req.session.userdata === undefined)) {
				var sessionData = JSON.parse(req.session.userdata);
				userLang = sessionData.data.lang;
			}
			if (req.session) {
				req.session.destroy();
				res.clearCookie('REMME');
				logger.logEvent("info","Session&Cookie cleared");
			}
			await res.render("logon", { PAGE: "Home", MODE: 0, MESSAGE : '', LANG : lang[userLang] });
			logger.logEvent("info","Logging out");
		}
		catch(ex) {
			logger.logEvent("error", "Logging out: " + ex.message);
		}
	}

exports.sessionUserData = 
	async (req, res, next) => {
		try {  
			resultSet =  req.session.userdata;
			queryError = {"err_code": 0, err_text: "Success"};
			reply = ({ result: queryError, selections : resultSet});
			res.status(200).json((reply));
			logger.logEvent("info","Received request for GET /api/session");
		}
		catch(ex) {
			var queryError = {"err_code": 500, err_text: ex.message};
			var	reply = ({ result: queryError, selections : {}});
			res.status(500).json((reply));
			logger.logEvent("error", "GET /api/session: " + ex.message);
		}
}

