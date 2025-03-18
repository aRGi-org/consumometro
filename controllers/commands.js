const { DateTime, Duration } = require("luxon");
const path = require('path');
const multer = require('multer');
var crypto = require('crypto');

const logger = require(appBasePath + 'controllers/logger');
const sqlite = require(appBasePath + 'controllers/db');
const email = require(appBasePath + 'controllers/emails');
const users = require(appBasePath + 'models/users');
const commands = require(appBasePath + 'models/commands');
const reports = require(appBasePath + 'models/reports');

exports.newJoins = 
	async () => {
		try {  
			let result = await commands.newJoinsList(sqlite.sqlDB);
			if (result.status == false) {
				resultSet = [];
				queryError = {"err_code": 11, err_text: result.message};
			}
			else {
				var resultSet = result.data;
				let mailresult;
				let resulting;
				let resulted;
				var serverParams;
				for (rs=0; rs<resultSet.length;rs++) {
					resulting = await commands.requestJoinSending(sqlite.sqlDB, resultSet[rs].uuid);
					serverParams = {protocol : wwwProtocol, host: wwwAddress, port : wwwPort};
					mailresult = await email.sendRequestConfirmation(serverParams, resultSet[rs], lang[resultSet[rs].lang]);
					if (mailresult.status == false) {
						queryError = {"err_code": 12, err_text: mailresult.message};
					}
					else {
						resulted = await commands.requestJoinSent(sqlite.sqlDB, mailresult.contact);
					}
				}
				queryError = {"err_code": 0, err_text: "Success"};
			}
			if (resultSet.length > 0)
				logger.logEvent("info","New Join Request command");
		}
		catch(ex) {
			logger.logEvent("error", "New Join Request command: " + ex.message);
		}
}

exports.expiredJoins = 
	async () => {
		try {  
			let result = await commands.closeJoin(sqlite.sqlDB);
			if (result.status == true) {
				if (result.data.changes > 0) 
					logger.logEvent("info","Closed/Expired Joins command");
			}
			else
				logger.logEvent("error", "Expired/Closed Joins message: " + result.message);
		}
		catch(ex) {
			logger.logEvent("error", "Expired/Closed Joins message: " + ex.message);
		}
}

exports.join_confirm = 
	async (req, res, next) => {
		try {  
			var message;
			var error = 0;
			var userLang = langId;
			let resultJoin = await commands.checkJoin(sqlite.sqlDB, req.query.who, lang[userLang])
			if (resultJoin.status == false) {
				message = resultJoin.message;
				error = 1;
			}
			else {
				userLang = resultJoin.data.lang;
				if (resultJoin.data.intime == 1 && resultJoin.data.instatus == 1) {
					message = "";
					let resultClose = await commands.requestJoinConfirmed(sqlite.sqlDB, req.query.who)
					if (resultClose.status == false) {
						message = resultClose.message;
						error = 1;
					}
					else {
						let resultEnable = await users.enableJoinedUser(sqlite.sqlDB, req.query.who)
						if (resultEnable.status == false) {
							message = resultEnable.message;
							error = 1;
						}
					}
				}
				else {
					error = 1;
					if (resultJoin.data.intime == 0) 
						message = lang[userLang]['str00000135'];
					if (resultJoin.data.instatus == 0)
						message = lang[userLang]['str00000136'];
				}
			}
			if (!(req.session.userdata === undefined)) {
				var sessionData = JSON.parse(req.session.userdata);
				userLang = sessionData.data.lang;
			}
			
			await res.render("join_result", { ERROR: error, MESSAGE : message, LANG : lang[userLang] });
			logger.logEvent("info","Rendering join request confirmation page");
		}
		catch(ex) {
			var queryError = {"err_code": 500, err_text: ex.message};
			var	reply = ({ result: queryError, selections : {}});
			res.status(500).json((reply));
			logger.logEvent("error", "GET /confirm: " + ex.message);
		}
}

exports.join_forwarded = 
	async (req, res, next) => {
		try {  
			var userLang = langId;
			if (!(req.session.userdata === undefined)) {
				var sessionData = JSON.parse(req.session.userdata);
				userLang = sessionData.data.lang;
			}
			await res.render("join_reqok", { ERROR: 0, MESSAGE : '', LANG : lang[userLang] });
			logger.logEvent("info","Rendering Join Request OK Page");
		}
		catch(ex) {
			await res.render("join_reqok", { ERROR: 1, MESSAGE : ex.message, LANG : lang[langId] });
			logger.logEvent("error", "GET /requestdone: " + ex.message);
		}
}


