//const fs = require('fs');
const rfs = require('rotating-file-stream');
const { DateTime, Duration } = require("luxon");

exports.logInit = (logPath,logName) => {
	
	logStream = rfs.createStream(logName, {
					size: '100M',
					interval: '1d',
					path: logPath
					});
}

exports.logEvent = (kind,message) => {

	console.log(DateTime.now().toFormat('yyyy-LL-dd HH:mm:ss') + ' ' + kind.toUpperCase() + ' - ' + message);
	logStream.write(DateTime.now().toFormat('yyyy-LL-dd HH:mm:ss') + ' ' + kind.toUpperCase() + ' - ' + message + '\n', function (err, f) {
																				if (err) {
																					return console.error(err);
																				}
																			 }
	);
}
