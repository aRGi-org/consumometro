const costs = require(appBasePath + 'models/costs');
const cars = require(appBasePath + 'models/cars');
const logger = require(appBasePath + 'controllers/logger');
const sqlite = require(appBasePath + 'controllers/db');

exports.refillView =
	async (req, res, next) => {
		try {  
			var userLang = langId;
			if (!(req.session.userdata === undefined)) {
				var sessionData = JSON.parse(req.session.userdata);
				userLang = sessionData.data.lang;
			}
			await res.render("refill", { ACTIVE: 4, PAGE: "Spese/Rifornimenti", MODE: 1, MESSAGE : '', DATA: JSON.parse(req.session.userdata), LANG : lang[userLang] });
			logger.logEvent("info","Rendering Refills Page");
		}
		catch(ex) {
			var queryError = {"err_code": 500, err_text: ex.message};
			var	reply = ({ result: queryError, selections : {}});
			res.status(500).json((reply));
			logger.logEvent("error", "GET /app/pieno: " + ex.message);
		}
}

exports.costsView =
	async (req, res, next) => {
		try {  
			var userLang = langId;
			if (!(req.session.userdata === undefined)) {
				var sessionData = JSON.parse(req.session.userdata);
				userLang = sessionData.data.lang;
			}
			await res.render("costs", { ACTIVE: 5, PAGE: "Costi", MODE: 1, MESSAGE : '', DATA: JSON.parse(req.session.userdata), LANG : lang[userLang] });
			logger.logEvent("info","Rendering Expenses Page");
		}
		catch(ex) {
			var queryError = {"err_code": 500, err_text: ex.message};
			var	reply = ({ result: queryError, selections : {}});
			res.status(500).json((reply));
			logger.logEvent("error", "GET /app/spese: " + ex.message);
		}
}

exports.consView =
	async (req, res, next) => {
		try {  
			var userLang = langId;
			if (!(req.session.userdata === undefined)) {
				var sessionData = JSON.parse(req.session.userdata);
				userLang = sessionData.data.lang;
			}
			await res.render("consum", { ACTIVE: 5, PAGE: "Consumi", MODE: 1, MESSAGE : '', DATA: JSON.parse(req.session.userdata), LANG : lang[userLang] });
			logger.logEvent("info","Rendering Expenses Page");
		}
		catch(ex) {
			var queryError = {"err_code": 500, err_text: ex.message};
			var	reply = ({ result: queryError, selections : {}});
			res.status(500).json((reply));
			logger.logEvent("error", "GET /app/cons: " + ex.message);
		}
}

exports.refills = 
	async (req, res, next) => {
		try {  
			let result = await costs.allRefills(sqlite.sqlDB, JSON.parse(req.session.userdata));
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
			logger.logEvent("info","Received request for GET /api/rifornimenti");
		}
		catch(ex) {
			var queryError = {"err_code": 500, err_text: ex.message};
			var	reply = ({ result: queryError, selections : {}});
			res.status(500).json((reply));
			logger.logEvent("error", "GET /api/rifornimenti: " + ex.message);
		}
}

exports.expenses_edit = 
	async (req, res, next) => {
		try {  
			var userLang = langId;
			if (!(req.session.userdata === undefined)) {
				var sessionData = JSON.parse(req.session.userdata);
				userLang = sessionData.data.lang;
			}

			let result = await costs.editExpense(sqlite.sqlDB, req.body, JSON.parse(req.session.userdata));
			if (result.error != 0) {
				resultSet = [];
				car = req.body.auto;
				carburante = "";
				kms = result.kms;
				kme = result.kme;
				queryError = {"err_code": result.error, err_text: lang[userLang][result.message] + ' >= ' + kms + ', <= ' + kme};
			}
			else {
				if (parseInt(req.body.chilometri) > parseInt(req.body.kmEnd)) {
					let resultKM = await cars.updateCarKM(sqlite.sqlDB, req.body, JSON.parse(req.session.userdata));
					if (resultKM.error != 0) {
						resultSet = [];
						car = "";
						carburante = "";
						kms = "";
						kme = "";
						queryError = {"err_code": resultKM.error, err_text: resultKM.message};
					}
					else {
						resultSet = result.result;
						car = result.auto;
						carburante = result.fuel;
						kms = result.kms;
						kme = result.kme;
						queryError = {"err_code": 0, err_text: "Success"};
					}
				}
				else {
					resultSet = result.result;
					car = result.auto;
					carburante = result.fuel;
					kms = result.kms;
					kme = result.kme;
					queryError = {"err_code": 0, err_text: "Success"};
				}
			}
			reply = ({ result: queryError, selections : resultSet, auto: car, fuel : carburante, kmBeg : kms, kmEnd : kme});
			res.status(200).json((reply));
			logger.logEvent("info","Received request for POST /api/rifornimenti");
		}
		catch(ex) {
			var queryError = {"err_code": 500, err_text: ex.message};
			var	reply = ({ result: queryError, selections : {}});
			res.status(500).json((reply));
			logger.logEvent("error", "POST /api/rifornimenti: " + ex.message);
		}
}

		
exports.expense_types_list = 
	async (req, res, next) => {
		try {  
			let result = await costs.listExpenseTypes(sqlite.sqlDB, JSON.parse(req.session.userdata));
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
			logger.logEvent("info","Received request for GET /api/tipospese/list");
		}
		catch(ex) {
			var queryError = {"err_code": 500, err_text: ex.message};
			var	reply = ({ result: queryError, selections : {}});
			res.status(500).json((reply));
			logger.logEvent("error", "GET /api/tipospese/list: " + ex.message);
		}
}

