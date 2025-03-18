var crypto = require('crypto');

const logger = require(appBasePath + 'controllers/logger');

const algorithm = "aes-256-cbc"; 

exports.expensesTable = 
	async (db) => {
		try {
			await db.exec(' CREATE TABLE IF NOT EXISTS spese (\
				uuid VARCHAR(36) PRIMARY KEY NOT NULL,\
				auto VARCHAR(36) NOT NULL,\
				tipo VARCHAR(36) NOT NULL,\
				carburante VARCHAR(36) NULL,\
				data datetime NOT NULL,\
				chilometri integer NOT NULL,\
				prezzo_unita REAL NOT NULL,\
				prezzo_totale REAL NOT NULL,\
				qta REAL NOT NULL,\
				utente VARCHAR(36) NOT NULL,\
				added datetime NOT NULL,\
				lastmod datetime NOT NULL,\
				FOREIGN KEY(auto) REFERENCES AUTOMOBILI (UUID),\
				FOREIGN KEY(tipo) REFERENCES TIPOSPESE(UUID),\
				FOREIGN KEY(carburante) REFERENCES CARBURANTI(UUID),\
				FOREIGN KEY(utente) REFERENCES UTENTI(UUID));\
			');
			logger.logEvent("info", "Expenses table created");
			return true;
		}
		catch(ex) {
			logger.logEvent("error", "Expenses Table message: " + ex.message);
			return false;
		}
	}

exports.expenseTypesTable = 
	async (db) => {
		try {
			await db.exec(' CREATE TABLE IF NOT EXISTS tipospese (\
				uuid VARCHAR(36) PRIMARY KEY NOT NULL,\
				spesa VARCHAR(100) NOT NULL,\
				added datetime NOT NULL,\
				lastmod datetime NOT NULL);\
			');
			await db.exec(" INSERT INTO tipospese (uuid, spesa, added, lastmod) values('00000000-3000-0000-0000-000000000000', 'str00000073', datetime(\'now\',\'localtime\'),datetime(\'now\',\'localtime\')) ON CONFLICT (UUID) DO NOTHING;");
			await db.exec(" INSERT INTO tipospese (uuid, spesa, added, lastmod) values('00000000-3000-0000-0006-000000000000', 'str00000074', datetime(\'now\',\'localtime\'),datetime(\'now\',\'localtime\')) ON CONFLICT (UUID) DO NOTHING;");
			await db.exec(" INSERT INTO tipospese (uuid, spesa, added, lastmod) values('00000000-3000-0000-0007-000000000000', 'str00000075', datetime(\'now\',\'localtime\'),datetime(\'now\',\'localtime\')) ON CONFLICT (UUID) DO NOTHING;");
			await db.exec(" INSERT INTO tipospese (uuid, spesa, added, lastmod) values('00000000-3000-0000-0008-000000000000', 'str00000076', datetime(\'now\',\'localtime\'),datetime(\'now\',\'localtime\')) ON CONFLICT (UUID) DO NOTHING;");
			await db.exec(" INSERT INTO tipospese (uuid, spesa, added, lastmod) values('00000000-3000-0000-0009-000000000000', 'str00000077', datetime(\'now\',\'localtime\'),datetime(\'now\',\'localtime\')) ON CONFLICT (UUID) DO NOTHING;");
			await db.exec(" INSERT INTO tipospese (uuid, spesa, added, lastmod) values('00000000-3000-0000-0010-000000000000', 'str00000078', datetime(\'now\',\'localtime\'),datetime(\'now\',\'localtime\')) ON CONFLICT (UUID) DO NOTHING;");
			logger.logEvent("info", "Tipospese table created");
			return true;
		}
		catch(ex) {
			logger.logEvent("error", "Tipospese table message: " + ex.message);
			return false;
		}
}

exports.allRefills =
	async (db, userData) => {
		try {
			let rifornimentiAll;
			rifornimentiAll = await db.all("SELECT s.uuid, s.auto as autouuid, a.marca || ' ' || a.modello as auto, s.tipo as tipouuid, t.spesa, s.carburante as carbuuid, c.carburante, s.data,\
				s.prezzo_unita, s.prezzo_totale, s.qta, s.utente as utenteuuid, u.nome || ' ' || u.cognome as utente, s.added, s.lastmod\
				FROM spese s join automobili a on s.auto=a.uuid join tipospese t on s.tipo=t.uuid join carburanti c on s.carburante=c.uuid join utenti u on s.utente=u.uuid join autoutenti au on au.auto=s.auto\
				where au.utente=? order by s.data desc;",[userData.data.uid]);
			return {error: 0, result: rifornimentiAll};
			return rifornimentiAll;
		}
		catch(ex) {
			logger.logEvent("error", "Users Table message: " + ex.message);
			return {error: 500, message: ex.message};
		}
	}

