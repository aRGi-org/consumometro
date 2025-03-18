const dbase = require(appBasePath + 'controllers/db');
const logger = require(appBasePath + 'controllers/logger');

exports.linksTable = 
	async (db) => {
		try {
			await db.exec(' CREATE TABLE IF NOT EXISTS autoutenti (\
				auto VARCHAR(36) NOT NULL,\
				utente VARCHAR(36) NOT NULL,\
				next_report datetime NOT NULL,\
				report_status integer NOT NULL,\
				added datetime NOT NULL,\
				FOREIGN KEY(auto) REFERENCES AUTOMOBILI(UUID),\
				FOREIGN KEY(utente) REFERENCES UTENTI(UUID));');
			logger.logEvent("info", "Users Cars table created");
			return true;
		}
		catch(ex) {
			logger.logEvent("error", "Users Cars Table message: " + ex.message);
			return false;
		}
}

exports.allLinks =
	async (db) => {
		try {
			let linksAll = await db.all("SELECT l.auto, l.utente, u.nome, u.cognome, u.userid, c.make, c.model, c.license,\
				from autoutenti l join utenti u on u.uuid=l.utente join automobili c on c.uuid=l.auto\
				order by u.userid, c.license");
			return {error: 0, result: linksAll};
		}
		catch(ex) {
			logger.logEvent("error", "Users Cars Table message: " + ex.message);
			return {error: 500, message : ex.message};
		}
	}


exports.addUser2Auto =
	async (db, payload) => {
		try {
			let utentiAddAuto;
			utentiAddAuto = await db.run("insert into autoutenti (auto, utente, next_report, report_status, added) values(?, ?, datetime(?,\'localtime\'), ?, datetime(\'now\',\'localtime\'))",[payload.auto, payload.user, payload.data, payload.state]);
			return {error: 0, result: utentiAddAuto};
		}
		catch(ex) {
			logger.logEvent("error", "Users Cars Table message: " + ex.message);
			return {error: 500, message : ex.message};
		}
	}

exports.removeUserFromAuto =
	async (db, payload) => {
		try {
			let utentiAddAuto;
			utentiRemoveFromAuto = await db.run("delete from autoutenti where auto=? and utente=?",[payload.auto,payload.user]);
			return {error: 0, result: utentiRemoveFromAuto};
		}
		catch(ex) {
			logger.logEvent("error", "Users Cars Table message: " + ex.message);
			return {error: 500, message : ex.message};
		}
	}

exports.removeAuto =
	async (db, carUUID) => {
		try {
			let utentiAddAuto;
			utentiRemoveAuto = await db.run("delete from autoutenti where auto=?",[carUUID]);
			return {error: 0, result: utentiRemoveAuto};
		}
		catch(ex) {
			logger.logEvent("error", "Users Cars Table message: " + ex.message);
			return {error: 500, message : ex.message};
		}
	}

exports.carLinks =
	async (db, car, owner, userData) => {
		try {
			let linksByCar = await db.all("SELECT l.auto, l.utente, u.nome, u.cognome, u.userid, u.email, u.uuid as userUID, case when a.owner=l.utente then 1 else 0 end as isOwner\
				from autoutenti l join utenti u on u.uuid=l.utente join automobili a on a.uuid=l.auto\
				where l.auto=? order by u.userid",[car]);
			return {error: 0, result: linksByCar, carId : car, userId : userData.data.uid, owner : owner };
		}
		catch(ex) {
			logger.logEvent("error", "Users Cars Table message: " + ex.message);
			return {error: 500, message : ex.message};
		}
	}

exports.rescheduleReport =
	async (db, payload) => {
		try {
			let utentiAutoUpdate;
			utentiAutoUpdate = await db.run("update autoutenti set next_report=datetime(?), report_status=0 where auto=? and utente=?",[payload.data, payload.auto, payload.user ]);
			return {error: 0, result: utentiAutoUpdate};
		}
		catch(ex) {
			logger.logEvent("error", "Users Cars Table message: " + ex.message);
			return {error: 500, message : ex.message};
		}
	}

