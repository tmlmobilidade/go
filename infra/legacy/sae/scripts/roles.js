db.createRole({
	privileges: [
		{ actions: ['find'], resource: { collection: 'agencies', db: 'production' } },
		{ actions: ['find'], resource: { collection: 'organizations', db: 'production' } },
		{ actions: ['find'], resource: { collection: 'users', db: 'production' } },
		{ actions: ['find'], resource: { collection: 'sessions', db: 'production' } },
		{ actions: ['find'], resource: { collection: 'roles', db: 'production' } },
		{ actions: ['find'], resource: { collection: 'verification_tokens', db: 'production' } },
		{ actions: ['find'], resource: { collection: 'files', db: 'production' } },
		{ actions: ['find'], resource: { collection: 'census', db: 'production' } },
		{ actions: ['find'], resource: { collection: 'districts', db: 'production' } },
		{ actions: ['find'], resource: { collection: 'localities', db: 'production' } },
		{ actions: ['find'], resource: { collection: 'municipalities', db: 'production' } },
		{ actions: ['find'], resource: { collection: 'parishes', db: 'production' } },
		{ actions: ['find', 'insert'], resource: { collection: 'notifications', db: 'production' } },
	],
	role: 'common',
	roles: [],
});

db.createRole({
	privileges: [
		{ actions: ['find'], resource: { collection: 'stops', db: 'production' } },
		{ actions: ['find'], resource: { collection: 'rides', db: 'production' } },
		{ actions: ['find'], resource: { collection: 'sams', db: 'production' } },
		{ actions: ['find'], resource: { collection: 'ride_acceptances', db: 'production' } },
		{ actions: ['find'], resource: { collection: 'hashed_patterns', db: 'production' } },
		{ actions: ['find'], resource: { collection: 'hashed_shapes', db: 'production' } },
		{ actions: ['find'], resource: { collection: 'hashed_trips', db: 'production' } },
		{ actions: ['find'], resource: { collection: 'vehicles', db: 'production' } },
		{ actions: ['find'], resource: { collection: 'stops', db: 'production' } },
		{ actions: ['find', 'update'], resource: { collection: 'plans', db: 'production' } },
		{ actions: ['find', 'insert', 'update', 'remove'], resource: { collection: 'files', db: 'production' } },
		{ actions: ['find', 'insert', 'update', 'remove'], resource: { collection: 'exports', db: 'production' } },
	],
	role: 'exporter',
	roles: [{ db: 'admin', role: 'common' }],
});

db.createRole({
	privileges: [
		{ actions: ['find', 'insert', 'update', 'remove'], resource: { collection: 'agencies', db: 'production' } },
		{ actions: ['find', 'insert', 'update', 'remove'], resource: { collection: 'users', db: 'production' } },
		{ actions: ['find', 'insert', 'update', 'remove'], resource: { collection: 'sessions', db: 'production' } },
		{ actions: ['find', 'insert', 'update', 'remove'], resource: { collection: 'roles', db: 'production' } },
		{ actions: ['find', 'insert', 'update', 'remove'], resource: { collection: 'files', db: 'production' } },
		{ actions: ['find', 'insert', 'update', 'remove'], resource: { collection: 'verification_tokens', db: 'production' } },
		{ actions: ['find', 'insert', 'update', 'remove'], resource: { collection: 'organizations', db: 'production' } },
		{ actions: ['find', 'insert', 'update', 'remove'], resource: { collection: 'proposed_changes', db: 'production' } },
		{ actions: ['find', 'insert', 'update', 'remove'], resource: { collection: 'notifications', db: 'production' } },
	],
	role: 'auth',
	roles: [{ db: 'admin', role: 'common' }],
});

db.createRole({
	privileges: [
		{ actions: ['find'], resource: { collection: 'stops', db: 'production' } },
		{ actions: ['find'], resource: { collection: 'holidays', db: 'production' } },
		{ actions: ['find'], resource: { collection: 'year_periods', db: 'production' } },
		{ actions: ['find'], resource: { collection: 'events', db: 'production' } },
		{ actions: ['find', 'insert', 'update', 'remove'], resource: { collection: 'files', db: 'production' } },
		{ actions: ['find', 'insert', 'update', 'remove'], resource: { collection: 'plans', db: 'production' } },
		{ actions: ['find', 'insert', 'update', 'remove'], resource: { collection: 'gtfs_validations', db: 'production' } },
	],
	role: 'plans',
	roles: [{ db: 'admin', role: 'common' }],
});

