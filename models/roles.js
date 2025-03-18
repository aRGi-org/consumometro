const dbase = require(appBasePath + 'controllers/db');
const logger = require(appBasePath + 'controllers/logger');

exports.rolesTable = 
	async (db) => {
		try {
			await db.exec(' CREATE TABLE IF NOT EXISTS ruoli (\
				uuid VARCHAR(36) PRIMARY KEY NOT NULL,\
				id integer,\
				ruolo VARCHAR(100) NOT NULL,\
				added datetime NOT NULL,\
				lastmod datetime NOT NULL);\
			');
			await db.exec(" INSERT INTO ruoli (uuid, id, ruolo, added, lastmod) values('00000000-1000-0000-0000-000000000000', 0, 'str00000191', datetime(\'now\',\'localtime\'),datetime(\'now\',\'localtime\')) ON CONFLICT (UUID) DO NOTHING;");
			await db.exec(" INSERT INTO ruoli (uuid, id, ruolo, added, lastmod) values('00000000-1000-0000-0100-000000000000', 100, 'str00000192', datetime(\'now\',\'localtime\'),datetime(\'now\',\'localtime\')) ON CONFLICT (UUID) DO NOTHING;");
			await db.exec(" INSERT INTO ruoli (uuid, id, ruolo, added, lastmod) values('00000000-1000-0000-0110-000000000000', 110, 'str00000166', datetime(\'now\',\'localtime\'),datetime(\'now\',\'localtime\')) ON CONFLICT (UUID) DO NOTHING;");
			/*
			await db.exec(" INSERT INTO ruoli (uuid, id, ruolo, added, lastmod) values('00000000-1000-0000-0000-000000000000', 0, 'Amministratore', datetime(\'now\',\'localtime\'),datetime(\'now\',\'localtime\')) ON CONFLICT (UUID) DO NOTHING;");
			await db.exec(" INSERT INTO ruoli (uuid, id, ruolo, added, lastmod) values('00000000-1000-0000-0100-000000000000', 100, 'Proprietario', datetime(\'now\',\'localtime\'),datetime(\'now\',\'localtime\')) ON CONFLICT (UUID) DO NOTHING;");
			await db.exec(" INSERT INTO ruoli (uuid, id, ruolo, added, lastmod) values('00000000-1000-0000-0110-000000000000', 110, 'Autista', datetime(\'now\',\'localtime\'),datetime(\'now\',\'localtime\')) ON CONFLICT (UUID) DO NOTHING;");
			*/
			logger.logEvent("info", "Ruoli table created");
			return true;
		}
		catch(ex) {
			logger.logEvent("error", "Ruoli table message: " + ex.message);
			return false;
		}
}

exports.listRoles =
	async (db) => {
		try {
			let ruoliList = await db.all("select uuid, ruolo from ruoli order by ruolo desc");
			return ruoliList;
		}
		catch(ex) {
			logger.logEvent("error", "Ruoli table message: " + ex.message);
			return false;
		}
	}

