var crypto = require('crypto');

const logger = require(appBasePath + 'controllers/logger');

const algorithm = "aes-256-cbc"; 

exports.commandsTable = 
	async (db) => {
		try {
			await db.exec(' CREATE TABLE IF NOT EXISTS comandi (\
				uuid VARCHAR(36) PRIMARY KEY NOT NULL,\
				tipo INTEGER NOT NULL,\
				stato INTEGER NOT NULL,\
				utente VARCHAR(36) NULL,\
				auto VARCHAR(36) NULL,\
				dati json NULL,\
				richiesta datetime NULL,\
				added datetime NOT NULL,\
				lastmod datetime NOT NULL,\
				FOREIGN KEY(auto) REFERENCES AUTOMOBILI(UUID),\
				FOREIGN KEY(utente) REFERENCES UTENTI(UUID));\
			');
			logger.logEvent("info", "Commands table created");
			return true;
		}
		catch(ex) {
			logger.logEvent("error", "Commands Table message: " + ex.message);
			return false;
		}
	}

exports.newResetRequest=
	async (db, userid) => {
		try {
			var uuid = crypto.randomUUID();
			let utenteResult = await db.run('INSERT INTO comandi (uuid, tipo, utente, stato, richiesta, added, lastmod) VALUES (?, ?, ?, ?, datetime(\'now\',\'localtime\'), datetime(\'now\',\'localtime\'), datetime(\'now\',\'localtime\'))', 
										[uuid, 1, userid, 0]);
			return {status: true, message: '', data: utenteResult};
		}
		catch(ex) {
			logger.logEvent("error", "Reset Password commands Table message: " + ex.message);
			return {status: false, message: ex.message};
		}
	}

exports.newResetList =
	async (db, payload) => {
		try {
			let utentiIn;
			utentiIn = await db.all("SELECT rs.uuid, rs.utente, u.email, u.nome, u.cognome, u.lang\
					FROM comandi rs join utenti u on rs.utente=u.uuid\
					where rs.tipo=1 and rs.stato=0 and rs.richiesta < datetime(rs.richiesta,'localTime','+23 hours');");
			return {status: true, message: '', data: utentiIn};
		}
		catch(ex) {
			logger.logEvent("error", "Reset Password commands Table message: " + ex.message);
			return {status: false, message: ex.message};
		}
	}

exports.resetRequestSent=
	async (db, data) => {
		try {
			let updateResult = await db.run('UPDATE comandi set stato=1, lastmod=datetime(\'now\',\'localtime\') where tipo=1 and uuid=?', 
										[data.uuid]);
			return {status: true, message: '', data: updateResult};
		}
		catch(ex) {
			logger.logEvent("error", "Reset Password commands Table message: " + ex.message);
			return {status: false, message: ex.message};
		}
	}

exports.resetRequestSending=
	async (db, data) => {
		try {
			let updateResult = await db.run('UPDATE comandi set stato=10, lastmod=datetime(\'now\',\'localtime\') where tipo=1 and uuid=?', 
										[data.uuid]);
			return {status: true, message: '', data: updateResult};
		}
		catch(ex) {
			logger.logEvent("error", "Reset Password commands Table message: " + ex.message);
			return {status: false, message: ex.message};
		}
	}

exports.checkResets =
	async (db, payload, langStr) => {
		try {
			let utentiIn;
			utentiIn = await db.all("SELECT rs.uuid, rs.utente, u.email, u.nome, u.cognome, u.lang,\
					case when datetime('now','localtime') < datetime(rs.richiesta,'localTime','+23 hours') then 1 else 0 end as intime,\
					case when rs.stato=1 then 1 else 0 end as instatus\
					FROM comandi rs join utenti u on rs.utente=u.uuid\
					where rs.tipo=1 and rs.stato=1 and rs.uuid=?;",[payload]);
			if (utentiIn.length == 0)
				return {status: false, message: langStr['str00000143']};
			else
				return {status: true, message: '', data: utentiIn[0]};
		}
		catch(ex) {
			logger.logEvent("error", "Reset Password commands Table message: " + ex.message);
			return {status: false, message: ex.message};
		}
	}

