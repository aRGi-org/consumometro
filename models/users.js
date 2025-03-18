var crypto = require('crypto');

const logger = require(appBasePath + 'controllers/logger');

const algorithm = "aes-256-cbc"; 

exports.usersTable = 
	async (db) => {
		try {
			await db.exec(' CREATE TABLE IF NOT EXISTS utenti (\
				uuid VARCHAR(36) PRIMARY KEY NOT NULL,\
				nome VARCHAR(100) NOT NULL,\
				cognome VARCHAR(100) NOT NULL,\
				email VARCHAR(100) NOT NULL,\
				userid VARCHAR(10) NOT NULL,\
				password BLOB NULL,\
				salt BLOB NULL,\
				enabled INTEGER NOT NULL,\
				role VARCHAR(36) NOT NULL,\
				lang VARCHAR(2) NOT NULL,\
				report_freq integer not null,\
				added datetime NOT NULL,\
				lastmod datetime NOT NULL,\
				FOREIGN KEY(lang) REFERENCES LINGUE(ID),\
				FOREIGN KEY(role) REFERENCES RUOLI(UUID));\
			');
			logger.logEvent("info", "Users table created");
			return true;
		}
		catch(ex) {
			logger.logEvent("error", "Users Table message: " + ex.message);
			return false;
		}
	}

exports.verifyUser = 
	async (db, payload, timeNow) => { 
		try {
			let userDetails = await db.get("SELECT u.uuid as uid, u.nome, u.cognome, u.userid, u.password, u.salt, u.enabled, r.id as role, r.ruolo, u.role as roleuuid, u.email as emailu,\
				u.lang, l.lingua, 15552000 as maxage, '" + payload.formSecret + "' as unencsecret, " + timeNow + " as cookieTime\
				from utenti u join ruoli r on r.uuid=u.role\
				join lingue l on u.lang=l.id\
				where upper(u.userid)=? or upper(u.email)=?",[payload.formUser.toUpperCase(),payload.formUser.toUpperCase()]);
			if (userDetails) {
				hash = crypto.pbkdf2Sync(payload.formSecret, userDetails.salt, 310000, 32, 'sha256'); 
				if (!crypto.timingSafeEqual(hash, userDetails.password)) {
					logger.logEvent("error", "invalid logon attempt from user: " + payload.formUser);
					return { status: false, message : lang[langId]['str00000051']};
				}
				else {
					if (userDetails.enabled != 1) {
						logger.logEvent("error", "user is disable: " + payload.formUser);
						return { status: false, message : lang[langId]['str00000052']};
					}
					else {
						logger.logEvent("info", "user succesfully authenticated: " + payload.formUser);
						return { status: true, message : '', data : userDetails};
					}
				}
			}
			else {
				logger.logEvent("error", "invalid logon attempt from unknown user: " + payload.formUser);
				return { status: false, message : lang[langId]['str00000053']};
			}
		}
		catch(ex) {
			logger.logEvent("error",  "Users Table message: " + ex.message);
			return { status: false, message : lang[langId]['str00000053'] + ex.message};
		}
	}

exports.allUsers =
	async (db, currentUser) => {
		try {
			let utentiAll;
			utentiAll = await db.all("SELECT row_number() over (order by  u.nome || ' ' || u.cognome) as id, u.uuid as uid, u.nome, u.cognome, u.userid, u.enabled, u.email, u.role, u.nome || ' ' || u.cognome as fullname,\
				case when u.enabled=1 then 'Abilitato' else 'Disabilitato' end as state, u.lang, l.lingua,\
				case when u.report_freq = 0 then 'str00000145' when u.report_freq = 1 then 'str00000146' when u.report_freq = 2 then 'str00000147'  when u.report_freq = 3 then 'str00000148' end as reports, u.report_freq,\
				r.ruolo as roledesc,u.added, u.lastmod, date(u.added) as useradded, date(u.lastmod) as userlastmod, count(a.uuid) as auto\
				from utenti u\
				join ruoli r on r.uuid=u.role\
				join lingue l on l.id=u.lang\
				left join autoutenti au on u.uuid=au.utente\
				left join automobili a on au.auto=a.uuid\
				where u.uuid != '00000000-0000-0000-0000-000000000000'\
				group by u.uuid, u.nome, u.cognome, u.userid, u.enabled, u.email, u.role, u.nome || ' ' || u.cognome, case when u.enabled=1 then 'Abilitato' else 'Disabilitato' end, r.ruolo, u.added, u.lastmod, date(u.added), date(u.lastmod);");
			
/*			
			
			
			SELECT row_number() over (order by  u.nome || ' ' || u.cognome) as id, u.uuid as uid, u.nome, u.cognome, u.userid, u.password, u.salt, u.enabled, u.email, u.role, u.nome || ' ' || u.cognome as fullname, case when u.enabled=1 then 'Abilitato' else 'Disabilitato' end as state,\
										r.ruolo as roledesc,\
										u.added, u.lastmod, date(u.added) as useradded, date(u.lastmod) as userlastmod from utenti u join ruoli r on r.uuid=u.role where u.uuid != '00000000-0000-0000-0000-000000000000' ;");
										*/
			return utentiAll;
		}
		catch(ex) {
			logger.logEvent("error", "Users Table message: " + ex.message);
			return false;
		}
	}

