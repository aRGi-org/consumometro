const logger = require(appBasePath + 'controllers/logger');

exports.expenses =
	async (db, freq, period, car) => {
		try {
			let reportSettimanaleSpese;
			var periodStr = '';
			switch (freq) {
				case 0:
					periodStr = '-7 days';
					break;
				case 1:
					periodStr = '-1 Month';
					break;
				case 2:
					periodStr = '-3 Month';
					break;
				case 3:
					periodStr = '-12 Month';
					break;
			}

			reportSettimanaleSpese = await db.all("\
				SELECT row_number() over (order by s1.data) as ord,\
				printf('%.2f',s1.prezzo_totale) as prezzo_totale, printf('%.2f',s1.qta) as qta, printf('%.2f',s1.prezzo_unita) as prezzo_unitario,\
				STRFTIME('%d/%m/%Y', s1.data) as data_spesa, t1.spesa as tipo_spesa, c1.carburante as carburante, u1.nome || ' ' || u1.cognome as autista\
				from spese s1 join automobili a1 on a1.uuid=s1.auto join tipospese t1 on s1.tipo=t1.uuid left join carburanti c1 on s1.carburante=c1.uuid join utenti u1 on s1.utente=u1.uuid\
				where a1.uuid=? and\
				data >= datetime(STRFTIME('%Y-%m-%d  00:00:00.000', datetime(?,'localtime','" + periodStr + "')))\
				and data < datetime(STRFTIME('%Y-%m-%d  00:00:00.000', datetime(?,'localtime')))\
				union\
				SELECT 0 as idstart,\
				printf('%.2f',sum(s1.prezzo_totale)) as prc_st, '' as qta_st,\
				'' as un_st,'Periodo Precedente' as d1, '', '', ''\
				from spese s1 join automobili a1 on a1.uuid=s1.auto join tipospese t1 on s1.tipo=t1.uuid left join carburanti c1 on s1.carburante=c1.uuid join utenti u1 on s1.utente=u1.uuid\
				where a1.uuid=? and\
				data < datetime(STRFTIME('%Y-%m-%d  00:00:00.000', datetime(?,'localtime','" + periodStr + "')))\
				order by ord;",[car, period, period, car, period]);
			return {error: 0, result: reportSettimanaleSpese};
		}
		catch(ex) {
			logger.logEvent("error", "Users Table message: " + ex.message);
			return {error: 500, message: ex.message};
		}
	}

exports.consumptions =
	async (db, freq, period, car) => {
		try {
			let reportSettimanaleConsumi;
			var periodStr = '';
			switch (freq) {
				case 0:
					periodStr = '-7 days';
					break;
				case 1:
					periodStr = '-1 Month';
					break;
				case 2:
					periodStr = '-3 Month';
					break;
				case 3:
					periodStr = '-12 Month';
					break;
			}
			
			reportSettimanaleConsumi = await db.all("\
				with totalexp as (\
					with startkm as (\
						SELECT row_number() over (order by s1.chilometri) as idstart, a1.km_iniziali as auto_start, a1.km_attuali as auto_actual_start, s1.chilometri as km_exp_st, s1.prezzo_totale as prc_st,s1.qta as qta_st,\
						s1.prezzo_unita as un_st, s1.data as d1, c1.carburante, u1.uuid, u1.nome, u1.cognome\
						from spese s1 join automobili a1 on a1.uuid=s1.auto join carburanti c1 on s1.carburante=c1.uuid join utenti u1 on s1.utente=u1.uuid\
						where a1.uuid=? and s1.carburante=a1.carburante_principale),\
					endkm as (\
						SELECT row_number() over (order by s2.chilometri)+1 as idend, a2.km_iniziali as auto_end, s2.chilometri as km_exp_end, s2.prezzo_totale, s2.qta, s2.prezzo_unita as un_end,\
						s2.data as d2, c2.carburante, u2.uuid, u2.nome, u2.cognome\
						from spese s2 join automobili a2 on a2.uuid=s2.auto join carburanti c2 on s2.carburante=c2.uuid join utenti u2 on s2.utente=u2.uuid\
						where a2.uuid=? and s2.carburante=a2.carburante_principale)\
					select s.idstart, case when e.d2 is null then 0 else unixepoch(s.d1) - unixepoch(e.d2) end / 86400 as delta_days,\
						case when idend is null then s.auto_start else e.km_exp_end end as km_begin,\
						case when idend is null then s.km_exp_st else s.km_exp_st end as km_end,\
						e.d2 as data, case when e.d2 is null then 'Inizio' else STRFTIME('%d/%m/%Y', e.d2) end as datastr,\
						(s.auto_actual_start - s.auto_start) as km_consumed,\
						printf('%.2f',((case when idend is null then s.km_exp_st else s.km_exp_st end) - (case when idend is null then s.auto_start else e.km_exp_end end)) / s.qta_st) as km_litro,\
						printf('%.2f',100 / (((case when idend is null then s.km_exp_st else s.km_exp_st end) - (case when idend is null then s.auto_start else e.km_exp_end end)) / s.qta_st)) as l_100km,\
						case when idend is null then s.un_st else e.un_end end as unit_price,\
						case when idend is null then s.carburante else e.carburante end as carburante,\
						case when idend is null then s.nome else e.nome end as nome,\
						case when idend is null then s.cognome else e.cognome end as cognome\
						from endkm e right join startkm s on e.idend=s.idstart where not e.d2 is null order by idstart)\
				select 0 as ord, 1 as idstart, sum(delta_days) as delta_days, min(km_begin) as km_begin, max(km_end) as km_end,\
					STRFTIME('%d/%m/%Y', min(datetime(STRFTIME('%Y-%m-%d  00:00:00.000', datetime(?,'localtime','" + periodStr + "'))))) as datastr,\
					printf('%.2f',avg(km_litro)) as km_litro, printf('%.2f',avg(l_100km)) as l_100km, '' as nome, '' as cognome, avg(unit_price) as unit_price, '' as carburante, data\
				from totalexp where\
				data < datetime(STRFTIME('%Y-%m-%d  00:00:00.000', datetime(?,'localtime','" + periodStr + "')))\
				union\
				select 1 as ord, idstart, delta_days, km_begin, km_end, datastr, km_litro, l_100km, nome, cognome, unit_price, carburante, data\
				from totalexp where\
				data >= datetime(STRFTIME('%Y-%m-%d  00:00:00.000', datetime(?,'localtime','" + periodStr + "')))\
				and data < datetime(STRFTIME('%Y-%m-%d  00:00:00.000', datetime(?,'localtime')))\
				order by ord, data, idstart;",[car, car, period, period, period, period]);
			return {error: 0, result: reportSettimanaleConsumi};
		}
		catch(ex) {
			logger.logEvent("error", "Users Table message: " + ex.message);
			return {error: 500, message: ex.message};
		}
	}