exports.editExpense=
	async (db, data, userData) => {
		try {
			let expenseResult;
			var uuid = crypto.randomUUID();
			if (data.cmd == 'ADD' || data.cmd == 'EDIT') {
				kmResult = await db.all("with\
					pre as (select 0 as link,s.chilometri as kmpre from spese s	where auto=? and data <= datetime(?,\'localtime\') limit 1),\
					post as (select 0 as link, s.chilometri as kmpost from spese s where auto=? and data >= datetime(?,\'localtime\') limit 1)\
					select kmpre,kmpost from pre full join post on pre.link=post.link",[data.auto, data.when, data.auto, data.when]); 
				var kmOk = 0;
				if (kmResult.length < 1)
					kmOk = 1;
				else {
					if ((kmResult[0].kmpre == null || kmResult[0].kmpre <= parseFloat(data.chilometri)) && (kmResult[0].kmpost == null || kmResult[0].kmpost >= parseFloat(data.chilometri)))
						kmOk = 1;
				}
			}
			
			if (data.cmd == 'DEL')
				expenseResult = await db.run('DELETE FROM spese where uuid=?', [data.gid]);
			else {
				if (kmOk != 0) {
					if (data.cmd == 'ADD') {
						expenseResult = await db.run('INSERT INTO spese (uuid, auto, tipo, carburante, data, chilometri, prezzo_unita, prezzo_totale, qta, utente, added, lastmod )\
								VALUES (?, ?, ?, ?, datetime(?,\'localtime\'), ?, ?, ?, ?, ?, datetime(\'now\',\'localtime\'),datetime(\'now\',\'localtime\'))', 
								[uuid, data.auto, data.tipo, data.carburante, data.when, data.chilometri, data.unit, data.total, data.qty ,userData.data.uid]);
					}
					else {
						if (data.cmd == 'EDIT') {
							expenseResult = await db.run('UPDATE spese set tipo=?, carburante=?, data=datetime(?,\'localtime\'), chilometri=?, prezzo_unita=?, prezzo_totale=?, qta=?, utente=?, lastmod=datetime(\'now\',\'localtime\') where uuid=?', 
									[data.tipo, data.carburante, data.when, data.chilometri, data.unit, data.total, data.qty, userData.data.uid, data.gid]);
						}
					}
				}
				else {
					return {error: 10, result: expenseResult, auto: data.defAuto, fuel: data.defFuel, kms: (kmResult[0].kmpre == null ? data.kmBeg : kmResult[0].kmpre) , kme: (kmResult[0].kmpost == null ? '' : kmResult[0].kmpost), message : 'str00000179'};
				}
			}
			return {error: 0, result: expenseResult, auto: data.defAuto, fuel: data.defFuel, kms: data.kmBeg, kme: (parseInt(data.chilometri) > parseInt(data.kmEnd) ? data.chilometri : data.kmEnd)};
		}
		catch(ex) {
			logger.logEvent("error", "Cars Table message: " + ex.message);
			return {error: 500, message: ex.message};
		}
	}


exports.listExpenseTypes =
	async (db) => {
		try {
			let expenseTypesList = await db.all("select uuid, spesa from tipospese order by uuid");
			return {error: 0, result: expenseTypesList};
		}
		catch(ex) {
			logger.logEvent("error", "Tipospese list table message: " + ex.message);
			return {error: 500, message : ex.message};
		}
	}

exports.listExpensesByCar =
	async (db, carUUID, carFuel, kmBegin, kmActual, carLicense) => {
		try {
			let expenseByCar = await db.all("select s.uuid, s.data as dataora, STRFTIME('%d/%m/%Y', s.data) as data, s.chilometri, printf('%.2f', s.prezzo_unita) as prezzo_unita, printf('%.2f', s.prezzo_totale) as prezzo_totale,\
				printf('%.2f', s.qta) as qta, case when ts.uuid='00000000-3000-0000-0000-000000000000' then cs.carburante else ts.spesa end as spesa, cs.carburante, a.targa, s.auto, s.tipo, s.carburante,\
				s.utente, a.km_iniziali as kms, a.km_attuali as kme\
				from spese s\
				left join tipospese ts on s.tipo=ts.uuid\
				left join carburanti cs on s.carburante=cs.uuid\
				join automobili a on s.auto=a.uuid\
				where s.auto=? order by s.data desc limit 10",[carUUID]);
			return {error: 0, result: expenseByCar, car: carUUID, fuel: carFuel, kmb: kmBegin, kme: kmActual, license: carLicense};
		}
		catch(ex) {
			logger.logEvent("error", "Tipospese bycar table message: " + ex.message);
			return {error: 500, message : ex.message};
		}
	}
	
exports.deleteExpensesByCar =
	async (db, carUUID) => {
		try {
			let	expenseResult = await db.run('DELETE FROM spese where auto=?', [carUUID]);
			return {error: 0, result: expenseResult};
		}
		catch(ex) {
			logger.logEvent("error", "Tipospese delete bycar table message: " + ex.message);
			return {error: 500, message : ex.message};
		}
	}
	
