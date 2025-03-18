const roles = require(appBasePath + 'models/roles');
const logger = require(appBasePath + 'controllers/logger');
const sqlite = require(appBasePath + 'controllers/db');

exports.roles_list = 
	async (req, res, next) => {
		try {  
			let result = await roles.listRoles(sqlite.sqlDB);
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
			logger.logEvent("info","Received request for GET /api/ruoli/list");
		}
		catch(ex) {
			var queryError = {"err_code": 500, err_text: "Error"};
			var	reply = ({ result: queryError, selections : {}});
			res.status(500).json((reply));
			logger.logEvent("error", "GET /api/ruoli/list: " + ex.message);
		}
}