exports.newResets = 
	async () => {
		try {  
			let result = await commands.newResetList(sqlite.sqlDB);
			if (result.status == false) {
				resultSet = [];
				queryError = {"err_code": 11, err_text: result.message};
			}
			else {
				let mailresult;
				let resulting;
				let resulted;
				let serverParams;
				var resultSet = result.data;
				for (rs=0; rs<resultSet.length;rs++) {
					resulting = await commands.resetRequestSending(sqlite.sqlDB, resultSet[rs].uuid);
					serverParams = {protocol : wwwProtocol, host: wwwAddress, port : wwwPort};
					mailresult = await email.sendResetRequest(serverParams, resultSet[rs], lang[resultSet[rs].lang]);
					if (mailresult.status == false) {
						resultSet = [];
						queryError = {"err_code": 12, err_text: mailresult.message};
					}
					else {
						let resulted = await commands.resetRequestSent(sqlite.sqlDB, mailresult.contact);
					}
				}
				queryError = {"err_code": 0, err_text: "Success"};
			}
			if (resultSet.length > 0)
				logger.logEvent("info","New Reset Request command");
		}
		catch(ex) {
			logger.logEvent("error", "New Reset Request command: " + ex.message);
		}
}

exports.expiredResets = 
	async () => {
		try {  
			let result = await commands.closeReset(sqlite.sqlDB);
			if (result.status == true) {
				if (result.data.changes > 0) 
					logger.logEvent("info","Closed/Expired Resets command");
			}
			else
				logger.logEvent("error", "Expired/Closed Resets message: " + result.message);
		}
		catch(ex) {
			logger.logEvent("error", "Expired/Closed Resets message: " + ex.message);
		}
}

exports.reset_request = 
	async (req, res, next) => {
		try {  
			var message;
			var error = 0;
			var userLang = langId;
			let resultCheckMail = await users.oneUserByMailAddress(sqlite.sqlDB, req.body.email, lang[userLang]);
			if (resultCheckMail.error != 0) {
				message = resultCheckMail.message;
				error = 1;
				logger.logEvent("info","Invalid password reset request from: " + req.body.email);
			}
			else {
				let resultAddReset = await commands.newResetRequest(sqlite.sqlDB, resultCheckMail.data.uuid);
				if (resultAddReset.error != 0) {
					message = resultAddReset.message;
					error = 1;
				}
				logger.logEvent("info","Store password reset for: " + resultCheckMail.data.uuid + " " + req.body.email);
			}
			var queryError = {"err_code": error, err_text: message};
			var	reply = ({ result: queryError, selections : {}});
			res.status(200).json((reply));
		}
		catch(ex) {
			var queryError = {"err_code": 500, err_text: ex.message};
			var	reply = ({ result: queryError, selections : {}});
			res.status(500).json((reply));
			logger.logEvent("error", "GET /reset: " + ex.message);
		}
}

exports.reset_confirm = 
	async (req, res, next) => {
		try {  
			var message;
			var error = 0;
			var userLang = langId;
			let resultReset = await commands.checkResets(sqlite.sqlDB, req.body.who, lang[userLang])
			if (resultReset.status == false) {
				message = resultReset.message;
				error = 1;
			}
			else {
				userLang = resultReset.data.lang;
				if (resultReset.data.intime == 1 && resultReset.data.instatus == 1) {
					message = "";
					let resultClose = await commands.requestResetConfirmed(sqlite.sqlDB, req.body.who)
					if (resultClose.status == false) {
						message = resultClose.message;
						error = 1;
					}
					else {
						let result = await users.editUser(sqlite.sqlDB, req.body);
						if (result.status == false) {
							resultSet = [];
							queryError = {"err_code": 10, err_text: result.message};
						}
						else {
							resultSet = result.data;
							queryError = {"err_code": 0, err_text: "Success"};
						}
					}
				}
				else {
					error = 1;
					if (resultReset.data.intime == 0) 
						message = lang[userLang]['str00000164'];
					if (resultReset.data.instatus == 0)
						message = lang[userLang]['str00000165'];
				}
			}
			if (!(req.session.userdata === undefined)) {
				var sessionData = JSON.parse(req.session.userdata);
				userLang = sessionData.data.lang;
			}
			
			var queryError = {"err_code": error, err_text: message};
			var	reply = ({ result: queryError, selections : {}});
			res.status(200).json((reply));

//			await res.render("reset_result", { ERROR: error, MESSAGE : message, LANG : lang[userLang] });
			logger.logEvent("info","Rendering reset password confirmation page");
		}
		catch(ex) {
			var queryError = {"err_code": 500, err_text: ex.message};
			var	reply = ({ result: queryError, selections : {}});
			res.status(500).json((reply));
			logger.logEvent("error", "GET /confirm: " + ex.message);
		}
}

