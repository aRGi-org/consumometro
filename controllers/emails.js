const nodemailer = require('nodemailer');
const ejs = require('ejs');

const logger = require(appBasePath + 'controllers/logger');
const sqlite = require(appBasePath + 'controllers/db');

async function sendMailMessage(mailOptions) {
	return new Promise((resolve,reject) => {

		transport.sendMail(mailOptions, function (error, info) {
			if (error) {
				logger.logEvent("error", error);
				resolve(false); // or use rejcet(false) but then you will have to handle errors
			}
			else {
				logger.logEvent("info","Email message sent");
				resolve(true);
			}
		});
   })
};

async function renderEmailMessage(path, contact) {
	return new Promise((resolve,reject) => {

		ejs.renderFile(path ,contact, function (error, data) {
			if (error) {
				logger.logEvent("error", error);
				resolve({status : false}); // or use rejcet(false) but then you will have to handle errors
			}
			else {
				resolve({status : true, body : data});
			}
		});
   })
};

exports.sendRequestConfirmation = 
	async (serverData, contactData, lang) => {
		try {  
			var pageData = { server: serverData, contact : contactData, LANG : lang};
			let resultP = await renderEmailMessage(__dirname + '/../views/join_request.ejs', { pageData });
			if (resultP.status == false) {
				logger.logEvent("error", "Unable to build email body.");
				return {status : false, message : "Unable to build email body.", contact : contactData};
			}
			else {
				var mailOptions = {
					from: emailSender,
					to: contactData.email,
					bcc: emailSender,
					subject: lang.str00000125,
					html: resultP.body
				};
				let resultS = await sendMailMessage(mailOptions);
				return {status : resultS, contact : contactData};
			}
		}
		catch(ex) {
			logger.logEvent("error", "Send confirmation email: " + ex.message);
			return {status : false, message : ex.message, contact : contactData};
		}
	};

exports.sendInviteConfirmation = 
	async (serverData, contactData, lang) => {
		try {  
			var pageData = { server: serverData, contact : contactData, LANG : lang};
			let resultP = await renderEmailMessage(__dirname + '/../views/minvite_mail.ejs', { pageData });
			if (resultP.status == false) {
				logger.logEvent("error", "Unable to build email body.");
				return {status : false, message : "Unable to build email body.", contact : contactData};
			}
			else {
				var mailOptions = {
					from: emailSender,
					to: contactData.to,
					cc: contactData.from,
					name: contactData.name,
					bcc: emailSender,
					subject: lang.str00000254,
					html: resultP.body
				};
				let resultS = await sendMailMessage(mailOptions);
				return {status : resultS, contact : contactData};
			}
			return {status : true, contact : contactData};
		}
		catch(ex) {
			logger.logEvent("error", "Send invitation email: " + ex.message);
			return {status : false, message : ex.message, contact : contactData};
		}
	};

exports.sendAddDriverConfirmation = 
	async (serverData, contactData, lang) => {
		try {  
			var pageData = { server: serverData, contact : contactData, LANG : lang};
			let resultP = await renderEmailMessage(__dirname + '/../views/add_driver.ejs', { pageData });
			if (resultP.status == false) {
				logger.logEvent("error", "Unable to build email body.");
				return {status : false, message : "Unable to build email body.", contact : contactData};
			}
			else {
				var mailOptions = {
					from: emailSender,
					to: contactData.to,
					cc: contactData.from,
					bcc: emailSender,
					subject: lang.str00000126,
					html: resultP.body
				};
				let resultS = await sendMailMessage(mailOptions);
				return {status : resultS, contact : contactData};
			}
		}
		catch(ex) {
			logger.logEvent("error", "Send add driver email: " + ex.message);
			return {status : false, message : ex.message, contact : contactData};
		}
	};

exports.sendDelDriverConfirmation = 
	async (serverData, contactData, lang) => {
		try {  
			var pageData = { server: serverData, contact : contactData, LANG : lang};
			let resultP = await renderEmailMessage(__dirname + '/../views/del_driver.ejs', { pageData });
			if (resultP.status == false) {
				logger.logEvent("error", "Unable to build email body.");
				return {status : false, message : "Unable to build email body.", contact : contactData};
			}
			else {
				var mailOptions = {
					from: emailSender,
					to: contactData.to,
					cc: contactData.from,
					bcc: emailSender,
					subject: lang.str00000129,
					html: resultP.body
				};
				let resultS = await sendMailMessage(mailOptions);
				return {status : resultS, contact : contactData};
			}
		}
		catch(ex) {
			logger.logEvent("error", "Send delete driver email: " + ex.message);
			return {status : false, message : ex.message, contact : contactData};
		}
	};

exports.sendMessageDriverConfirmation = 
	async (serverData, contactData, lang) => {
		try {  
			var pageData = { server: serverData, contact : contactData, LANG : lang};
			let resultP = await renderEmailMessage(__dirname + '/../views/msg_driver.ejs', { pageData });
			if (resultP.status == false) {
				logger.logEvent("error", "Unable to build email body.");
				return {status : false, message : "Unable to build email body.", contact : contactData};
			}
			else {
				var mailOptions = {
					from: emailSender,
					to: contactData.to,
					cc: contactData.from,
					bcc: emailSender,
					subject: lang.str00000130,
					html: resultP.body
				};
				let resultS = await sendMailMessage(mailOptions);
				return {status : resultS, contact : contactData};
			}
		}
		catch(ex) {
			logger.logEvent("error", "Send u2u email: " + ex.message);
			return {status : false, message : ex.message, contact : contactData};
		}
	};

exports.sendResetRequest = 
	async (serverData, contactData, lang) => {
		try {  
			var pageData = { server: serverData, contact : contactData, LANG : lang};
			let resultP = await renderEmailMessage(__dirname + '/../views/reset_request.ejs', { pageData });
			if (resultP.status == false) {
				logger.logEvent("error", "Unable to build email body.");
				return {status : false, message : "Unable to build email body.", contact : contactData};
			}
			else {
				var mailOptions = {
					from: emailSender,
					to: contactData.email,
					bcc: emailSender,
					subject: lang.str00000157,
					html: resultP.body
				};
				let resultS = await sendMailMessage(mailOptions);
				return {status : resultS, contact : contactData};
			}
		}
		catch(ex) {
			logger.logEvent("error", "Send password reset email: " + ex.message);
			return {status : false, message : ex.message, contact : contactData};
		}
	};

exports.sendReport = 
	async (serverData, coverData, lang) => {
		try {  
			var pageData = { server: serverData, cover : coverData, LANG : lang};
			let resultP = await renderEmailMessage(__dirname + '/../views/reports.ejs', { pageData });
			if (resultP.status == false) {
				logger.logEvent("error", "Unable to build email body.");
				return {status : false, message : "Unable to build email body.", cover : coverData};
			}
			else {
				var mailOptions = {
					from: emailSender,
					to: coverData.email,
					subject: lang.str00000178,
					html: resultP.body,
					attachments : [ { path: coverData.attachPath } ]					
				};
				let resultS = await sendMailMessage(mailOptions);
				return {status : resultS, cover : coverData};
			}
		}
		catch(ex) {
			logger.logEvent("error", "Send report email: " + ex.message);
			return {status : false, message : ex.message, cocoverntact : coverData};
		}
	};

