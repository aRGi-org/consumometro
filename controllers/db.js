const sqlite3 = require("sqlite3").verbose();
const { open } = require('sqlite');
var debug = require('debug')('consumometro:server');
const logger = require(appBasePath + 'controllers/logger');
const langs = require(appBasePath + 'models/langs');
const roles = require(appBasePath + 'models/roles');
const fuels = require(appBasePath + 'models/fuels');
const cars = require(appBasePath + 'models/cars');
const users = require(appBasePath + 'models/users');
const userscars = require(appBasePath + 'models/userscars');
const cmd = require(appBasePath + 'models/commands');
const costs = require(appBasePath + 'models/costs');

var current_version = 1;
var sqlDB; 

const dbRunitimePath = appBasePath + "db/consumometro.db";
const dbBackupPath = appBasePath + "db/consumometro.db";

function createDbConnection(filename) {
	logger.logEvent("info","Connecting database: " + filename);
    return open({
        filename,
        driver: sqlite3.Database
    });
}

module.exports.connect = async () => {
    try {
        sqlite3.verbose();
		let conn = await createDbConnection(dbRunitimePath);
		logger.logEvent("info", "connect message: Database connected.");
		return conn;
    }
	catch (ex) {
		logger.logEvent("error", "connect message: " + ex.message);
    }
}

module.exports.migrate = async (db) => {
   try { 

		var current_version = 1;
		
		let version = await db.all("PRAGMA user_version;");
		let result = true;
		if (version[0].user_version == current_version)
			logger.logEvent("info", "Database is up to date, current version: " + current_version);
		else
			logger.logEvent("info", "Migrating database from version " + version[0].user_version + " to version " + current_version);
		switch (version[0].user_version) {
			case 0:
				result = await roles.rolesTable(db);
				if (result) 
					result = await fuels.fuelsTable(db);
				if (result) 
					result = await costs.expenseTypesTable(db);
				if (result) 
					result = await cars.carsTable(db);
				if (result) 
					result = await users.usersTable(db);
				if (result) 
					result = await userscars.linksTable(db);
				if (result) 
					result = await costs.expensesTable(db);
				if (result) 
					result = await cmd.commandsTable(db);
				if (result) 
					result = await langs.languagesTable(db);
				if (result) 
					await db.exec("PRAGMA user_version=" + current_version + ";");
			case 1:
				break;
		}
    }
	catch (ex) {
		logger.logEvent("error", "migrate message: " + ex.message);
    }
}


module.exports.sqlDB = sqlDB;