exports.editUser=
	async (db, data) => {
		try {
			if (data.cmd == 'ADD') {
				var uuid = crypto.randomUUID();
				var salt = crypto.randomBytes(16);
				var hash = crypto.pbkdf2Sync(data.secret1, salt, 310000, 32, 'sha256'); 
				var enabled = 1;
				let checkUserid = await db.all("SELECT u.uuid as uid, u.userid from utenti u where upper(u.userid) = ?",[data.userid.toUpperCase()]);
				let checkUsermail = await db.all("SELECT u.uuid as uid, u.email from utenti u where upper(u.email) = ?",[data.email.toUpperCase()]);
				if (checkUserid[0] === undefined)
					if (checkUsermail[0] === undefined)
						utenteResult = await db.run('INSERT INTO utenti (uuid, nome, cognome, userid, password, salt, enabled, role, lang, email, report_freq, added, lastmod) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime(\'now\',\'localtime\'),datetime(\'now\',\'localtime\'))', 
													[uuid, data.nome, data.cognome, data.userid.toUpperCase(), hash, salt, enabled, data.ruolo, data.lang, data.email.toLowerCase(), data.freq]);
					else
						return {status: false, message: "L'indirizzo " + data.email + " è già stato utilizzato"};
				else
					return {status: false, message: "L'utente " + data.userid + " è già stato creato"};
			}
			else
				if (data.cmd == 'EDIT') {
					let checkUsermail = await db.all("SELECT u.uuid as uid, u.email from utenti u where upper(u.email) = ? and upper(u.uuid) <> ?",[data.email.toUpperCase(), data.gid.toUpperCase()]);
					if (checkUsermail[0] === undefined)
						utenteResult = await db.run('UPDATE utenti set nome=?, cognome=?, email=?, enabled=?, role=?, lang=?, report_freq=?, lastmod=datetime(\'now\',\'localtime\') where uuid=?', 
													[data.nome, data.cognome, data.email.toLowerCase(), data.enabled, data.ruolo, data.lang, data.freq, data.gid]);
					else
						return {status: false, message: "L'indirizzo " + data.email + " è già stato utilizzato"};
				}
				else
					if (data.cmd == 'PSWD') {
						var salt = crypto.randomBytes(16);
						var hash = crypto.pbkdf2Sync(data.secret1, salt, 310000, 32, 'sha256'); 
						utenteResult = await db.run('UPDATE utenti set password=?, salt=?, lastmod=datetime(\'now\',\'localtime\') where uuid=?', 
													[hash, salt, data.gid]);
					}
					else
						if (data.cmd == 'DEL')
							utenteResult = await db.run('DELETE FROM utenti where upper(uuid)=?', [data.gid.toUpperCase()]);
			return {status: true, message: '', data: utenteResult};
		}
		catch(ex) {
			logger.logEvent("error", "Users Table message: " + ex.message);
			return {status: false, message: ex.message};
		}
	}

exports.joinUser=
	async (db, data) => {
		try {
			var uuid = crypto.randomUUID();
			var salt = crypto.randomBytes(16);
			var hash = crypto.pbkdf2Sync(data.secret1, salt, 310000, 32, 'sha256'); 
			let checkUserid = await db.all("SELECT u.uuid as uid, u.userid from utenti u where upper(u.userid) = ?",[data.userid.toUpperCase()]);
			let checkUsermail = await db.all("SELECT u.uuid as uid, u.email from utenti u where upper(u.email) = ?",[data.email.toUpperCase()]);
			if (checkUserid[0] === undefined)
				if (checkUsermail[0] === undefined)
					utenteResult = await db.run('INSERT INTO utenti (uuid, nome, cognome, userid, password, salt, enabled, role, email, lang, report_freq, added, lastmod) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime(\'now\',\'localtime\'),datetime(\'now\',\'localtime\'))', 
												[uuid, data.nome, data.cognome, data.userid.toUpperCase(), hash, salt, data.enabled, data.ruolo, data.email.toLowerCase(), data.lang, 1]);
				else
					return {status: false, message: "L'indirizzo " + data.email + " è già stato utilizzato"};
			else
				return {status: false, message: "L'utente " + data.userid + " è già stato creato"};
			return {status: true, message: '', data: utenteResult, requestId : uuid };
		}
		catch(ex) {
			logger.logEvent("error", "Users Table message: " + ex.message);
			return {status: false, message: ex.message};
		}
	}

exports.enableJoinedUser=
	async (db, data) => {
		try {
			console.log(data);
			utenteResult = await db.run('UPDATE utenti set enabled=1\
			where uuid=(select utente from comandi where tipo=0 and uuid=?)',[data]);
			return {status: true, message: '', data: utenteResult };
		}
		catch(ex) {
			logger.logEvent("error", "Users Table message: " + ex.message);
			return {status: false, message: ex.message};
		}
	}