/*
exports.monthlyConsumptions =
	async (db, period, car) => {
		try {
			let reportMensileConsumi;
			reportMensileConsumi = await db.all("\
				with totalexp as (\
					with startkm as (\
						SELECT row_number() over (order by s1.chilometri) as idstart, a1.km_iniziali as auto_start, a1.km_attuali as auto_actual_start, s1.chilometri as km_exp_st, s1.prezzo_totale as prc_st,s1.qta as qta_st, s1.data as d1\
						from spese s1 join automobili a1 on a1.uuid=s1.auto\
						where a1.uuid=? and s1.carburante=a1.carburante_principale),\
					endkm as (\
						SELECT row_number() over (order by s2.chilometri)+1 as idend, a2.km_iniziali as auto_end, s2.chilometri as km_exp_end, s2.prezzo_totale, s2.qta, s2.data as d2\
						from spese s2 join automobili a2 on a2.uuid=s2.auto\
						where a2.uuid=? and s2.carburante=a2.carburante_principale)\
					select s.idstart, case when e.d2 is null then 0 else unixepoch(s.d1) - unixepoch(e.d2) end / 86400 as delta_days,\
						case when idend is null then s.auto_start else e.km_exp_end end as km_begin,\
						case when idend is null then s.km_exp_st else s.km_exp_st end as km_end,\
						e.d2 as data, case when e.d2 is null then 'Inizio' else STRFTIME('%d/%m/%Y', e.d2) end as datastr,\
						(s.auto_actual_start - s.auto_start) as km_consumed,\
						printf('%.2f',((case when idend is null then s.km_exp_st else s.km_exp_st end) - (case when idend is null then s.auto_start else e.km_exp_end end)) / s.qta_st) as km_litro,\
						printf('%.2f',100 / (((case when idend is null then s.km_exp_st else s.km_exp_st end) - (case when idend is null then s.auto_start else e.km_exp_end end)) / s.qta_st)) as l_100km\
						from endkm e right join startkm s on e.idend=s.idstart where not e.d2 is null order by idstart)\
				select 0 as ord, 1 as idstart, sum(delta_days) as delta_days, min(km_begin) as km_begin, max(km_end) as km_end,\
					STRFTIME('%d/%m/%Y', min(datetime(STRFTIME('%Y-%m-%d  00:00:00.000', datetime(?,'localtime','-1 Month'))))) as datastr,\
					printf('%.2f',avg(km_litro)) as km_litro, printf('%.2f',avg(l_100km)) as l_100km\
				from totalexp where\
				data < datetime(STRFTIME('%Y-%m-%d  00:00:00.000', datetime(?,'localtime','-1 Month')))\
				union\
				select 1 as ord, idstart, delta_days, km_begin, km_end, datastr, km_litro, l_100km\
				from totalexp where\
				data >= datetime(STRFTIME('%Y-%m-%d  00:00:00.000', datetime(?,'localtime','-1 Month')))\
				and data < datetime(STRFTIME('%Y-%m-%d  00:00:00.000', datetime(?,'localtime')))\
				order by ord, idstart;",[car, car, period, period, period, period]);
			return {error: 0, result: reportMensileConsumi};
		}
		catch(ex) {
			logger.logEvent("error", "Users Table message: " + ex.message);
			return {error: 500, message: ex.message};
		}
	}
*/
exports.reportsListNew =
	async (db, dueDate) => {
		try {
			let reports = await db.all("SELECT au.auto, au.utente, au.next_report, au.report_status\
				FROM autoutenti au\
				where au.next_report = datetime(?) and au.report_status=0",[dueDate]);
			return {error: 0, result: reports };
		}
		catch(ex) {
			logger.logEvent("error", "Reporting Engine message: " + ex.message);
			return {error: 500, message : ex.message};
		}
	}