exports.requestResetConfirmed=
	async (db, data) => {
		try {
			let updateResult = await db.run('UPDATE comandi set stato=2, lastmod=datetime(\'now\',\'localtime\') where uuid=?', 
										[data]);
			let utentiIn = await db.all("SELECT rs.uuid, rs.utente, u.email, u.nome, u.cognome, u.lang\
					FROM comandi rs join utenti u on rs.utente=u.uuid\
					where rs.tipo=1 and rs.stato=2 and rs.uuid=?;",[data.uuid]);
			return {status: true, message: '', data: utentiIn[0]};
		}
		catch(ex) {
			logger.logEvent("error", "Reset Password commands Table message: " + ex.message);
			return {status: false, message: ex.message};
		}
	}

exports.closeReset =
	async (db) => {
		try {
			let utentiIn;
			utentiIn = await db.run("delete FROM comandi\
				where (tipo=1 and stato=0 and datetime('now','localtime') > datetime(richiesta,'localTime','+23 hours')) or\
				(tipo=1 and stato=1 and datetime('now','localtime') > datetime(richiesta,'localTime','+23 hours')) or\
				(tipo=1 and stato=2 and datetime('now','localtime') > datetime(richiesta,'localTime','+23 hours'));");
			return {status: true, message: '', data : utentiIn};
		}
		catch(ex) {
			logger.logEvent("error", "Reset Password commands Table message: " + ex.message);
			return {status: false, message: ex.message};
		}
	}


/* joins */
exports.newJoinRequest=
	async (db, data) => {
		try {
			var uuid = crypto.randomUUID();
			let utenteResult = await db.run('INSERT INTO comandi (uuid, tipo, utente, stato, richiesta, added, lastmod) VALUES (?, ?, ?, ?, datetime(\'now\',\'localtime\'), datetime(\'now\',\'localtime\'), datetime(\'now\',\'localtime\'))', 
										[uuid, 0, data.utente, 0]);
			return {status: true, message: '', data: utenteResult};
		}
		catch(ex) {
			logger.logEvent("error", "Join User commands Table message: " + ex.message);
			return {status: false, message: ex.message};
		}
	}

exports.newJoinsList =
	async (db, payload) => {
		try {
			let utentiIn;
			utentiIn = await db.all("SELECT nu.uuid, nu.utente, u.email, u.nome, u.cognome, u.lang\
					FROM comandi nu join utenti u on nu.utente=u.uuid\
					where nu.tipo=0 and nu.stato=0 and nu.richiesta < datetime(nu.richiesta,'localTime','+47 hours');");
			return {status: true, message: '', data: utentiIn};
		}
		catch(ex) {
			logger.logEvent("error", "Join User commands Table message: " + ex.message);
			return {status: false, message: ex.message};
		}
	}

exports.requestJoinSent=
	async (db, data) => {
		try {
			let updateResult = await db.run('UPDATE comandi set stato=1, richiesta=datetime(\'now\',\'localtime\'), lastmod=datetime(\'now\',\'localtime\') where tipo=0 and uuid=?', 
										[data.uuid]);
			return {status: true, message: '', data: updateResult};
		}
		catch(ex) {
			logger.logEvent("error", "Join User commands Table message: " + ex.message);
			return {status: false, message: ex.message};
		}
	}

exports.requestJoinSending=
	async (db, data) => {
		try {
			let updateResult = await db.run('UPDATE comandi set stato=10, lastmod=datetime(\'now\',\'localtime\') where tipo=0 and uuid=?', 
										[data]);
			return {status: true, message: '', data: updateResult};
		}
		catch(ex) {
			logger.logEvent("error", "Join User commands Table message: " + ex.message);
			return {status: false, message: ex.message};
		}
	}

exports.checkJoin =
	async (db, payload, langStr) => {
		try {
			let utentiIn;
			utentiIn = await db.all("SELECT nu.uuid, nu.utente, u.email, u.nome, u.cognome, u.lang,\
					case when datetime('now','localtime') < datetime(nu.richiesta,'localTime','+47 hours') then 1 else 0 end as intime,\
					case when nu.stato=1 then 1 else 0 end as instatus\
					FROM comandi nu join utenti u on nu.utente=u.uuid\
					where nu.tipo=0 and nu.stato=1 and nu.uuid=?;",[payload]);
			if (utentiIn.length == 0)
				return {status: false, message: langStr['str00000143']};
			else
				return {status: true, message: '', data: utentiIn[0]};
		}
		catch(ex) {
			logger.logEvent("error", "Join User commands Table message: " + ex.message);
			return {status: false, message: ex.message};
		}
	}

