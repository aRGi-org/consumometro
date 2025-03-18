var XLSX = require("xlsx");
const fs = require('fs'); 
const { DateTime, Duration } = require("luxon");

const logger = require(appBasePath + 'controllers/logger');
const sqlite = require(appBasePath + 'controllers/db');
const email = require(appBasePath + 'controllers/emails');
const users = require(appBasePath + 'models/users');
const links = require(appBasePath + 'models/userscars');
const reports = require(appBasePath + 'models/reports');

exports.generateReports = 
	async () => {
		try {  
			
			var toDay = DateTime.now().toFormat('yyyy-LL-dd 00:00:00.000');
			//console.log ("reporting... " + DateTime.now().toFormat('yyyy-LL-dd hh:mm:ss'));
			var findReports = await reports.reportsListNew(sqlite.sqlDB, toDay);
//			var findReports = await reports.reportsListNew(sqlite.sqlDB, '2025-02-24 00:00:00.000');
			if (findReports.error == 0) {
				if (findReports.result.length > 0) {
					var resultStep1 = await reports.updateReportsStep1(sqlite.sqlDB, toDay);
					//var resultStep1 = await reports.updateReportsStep1(sqlite.sqlDB, '2025-02-24 00:00:00.000');
					if (resultStep1.error != 0) {
						logger.logEvent("error", "ERROR: " + resultStep1.message);
					}
				}
			}
			else
				logger.logEvent("error", "ERROR: " + findReports.message);

			var buildReports = await reports.reportsList2BeProcessed(sqlite.sqlDB);

			for (carNum=0; carNum<buildReports.result.length; carNum++) {
				var userLang = buildReports.result[carNum].lang;
				var periodStr = (buildReports.result[carNum].report_freq == 0 ? lang[userLang]['str00000145'] : (buildReports.result[carNum].report_freq == 1 ? lang[userLang]['str00000146'] : (buildReports.result[carNum].report_freq == 2 ? lang[userLang]['str00000147'] : lang[userLang]['str00000148'])))
				var reportName = "reports/" + buildReports.result[carNum].targa + "_" + periodStr.substring(0,1) + "_" + buildReports.result[carNum].userid + ".xlsx";
				var reportTempName = "temp/" + buildReports.result[carNum].targa + "_" + periodStr.substring(0,1) + "_" + buildReports.result[carNum].userid + ".xlsx";
				
				var driversResult= await reports.reportsListDrivers(sqlite.sqlDB, buildReports.result[carNum].auto);
				var driverList = [];
				var copertina= [ 
						[lang[userLang]['str00000174'],(buildReports.result[carNum].report_freq == 0 ? lang[userLang]['str00000145'] : (buildReports.result[carNum].report_freq == 1 ? lang[userLang]['str00000146'] : (buildReports.result[carNum].report_freq == 2 ? lang[userLang]['str00000147'] : lang[userLang]['str00000148'])))], 
						[lang[userLang]['str00000175'],buildReports.result[carNum].nome + ' ' + buildReports.result[carNum].cognome],
						['@',buildReports.result[carNum].email],
						['',''],
						[lang[userLang]['str00000105'],buildReports.result[carNum].marca], 
						[lang[userLang]['str00000106'],buildReports.result[carNum].modello], 
						[lang[userLang]['str00000107'],buildReports.result[carNum].targa],
						[lang[userLang]['str00000073'],lang[userLang][buildReports.result[carNum].carburante]]
					];

				if (driversResult.error == 0) {
					copertina.push(['','']);
					copertina.push([lang[userLang]['str00000013'],'']);
					for (drv=0;drv<driversResult.result.length;drv++)
						copertina.push([driversResult.result[drv].autista,driversResult.result[drv].email]);
				}
				
				const cover = XLSX.utils.aoa_to_sheet(copertina);
				var period = '2025-02-24 00:00:00.000';
				var car = buildReports.result[carNum].auto;
				var user = buildReports.result[carNum].userid;

				var expenseData = await reports.expenses(sqlite.sqlDB, buildReports.result[carNum].report_freq, period, car);
				var expenseRows;
				var spese;
				var consumi;
				
				if (expenseData.error == 0) {
					if (expenseData.result.length > 0) {
						expenseRows = expenseData.result.map( row  => ( 
								{
								data : (row.ord == 0 ? lang[userLang]['str00000172'] : row.data_spesa),
								autista: row.autista,
								qta : row.qta * 1.0,
								unit : row.prezzo_unitario * 1.0,
								tot : row.prezzo_totale * 1.0,
								tipo : lang[userLang][row.tipo_spesa],
								fuel : lang[userLang][row.carburante]
								}
								));
						spese = XLSX.utils.json_to_sheet(expenseRows);
					}
					else {
						expenseRows= [[lang[userLang]['str00000167']]];
						spese = XLSX.utils.aoa_to_sheet(expenseRows);
					}
				}

				var cosumptionData = await reports.consumptions(sqlite.sqlDB, buildReports.result[carNum].report_freq, period, car);
				var cosumptionRows;
				var consumi;
				if (cosumptionData.error == 0) {
					if (cosumptionData.result.length > 0) {
						cosumptionRows = cosumptionData.result.map( row  => ( 
								{
								data : (row.ord == 0 ? lang[userLang]['str00000172'] : row.datastr),
								autista: row.nome + ' ' + row.cognome,
								kmb : row.km_begin * 1,
								kme : row.km_end * 1,
								days : row.delta_days * 1,
								kml : row.km_litro * 1.0,
								lhun : row.l_100km * 1.0
								}
								));
						consumi = XLSX.utils.json_to_sheet(cosumptionRows);
					}
					else {
						cosumptionRows= [[lang[userLang]['str00000167']]];
						consumi = XLSX.utils.aoa_to_sheet(cosumptionRows);
					}
				}

				const workbook = XLSX.utils.book_new();
				XLSX.utils.book_append_sheet(workbook, cover, lang[userLang]['str00000168']);
				XLSX.utils.book_append_sheet(workbook, spese, lang[userLang]['str00000009']);
				XLSX.utils.book_append_sheet(workbook, consumi, lang[userLang]['str00000008']);
				cover["!cols"] = [ { wch: 25 },{ wch: 25 } ];
				XLSX.utils.sheet_add_aoa(spese, [[lang[userLang]['str00000056'], lang[userLang]['str00000166'], lang[userLang]['str00000085'], lang[userLang]['str00000084'], lang[userLang]['str00000083'], lang[userLang]['str00000081'],lang[userLang]['str00000073']]], { origin: "A1" });
				spese["!cols"] = [ { wch: 20 },{ wch: 25 },{ wch: 18 },{ wch: 18 },{ wch: 18 },{ wch: 25 },{ wch: 25 } ]; 
				XLSX.utils.sheet_add_aoa(consumi, [[lang[userLang]['str00000056'], lang[userLang]['str00000166'], lang[userLang]['str00000169'], lang[userLang]['str00000170'], lang[userLang]['str00000171'], "KM/L", "L/100KM"]], { origin: "A1" });
				consumi["!cols"] = [ { wch: 20 },{ wch: 25 },{ wch: 18 },{ wch: 18 },{ wch: 18 },{ wch: 18 },{ wch: 18 } ];
				XLSX.writeFile(workbook, reportTempName, { compression: false });
				fs.renameSync(reportTempName, reportName); 
				var updateStep2 = await reports.updateReportsStep2(sqlite.sqlDB, buildReports.result[carNum].auto, buildReports.result[carNum].utente);
				if (updateStep2.error == 0) {
					var userLang = buildReports.result[carNum].lang;
					var periodStr = (buildReports.result[carNum].report_freq == 0 ? lang[userLang]['str00000145'] : (buildReports.result[carNum].report_freq == 1 ? lang[userLang]['str00000146'] : (buildReports.result[carNum].report_freq == 2 ? lang[userLang]['str00000147'] : lang[userLang]['str00000148'])))
					var reportPath = "reports/" + buildReports.result[carNum].targa + "_" + periodStr.substring(0,1) + "_" + buildReports.result[carNum].userid + ".xlsx";
					
					var copertina= {
						destinatario : buildReports.result[carNum].nome + ' ' + buildReports.result[carNum].cognome,
						email: buildReports.result[carNum].email,
						marca : buildReports.result[carNum].marca, 
						modello : buildReports.result[carNum].modello, 
						targa : buildReports.result[carNum].targa,
						attachPath: reportPath,
						periodostr : periodStr.toLowerCase()
					}
					
					var serverParams = {protocol : wwwProtocol, host: wwwAddress, port : wwwPort};
					let mailresult = await email.sendReport(serverParams, copertina, lang[userLang]);
					if (mailresult.status == false) {
						logger.logEvent("error", "Error sending email to " + copertina.email + ": " + mailresult.message);
					}
					else {
						logger.logEvent("info", "email sent to: " + copertina.email);
						var updateStep3 = await reports.updateReportsStep3(sqlite.sqlDB, buildReports.result[carNum].auto, buildReports.result[carNum].utente);
						if (updateStep3.error == 0) {
							let	usrDetail = await users.oneUserByUID(sqlite.sqlDB, buildReports.result[carNum].utente);
							if (usrDetail.status == false) {
								logger.logEvent("error", "Error rescheduling report: " + usrDetail.message);
							}
							else {
								var nextReport = DateTime.now();
								switch (usrDetail.data.report_freq) {
									case 0:
										while (nextReport.weekday != 1) {
											nextReport = nextReport.plus({days:1})
										}
										break;
									case 1:
										while (nextReport.day != 1) {
											nextReport = nextReport.plus({days:1})
										}
										break;
									case 2:
										while (nextReport.day != 1 || (nextReport.month != 1 && nextReport.month != 4 && nextReport.month != 7 && nextReport.month != 10)) {
											nextReport = nextReport.plus({days:1})
										}
										break;
									case 3:
									default:
										while (nextReport.day != 1 || nextReport.month != 1) {
											nextReport = nextReport.plus({days:1})
										}
										break;
								}
								var payload = {
									auto: buildReports.result[carNum].auto,
									user: buildReports.result[carNum].utente,
									data: nextReport.toFormat('yyyy-LL-dd 00:00:00.000')
								}
								let	result = await links.rescheduleReport(sqlite.sqlDB, payload);
								if (result.status == false) {
									logger.logEvent("error", "Error rescheduling report: " + result.message);
								}
								else {
									logger.logEvent("info", "Report next execution: " + nextReport.toFormat('yyyy-LL-dd 00:00:00.000'));
								}
							}
							logger.logEvent("info", "Reporting done for: " + reportPath);
						}
						else
							logger.logEvent("error", "Error building " + reportPath + " report file: " + updateStep2.message);
					}
				}
				else
					logger.logEvent("error", "Error building " + reportName + " report file: " + updateStep2.message);
			}
			return true;
		}
		catch(ex) {
			logger.logEvent("error", "Error building " + reportName + " report file: " + ex.message);
			return false;
		}
}

