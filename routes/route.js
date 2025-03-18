const express = require("express");
const session = require('express-session');
const router = express.Router();
const cors = require('cors');
const sqlite3 = require("sqlite3").verbose();
const { open } = require('sqlite');
const crypto = require('crypto');
const connect = require('connect');
const sessionStore = require('connect-sqlite3')(session);

const logger = require(appBasePath + 'controllers/logger');

const corsOptions = {
	origin: 'https://*', 
	credentials: true,
	methods: ['GET', 'POST', 'PUT', 'DELETE'],
	optionsSuccessStatus: 204
};

const auth_controller = require(appBasePath + 'controllers/auth');
const home_controller = require(appBasePath + 'controllers/home');
const cars_controller = require(appBasePath + 'controllers/cars');
const costs_controller = require(appBasePath + 'controllers/costs');
const users_controller = require(appBasePath + 'controllers/users');
const roles_controller = require(appBasePath + 'controllers/roles');
const langs_controller = require(appBasePath + 'controllers/langs');
const emails_controller = require(appBasePath + 'controllers/emails');
const commands_controller = require(appBasePath + 'controllers/commands');

var sessionpwd = crypto.randomBytes(16);

router.use(
	session(
		{
			store: new sessionStore({dir:appBasePath + "db", db:'consumometro.db', table:'sessions'}),
			secret: sessionpwd,
			resave: true,
			saveUninitialized: false,
			cookie: { maxAge: 24 * 60 * 60 * 1000 } // 1 week
		}
	)
);

	
router.use("/api/*", cors(corsOptions), auth_controller.authauth);
router.use("/app/*", cors(corsOptions), auth_controller.authauth);

router.get( "/", cors(corsOptions), home_controller.indexView);
router.get( "/intl", cors(corsOptions), langs_controller.language);
router.get( "/intl/list", cors(corsOptions), langs_controller.lingue_list);
router.post( "/intl/set", cors(corsOptions), langs_controller.cambia_lingua);
router.get("/lang", cors(corsOptions), langs_controller.lingue_list);
router.get( "/login", cors(corsOptions), home_controller.login);
router.post('/login/auth', cors(corsOptions), auth_controller.authauth);
router.get( "/reset", cors(corsOptions), home_controller.mresetView);
router.post( "/reset", cors(corsOptions), commands_controller.reset_request);
router.get( "/secretreset", cors(corsOptions), home_controller.mresetsecretView);
router.get("/secretwhoami", cors(corsOptions), users_controller.users_one);
router.post("/updatesecret", cors(corsOptions), commands_controller.reset_confirm);
router.get( "/resetdone", cors(corsOptions), commands_controller.reset_forwarded);
router.post( "/join", cors(corsOptions), users_controller.users_join);
router.get( "/confirm", cors(corsOptions), commands_controller.join_confirm);
router.get( "/requestdone", cors(corsOptions), commands_controller.join_forwarded);
router.get("/contactus", cors(corsOptions), home_controller.contactView);

router.get("/app/index", cors(corsOptions), home_controller.indexView);
router.get("/app/secret", cors(corsOptions), home_controller.secretView);
router.get("/app/logout", cors(corsOptions), home_controller.logout);
router.get("/app/utenti", cors(corsOptions), users_controller.usersView);
router.get("/app/auto", cors(corsOptions), cars_controller.carsView);
router.get("/app/pieno", cors(corsOptions), costs_controller.refillView);
router.get("/app/spese", cors(corsOptions), costs_controller.costsView);

router.get("/app/mpieno", cors(corsOptions), home_controller.mrefillView);
router.get("/app/mcons", cors(corsOptions), home_controller.mconsView);
router.get("/app/mspese", cors(corsOptions), home_controller.mcostsView);
router.get("/app/mrequs", cors(corsOptions), home_controller.mrequestsView);

router.get("/app/mauto", cors(corsOptions), home_controller.mautoView);
router.get("/app/mdriver", cors(corsOptions), home_controller.mdriverView);
router.get("/app/mprofile", cors(corsOptions), home_controller.mprofileView);
router.get("/app/minvite", cors(corsOptions), home_controller.minviteView);
router.get("/app/minvitedone", cors(corsOptions), home_controller.minviteDoneView);

router.get("/api/session", cors(corsOptions), home_controller.sessionUserData);

router.get("/api/ruoli/list", cors(corsOptions), roles_controller.roles_list);
router.get("/api/lingue/list", cors(corsOptions), langs_controller.lingue_list);

router.get("/api/auto/all", cors(corsOptions), cars_controller.cars);
router.get("/api/auto/one", cors(corsOptions), cars_controller.thiscar);
router.get("/api/auto/links", cors(corsOptions), cars_controller.users_cars_list);
router.get("/api/auto/list", cors(corsOptions), cars_controller.cars_list);
router.get("/api/auto/listbyuser", cors(corsOptions), cars_controller.cars_user_list);
router.post("/api/auto", cors(corsOptions), cars_controller.cars_edit);
router.post("/api/auto/users", cors(corsOptions), users_controller.users_inout);
router.post("/api/auto/adduser", cors(corsOptions), users_controller.users_auto_add);
router.post("/api/auto/remuser", cors(corsOptions), users_controller.users_auto_remove);
router.post("/api/auto/driver", cors(corsOptions), users_controller.users_auto_drivers);
router.get("/api/auto/fuels", cors(corsOptions), cars_controller.fuels_list);

router.get("/api/utenti/all", cors(corsOptions), users_controller.users);
router.get("/api/utenti/list", cors(corsOptions), users_controller.users_list);
router.get("/api/utenti/whoami", cors(corsOptions), users_controller.users_one);
router.post("/api/utenti", cors(corsOptions), users_controller.users_edit);

router.get("/api/rifornimenti/all", cors(corsOptions), costs_controller.refills);
router.get("/api/tipospese/list", cors(corsOptions), costs_controller.expense_types_list);
router.post("/api/rifornimenti", cors(corsOptions), costs_controller.expenses_edit);
router.get("/api/rifornimenti/bycar", cors(corsOptions), costs_controller.expenses_list_bycar);
router.get("/api/rifornimenti/bycarandcathead", cors(corsOptions), costs_controller.expenses_list_bycar_and_cat_head);
router.get("/api/rifornimenti/bycarandcat", cors(corsOptions), costs_controller.expenses_list_bycar_and_cat);
router.get("/api/rifornimenti/bycarcons", cors(corsOptions), costs_controller.consumptions_list_bycar);

router.post("/api/invite", cors(corsOptions), commands_controller.invite);
/*
router.get('/manifest.json', function(req, res) {
	var manifest = {
		start_url: "https://consumometro.argi.mooo.com",
		name: "CONSUMOMETRO",
		description: "Track consumptions and expenses of your cars.",
		display: "standalone",
		icons: [
			{
				src: "/media/images/consumometro_512.png",
				type: "image/png",
				sizes: "512x512"
			},
			{
				src: "/media/images/consumometro_192.png",
				type: "image/png",
				sizes: "192x192"
			}
		]
	};
	
    res.header("Content-Type", 'application/json');
    res.json(manifest);
});
*/
module.exports = router;