exports.reset_forwarded = 
	async (req, res, next) => {
		try {  
			var userLang = langId;
			if (!(req.session.userdata === undefined)) {
				var sessionData = JSON.parse(req.session.userdata);
				userLang = sessionData.data.lang;
			}
			await res.render("reset_result", { ERROR: 0, MESSAGE : '', LANG : lang[userLang] });
			logger.logEvent("info","Rendering Join Request OK Page");
		}
		catch(ex) {
			await res.render("join_reqok", { ERROR: 1, MESSAGE : ex.message, LANG : lang[langId] });
			logger.logEvent("error", "GET /requestdone: " + ex.message);
		}
}

exports.newAddDriver = 
	async () => {
		try {  
			let result = await commands.newAddDriverList(sqlite.sqlDB);
			if (result.status == false) {
				resultSet = [];
				queryError = {"err_code": 11, err_text: result.message};
			}
			else {
				let mailresult;
				let resulting;
				let resulted;
				let serverParams;
				var resultSet = result.data;
				for (rs=0; rs<resultSet.length;rs++) {
					resulting = await commands.addDriverSending(sqlite.sqlDB, resultSet[rs].uuid);
					serverParams = {protocol : wwwProtocol, host: wwwAddress, port : wwwPort};
					mailresult = await email.sendAddDriverConfirmation(serverParams, JSON.parse(resultSet[rs].dati), lang[resultSet[rs].lang]);
					if (mailresult.status == false) {
						resultSet = [];
						queryError = {"err_code": 12, err_text: mailresult.message};
					}
					else {
						let resulted = await commands.addDriverSent(sqlite.sqlDB, resultSet[rs].uuid);
					}
				}
				queryError = {"err_code": 0, err_text: "Success"};
			}
			if (resultSet.length > 0)
				logger.logEvent("info","Add driver command");
		}
		catch(ex) {
			logger.logEvent("error", "Add driver command: " + ex.message);
		}
}

exports.expiredAddDriver = 
	async () => {
		try {  
			let result = await commands.closeAddDriver(sqlite.sqlDB);
			if (result.status == true) {
				if (result.data.changes > 0) 
					logger.logEvent("info","Closed/Expired Add driver email command");
			}
			else
				logger.logEvent("error", "Expired/Closed Add driver email message: " + result.message);
		}
		catch(ex) {
			logger.logEvent("error", "Expired/Closed Add driver email message: " + ex.message);
		}
}

exports.newDelDriver = 
	async () => {
		try {  
			let result = await commands.newDelDriverList(sqlite.sqlDB);
			if (result.status == false) {
				resultSet = [];
				queryError = {"err_code": 11, err_text: result.message};
			}
			else {
				let mailresult;
				let resulting;
				let resulted;
				let serverParams;
				var resultSet = result.data;
				for (rs=0; rs<resultSet.length;rs++) {
					resulting = await commands.delDriverSending(sqlite.sqlDB, resultSet[rs].uuid);
					serverParams = {protocol : wwwProtocol, host: wwwAddress, port : wwwPort};
					mailresult = await email.sendDelDriverConfirmation(serverParams, JSON.parse(resultSet[rs].dati), lang[resultSet[rs].lang]);
					if (mailresult.status == false) {
						resultSet = [];
						queryError = {"err_code": 12, err_text: mailresult.message};
					}
					else {
						let resulted = await commands.delDriverSent(sqlite.sqlDB, resultSet[rs].uuid);
					}
				}
				queryError = {"err_code": 0, err_text: "Success"};
			}
			if (resultSet.length > 0)
				logger.logEvent("info","Delete driver command");
		}
		catch(ex) {
			logger.logEvent("error", "Delete driver command: " + ex.message);
		}
}

exports.expiredDelDriver = 
	async () => {
		try {  
			let result = await commands.closeDelDriver(sqlite.sqlDB);
			if (result.status == true) {
				if (result.data.changes > 0) 
					logger.logEvent("info","Closed/Expired Delete driver email command");
			}
			else
				logger.logEvent("error", "Expired/Closed Delete driver email message: " + result.message);
		}
		catch(ex) {
			logger.logEvent("error", "Expired/Closed Delete driver email message: " + ex.message);
		}
}