exports.reportsList2BeProcessed =
	async (db) => {
		try {
			let reports = await db.all("SELECT au.auto, au.utente, au.next_report, au.report_status,  a.marca,  a.modello,  a.targa,\
				a.carburante_principale, c.carburante, c.unita_misura, u.nome, u.cognome, u.email, u.lang, u.userid, u.report_freq\
				FROM autoutenti au\
				join automobili a on au.auto=a.uuid\
				join carburanti c on a.carburante_principale=c.uuid\
				join utenti u on au.utente=u.uuid\
				where au.report_status=1");
			return {error: 0, result: reports };
		}
		catch(ex) {
			logger.logEvent("error", "Reporting Engine message: " + ex.message);
			return {error: 500, message : ex.message};
		}
	}

exports.reportsList2BeSend =
	async (db) => {
		try {
			let reports = await db.all("SELECT au.auto, au.utente, au.next_report, au.report_status,  a.marca,  a.modello,  a.targa,\
				a.carburante_principale, c.carburante, c.unita_misura, u.nome, u.cognome, u.email, u.lang, u.userid, u.report_freq\
				FROM autoutenti au\
				join automobili a on au.auto=a.uuid\
				join carburanti c on a.carburante_principale=c.uuid\
				join utenti u on au.utente=u.uuid\
				where au.report_status=2");
			return {error: 0, result: reports };
		}
		catch(ex) {
			logger.logEvent("error", "Reporting Engine message: " + ex.message);
			return {error: 500, message : ex.message};
		}
	}

exports.reportsList2BeScheduled =
	async (db) => {
		try {
			let reports = await db.all("SELECT au.auto, au.utente, au.next_report, au.report_status,  a.marca,  a.modello,  a.targa,\
				a.carburante_principale, c.carburante, c.unita_misura, u.nome, u.cognome, u.email, u.lang, u.userid, u.report_freq\
				FROM autoutenti au\
				join automobili a on au.auto=a.uuid\
				join carburanti c on a.carburante_principale=c.uuid\
				join utenti u on au.utente=u.uuid\
				where au.report_status=3");
			return {error: 0, result: reports };
		}
		catch(ex) {
			logger.logEvent("error", "Reporting Engine message: " + ex.message);
			return {error: 500, message : ex.message};
		}
	}

exports.reportsListDrivers =
	async (db, car) => {
		try {
			let drivers = await db.all("SELECT u.nome || ' ' || u.cognome as autista, u.email FROM autoutenti au join utenti u on au.utente=u.uuid where au.auto=?",[car]);
			return {error: 0, result: drivers };
		}
		catch(ex) {
			logger.logEvent("error", "Reporting Engine message: " + ex.message);
			return {error: 500, message : ex.message};
		}
	}

exports.updateReportsStep1 =
	async (db, dueDate) => {
		try {
			let reports = await db.run("UPDATE autoutenti set report_status=1 where next_report = datetime(?) and report_status=0;",[dueDate]);
			return {error: 0, result: reports };
		}
		catch(ex) {
			logger.logEvent("error", "Reporting Engine message: " + ex.message);
			return {error: 500, message : ex.message};
		}
	}

exports.updateReportsStep2 =
	async (db, carId, userId) => {
		try {
			let reports = await db.run("UPDATE autoutenti set report_status=2 where auto=? and utente=? and report_status=1;",[carId,userId]);
			return {error: 0, result: reports };
		}
		catch(ex) {
			logger.logEvent("error", "Reporting Engine message: " + ex.message);
			return {error: 500, message : ex.message};
		}
	}

exports.updateReportsStep3 =
	async (db, carId, userId) => {
		try {
			let reports = await db.run("UPDATE autoutenti set report_status=3 where auto=? and utente=? and report_status=2;",[carId,userId]);
			return {error: 0, result: reports };
		}
		catch(ex) {
			logger.logEvent("error", "Reporting Engine message: " + ex.message);
			return {error: 500, message : ex.message};
		}
	}