exports.requestJoinConfirmed=
	async (db, data) => {
		try {
			let updateResult = await db.run('UPDATE comandi set stato=2, lastmod=datetime(\'now\',\'localtime\') where tipo=0 and uuid=?', 
										[data]);
			let utentiIn = await db.all("SELECT nu.uuid, nu.utente, u.email, u.nome, u.cognome, u.lang\
					FROM comandi nu join utenti u on nu.utente=u.uuid\
					where nu.uuid=? and nu.stato=2;",[data.uuid]);
			return {status: true, message: '', data: utentiIn[0]};
		}
		catch(ex) {
			logger.logEvent("error", "Join User commands Table message: " + ex.message);
			return {status: false, message: ex.message};
		}
	}

exports.closeJoin =
	async (db) => {
		try {
			let utentiIn;
			utentiIn = await db.run("delete FROM comandi\
				where (tipo=0 and stato=0 and datetime('now','localtime') > datetime(richiesta,'localTime','+47 hours')) or\
				(tipo=0 and stato=1 and datetime('now','localtime') > datetime(richiesta,'localTime','+47 hours')) or\
				(tipo=0 and stato=2 and datetime('now','localtime') > datetime(richiesta,'localTime','+240 hours'));");
			return {status: true, message: '', data : utentiIn};
		}
		catch(ex) {
			logger.logEvent("error", "Join User commands Table message: " + ex.message);
			return {status: false, message: ex.message};
		}
	}

/* add driver */
exports.newAddDriverRequest=
	async (db, data) => {
		try {
			var uuid = crypto.randomUUID();
			let utenteResult = await db.run('INSERT INTO comandi (uuid, tipo, utente, auto, dati, stato, richiesta, added, lastmod) VALUES (?, ?, ?, ?, ?, ?, datetime(\'now\',\'localtime\'), datetime(\'now\',\'localtime\'), datetime(\'now\',\'localtime\'))', 
										[uuid, 2, data.touid, data.car, JSON.stringify(data), 0]);
			return {status: true, message: '', data: utenteResult};
		}
		catch(ex) {
			logger.logEvent("error", "Add driver commands Table message: " + ex.message);
			return {status: false, message: ex.message};
		}
	}

exports.newAddDriverList =
	async (db, payload) => {
		try {
			let messagesToSend;
			messagesToSend = await db.all("SELECT rs.uuid, rs.utente, u.email, u.nome, u.cognome, u.lang, rs.dati\
					FROM comandi rs join utenti u on rs.utente=u.uuid\
					where rs.tipo=2 and rs.stato=0;");
			return {status: true, message: '', data: messagesToSend};
		}
		catch(ex) {
			logger.logEvent("error", "Add driver commands Table message: " + ex.message);
			return {status: false, message: ex.message};
		}
	}

exports.addDriverSent=
	async (db, data) => {
		try {
			let updateResult = await db.run('UPDATE comandi set stato=1, richiesta=datetime(\'now\',\'localtime\'), lastmod=datetime(\'now\',\'localtime\') where tipo=2 and uuid=?', [data]);
			return {status: true, message: '', data: updateResult};
		}
		catch(ex) {
			logger.logEvent("error", "Add driver commands Table message: " + ex.message);
			return {status: false, message: ex.message};
		}
	}

exports.addDriverSending=
	async (db, data) => {
		try {
			let updateResult = await db.run('UPDATE comandi set stato=10, lastmod=datetime(\'now\',\'localtime\') where tipo=2 and uuid=?', [data]);
			return {status: true, message: '', data: updateResult};
		}
		catch(ex) {
			logger.logEvent("error", "Add driver commands Table message: " + ex.message);
			return {status: false, message: ex.message};
		}
	}

