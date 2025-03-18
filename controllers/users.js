const { DateTime, Duration } = require("luxon");

const users = require(appBasePath + 'models/users');
const commands = require(appBasePath + 'models/commands');
const cars = require(appBasePath + 'models/cars');
const links = require(appBasePath + 'models/userscars');
const logger = require(appBasePath + 'controllers/logger');
const sqlite = require(appBasePath + 'controllers/db');
const email = require(appBasePath + 'controllers/emails');

exports.usersView =
	async (req, res, next) => {
		try {  
			var userLang = langId;
			if (!(req.session.userdata === undefined)) {
				var sessionData = JSON.parse(req.session.userdata);
				userLang = sessionData.data.lang;
			}
			await res.render("utenti", { ACTIVE: 2, PAGE: "Utenti", MODE: 1, MESSAGE : '', DATA: JSON.parse(req.session.userdata), LANG : lang[userLang]  });
			logger.logEvent("info","Rendering Utenti Page");
		}
		catch(ex) {
			var queryError = {"err_code": 500, err_text: ex.message};
			var	reply = ({ result: queryError, selections : {}});
			res.status(500).json((reply));
			logger.logEvent("error", "GET /app/utenti: " + ex.message);
		}
}

exports.users = 
	async (req, res, next) => {
		try {  
			let result = await users.allUsers(sqlite.sqlDB, JSON.parse(req.session.userdata));
			if (result == false) {
				resultSet = [];
				queryError = {"err_code": 0, err_text: "No data"};
			}
			else {
				resultSet = result;
				queryError = {"err_code": 0, err_text: "Success"};
			}
			reply = ({ result: queryError, selections : resultSet});
			res.status(200).json((reply));
			logger.logEvent("info","Received request for GET /api/utenti");
		}
		catch(ex) {
			var queryError = {"err_code": 500, err_text: ex.message};
			var	reply = ({ result: queryError, selections : {}});
			res.status(500).json((reply));
			logger.logEvent("error", "GET /api/utenti: " + ex.message);
		}
}
		
exports.users_list = 
	async (req, res, next) => {
		try {  
			let result = await users.listUsers(sqlite.sqlDB);
			if (result == false) {
				resultSet = [];
				queryError = {"err_code": 0, err_text: "No data"};
			}
			else {
				resultSet = result;
				queryError = {"err_code": 0, err_text: "Success"};
			}
			reply = ({ result: queryError, selections : resultSet});
			res.status(200).json((reply));
			logger.logEvent("info","Received request for GET /api/users/list");
		}
		catch(ex) {
			var queryError = {"err_code": 500, err_text: ex.message};
			var	reply = ({ result: queryError, selections : {}});
			res.status(500).json((reply));
			logger.logEvent("error", "GET /api/users/list: " + ex.message);
		}
}
		
/*
return {status: true, message: '', data: utenteResult};
*/		

exports.users_edit = 
	async (req, res, next) => {
		try {  
			let result = await users.editUser(sqlite.sqlDB, req.body);
			if (result.status == false) {
				resultSet = [];
				queryError = {"err_code": 10, err_text: result.message};
			}
			else {
				resultSet = result.data;
				queryError = {"err_code": 0, err_text: "Success"};
			}
			reply = ({ result: queryError, selections : resultSet});
			res.status(200).json((reply));
			logger.logEvent("info","Received request for POST /api/utenti");
		}
		catch(ex) {
			var queryError = {"err_code": 500, err_text: ex.message};
			var	reply = ({ result: queryError, selections : {}});
			res.status(500).json((reply));
			logger.logEvent("error", "POST /api/utenti: " + ex.message);
		}
}

exports.users_join = 
	async (req, res, next) => {
		try {  
			let result = await users.joinUser(sqlite.sqlDB, req.body);
			if (result.status == false) {
				resultSet = [];
				queryError = {"err_code": 10, err_text: result.message};
			}
			else {
				let joinResult = await commands.newJoinRequest(sqlite.sqlDB, {utente : result.requestId} );
				if (joinResult.status == false) {
					resultSet = [];
					queryError = {"err_code": 11, err_text: joinResult.message};
				}
				else {
					resultSet = result.data;
					queryError = {"err_code": 0, err_text: "Success"};
				}
			}
			reply = ({ result: queryError, selections : resultSet});
			res.status(200).json((reply));
			logger.logEvent("info","Received request for POST /join");
		}
		catch(ex) {
			var queryError = {"err_code": 500, err_text: ex.message};
			var	reply = ({ result: queryError, selections : {}});
			res.status(500).json((reply));
			logger.logEvent("error", "POST /join: " + ex.message);
		}
}

