const fs = require('fs');

const cars = require(appBasePath + 'models/cars');
const fuels = require(appBasePath + 'models/fuels');
const caruser = require(appBasePath + 'models/userscars');
const costs = require(appBasePath + 'models/costs');
const logger = require(appBasePath + 'controllers/logger');
const sqlite = require(appBasePath + 'controllers/db');

function loadReportPart(partFile) {
	return fs.readFileSync(partFile,{ encoding: 'utf8', flag: 'r' });
}

exports.carsView =
	async (req, res, next) => {
		try {  
			var userLang = langId;
			if (!(req.session.userdata === undefined)) {
				var sessionData = JSON.parse(req.session.userdata);
				userLang = sessionData.data.lang;
			}
			await res.render("auto", { ACTIVE: 3, PAGE: "Auto", MODE: 1, MESSAGE : '', DATA: JSON.parse(req.session.userdata), LANG : lang[userLang]   });
			logger.logEvent("info","Rendering Stores Page");
		}
		catch(ex) {
			var queryError = {"err_code": 500, err_text: ex};
			var	reply = ({ result: queryError, selections : {}});
			res.status(500).json((reply));
			logger.logEvent("error", "GET /api/auto: " + ex.message);
		}
}

exports.cars= 
	async (req, res, next) => {
		try {  
			let result = await cars.allCars(sqlite.sqlDB);
			if (result.error != 0) {
				resultSet = [];
				queryError = {"err_code": result.error, err_text: result.message};
			}
			else {
				resultSet = result.result;
				queryError = {"err_code": 0, err_text: "Success"};
			}
			reply = ({ result: queryError, selections : resultSet});
			res.status(200).json((reply));
			logger.logEvent("info","Received request for GET /api/auto");
		}
		catch(ex) {
			var queryError = {"err_code": 500, err_text: ex.message};
			var	reply = ({ result: queryError, selections : {}});
			res.status(500).json((reply));
			logger.logEvent("error", "GET /api/auto: " + ex.message);
		}
}
		
exports.thiscar= 
	async (req, res, next) => {
		try {  
			let result = await cars.oneCar(sqlite.sqlDB, req.query.car, JSON.parse(req.session.userdata));
			if (result.error != 0) {
				resultSet = [];
				queryError = {"err_code": result.error, err_text: result.message};
			}
			else {
				resultSet = result.result;
				queryError = {"err_code": 0, err_text: "Success"};
			}
			reply = ({ result: queryError, selections : resultSet, carId: result.carId, userId: result.user});
			res.status(200).json((reply));
			logger.logEvent("info","Received request for GET /api/auto");
		}
		catch(ex) {
			var queryError = {"err_code": 500, err_text: ex.message};
			var	reply = ({ result: queryError, selections : {}});
			res.status(500).json((reply));
			logger.logEvent("error", "GET /api/auto: " + ex.message);
		}
}
		
exports.cars_list = 
	async (req, res, next) => {
		try {  
			let result = await cars.listCars(sqlite.sqlDB, JSON.parse(req.session.userdata));
			if (result.error != 0) {
				resultSet = [];
				queryError = {"err_code": result.error, err_text: result.message};
			}
			else {
				resultSet = result.result;
				queryError = {"err_code": 0, err_text: "Success"};
			}
			reply = ({ result: queryError, selections : resultSet});
			res.status(200).json((reply));
			logger.logEvent("info","Received request for GET /api/auto/list");
		}
		catch(ex) {
			var queryError = {"err_code": 500, err_text: ex.message};
			var	reply = ({ result: queryError, selections : {}});
			res.status(500).json((reply));
			logger.logEvent("error", "GET /api/auto/list: " + ex.message);
		}
}

