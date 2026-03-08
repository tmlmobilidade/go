db.createUser({
	pwd: USER_AUTH_PASSWORD,
	roles: [{ db: 'admin', role: 'auth' }],
	user: 'auth',
});

db.createUser({
	pwd: USER_PLANS_PASSWORD,
	roles: [{ db: 'admin', role: 'plans' }],
	user: 'plans',
});

db.createUser({
	pwd: USER_ALERTS_PASSWORD,
	roles: [{ db: 'admin', role: 'alerts' }],
	user: 'alerts',
});

db.createUser({
	pwd: USER_STOPS_PASSWORD,
	roles: [{ db: 'admin', role: 'stops' }],
	user: 'stops',
});

db.createUser({
	pwd: USER_LOCATIONS_PASSWORD,
	roles: [{ db: 'admin', role: 'locations' }],
	user: 'locations',
});

db.createUser({
	pwd: USER_CONTROLLER_PASSWORD,
	roles: [{ db: 'admin', role: 'controller' }],
	user: 'controller',
});

db.createUser({
	pwd: USER_TRACKER_PASSWORD,
	roles: [{ db: 'admin', role: 'tracker' }],
	user: 'tracker',
});

db.createUser({
	pwd: USER_REPLICATOR_PASSWORD,
	roles: [{ db: 'admin', role: 'apex' }],
	user: 'apex',
});

db.createUser({
	pwd: USER_PERFORMANCE_PASSWORD,
	roles: [{ db: 'admin', role: 'performance' }],
	user: 'performance',
});

db.createUser({
	pwd: USER_DATES_PASSWORD,
	roles: [{ db: 'admin', role: 'dates' }],
	user: 'dates',
});

db.createUser({
	pwd: USER_OFFER_PASSWORD,
	roles: [{ db: 'admin', role: 'offer' }],
	user: 'offer',
});

db.createUser({
	pwd: USER_CMET_API_PASSWORD,
	roles: [{ db: 'admin', role: 'cmet-api' }],
	user: 'cmet-api',
});

db.createUser({
	pwd: USER_GO_V1_PASSWORD,
	roles: [{ db: 'admin', role: 'go-v1' }],
	user: 'go-v1',
});

db.createUser({
	pwd: USER_DGC_USER_PASSWORD,
	roles: [{ db: 'admin', role: 'dgc-user' }],
	user: 'dgc-user',
});

db.createUser({
	pwd: USER_BACKUP_PASSWORD,
	roles: [{ db: 'admin', role: 'backup' }],
	user: 'backup',
});

db.createUser({
	pwd: USER_EXPORTER_PASSWORD,
	roles: [{ db: 'admin', role: 'exporter' }],
	user: 'exporter',
});

db.createUser({
	pwd: USER_FLEET_PASSWORD,
	roles: [{ db: 'admin', role: 'fleet' }],
	user: 'fleet',
});