exports.users_one = 
	async (req, res, next) => {
		try {  
			let result;
			if (!(req.session.userdata === undefined))
				result = await users.oneUser(sqlite.sqlDB, JSON.parse(req.session.userdata));
			else
				result = await users.oneUser4Secret(sqlite.sqlDB, req.query.who, langId);
			if (result.status == false) {
				resultSet = [];
				queryError = {"err_code": 10, err_text: result.message};
			}
			else {
				resultSet = result.data;
				queryError = {"err_code": 0, err_text: "Success"};
			}
			reply = ({ result: queryError, selections : resultSet});
			res.status(200).json((reply));
			logger.logEvent("info","Received request for POST /join");
		}
		catch(ex) {
			var queryError = {"err_code": 500, err_text: ex.message};
			var	reply = ({ result: queryError, selections : {}});
			res.status(500).json((reply));
			logger.logEvent("error", "POST /join: " + ex.message);
		}
}

exports.users_inout = 
	async (req, res, next) => {
		try {  
			let result;
			if (req.body.direction == 0)
				result = await users.inUsers(sqlite.sqlDB, req.body);
			else
				result = await users.outUsers(sqlite.sqlDB, req.body);
			if (result.status == false) {
				resultSet = [];
				queryError = {"err_code": 10, err_text: result.message};
			}
			else {
				resultSet = result;
				queryError = {"err_code": 0, err_text: "Success"};
			}
			reply = ({ result: queryError, selections : resultSet});
			res.status(200).json((reply));
			logger.logEvent("info","Received request for POST /api/auto/utenti");
		}
		catch(ex) {
			var queryError = {"err_code": 500, err_text: ex.message};
			var	reply = ({ result: queryError, selections : {}});
			res.status(500).json((reply));
			logger.logEvent("error", "POST /api/utenti: " + ex.message);
		}
}

exports.users_auto_add = 
	async (req, res, next) => {
		try {  
			let	usrDetail = await users.oneUserByUID(sqlite.sqlDB, req.body.user);
			if (usrDetail.status == false) {
				resultSet = [];
				queryError = {"err_code": 11, err_text: usrDetail.message};
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
					auto: req.body.auto,
					user: req.body.user,
					data: nextReport.toFormat('yyyy-LL-dd 00:00:00'),
					state: 0
				}
				let	result = await links.addUser2Auto(sqlite.sqlDB, payload);
				if (result.status == false) {
					resultSet = [];
					queryError = {"err_code": 10, err_text: result.message};
				}
				else {
					resultSet = result;
					queryError = {"err_code": 0, err_text: "Success"};
				}
			}
			reply = ({ result: queryError, selections : resultSet});
			res.status(200).json((reply));
			logger.logEvent("info","Received request for POST /api/auto/utenti");
		}
		catch(ex) {
			var queryError = {"err_code": 500, err_text: ex.message};
			var	reply = ({ result: queryError, selections : {}});
			res.status(500).json((reply));
			logger.logEvent("error", "POST /api/utenti: " + ex.message);
		}
}

exports.users_auto_remove = 
	async (req, res, next) => {
		try {  
			let	result = await links.removeUserFromAuto(sqlite.sqlDB, req.body);
			if (result.status == false) {
				resultSet = [];
				queryError = {"err_code": 10, err_text: result.message};
			}
			else {
				resultSet = result;
				queryError = {"err_code": 0, err_text: "Success"};
			}
			reply = ({ result: queryError, selections : resultSet});
			res.status(200).json((reply));
			logger.logEvent("info","Received request for POST /api/auto/utenti");
		}
		catch(ex) {
			var queryError = {"err_code": 500, err_text: ex.message};
			var	reply = ({ result: queryError, selections : {}});
			res.status(500).json((reply));
			logger.logEvent("error", "POST /api/utenti: " + ex.message);
		}
}

