const dbase = require(appBasePath + 'controllers/db');
const logger = require(appBasePath + 'controllers/logger');

exports.fuelsTable = 
	async (db) => {
		try {
			await db.exec(' CREATE TABLE IF NOT EXISTS carburanti (\
				UUID VARCHAR(36) PRIMARY KEY,\
				carburante VARCHAR(100) NOT NULL,\
				unita_misura varchar(10) NOT NULL,\
				added datetime NOT NULL,\
				lastmod datetime NOT NULL);\
			');
			await db.exec(" INSERT INTO carburanti (UUID, carburante, unita_misura, added, lastmod) values('00000000-2000-0000-0000-000000000000','str00000063','str00000063',datetime(\'now\',\'localtime\'),datetime(\'now\',\'localtime\')) ON CONFLICT (UUID) DO NOTHING;");
			await db.exec(" INSERT INTO carburanti (UUID, carburante, unita_misura, added, lastmod) values('00000000-2000-0000-0001-000000000000','str00000064','str00000070',datetime(\'now\',\'localtime\'),datetime(\'now\',\'localtime\')) ON CONFLICT (UUID) DO NOTHING;");
			await db.exec(" INSERT INTO carburanti (UUID, carburante, unita_misura, added, lastmod) values('00000000-2000-0000-0002-000000000000','str00000065','str00000070',datetime(\'now\',\'localtime\'),datetime(\'now\',\'localtime\')) ON CONFLICT (UUID) DO NOTHING;");
			await db.exec(" INSERT INTO carburanti (UUID, carburante, unita_misura, added, lastmod) values('00000000-2000-0000-0003-000000000000','str00000066','str00000070',datetime(\'now\',\'localtime\'),datetime(\'now\',\'localtime\')) ON CONFLICT (UUID) DO NOTHING;");
			await db.exec(" INSERT INTO carburanti (UUID, carburante, unita_misura, added, lastmod) values('00000000-2000-0000-0004-000000000000','str00000067','str00000071',datetime(\'now\',\'localtime\'),datetime(\'now\',\'localtime\')) ON CONFLICT (UUID) DO NOTHING;");
			await db.exec(" INSERT INTO carburanti (UUID, carburante, unita_misura, added, lastmod) values('00000000-2000-0000-0005-000000000000','str00000068','str00000070',datetime(\'now\',\'localtime\'),datetime(\'now\',\'localtime\')) ON CONFLICT (UUID) DO NOTHING;");
			await db.exec(" INSERT INTO carburanti (UUID, carburante, unita_misura, added, lastmod) values('00000000-2000-0000-0006-000000000000','str00000069','str00000072',datetime(\'now\',\'localtime\'),datetime(\'now\',\'localtime\')) ON CONFLICT (UUID) DO NOTHING;");

			logger.logEvent("info", "Carburanti table created");
			return {status: true, message: '', data: ""};
		}
		catch(ex) {
			logger.logEvent("error", "Carburanti Table message: " + ex.message);
			return {status: false, message: ex.message};
		}
}

exports.listFuels =
	async (db) => {
		try {
			let carburantiList = await db.all("select uuid, carburante, unita_misura from carburanti where uuid <> '00000000-2000-0000-0000-000000000000' order by uuid");
			return {status: true, message: '', data: carburantiList};
		}
		catch(ex) {
			logger.logEvent("error", "Carburanti Table message: " + ex.message);
			return {status: false, message: ex.message};
		}
	}

