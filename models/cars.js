var crypto = require('crypto');

const dbase = require(appBasePath + 'controllers/db');
const logger = require(appBasePath + 'controllers/logger');

const algorithm = "aes-256-cbc"; 

exports.carsTable = 
	async (db) => {
		try {
			await db.exec(' CREATE TABLE IF NOT EXISTS automobili (\
				uuid VARCHAR(36) PRIMARY KEY NOT NULL,\
				marca VARCHAR(50) NOT NULL,\
				modello VARCHAR(50) NOT NULL,\
				targa VARCHAR(10) NOT NULL,\
				carburante_principale VARCHAR(36) NOT NULL,\
				km_iniziali INTEGER NOT NULL,\
				km_attuali INTEGER NOT NULL,\
				owner VARCHAR(36) NOT NULL,\
				added datetime NOT NULL,\
				lastmod datetime NOT NULL,\
				FOREIGN KEY(owner) REFERENCES UTENTI(uuid),\
				FOREIGN KEY(carburante_principale) REFERENCES CARBURANTI(uuid));\
			');
			logger.logEvent("info", "Cars table created");
			return true;
		}
		catch(ex) {
			logger.logEvent("error", "Cars Table message: " + ex.message);
			return false;
		}
	}

exports.allCars =
	async (db) => {
		try {
			let carsAll = await db.all("SELECT row_number() over (order by a.marca, a.modello, a.targa) as id, a.uuid, a.marca, a.modello, a.targa, a.km_iniziali, a.km_attuali, a.carburante_principale, c.carburante, a.added, a.lastmod, count(u.uuid) as utenti from automobili a\
				join carburanti c on a.carburante_principale=c.uuid\
				left join autoutenti au on a.uuid=au.auto\
				left join utenti u on au.utente=u.uuid\
				where a.uuid != '00000000-0000-0000-0000-000000000000' \
				group by a.uuid, a.marca, a.modello, a.targa, a.km_iniziali, a.km_attuali, a.carburante_principale, c.carburante, a.added, a.lastmod\
				order by a.marca, a.modello, a.targa");
			return {error: 0, result: carsAll};
		}
		catch(ex) {
			logger.logEvent("error", " Cars Table message: " + ex.message);
			return {error: 500, message: ex.message};
		}
	}
	
exports.oneCar =
	async (db, car, userData) => {
		try {
			let carOne = await db.all("SELECT a.uuid, a.marca, a.modello, a.targa, a.km_iniziali, a.km_attuali, a.carburante_principale, c.carburante,\
				a.owner, a.added, a.lastmod, count(u.uuid) as utenti\
				from automobili a\
				join carburanti c on a.carburante_principale=c.uuid\
				left join autoutenti au on a.uuid=au.auto\
				left join utenti u on au.utente=u.uuid\
				where a.uuid != '00000000-0000-0000-0000-000000000000' and a.uuid=?\
				group by a.uuid, a.marca, a.modello, a.targa, a.km_iniziali, a.km_attuali, a.carburante_principale, c.carburante, a.owner, a.added, a.lastmod\
				order by a.marca, a.modello, a.targa",[car]);
			return {error: 0, result: carOne, carId: car, user : userData.data.uid};
		}
		catch(ex) {
			logger.logEvent("error", " Cars Table message: " + ex.message);
			return {error: 500, message: ex.message};
		}
	}

exports.editCar=
	async (db, data, owner, language) => {
		try {
			let carResult;
			var uuid = crypto.randomUUID();
			if (data.cmd == 'ADD') {
				let numExists = await db.all("SELECT uuid, marca, modello from automobili where targa = ?",[data.targa.toUpperCase()]);
				if (numExists.length > 0)
					return {error: 2, message: lang[language]['str00000113']};
				else {
			
					carResult = await db.run('INSERT INTO automobili (uuid, marca, modello, targa, carburante_principale, km_iniziali, km_attuali, owner, added, lastmod)\
						VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime(\'now\',\'localtime\'),datetime(\'now\',\'localtime\'))', 
						[uuid, data.marca, data.modello, data.targa.toUpperCase(), data.carburante, data.chilometri, data.chilometri, owner ]);
				}
			}
			else
				if (data.cmd == 'EDIT') {
					let numExists = await db.all("SELECT uuid, marca, modello from automobili where uuid<>? and targa=?",[data.uuid, data.targa.toUpperCase()]);
					if (numExists.length > 0)
						return {error: 2, message: lang[language]['str00000113']};
					else
						carResult = await db.run('UPDATE automobili set marca=?, modello=?, carburante_principale=?, km_iniziali=?,\
							km_attuali=case when km_attuali=km_iniziali then ? else km_attuali end, lastmod=datetime(\'now\',\'localtime\') where uuid=?', 
							[data.marca, data.modello, data.carburante, data.chilometri, data.chilometri, data.uuid]);
				}
				else
					if (data.cmd == 'DEL')
						carResult = await db.run('DELETE FROM automobili where uuid=?', [data.uuid]);
			return {error: 0, result: carResult, newcarId : uuid};
		}
		catch(ex) {
			logger.logEvent("error", "Cars Table message: " + ex.message);
			return {error: 500, message: ex.message};
		}
	}

exports.listCars =
	async (db,userData) => {
		try {
			let carList = await db.all("select a.uuid, a.targa || ' (' || a.marca || ' ' || a.modello || ')' as automobile from automobili a join autoutenti au on a.uuid=au.auto where au.utente=? order by automobile",[userData.data.uid]);
			return {error: 0, result: carList};
		}
		catch(ex) {
			logger.logEvent("error", "Cars Table message: " + ex.message);
			return {error: 500, message : ex.message};
		}
	}

exports.carsByUser =
	async (db, userData) => {
		try {
			let carsByUserList = await db.all("SELECT a.uuid, a.marca, a.modello, a.targa, c.carburante, c.unita_misura, c.uuid as carbId, km_iniziali as kms, km_attuali as kme,\
				a.owner, case when a.owner=? then 1 else 0 end as isOwner\
				from automobili a\
				join carburanti c on a.carburante_principale=c.uuid\
				join autoutenti au on a.uuid=au.auto\
				where au.utente=? order by a.marca;",[userData.data.uid, userData.data.uid]);
			return {error: 0, result: carsByUserList };
		}
		catch(ex) {
			logger.logEvent("error", "Cars by users message: " + ex.message);
			return {error: 500, message : ex.message};
		}
	}

exports.updateCarKM=
	async (db, data) => {
		try {
			let carResult;
			carResult = await db.run('UPDATE automobili set km_attuali=?, lastmod=datetime(\'now\',\'localtime\') where uuid=?',[data.chilometri, data.auto]);
			return {error: 0, result: carResult};
		}
		catch(ex) {
			logger.logEvent("error", "Cars Table message: " + ex.message);
			return {error: 500, message: ex.message};
		}
	}