db.createRole({
	privileges: [
		{ actions: ['find'], resource: { collection: 'stops', db: 'production' } },
		{ actions: ['find'], resource: { collection: 'alerts', db: 'production' } },
		{ actions: ['find'], resource: { collection: 'census', db: 'production' } },
		{ actions: ['find'], resource: { collection: 'agencies', db: 'production' } },
		{ actions: ['find'], resource: { collection: 'districts', db: 'production' } },
		{ actions: ['find'], resource: { collection: 'localities', db: 'production' } },
		{ actions: ['find'], resource: { collection: 'municipalities', db: 'production' } },
		{ actions: ['find'], resource: { collection: 'parishes', db: 'production' } },
		{ actions: ['find'], resource: { collection: 'vehicles', db: 'production' } },
		{ actions: ['find'], resource: { collection: 'hashed_trips', db: 'production' } },
		{ actions: ['find', 'update'], resource: { collection: 'plans', db: 'production' } },
		{ actions: ['find', 'changeStream'], resource: { collection: 'rides', db: 'production' } },
		{ actions: ['find', 'insert', 'update', 'remove'], resource: { collection: 'files', db: 'production' } },
	],
	role: 'hub',
	roles: [],
});

db.createRole({
	privileges: [
		{ actions: ['find', 'insert', 'update', 'remove'], resource: { collection: 'files', db: 'production' } },
		{ actions: ['find', 'update', 'insert', 'remove'], resource: { collection: 'alerts', db: 'production' } },
		{ actions: ['find', 'changeStream'], resource: { collection: 'rides', db: 'production' } },
		{ actions: ['find'], resource: { collection: 'ride_acceptances', db: 'production' } },
		{ actions: ['find'], resource: { collection: 'hashed_patterns', db: 'production' } },
		{ actions: ['find'], resource: { collection: 'hashed_trips', db: 'production' } },
	],
	role: 'alerts',
	roles: [{ db: 'admin', role: 'common' }],
});

db.updateRole('stops', {
	privileges: [
		{ actions: ['find', 'update', 'insert', 'remove'], resource: { collection: 'stops', db: 'production' } },
		{ actions: ['find'], resource: { collection: 'patterns', db: 'production' } }
	],
	roles: [{ db: 'admin', role: 'common' }],
});

db.createRole({
	privileges: [
		{ actions: ['find', 'update', 'insert', 'remove'], resource: { collection: 'census', db: 'production' } },
		{ actions: ['find', 'update', 'insert', 'remove'], resource: { collection: 'districts', db: 'production' } },
		{ actions: ['find', 'update', 'insert', 'remove'], resource: { collection: 'municipalities', db: 'production' } },
		{ actions: ['find', 'update', 'insert', 'remove'], resource: { collection: 'parishes', db: 'production' } },
		{ actions: ['find', 'update', 'insert', 'remove'], resource: { collection: 'localities', db: 'production' } },
	],
	role: 'locations',
	roles: [{ db: 'admin', role: 'common' }],
});

db.createRole({
	privileges: [
		{ actions: ['find'], resource: { collection: 'alerts', db: 'production' } },
		{ actions: ['find', 'update'], resource: { collection: 'plans', db: 'production' } },
		{ actions: ['find', 'update', 'insert', 'remove'], resource: { collection: 'sams', db: 'production' } },
		{ actions: ['find', 'update', 'insert', 'remove', 'changeStream'], resource: { collection: 'rides', db: 'production' } },
		{ actions: ['find', 'update', 'insert', 'remove'], resource: { collection: 'ride_acceptances', db: 'production' } },
		{ actions: ['find', 'update', 'insert', 'remove'], resource: { collection: 'hashed_patterns', db: 'production' } },
		{ actions: ['find', 'update', 'insert', 'remove'], resource: { collection: 'hashed_shapes', db: 'production' } },
		{ actions: ['find', 'update', 'insert', 'remove'], resource: { collection: 'hashed_trips', db: 'production' } },
		{ actions: ['find'], resource: { collection: 'simplified_apex_locations', db: 'production' } },
		{ actions: ['find'], resource: { collection: 'simplified_apex_on_board_refunds', db: 'production' } },
		{ actions: ['find'], resource: { collection: 'simplified_apex_on_board_sales', db: 'production' } },
		{ actions: ['find'], resource: { collection: 'simplified_apex_validations', db: 'production' } },
		{ actions: ['find'], resource: { collection: 'simplified_vehicle_events', db: 'production' } },
	],
	role: 'controller',
	roles: [{ db: 'admin', role: 'common' }],
});

