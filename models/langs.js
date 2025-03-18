const dbase = require(appBasePath + 'controllers/db');
const logger = require(appBasePath + 'controllers/logger');

exports.languagesTable = 
	async (db) => {
		try {
			await db.exec(' CREATE TABLE IF NOT EXISTS lingue (\
				id VARCHAR(2) PRIMARY KEY NOT NULL,\
				lingua VARCHAR(100) NOT NULL,\
				added datetime NOT NULL,\
				lastmod datetime NOT NULL);\
			');
			await db.exec(" INSERT INTO lingue (id, lingua, added, lastmod) values('it', 'str00000032', datetime(\'now\',\'localtime\'),datetime(\'now\',\'localtime\')) ON CONFLICT (ID) DO NOTHING;");
			await db.exec(" INSERT INTO lingue (id, lingua, added, lastmod) values('en', 'str00000033', datetime(\'now\',\'localtime\'),datetime(\'now\',\'localtime\')) ON CONFLICT (ID) DO NOTHING;");
			await db.exec(" INSERT INTO lingue (id, lingua, added, lastmod) values('es', 'str00000034', datetime(\'now\',\'localtime\'),datetime(\'now\',\'localtime\')) ON CONFLICT (ID) DO NOTHING;");
			logger.logEvent("info", "Lingue table created");
			return true;
		}
		catch(ex) {
			logger.logEvent("error", "Lingue table message: " + ex.message);
			return false;
		}
}

exports.listLingue =
	async (db) => {
		try {
			let lingueList = await db.all("select id, lingua from lingue order by lingua desc");
			return { status: true, result : lingueList};
		}
		catch(ex) {
			logger.logEvent("error", "Lingue List message: " + ex.message);
			return { status: false, message : ex.message};
		}
	}

exports.changeLingue =
	async (db, newLanguage) => {
		try {
			langId = newLanguage;
			return { status: true, result : newLanguage};
		}
		catch(ex) {
			logger.logEvent("error", "Lingue change message: " + ex.message);
			return { status: false, message : ex.message};
		}
	}