exports.inUsers =
	async (db, payload) => {
		try {
			let utentiIn;
			utentiIn = await db.all("SELECT '"  + payload.auto + "' as auto, u.uuid as uid, u.email, u.nome || ' ' || u.cognome as fullname, u.enabled\
				from utenti u join autoutenti au on au.utente=u.uuid\
				where au.auto = ?;",[payload.auto]);
			return utentiIn;
		}
		catch(ex) {
			logger.logEvent("error", "Users Table message: " + ex.message);
			return false;
		}
	}

exports.outUsers =
	async (db, payload) => {
		try {
			let utentiIn;
			utentiIn = await db.all("SELECT DISTINCT '"  + payload.auto + "' as auto, u.uuid as uid, u.email, u.nome || ' ' || u.cognome as fullname\
				from utenti u\
				where u.enabled=1 and u.uuid != '00000000-0000-0000-0000-000000000000' and u.uuid not in\
				(select auout.utente from autoutenti auin join autoutenti auout on auin.auto=auout.auto and auin.utente=auout.utente where auout.auto = '" + payload.auto + "');");
			return utentiIn;
		}
		catch(ex) {
			logger.logEvent("error", "Users Table message: " + ex.message);
			return false;
		}
	}

exports.searchUser=
	async (db, data, currentUser) => {
		try { 
			let checkUser = await db.all("SELECT u.uuid as uid, u.userid, u.nome, u.cognome, u.email from utenti u\
			where (upper(u.userid) = ? or upper(u.email) = ?) and upper(u.userid) <> upper(?) and upper(u.email) <> upper(?)",[data.userGuess, data.userGuess, currentUser.data.userid, currentUser.data.emailu]);
			if (checkUser[0] === undefined)
				return {error: 500, message: lang[currentUser.data.lang]['str00000119']};
			else {
				var emailData = {
					from: currentUser.data.emailu,
					fromName : currentUser.data.nome,
					fromLast : currentUser.data.cognome,
					to : checkUser[0].email,
					toName : checkUser[0].nome,
					toLast : checkUser[0].cognome,
					uid: checkUser[0].uid,
				}
				return {error: 0, message: '', data: emailData };
			}
		}
		catch(ex) {
			logger.logEvent("error", "Users Table message: " + ex.message);
			return {error: 500, message: ex.message};
		}
	}

exports.oneUser=
	async (db, currentUser) => {
		try { 
			let oneUserData = await db.all("SELECT uuid, nome, cognome, email, userid, role, lang, report_freq FROM utenti where uuid=?",[currentUser.data.uid]);
			if (oneUserData[0] === undefined)
				return {error: 500, message: lang[currentUser.data.lang]['str00000119']};
			else {
				return {error: 0, message: '', data: oneUserData[0] };
			}
		}
		catch(ex) {
			logger.logEvent("error", "Users Table message: " + ex.message);
			return {error: 500, message: ex.message};
		}
	}

exports.oneUser4Secret=
	async (db, resetRequest, languageId) => {
		try { 
			let oneUserData = await db.all("SELECT u.uuid, u.nome, u.cognome, u.email, u.userid, u.role, u.lang, u. report_freq, r.uuid as who\
				FROM utenti u join comandi r on u.uuid=r.utente where r.tipo=1 and  r.uuid=?",[resetRequest]);
			if (oneUserData[0] === undefined)
				return {error: 500, message: lang[languageId]['str00000119']};
			else {
				return {error: 0, message: '', data: oneUserData[0] };
			}
		}
		catch(ex) {
			logger.logEvent("error", "Users Table message: " + ex.message);
			return {error: 500, message: ex.message};
		}
	}

exports.oneUserByUID=
	async (db, currentUser) => {
		try { 
			let oneUserData = await db.all("SELECT uuid, nome, cognome, email, userid, role, lang, report_freq FROM utenti where uuid=?",[currentUser]);
			if (oneUserData[0] === undefined)
				return {error: 500, message: lang[currentUser.data.lang]['str00000119']};
			else {
				return {error: 0, message: '', data: oneUserData[0] };
			}
		}
		catch(ex) {
			logger.logEvent("error", "Users Table message: " + ex.message);
			return {error: 500, message: ex.message};
		}
	}


exports.oneUserByMailAddress=
	async (db, mailAddress) => {
		try { 
			var userLang = langId;
			let oneUserData = await db.all("SELECT uuid, nome, cognome, email, userid, role, lang, report_freq FROM utenti where upper(email)=?",[mailAddress.toUpperCase()]);
			if (oneUserData[0] === undefined)
				return {error: 1, message: lang[userLang]['str00000119']};
			else {
				return {error: 0, message: '', data: oneUserData[0] };
			}
		}
		catch(ex) {
			logger.logEvent("error", "Users Table message: " + ex.message);
			return {error: 500, message: ex.message};
		}
	}