db.createRole({
	privileges: [
		{ actions: ['find', 'update'], resource: { collection: 'rides', db: 'production' } },
	],
	role: 'apex',
	roles: [],
});

db.createRole({
	privileges: [
		{ actions: ['find'], resource: { collection: 'rides', db: 'production' } },
		{ actions: ['find'], resource: { collection: 'sams', db: 'production' } },
		{ actions: ['find', 'update', 'insert', 'remove'], resource: { collection: 'metrics', db: 'production' } },
	],
	role: 'performance',
	roles: [{ db: 'admin', role: 'common' }],
});

db.updateRole('dates', {
	privileges: [
		{ actions: ['find', 'insert', 'update', 'remove'], resource: { collection: 'annotations', db: 'production' } },
		{ actions: ['find', 'insert', 'update', 'remove'], resource: { collection: 'holidays', db: 'production' } },
		{ actions: ['find', 'insert', 'update', 'remove'], resource: { collection: 'year_periods', db: 'production' } },
		{ actions: ['find', 'insert', 'update', 'remove'], resource: { collection: 'events', db: 'production' } },
		{ actions: ['find'], resource: { collection: 'patterns', db: 'production' } },
	],
	roles: [{ db: 'admin', role: 'common' }],
});

db.updateRole('offer', {
	privileges: [
		{ actions: ['find', 'insert', 'update', 'remove'], resource: { collection: 'typologies', db: 'production' } },
		{ actions: ['find', 'insert', 'update', 'remove'], resource: { collection: 'lines', db: 'production' } },
		{ actions: ['find', 'insert', 'update', 'remove'], resource: { collection: 'routes', db: 'production' } },
		{ actions: ['find', 'insert', 'update', 'remove'], resource: { collection: 'patterns', db: 'production' } },
		{ actions: ['find', 'insert', 'update', 'remove'], resource: { collection: 'fares', db: 'production' } },
		{ actions: ['find', 'insert', 'update', 'remove'], resource: { collection: 'zones', db: 'production' } },
		{ actions: ['find', 'insert', 'update'], resource: { collection: 'exports', db: 'production' } },
		{ actions: ['find', 'insert'], resource: { collection: 'files', db: 'production' } },
		{ actions: ['find'], resource: { collection: 'holidays', db: 'production' } },
		{ actions: ['find'], resource: { collection: 'year_periods', db: 'production' } },
		{ actions: ['find'], resource: { collection: 'events', db: 'production' } },
		{ actions: ['find'], resource: { collection: 'stops', db: 'production' } },
	],
	roles: [{ db: 'admin', role: 'common' }],
});

db.createRole({
	privileges: [
		{ actions: ['find', 'insert', 'update', 'remove'], resource: { collection: 'vehicles', db: 'production' } },
	],
	role: 'fleet',
	roles: [{ db: 'admin', role: 'common' }],
});

db.createRole({
	privileges: [
		{ actions: ['find'], resource: { collection: 'rides', db: 'production' } },
		{ actions: ['find'], resource: { collection: 'alerts', db: 'production' } },
		{ actions: ['find'], resource: { collection: 'metrics', db: 'production' } },
	],
	role: 'cmet-api',
	roles: [],
});


db.updateRole('tracker', {
	privileges: [
		{ actions: ['find'], resource: { collection: 'rides', db: 'production' } },
		{ actions: ['find'], resource: { collection: 'plans', db: 'production' } },
		{ actions: ['find'], resource: { collection: 'stops', db: 'production' } },
		{ actions: ['find'], resource: { collection: 'hashed_shapes', db: 'production' } },
		{ actions: ['find'], resource: { collection: 'hashed_trips', db: 'production' } },
		{ actions: ['find'], resource: { collection: 'hashed_patterns', db: 'production' } },
	],
	roles: [],
});