exports.closeAddDriver =
	async (db) => {
		try {
			let utentiIn;
			utentiIn = await db.run("delete FROM comandi where (tipo=2 and stato=1 and datetime('now','localtime') > datetime(richiesta,'localTime','+240 hours'));");
			return {status: true, message: '', data : utentiIn};
		}
		catch(ex) {
			logger.logEvent("error", "Add driver Commands Table message: " + ex.message);
			return {status: false, message: ex.message};
		}
	}


/* delete driver */
exports.newDelDriverRequest=
	async (db, data) => {
		try {
			var uuid = crypto.randomUUID();
			let utenteResult = await db.run('INSERT INTO comandi (uuid, tipo, utente, auto, dati, stato, richiesta, added, lastmod) VALUES (?, ?, ?, ?, ?, ?, datetime(\'now\',\'localtime\'), datetime(\'now\',\'localtime\'), datetime(\'now\',\'localtime\'))', 
										[uuid, 3, data.touid, data.car, JSON.stringify(data), 0]);
			return {status: true, message: '', data: utenteResult};
		}
		catch(ex) {
			logger.logEvent("error", "Delete driver commands Table message: " + ex.message);
			return {status: false, message: ex.message};
		}
	}

exports.newDelDriverList =
	async (db, payload) => {
		try {
			let messagesToSend;
			messagesToSend = await db.all("SELECT rs.uuid, rs.utente, u.email, u.nome, u.cognome, u.lang, rs.dati\
					FROM comandi rs join utenti u on rs.utente=u.uuid\
					where rs.tipo=3 and rs.stato=0;");
			return {status: true, message: '', data: messagesToSend};
		}
		catch(ex) {
			logger.logEvent("error", "Delete driver commands Table message: " + ex.message);
			return {status: false, message: ex.message};
		}
	}

exports.delDriverSent=
	async (db, data) => {
		try {
			let updateResult = await db.run('UPDATE comandi set stato=1, richiesta=datetime(\'now\',\'localtime\'), lastmod=datetime(\'now\',\'localtime\') where tipo=3 and uuid=?', [data]);
			return {status: true, message: '', data: updateResult};
		}
		catch(ex) {
			logger.logEvent("error", "Delete driver commands Table message: " + ex.message);
			return {status: false, message: ex.message};
		}
	}

exports.delDriverSending=
	async (db, data) => {
		try {
			let updateResult = await db.run('UPDATE comandi set stato=10, lastmod=datetime(\'now\',\'localtime\') where tipo=3 and uuid=?', [data]);
			return {status: true, message: '', data: updateResult};
		}
		catch(ex) {
			logger.logEvent("error", "Delete driver commands Table message: " + ex.message);
			return {status: false, message: ex.message};
		}
	}

exports.closeDelDriver =
	async (db) => {
		try {
			let utentiIn;
			utentiIn = await db.run("delete FROM comandi where (tipo=3 and stato=1 and datetime('now','localtime') > datetime(richiesta,'localTime','+240 hours'));");
			return {status: true, message: '', data : utentiIn};
		}
		catch(ex) {
			logger.logEvent("error", "Delete driver commands Table message: " + ex.message);
			return {status: false, message: ex.message};
		}
	}

/* u2u messages */
exports.newMessageRequest=
	async (db, data) => {
		try {
			var uuid = crypto.randomUUID();
			let utenteResult = await db.run('INSERT INTO comandi (uuid, tipo, utente, auto, dati, stato, richiesta, added, lastmod) VALUES (?, ?, ?, ?, ?, ?, datetime(\'now\',\'localtime\'), datetime(\'now\',\'localtime\'), datetime(\'now\',\'localtime\'))', 
										[uuid, 4, data.touid, data.car, JSON.stringify(data), 0]);
			return {status: true, message: '', data: utenteResult};
		}
		catch(ex) {
			logger.logEvent("error", "U2U email commands Table message: " + ex.message);
			return {status: false, message: ex.message};
		}
	}

exports.newMessageList =
	async (db, payload) => {
		try {
			let messagesToSend;
			messagesToSend = await db.all("SELECT rs.uuid, rs.utente, u.email, u.nome, u.cognome, u.lang, rs.dati\
					FROM comandi rs join utenti u on rs.utente=u.uuid\
					where rs.tipo=4 and rs.stato=0;");
			return {status: true, message: '', data: messagesToSend};
		}
		catch(ex) {
			logger.logEvent("error", "u2u email Commands Table message: " + ex.message);
			return {status: false, message: ex.message};
		}
	}

