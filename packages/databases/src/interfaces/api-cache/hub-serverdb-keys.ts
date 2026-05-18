/* * */

export const SERVERDB_KEYS = Object.freeze({
	FACILITIES: {
		BOAT_STATIONS: 'facilities:boat_stations',
		HELPDESKS: 'facilities:helpdesks',
		LIGHT_RAIL_STATIONS: 'facilities:light_rail_stations',
		PIPS: 'facilities:pips',
		SCHOOLS: 'facilities:schools',
		STORES: 'facilities:stores',
		SUBWAY_STATIONS: 'facilities:subway_stations',
		TRAIN_STATIONS: 'facilities:train_stations',
	},
	LOCATIONS: {
		DISTRICTS: 'locations:districts',
		LOCALITIES: 'locations:localities',
		MUNICIPALITIES: 'locations:municipalities',
		PARISHES: 'locations:parishes',
		REGIONS: 'locations:regions',
	},
	NETWORK: {
		ALERTS: {
			ALL: 'network:alerts:all',
			PROTOBUF: 'network:alerts:protobuf',
			SENT_NOTIFICATIONS: 'network:alerts:sent_notifications',
		},
		DATES: 'network:dates',
		LINES: 'network:lines',
		PATTERNS: {
			BASE: 'network:patterns',
			ID: (id: string) => `network:patterns:${id}`,
		},
		PERIODS: 'network:periods',
		PLANS: 'network:plans',
		ROUTES: 'network:routes',
		SHAPES: {
			BASE: 'network:shapes',
			ID: (id: string) => `network:shapes:${id}`,
		},
		STOPS: 'network:stops',
		VEHICLES: {
			ALL: 'network:vehicles:all',
			PROTOBUF: 'network:vehicles:protobuf',
		},
	},
});