exports.expenses_list_bycar = 
	async (req, res, next) => {
		try {  
			let result = await costs.listExpensesByCar(sqlite.sqlDB, req.query.car, req.query.fuel, req.query.kmb, req.query.kme, req.query.lic);
			if (result.error != 0) {
				resultSet = [];
				queryError = {"err_code": result.error, err_text: result.message};
			}
			else {
				resultSet = result.result;
				queryError = {"err_code": 0, err_text: "Success"};
			}
			reply = ({ result: queryError, selections : resultSet, car: req.query.car, fuel: req.query.fuel, kms: req.query.kmb, kme: req.query.kme, license: result.license });
			res.status(200).json((reply));
			logger.logEvent("info","Received request for GET /api/tipospese/list");
		}
		catch(ex) {
			var queryError = {"err_code": 500, err_text: ex.message};
			var	reply = ({ result: queryError, selections : {}});
			res.status(500).json((reply));
			logger.logEvent("error", "GET /api/tipospese/list: " + ex.message);
		}
}

exports.expenses_list_bycar_and_cat_head = 
	async (req, res, next) => {
		try {  
			let result = await costs.listExpensesByCarAndCatHead(sqlite.sqlDB, req.query.car);
			if (result.error != 0) {
				resultSet = [];
				queryError = {"err_code": result.error, err_text: result.message};
			}
			else {
				resultSet = result.result;
				queryError = {"err_code": 0, err_text: "Success"};
			}
			reply = ({ result: queryError, selections : resultSet, car: req.query.car, fuel: req.query.fuel, license: result.license });
			res.status(200).json((reply));
			logger.logEvent("info","Received request for GET /api/tipospese/list");
		}
		catch(ex) {
			var queryError = {"err_code": 500, err_text: ex.message};
			var	reply = ({ result: queryError, selections : {}});
			res.status(500).json((reply));
			logger.logEvent("error", "GET /api/tipospese/list: " + ex.message);
		}
}

exports.expenses_list_bycar_and_cat = 
	async (req, res, next) => {
		try {  
			let result = await costs.listExpensesByCarAndCat(sqlite.sqlDB, req.query.car, req.query.exp, req.query.carb);
			if (result.error != 0) {
				resultSet = [];
				queryError = {"err_code": result.error, err_text: result.message};
			}
			else {
				resultSet = result.result;
				queryError = {"err_code": 0, err_text: "Success"};
			}
			reply = ({ result: queryError, selections : resultSet, car: req.query.car, exp: req.query.exp, carb: req.query.carb });
			res.status(200).json((reply));
			logger.logEvent("info","Received request for GET /api/tipospese/list");
		}
		catch(ex) {
			var queryError = {"err_code": 500, err_text: ex.message};
			var	reply = ({ result: queryError, selections : {}});
			res.status(500).json((reply));
			logger.logEvent("error", "GET /api/tipospese/list: " + ex.message);
		}
}

exports.consumptions_list_bycar = 
	async (req, res, next) => {
		try {  
			let result = await costs.listConsumptionsByCar(sqlite.sqlDB, req.query.car, req.query.fuelunit);
			if (result.error != 0) {
				resultSet = [];
				queryError = {"err_code": result.error, err_text: result.message};
			}
			else {
				resultSet = result.result;
				queryError = {"err_code": 0, err_text: "Success"};
			}
			reply = ({ result: queryError, selections : resultSet, car: result.car, fuelunit: result.fuelunit });
			res.status(200).json((reply));
			logger.logEvent("info","Received request for GET /api/tipospese/list");
		}
		catch(ex) {
			var queryError = {"err_code": 500, err_text: ex.message};
			var	reply = ({ result: queryError, selections : {}});
			res.status(500).json((reply));
			logger.logEvent("error", "GET /api/tipospese/list: " + ex.message);
		}
}