exports.cars_edit = 
	async (req, res, next) => {
		try {  
			var sessionData = JSON.parse(req.session.userdata);
			var deleteOK = true;
			var resultSet;
			var queryError;
			
			if (req.body.cmd == 'DEL') {
				let expResult = await costs.deleteExpensesByCar(sqlite.sqlDB, req.body.uuid);
				if (expResult.error != 0) {
					deleteOK = false;
					resultSet = [];
					queryError = {"err_code": expResult.error, err_text: expResult.message};
				}
				else {
					let usrResult = await caruser.removeAuto(sqlite.sqlDB, req.body.uuid);
					if (usrResult.error != 0) {
						deleteOK = false;
						resultSet = [];
						queryError = {"err_code": usrResult.error, err_text: usrResult.message};
					}
				}
			}
			if (deleteOK) {
				let result = await cars.editCar(sqlite.sqlDB, req.body, sessionData.data.uid, sessionData.data.lang);
				if (result.error != 0) {
					resultSet = [];
					queryError = {"err_code": result.error, err_text: result.message};
				}
				else {
					resultSet = result.result;
					if (req.body.cmd == 'ADD') {
						payload = {auto: result.newcarId, user: sessionData.data.uid, data: '2025-01-01 00:00:00', state : 3}
						let linkresult = await caruser.addUser2Auto(sqlite.sqlDB, payload);
						if (linkresult.error != 0) {
							resultSet = [];
							queryError = {"err_code": linkresult.error, err_text: linkresult.message};
						}
						else
							queryError = {"err_code": 0, err_text: "Success"};
					}
					else
						queryError = {"err_code": 0, err_text: "Success"};
				}
			}
			reply = ({ result: queryError, selections : resultSet});
			res.status(200).json((reply));
			logger.logEvent("info","Received request for POST /api/auto");
		}
		catch(ex) {
			var queryError = {"err_code": 500, err_text: ex.message};
			var	reply = ({ result: queryError, selections : {}});
			res.status(500).json((reply));
			logger.logEvent("error", "POST /api/auto: " + ex.message);
		}
}

exports.fuels_list = 
	async (req, res, next) => {
		try {  
			let result = await fuels.listFuels(sqlite.sqlDB);
			if (result.status === false) {
				resultSet = [];
				queryError = {"err_code": 1, err_text: result.message};
			}
			else {
				resultSet = result.data;
				queryError = {"err_code": 0, err_text: "Success"};
			}
			reply = ({ result: queryError, selections : resultSet});
			res.status(200).json((reply));
			logger.logEvent("info","Received request for GET /api/auto/fuels");
		}
		catch(ex) {
			var queryError = {"err_code": 500, err_text: ex.message};
			var	reply = ({ result: queryError, selections : {}});
			res.status(500).json((reply));
			logger.logEvent("error", "GET /api/auto/fuels: " + ex.message);
		}
}

exports.cars_user_list = 
	async (req, res, next) => {
		try {  
			let result = await cars.carsByUser(sqlite.sqlDB, JSON.parse(req.session.userdata));
			if (result.error != 0) {
				resultSet = [];
				queryError = {"err_code": result.error, err_text: result.message};
			}
			else {
				resultSet = result.result;
				queryError = {"err_code": 0, err_text: "Success"};
			}
			reply = ({ result: queryError, selections : resultSet});
			res.status(200).json((reply));
			logger.logEvent("info","Received request for GET /api/auto/listbyuser");
		}
		catch(ex) {
			var queryError = {"err_code": 500, err_text: ex.message};
			var	reply = ({ result: queryError, selections : {}});
			res.status(500).json((reply));
			logger.logEvent("error", "GET /api/auto/listbyuser: " + ex.message);
		}
}

exports.users_cars_list = 
	async (req, res, next) => {
		try {  
			let result = await caruser.carLinks(sqlite.sqlDB, req.query.car, req.query.owner, JSON.parse(req.session.userdata));
			if (result.error != 0) {
				resultSet = [];
				carId="";
				userId="";
				isOwner = 0;
				queryError = {"err_code": result.error, err_text: result.message};
			}
			else {
				resultSet = result.result;
				carId = result.carId
				userId = result.userId;
				isOwner = result.owner;
				queryError = {"err_code": 0, err_text: "Success"};
			}
			reply = ({ result: queryError, selections : resultSet, carId : carId, userId : userId, isOwner : isOwner});
			res.status(200).json((reply));
			logger.logEvent("info","Received request for GET /api/auto/listbyuser");
		}
		catch(ex) {
			var queryError = {"err_code": 500, err_text: ex.message};
			var	reply = ({ result: queryError, selections : {}});
			res.status(500).json((reply));
			logger.logEvent("error", "GET /api/auto/listbyuser: " + ex.message);
		}
}