exports.newMessages = 
	async () => {
		try {  
			let result = await commands.newMessageList(sqlite.sqlDB);
			if (result.status == false) {
				resultSet = [];
				queryError = {"err_code": 11, err_text: result.message};
			}
			else {
				let mailresult;
				let resulting;
				let resulted;
				let serverParams;
				var resultSet = result.data;
				for (rs=0; rs<resultSet.length;rs++) {
					resulting = await commands.messageSending(sqlite.sqlDB, resultSet[rs].uuid);
					serverParams = {protocol : wwwProtocol, host: wwwAddress, port : wwwPort};
					mailresult = await email.sendMessageDriverConfirmation(serverParams, JSON.parse(resultSet[rs].dati), lang[resultSet[rs].lang]);
					if (mailresult.status == false) {
						resultSet = [];
						queryError = {"err_code": 12, err_text: mailresult.message};
					}
					else {
						let resulted = await commands.messageSent(sqlite.sqlDB, resultSet[rs].uuid);
					}
				}
				queryError = {"err_code": 0, err_text: "Success"};
			}
			if (resultSet.length > 0)
				logger.logEvent("info","u2u email command");
		}
		catch(ex) {
			logger.logEvent("error", "u2u email command: " + ex.message);
		}
}

exports.expiredMessages = 
	async () => {
		try {  
			let result = await commands.closeMessage(sqlite.sqlDB);
			if (result.status == true) {
				if (result.data.changes > 0) 
					logger.logEvent("info","Closed/Expired u2u email command");
			}
			else
				logger.logEvent("error", "Expired/Closed u2u email message: " + result.message);
		}
		catch(ex) {
			logger.logEvent("error", "Expired/Closed u2u email message: " + ex.message);
		}
}

exports.invite = 
	async (req, res, next) => {
		try {  
			var message = "";
			var error = 0;

			var userLang = langId;
			if (!(req.session.userdata === undefined)) {
				var sessionData = JSON.parse(req.session.userdata);
				userLang = sessionData.data.lang;
			}

			let resultCheckMail = await users.oneUserByMailAddress(sqlite.sqlDB, req.body.email, lang[userLang]);
			if (resultCheckMail.error != 1) {
				error = 1;
				if (resultCheckMail.error == 0) {
					message = lang[userLang]['str00000248'] + ": " + req.body.email;
					logger.logEvent("info",lang[userLang]['str00000248'] + ": " + req.body.email);
				}
				else {
					message = resultCheckMail.message;
					logger.logEvent("error",message);
				}
			}
			else {
//				console.log(sessionData);
				var contactData = {
					to: req.body.email, 
					from: sessionData.data.emailu,
					name: sessionData.data.nome + ' ' + sessionData.data.cognome,
					lang: req.body.lang
				};
				let resultInvite = await commands.newInviteRequest(sqlite.sqlDB, sessionData.data.uid, contactData);
				if (resultInvite.status == false) {
					message = resultInvite.message;
					error = 1;
				}
				logger.logEvent("info","Added invite request for: " + req.body.email);
			}
			var queryError = {"err_code": error, err_text: message};
			var	reply = ({ result: queryError, selections : {}});
			res.status(200).json((reply));
		}
		catch(ex) {
			var queryError = {"err_code": 500, err_text: ex.message};
			var	reply = ({ result: queryError, selections : {}});
			res.status(500).json((reply));
			logger.logEvent("error", "GET /reset: " + ex.message);
		}
}

exports.newInvites = 
	async () => {
		try {  
			let result = await commands.newInviteList(sqlite.sqlDB);
			if (result.status == false) {
				resultSet = [];
				queryError = {"err_code": 11, err_text: result.message};
			}
			else {
				let mailresult;
				let resulting;
				let resulted;
				let serverParams;
				var resultSet = result.data;
				for (rs=0; rs<resultSet.length;rs++) {
					resulting = await commands.inviteSending(sqlite.sqlDB, resultSet[rs].uuid);
					serverParams = {protocol : wwwProtocol, host: wwwAddress, port : wwwPort};
					var newUserData = JSON.parse(resultSet[rs].dati);
					mailresult = await email.sendInviteConfirmation(serverParams, JSON.parse(resultSet[rs].dati), lang[newUserData.lang]);
					if (mailresult.status == false) {
						resultSet = [];
						queryError = {"err_code": 12, err_text: mailresult.message};
					}
					else {
						let resulted = await commands.inviteSent(sqlite.sqlDB, resultSet[rs].uuid);
					}
				}
				queryError = {"err_code": 0, err_text: "Success"};
			}
			if (resultSet.length > 0)
				logger.logEvent("info","Invite user command");
		}
		catch(ex) {
			logger.logEvent("error", "Invite user command: " + ex.message);
		}
}

exports.expiredInvites = 
	async () => {
		try {  
			let result = await commands.closeInvite(sqlite.sqlDB);
			if (result.status == true) {
				if (result.data.changes > 0) 
					logger.logEvent("info","Closed/Expired Invite user command");
			}
			else
				logger.logEvent("error", "Expired/Closed Invite user message: " + result.message);
		}
		catch(ex) {
			logger.logEvent("error", "Expired/Closed Invite user message: " + ex.message);
		}
}