exports.users_auto_drivers = 
	async (req, res, next) => {
		try {  
			var userLang = langId;
			var userFound, resultAdd, mailresult;
			if (!(req.session.userdata === undefined)) {
				var sessionData = JSON.parse(req.session.userdata);
				userLang = sessionData.data.lang;
			}
			switch (req.body.cmd) {
				case "ADD":
					userFound = await users.searchUser(sqlite.sqlDB, req.body, JSON.parse(req.session.userdata));
					if (userFound.error == 0) {
						payload = {auto : req.body.auto, user : userFound.data.uid, data: '2025-01-01 00:00:00', state : 3}
						resultAdd = await links.addUser2Auto(sqlite.sqlDB, payload);
						if (resultAdd.error != 0) {
							resultSet = [];
							queryError = {"err_code": resultAdd.error, err_text: resultAdd.message};
						}
						else {
							let	carDetail = await cars.oneCar(sqlite.sqlDB, req.body.auto, JSON.parse(req.session.userdata));
							if (carDetail.error != 0) {
								resultSet = [];
								queryError = {"err_code": carDetail.error, err_text: carDetail.message};
							}
							else {
								resultSet = resultAdd;
								var contactData = {
									fromuid: carDetail.result[0].owner,
									touid: userFound.data.uid,
									from: userFound.data.from,
									fromName : userFound.data.fromName,
									fromLast : userFound.data.fromLast,
									to : userFound.data.to,
									toName : userFound.data.toName,
									toLast : userFound.data.toLast,
									marca: carDetail.result[0].marca,
									modello: carDetail.result[0].modello,
									targa: carDetail.result[0].targa,
								}

								let	enqueue = await commands.newAddDriverRequest(sqlite.sqlDB, contactData);
								if (enqueue.status == false) {
									resultSet = [];
									queryError = {"err_code": 12, err_text: mailresult.message};
								}
								else
									queryError = {"err_code": 0, err_text: "Success"};

								/*
								var serverParams = {protocol : wwwProtocol, host: wwwAddress, port : wwwPort};
								mailresult = await email.sendAddDriverConfirmation(serverParams, contactData, lang[userLang]);
								if (mailresult.status == false) {
									resultSet = [];
									queryError = {"err_code": 12, err_text: mailresult.message};
								}
								queryError = {"err_code": 0, err_text: "Success"};
								*/
							}
						}
					}
					else {
						resultSet = [];
						queryError = {"err_code": 10, err_text: userFound.message};
					}
					reply = ({ result: queryError, selections : resultSet});
					break;
				case "DEL":
					userFound = await users.searchUser(sqlite.sqlDB, req.body, JSON.parse(req.session.userdata));
					if (userFound.error == 0) {
						payload = {auto : req.body.auto, user : userFound.data.uid}
						resultAdd = await links.removeUserFromAuto(sqlite.sqlDB, payload);
						if (resultAdd.error != 0) {
							resultSet = [];
							queryError = {"err_code": resultAdd.error, err_text: resultAdd.message};
						}
						else {
							let	carDetail = await cars.oneCar(sqlite.sqlDB, req.body.auto, JSON.parse(req.session.userdata));
							if (carDetail.error != 0) {
								resultSet = [];
								queryError = {"err_code": carDetail.error, err_text: carDetail.message};
							}
							else {
								resultSet = resultAdd;
								var contactData = {
									fromuid: carDetail.result[0].owner,
									touid: userFound.data.uid,
									from: userFound.data.from,
									fromName : userFound.data.fromName,
									fromLast : userFound.data.fromLast,
									to : userFound.data.to,
									toName : userFound.data.toName,
									toLast : userFound.data.toLast,
									marca: carDetail.result[0].marca,
									modello: carDetail.result[0].modello,
									targa: carDetail.result[0].targa,
								}
								let	enqueue = await commands.newDelDriverRequest(sqlite.sqlDB, contactData);
								if (enqueue.status == false) {
									resultSet = [];
									queryError = {"err_code": 12, err_text: mailresult.message};
								}
								else
									queryError = {"err_code": 0, err_text: "Success"};
/*
								var serverParams = {protocol : wwwProtocol, host: wwwAddress, port : wwwPort};
								mailresult = await email.sendDelDriverConfirmation(serverParams, contactData, lang[userLang]);
								if (mailresult.status == false) {
									resultSet = [];
									queryError = {"err_code": 12, err_text: mailresult.message};
								}
								queryError = {"err_code": 0, err_text: "Success"};
								*/
							}
						}
					}
					else {
						resultSet = [];
						queryError = {"err_code": 10, err_text: userFound.message};
					}
					reply = ({ result: queryError, selections : resultSet});
					break;
				case "MSG":
					userFound = await users.searchUser(sqlite.sqlDB, req.body, JSON.parse(req.session.userdata));
					if (userFound.error == 0) {
						let	carDetail = await cars.oneCar(sqlite.sqlDB, req.body.auto, JSON.parse(req.session.userdata));
						if (carDetail.error != 0) {
							resultSet = [];
							queryError = {"err_code": carDetail.error, err_text: carDetail.message};
						}
						else {
							resultSet = userFound;
							var contactData = {
								fromuid: carDetail.result[0].owner,
								touid: userFound.data.uid,
								car: carDetail.result[0].uuid,
								from: userFound.data.from,
								fromName : userFound.data.fromName,
								fromLast : userFound.data.fromLast,
								to : userFound.data.to,
								toName : userFound.data.toName,
								toLast : userFound.data.toLast,
								marca: carDetail.result[0].marca,
								modello: carDetail.result[0].modello,
								targa: carDetail.result[0].targa,
								message : req.body.msg
							}
							let	enqueue = await commands.newMessageRequest(sqlite.sqlDB, contactData);
							if (enqueue.status == false) {
								resultSet = [];
								queryError = {"err_code": 12, err_text: mailresult.message};
							}
							else
								queryError = {"err_code": 0, err_text: "Success"};
						}
					}
					else {
						resultSet = [];
						queryError = {"err_code": 10, err_text: userFound.message};
					}
					reply = ({ result: queryError, selections : resultSet});
					break;
			}
			res.status(200).json((reply));
			logger.logEvent("info","Received request for POST /api/auto/utenti");
		}
		catch(ex) {
			var queryError = {"err_code": 500, err_text: ex.message};
			var	reply = ({ result: queryError, selections : {}});
			res.status(500).json((reply));
			logger.logEvent("error", "POST /api/utenti: " + ex.message);
		}
}
