const dbase = require(appBasePath + 'controllers/db');
const logger = require(appBasePath + 'controllers/logger');

exports.initSession = 
	async (db) => { 
		try {
			let isCleaned = await db.run("delete FROM sessions where DATETIME(expired/1000, \'unixepoch\') < datetime(\'now\',\'localtime\');");
			return { status: true, data: isCleaned, message : ''};
		}
		catch(ex) {
			logger.logEvent("error", ex.message);
			return { status: false, message : ex.message};
		}
	}