exports.listExpensesByCarAndCatHead =
	async (db, carUUID, carFuel, carLicense) => {
		try {
			let expenseByCarAndCat = await db.all("SELECT s.auto as carId, s.tipo as spesaId, ts.spesa, s.carburante as carbId, c.carburante, s.auto || '-' || s.tipo || '-' || s.carburante as expKey,\
				count(s.uuid) as totals, sum(prezzo_totale) as spesa_totale,(a.km_attuali-a.km_iniziali) as km_percorsi\
				FROM automobili a\
				left join spese s on s.auto=a.uuid\
				left join tipospese ts on s.tipo=ts.uuid\
				left join carburanti c on s.carburante=c.uuid\
				left join utenti u on s.utente=u.uuid\
				where s.auto=?\
				group by s.auto, s.tipo, ts.spesa, s.carburante, c.carburante, s.tipo || s.carburante order by expKey;",[carUUID]);
			return {error: 0, result: expenseByCarAndCat, car: carUUID};
		}
		catch(ex) {
			logger.logEvent("error", "Tipospese bycarandcat table message: " + ex.message);
			return {error: 500, message : ex.message};
		}
	}

exports.listExpensesByCarAndCat =
	async (db, carUUID, carExpense, carFuel) => {
		try {
			let expenseByCarAndCat = await db.all("SELECT 1 as indexs, ts.uuid,\
				u.nome || ' ' || u.cognome as utente, s.chilometri as km,\
				s.data as dataora, STRFTIME('%d/%m/%Y', s.data) as data,\
				s.auto || '-' || s.tipo || '-' || s.carburante as atcKey,\
				printf('%.2f',s.prezzo_unita) as unit, printf('%.2f',s.prezzo_totale) as total, printf('%.2f',s.qta) as qty,\
				c.unita_misura\
				FROM automobili a\
				left join spese s on s.auto=a.uuid\
				left join tipospese ts on s.tipo=ts.uuid\
				left join carburanti c on s.carburante=c.uuid\
				left join utenti u on s.utente=u.uuid\
				where s.auto=? and s.tipo=? and s.carburante=?\
				union\
				select 99999, tipo, '" + lang[langId]['str00000103'] + "', max(chilometri)-min(chilometri), '', '" + lang[langId]['str00000104'] + "', auto || '-' || tipo || '-' || carburante as atcKey,\
				printf('%.2f',avg(prezzo_unita)), printf('%.2f',sum(prezzo_totale)), printf('%.2f',sum(qta)),''\
				from spese where auto=? and tipo=? and carburante=?\
				group by auto, tipo, carburante\
				order by dataora desc;",[carUUID, carExpense, carFuel, carUUID, carExpense, carFuel]);
			return {error: 0, result: expenseByCarAndCat, car: carUUID};
		}
		catch(ex) {
			logger.logEvent("error", "Tipospese bycarandcat table message: " + ex.message);
			return {error: 500, message : ex.message};
		}
	}
		
exports.listConsumptionsByCar =
	async (db, carUUID, fuelUnit) => {
		try {
			let consumptionsByCar = await db.all("with startkm as (\
				SELECT row_number() over (order by s1.chilometri) as idstart, a1.km_iniziali as auto_start, a1.km_attuali as auto_actual_start, s1.chilometri as km_exp_st, s1.prezzo_totale as prc_st, s1.qta as qta_st, s1.data as d1\
				from spese s1 join automobili a1 on a1.uuid=s1.auto\
				where a1.uuid=? and s1.carburante=a1.carburante_principale /*and s1.chilometri < a1.km_attuali*/\
				), endkm as (\
				SELECT row_number() over (order by s2.chilometri)+1 as idend, a2.km_iniziali as auto_end, s2.chilometri as km_exp_end, s2.prezzo_totale, s2.qta, s2.data as d2\
				from spese s2 join automobili a2 on a2.uuid=s2.auto\
				where a2.uuid=? and s2.carburante=a2.carburante_principale /*and s2.chilometri < a2.km_attuali*/\
				) select s.idstart, case when e.d2 is null then 0 else unixepoch(s.d1) - unixepoch(e.d2) end / 86400 as delta_days,\
				case when idend is null then s.auto_start else e.km_exp_end end as km_begin,\
				case when idend is null then s.km_exp_st else s.km_exp_st end as km_end,\
				case when e.d2 is null then 'Inizio' else STRFTIME('%d/%m/%Y', e.d2) end as data,\
				(s.auto_actual_start - s.auto_start) as km_consumed,\
				((case when idend is null then s.km_exp_st else s.km_exp_st end) - (case when idend is null then s.auto_start else e.km_exp_end end)) as km_delta,\
				printf('%.2f',((case when idend is null then s.km_exp_st else s.km_exp_st end) - (case when idend is null then s.auto_start else e.km_exp_end end)) / s.qta_st) as km_litro,\
				printf('%.2f',100 / (((case when idend is null then s.km_exp_st else s.km_exp_st end) - (case when idend is null then s.auto_start else e.km_exp_end end)) / s.qta_st)) as l_100km\
				from endkm e right join startkm s on e.idend=s.idstart where not e.d2 is null order by idstart desc;",[carUUID, carUUID]);
			return {error: 0, result: consumptionsByCar, car: carUUID, fuelunit: fuelUnit};
		}
		catch(ex) {
			logger.logEvent("error", "Consumi bycar table message: " + ex.message);
			return {error: 500, message : ex.message};
		}
	}
