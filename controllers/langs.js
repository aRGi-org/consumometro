const langs = require(appBasePath + 'models/langs');
const logger = require(appBasePath + 'controllers/logger');
const sqlite = require(appBasePath + 'controllers/db');

exports.lingue_list = 
	async (req, res, next) => {
		try {  
			let result = await langs.listLingue(sqlite.sqlDB);
			if (result.status == false) {
				resultSet = [];
				queryError = {"err_code": 0, err_text: result.message};
			}
			else {
				resultSet = result;
				queryError = {"err_code": 0, err_text: "Success"};
			}
			reply = ({ result: queryError, selections : btoa(unescape(encodeURIComponent(JSON.stringify(resultSet)))), current : langId});
			res.status(200).json((reply));
			logger.logEvent("info","Received request for GET /api/lingue/list");
		}
		catch(ex) {
			var queryError = {"err_code": 500, err_text: ex.message};
			var	reply = ({ result: queryError, selections : {}});
			res.status(500).json((reply));
			logger.logEvent("error", "GET /api/lingue/list: " + ex.message);
		}
}

exports.cambia_lingua = 
	async (req, res, next) => {
		try {  
			let result = await langs.changeLingue(sqlite.sqlDB, req.body.newlang);
			if (result.status == false) {
				resultSet = [];
				queryError = {"err_code": 1, err_text: result.message};
			}
			else {
				resultSet = result;
				queryError = {"err_code": 0, err_text: "Success"};
			}
			reply = ({ result: queryError, selections : btoa(unescape(encodeURIComponent(JSON.stringify(resultSet))))});
			res.status(200).json((reply));
			logger.logEvent("info","Received request for GET /api/lingue/list");
		}
		catch(ex) {
			var queryError = {"err_code": 500, err_text: ex.message};
			var	reply = ({ result: queryError, selections : {}});
			res.status(500).json((reply));
			logger.logEvent("error", "GET /api/lingue/list: " + ex.message);
		}
}

exports.language = 
	async (req, res, next) => {
		try {  
			var userLang = langId;
			if (!(req.session.userdata === undefined)) {
				var sessionData = JSON.parse(req.session.userdata);
				userLang = sessionData.data.lang;
			}
			queryError = {"err_code": 0, err_text: "Success"};
			reply = ({ result: queryError, langStr : btoa(unescape(encodeURIComponent(JSON.stringify(lang[userLang]))))});
			res.status(200).json((reply));
			logger.logEvent("info","Received request for GET /intl");
		}
		catch(ex) {
			var queryError = {"err_code": 500, err_text: ex.message};
			var	reply = ({ result: queryError, selections : {}});
			res.status(500).json((reply));
			logger.logEvent("error", "GET /intl: " + ex.message);
		}
}