exports.sendReports = 
	async () => {
		try {  
			var buildReports = await reports.reportsList2BeSend(sqlite.sqlDB);

			for (carNum=0; carNum<buildReports.result.length; carNum++) {
				var userLang = buildReports.result[carNum].lang;
				var periodStr = (buildReports.result[carNum].report_freq == 0 ? lang[userLang]['str00000145'] : (buildReports.result[carNum].report_freq == 1 ? lang[userLang]['str00000146'] : (buildReports.result[carNum].report_freq == 2 ? lang[userLang]['str00000147'] : lang[userLang]['str00000148'])))
				var reportPath = "reports/" + buildReports.result[carNum].targa + "_" + periodStr.substring(0,1) + "_" + buildReports.result[carNum].userid + ".xlsx";
				
				var copertina= {
					destinatario : buildReports.result[carNum].nome + ' ' + buildReports.result[carNum].cognome,
					email: buildReports.result[carNum].email,
					marca : buildReports.result[carNum].marca, 
					modello : buildReports.result[carNum].modello, 
					targa : buildReports.result[carNum].targa,
					attachPath: reportPath,
					periodostr : periodStr.toLowerCase()
				}
				
				var serverParams = {protocol : wwwProtocol, host: wwwAddress, port : wwwPort};
				let mailresult = await email.sendReport(serverParams, copertina, lang[userLang]);
				if (mailresult.status == false) {
					logger.logEvent("error", "Error sending email to " + copertina.email + ": " + mailresult.message);
				}
				else {
					logger.logEvent("info", "email sent to: " + copertina.email);
					var updateStep3 = await reports.updateReportsStep3(sqlite.sqlDB, buildReports.result[carNum].auto, buildReports.result[carNum].utente);
					if (updateStep3.error == 0) {
						logger.logEvent("info", "Reporting done for: " + reportPath);
					}
					else
						logger.logEvent("error", "Error building " + reportPath + " report file: " + updateStep2.message);
				}
			}
			return true;
		}
		catch(ex) {
			logger.logEvent("error", "Error sending " + reportPath + " report file: " + ex.message);
			return false;
		}
}

