const express = require("express");
const createError = require("http-errors");
const path = require("path");
const cookieParser = require("cookie-parser");
const morgans = require("morgan");
const cors = require('cors');
const { DateTime, Duration } = require("luxon");

const appRouter = require(appBasePath + 'routes/route');
const appScheduler = require(appBasePath + 'controllers/commands');
const appReporter = require(appBasePath + 'controllers/reports');
const appSession = require(appBasePath + 'controllers/auth');
const logger = require(appBasePath + 'controllers/logger');

const app = express();

const corsOptions = {
	origin: 'https://*', 
	credentials: true,
	methods: ['GET', 'POST', 'PUT', 'DELETE'],
	optionsSuccessStatus: 204
};

var commandsTimer;


checkCommands = 
	async (id) => {
		try {  
			appScheduler.newJoins();
			appScheduler.expiredJoins();
			appScheduler.newResets();
			appScheduler.expiredResets();
			appScheduler.newAddDriver();
			appScheduler.expiredAddDriver();
			appScheduler.newDelDriver();
			appScheduler.expiredDelDriver();
			appScheduler.newMessages();
			appScheduler.expiredMessages();
			appScheduler.newInvites();
			appScheduler.expiredInvites();
			appSession.expiredSessions();
		}
		catch(ex) {
			logger.logEvent("ERROR", "Check commands message: " + ex.message);
		}
}

checkReports = 
	async (id) => {
		try {  
			appReporter.rescheduleReports();
			appReporter.sendReports();
			appReporter.generateReports();
		}
		catch(ex) {
			logger.logEvent("ERROR", "Check commands message: " + ex.message);
		}
}

app.set("views", appBasePath + 'views');
app.set("view engine", "ejs");
app.enable("trust proxy");

morgans.token('dt', function(req,res) { return DateTime.now().toFormat('yyyy-LL-dd HH:mm:ss') });
morgans.token('loginfo', function(req,res) { return "REQ" });

if (appEnvironment == "PROD") {
	app.use(morgans(":dt :loginfo - :remote-addr :method :status :url",{ stream: logStream }));
	app.use(morgans(":dt :loginfo - :remote-addr :method :status :url"));
}
else {
	app.use(morgans(":dt :loginfo - :remote-addr :method :status :url",{ stream: logStream }));
	app.use(morgans(":dt :loginfo - :remote-addr :method :status :url"));
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(appBasePath + 'public'));

app.options('*', cors(corsOptions));

app.use("/", appRouter);
app.use("/auth", appRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

function schedReporting() {
	checkReports();
	reportsTimer = setInterval(checkReports.bind(null), 600000);
}

function schedCommands() {
	checkCommands();
	commandsTimer = setInterval(checkCommands.bind(null), 10000);
}

setTimeout(schedReporting,3000);
setTimeout(schedCommands,1000);


module.exports = app;