db.createRole({
	privileges: [
		{ actions: ['find'], resource: { collection: 'rides', db: 'production' } },
		{ actions: ['find'], resource: { collection: 'plans', db: 'production' } },
		{ actions: ['find'], resource: { collection: 'files', db: 'production' } },
	],
	role: 'go-v1',
	roles: [],
});

db.createRole({
	privileges: [
		{ actions: ['find', 'listIndexes', 'collStats'], resource: { collection: 'agencies', db: 'production' } },
		{ actions: ['find', 'listIndexes', 'collStats'], resource: { collection: 'alerts', db: 'production' } },
		{ actions: ['find', 'listIndexes', 'collStats'], resource: { collection: 'stops', db: 'production' } },
		{ actions: ['find', 'listIndexes', 'collStats'], resource: { collection: 'plans', db: 'production' } },
		{ actions: ['find', 'listIndexes', 'collStats'], resource: { collection: 'rides', db: 'production' } },
		{ actions: ['find', 'listIndexes', 'collStats'], resource: { collection: 'hashed_patterns', db: 'production' } },
		{ actions: ['find', 'listIndexes', 'collStats'], resource: { collection: 'hashed_shapes', db: 'production' } },
		{ actions: ['find', 'listIndexes', 'collStats'], resource: { collection: 'hashed_trips', db: 'production' } },
		{ actions: ['find', 'listIndexes', 'collStats'], resource: { collection: 'sams', db: 'production' } },
		{ actions: ['find', 'listIndexes', 'collStats'], resource: { collection: 'simplified_apex_locations', db: 'production' } },
		{ actions: ['find', 'listIndexes', 'collStats'], resource: { collection: 'simplified_apex_on_board_refunds', db: 'production' } },
		{ actions: ['find', 'listIndexes', 'collStats'], resource: { collection: 'simplified_apex_on_board_sales', db: 'production' } },
		{ actions: ['find', 'listIndexes', 'collStats'], resource: { collection: 'simplified_apex_validations', db: 'production' } },
		{ actions: ['find', 'listIndexes', 'collStats'], resource: { collection: 'simplified_vehicle_events', db: 'production' } },
		{ actions: ['find', 'listIndexes', 'collStats'], resource: { collection: 'ride_acceptances', db: 'production' } },
		{ actions: ['find', 'listIndexes', 'collStats'], resource: { collection: 'metrics', db: 'production' } },
		{ actions: ['find', 'listIndexes', 'collStats'], resource: { collection: 'census', db: 'production' } },
		{ actions: ['find', 'listIndexes', 'collStats'], resource: { collection: 'districts', db: 'production' } },
		{ actions: ['find', 'listIndexes', 'collStats'], resource: { collection: 'localities', db: 'production' } },
		{ actions: ['find', 'listIndexes', 'collStats'], resource: { collection: 'municipalities', db: 'production' } },
		{ actions: ['find', 'listIndexes', 'collStats'], resource: { collection: 'parishes', db: 'production' } },
		{ actions: ['find', 'listIndexes', 'collStats'], resource: { collection: 'vehicles', db: 'production' } },
		{ actions: ['find', 'listIndexes', 'collStats'], resource: { collection: 'fares', db: 'production' } },
		{ actions: ['find', 'listIndexes', 'collStats'], resource: { collection: 'zones', db: 'production' } },
		{ actions: ['find', 'listIndexes', 'collStats'], resource: { collection: 'events', db: 'production' } },
		{ actions: ['find', 'listIndexes', 'collStats'], resource: { collection: 'annotations', db: 'production' } },
		{ actions: ['find', 'listIndexes', 'collStats'], resource: { collection: 'holidays', db: 'production' } },
		{ actions: ['find', 'listIndexes', 'collStats'], resource: { collection: 'year_periods', db: 'production' } },
		{ actions: ['find', 'listIndexes', 'collStats'], resource: { collection: 'typologies', db: 'production' } },
		{ actions: ['find', 'listIndexes', 'collStats'], resource: { collection: 'lines', db: 'production' } },
		{ actions: ['find', 'listIndexes', 'collStats'], resource: { collection: 'routes', db: 'production' } },
		{ actions: ['find', 'listIndexes', 'collStats'], resource: { collection: 'patterns', db: 'production' } },
	],
	role: 'dgc-user',
	roles: [],
});