exports.messageSent=
	async (db, data) => {
		try {
			let updateResult = await db.run('UPDATE comandi set stato=1, richiesta=datetime(\'now\',\'localtime\'), lastmod=datetime(\'now\',\'localtime\') where tipo=4 and uuid=?', [data]);
			return {status: true, message: '', data: updateResult};
		}
		catch(ex) {
			logger.logEvent("error", "U2U email commands Table message: " + ex.message);
			return {status: false, message: ex.message};
		}
	}

exports.messageSending=
	async (db, data) => {
		try {
			let updateResult = await db.run('UPDATE comandi set stato=10, lastmod=datetime(\'now\',\'localtime\') where tipo=4 and uuid=?', [data]);
			return {status: true, message: '', data: updateResult};
		}
		catch(ex) {
			logger.logEvent("error", "U2U email commands Table message: " + ex.message);
			return {status: false, message: ex.message};
		}
	}

exports.closeMessage =
	async (db) => {
		try {
			let utentiIn;
			utentiIn = await db.run("delete FROM comandi where (tipo=4 and stato=1 and datetime('now','localtime') > datetime(richiesta,'localTime','+240 hours'));");
			return {status: true, message: '', data : utentiIn};
		}
		catch(ex) {
			logger.logEvent("error", "U2U email commands Table message: " + ex.message);
			return {status: false, message: ex.message};
		}
	}

/* invite */
exports.newInviteRequest=
	async (db, data, addr) => {
		try {
			var uuid = crypto.randomUUID();
			let utenteResult = await db.run('INSERT INTO comandi (uuid, tipo, utente, dati, stato, richiesta, added, lastmod) VALUES (?, ?, ?, ?, ?, datetime(\'now\',\'localtime\'), datetime(\'now\',\'localtime\'), datetime(\'now\',\'localtime\'))', 
										[uuid, 5, data, JSON.stringify(addr), 0]);
			return {status: true, message: '', data: utenteResult};
		}
		catch(ex) {
			logger.logEvent("error", "Invite userr commands Table message: " + ex.message);
			return {status: false, message: ex.message};
		}
	}

exports.newInviteList =
	async (db, payload) => {
		try {
			let messagesToSend;
			messagesToSend = await db.all("SELECT rs.uuid, rs.utente, u.email, u.nome, u.cognome, u.lang, rs.dati\
					FROM comandi rs join utenti u on rs.utente=u.uuid\
					where rs.tipo=5 and rs.stato=0;");
			return {status: true, message: '', data: messagesToSend};
		}
		catch(ex) {
			logger.logEvent("error", "Invite user Commands Table message: " + ex.message);
			return {status: false, message: ex.message};
		}
	}

exports.inviteSent=
	async (db, data) => {
		try {
			let updateResult = await db.run('UPDATE comandi set stato=1, richiesta=datetime(\'now\',\'localtime\'), lastmod=datetime(\'now\',\'localtime\') where tipo=5 and uuid=?', [data]);
			return {status: true, message: '', data: updateResult};
		}
		catch(ex) {
			logger.logEvent("error", "Invite user commands Table message: " + ex.message);
			return {status: false, message: ex.message};
		}
	}

exports.inviteSending=
	async (db, data) => {
		try {
			let updateResult = await db.run('UPDATE comandi set stato=10, lastmod=datetime(\'now\',\'localtime\') where tipo=5 and uuid=?', [data]);
			return {status: true, message: '', data: updateResult};
		}
		catch(ex) {
			logger.logEvent("error", "Invite user commands Table message: " + ex.message);
			return {status: false, message: ex.message};
		}
	}

exports.closeInvite =
	async (db) => {
		try {
			let utentiIn;
			utentiIn = await db.run("delete FROM comandi where (tipo=5 and stato=1 and datetime('now','localtime') > datetime(richiesta,'localTime','+240 hours'));");
			return {status: true, message: '', data : utentiIn};
		}
		catch(ex) {
			logger.logEvent("error", "Invite user commands Table message: " + ex.message);
			return {status: false, message: ex.message};
		}
	}