exports.rescheduleReports = 
	async () => {
		try {  
			var buildReports = await reports.reportsList2BeScheduled(sqlite.sqlDB);

			for (carNum=0; carNum<buildReports.result.length; carNum++) {

				let	usrDetail = await users.oneUserByUID(sqlite.sqlDB, buildReports.result[carNum].utente);
				if (usrDetail.status == false) {
					logger.logEvent("error", "Error rescheduling report: " + usrDetail.message);
				}
				else {
					var nextReport = DateTime.now();
					switch (usrDetail.data.report_freq) {
						case 0:
							while (nextReport.weekday != 1) {
								nextReport = nextReport.plus({days:1})
							}
							break;
						case 1:
							while (nextReport.day != 1) {
								nextReport = nextReport.plus({days:1})
							}
							break;
						case 2:
							while (nextReport.day != 1 || (nextReport.month != 1 && nextReport.month != 4 && nextReport.month != 7 && nextReport.month != 10)) {
								nextReport = nextReport.plus({days:1})
							}
							break;
						case 3:
						default:
							while (nextReport.day != 1 || nextReport.month != 1) {
								nextReport = nextReport.plus({days:1})
							}
							break;
					}
					var payload = {
						auto: buildReports.result[carNum].auto,
						user: buildReports.result[carNum].utente,
						data: nextReport.toFormat('yyyy-LL-dd 00:00:00.000')
					}
					let	result = await links.rescheduleReport(sqlite.sqlDB, payload);
					if (result.status == false) {
						logger.logEvent("error", "Error rescheduling report: " + result.message);
					}
					else {
						logger.logEvent("info", "Report next execution: " + nextReport.toFormat('yyyy-LL-dd 00:00:00.000'));
					}
				}
			}
			return true;
		}
		catch(ex) {
			logger.logEvent("error", "Error rescheduling report: " + ex.message);
			return false;
		}
}
