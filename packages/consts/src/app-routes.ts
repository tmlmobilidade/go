export const PAGE_ROUTES = Object.freeze({
	/* * */
	/* ALERTS */
	alerts: {
		// ALERTS
		ALERTS_DETAIL: (id: string) => `/alerts/alerts/${id}`,
		// ALERTS
		ALERTS_LIST: '/alerts/alerts',
		// REALTIME
		REALTIME_DETAIL: (id: string) => `/alerts/realtime/${id}`,
		// REALTIME
		REALTIME_LIST: '/alerts/realtime',
		// REALTIME_NEW
		REALTIME_NEW_LIST: '/alerts/realtime/new',
	},

	/* * */
	/* AUTH */
	auth: {
		// AGENCIES
		AGENCIES_DETAIL: (id: string) => `/auth/agencies/${id}`,
		// AGENCIES
		AGENCIES_LIST: '/auth/agencies',
		// HOME
		HOME_DETAIL: (id: string) => `/auth/home/${id}`,
		// HOME
		HOME_LIST: '/auth/home',
		// LOGIN
		LOGIN_LIST: '/auth/login',
		// ORGANIZATIONS
		ORGANIZATIONS_DETAIL: (id: string) => `/auth/organizations/${id}`,
		// ORGANIZATIONS
		ORGANIZATIONS_LIST: '/auth/organizations',
		// RESET_PASSWORD
		RESET_PASSWORD_LIST: '/auth/reset-password',
		// ROLES
		ROLES_DETAIL: (id: string) => `/auth/roles/${id}`,
		// ROLES
		ROLES_LIST: '/auth/roles',
		// USERS
		USERS_DETAIL: (id: string) => `/auth/users/${id}`,
		// USERS
		USERS_LIST: '/auth/users',
		// VERIFICATION
		VERIFICATION_LIST: '/auth/verification',
	},

	/* * */
	/* CONTROLLER */
	controller: {
		// RIDES
		RIDES_DETAIL: (id: string) => `/controller/rides/${id}`,
		// RIDES
		RIDES_LIST: '/controller/rides',
	},

	/* * */
	/* PERFORMANCE */
	performance: {
		// PERFORMANCE_AREAS_1
		PERFORMANCE_AREAS_1_LIST: '/performance/performance/areas/1',
		// PERFORMANCE_AREAS_2
		PERFORMANCE_AREAS_2_LIST: '/performance/performance/areas/2',
		// PERFORMANCE
		PERFORMANCE_LIST: '/performance/performance',
		// PERFORMANCE_SUPPLY_DEMAND_DEMAND_BY_LINE
		PERFORMANCE_SUPPLY_DEMAND_DEMAND_BY_LINE_LIST: '/performance/performance/supply-demand/demand-by-line',
		// PERFORMANCE_SUPPLY_DEMAND
		PERFORMANCE_SUPPLY_DEMAND_LIST: '/performance/performance/supply-demand',
		// PERFORMANCE_SUPPLY_DEMAND_OCCUPANCY_RATE
		PERFORMANCE_SUPPLY_DEMAND_OCCUPANCY_RATE_LIST: '/performance/performance/supply-demand/occupancy-rate',
	},

	/* * */
	/* PLANS */
	plans: {
		// PLANS
		PLANS_DETAIL: (id: string) => `/plans/plans/${id}`,
		// PLANS
		PLANS_LIST: '/plans/plans',
		// VALIDATIONS
		VALIDATIONS_DETAIL: (id: string) => `/plans/validations/${id}`,
		// VALIDATIONS
		VALIDATIONS_LIST: '/plans/validations',
	},

	/* * */
	/* STOPS */
	stops: {
		// STOPS
		STOPS_DETAIL: (id: string) => `/stops/stops/${id}`,
		// STOPS
		STOPS_LIST: '/stops/stops',
	},
} as const);

export const API_ROUTES = Object.freeze({
	/* * */
	/* ALERTS */
	alerts: {
		// ALERTS
		ALERTS_DETAIL: (id: string) => `/alerts/api/alerts/${id}`,
		// ALERTS_DETAIL_IMAGE
		ALERTS_DETAIL_IMAGE: (id: string) => `/alerts/api/alerts/${id}/image`,
		// ALERTS_GTFS
		ALERTS_GTFS: '/alerts/api/alerts/gtfs',
		// ALERTS
		ALERTS_LIST: '/alerts/api/alerts',
		// RIDES
		RIDES_LIST: '/alerts/api/rides',
	},

	/* * */
	/* AUTH */
	auth: {
		// AGENCIES
		AGENCIES_DETAIL: (id: string) => `/auth/api/agencies/${id}`,
		// AGENCIES
		AGENCIES_LIST: '/auth/api/agencies',
		// AUTH_CHANGE_PASSWORD
		AUTH_CHANGE_PASSWORD: '/auth/api/auth/change-password',
		// AUTH_LOGIN
		AUTH_LOGIN: '/auth/api/auth/login',
		// AUTH_LOGOUT
		AUTH_LOGOUT: '/auth/api/auth/logout',
		// AUTH_PERMISSIONS
		AUTH_PERMISSIONS: '/auth/api/auth/permissions',
		// AUTH_VERIFY
		AUTH_VERIFY: '/auth/api/auth/verify',
		// AUTH_VERIFY_EMAIL
		AUTH_VERIFY_EMAIL: '/auth/api/auth/verify-email',
		// FILE_EXPORTS_DETAIL_DOWNLOAD
		FILE_EXPORTS_DETAIL_DOWNLOAD: (id: string) => `/auth/api/file-exports/${id}/download`,
		// FILE_EXPORTS
		FILE_EXPORTS_LIST: '/auth/api/file-exports',
		// NOTIFICATIONS
		NOTIFICATIONS_DETAIL: (id: string) => `/auth/api/notifications/${id}`,
		// NOTIFICATIONS_DETAIL_MARK_AS_READ
		NOTIFICATIONS_DETAIL_MARK_AS_READ: (id: string) => `/auth/api/notifications/${id}/mark-as-read`,
		// NOTIFICATIONS
		NOTIFICATIONS_LIST: '/auth/api/notifications',
		// ORGANIZATIONS
		ORGANIZATIONS_DETAIL: (id: string) => `/auth/api/organizations/${id}`,
		// ORGANIZATIONS_DETAIL_
		ORGANIZATIONS_DETAIL_: (id: string) => `THEME_IMAGE:/auth/api/organizations/${id}/:theme/image`,
		// ORGANIZATIONS_DETAIL_IMAGE
		ORGANIZATIONS_DETAIL_IMAGE: (id: string) => `/auth/api/organizations/${id}/image`,
		// ORGANIZATIONS_DETAIL_LOGO
		ORGANIZATIONS_DETAIL_LOGO: (id: string) => `/auth/api/organizations/${id}/logo`,
		// ORGANIZATIONS
		ORGANIZATIONS_LIST: '/auth/api/organizations',
		// PROPOSED_CHANGES
		PROPOSED_CHANGES_DETAIL: (id: string) => `/auth/api/proposed-changes/${id}`,
		// PROPOSED_CHANGES
		PROPOSED_CHANGES_LIST: '/auth/api/proposed-changes',
		// ROLES
		ROLES_DETAIL: (id: string) => `/auth/api/roles/${id}`,
		// ROLES
		ROLES_LIST: '/auth/api/roles',
		// USERS
		USERS_DETAIL: (id: string) => `/auth/api/users/${id}`,
		// USERS
		USERS_LIST: '/auth/api/users',
		// USERS_ME
		USERS_ME: '/auth/api/users/me',
		// WIKI
		WIKI_DETAIL: (id: string) => `/auth/api/wiki/${id}`,
		// WIKI
		WIKI_LIST: '/auth/api/wiki',
	},

	/* * */
	/* CONTROLLER */
	controller: {
		// RIDES_DETAIL_HASHED_SHAPE
		RIDES_DETAIL_HASHED_SHAPE: (id: string) => `/controller/api/rides/${id}/hashed-shape`,
		// RIDES_DETAIL_HASHED_TRIP
		RIDES_DETAIL_HASHED_TRIP: (id: string) => `/controller/api/rides/${id}/hashed-trip`,
		// RIDES_DETAIL_REPROCESS
		RIDES_DETAIL_REPROCESS: (id: string) => `/controller/api/rides/${id}/reprocess`,
		// RIDES_DETAIL_RIDE
		RIDES_DETAIL_RIDE: (id: string) => `/controller/api/rides/${id}/ride`,
		// RIDES_DETAIL_SIMPLIFIED_APEX_LOCATIONS
		RIDES_DETAIL_SIMPLIFIED_APEX_LOCATIONS: (id: string) => `/controller/api/rides/${id}/simplified-apex-locations`,
		// RIDES_DETAIL_SIMPLIFIED_APEX_ON_BOARD_REFUNDS
		RIDES_DETAIL_SIMPLIFIED_APEX_ON_BOARD_REFUNDS: (id: string) => `/controller/api/rides/${id}/simplified-apex-on-board-refunds`,
		// RIDES_DETAIL_SIMPLIFIED_APEX_ON_BOARD_SALES
		RIDES_DETAIL_SIMPLIFIED_APEX_ON_BOARD_SALES: (id: string) => `/controller/api/rides/${id}/simplified-apex-on-board-sales`,
		// RIDES_DETAIL_SIMPLIFIED_APEX_VALIDATIONS
		RIDES_DETAIL_SIMPLIFIED_APEX_VALIDATIONS: (id: string) => `/controller/api/rides/${id}/simplified-apex-validations`,
		// RIDES_DETAIL_VEHICLE_EVENTS
		RIDES_DETAIL_VEHICLE_EVENTS: (id: string) => `/controller/api/rides/${id}/vehicle-events`,
		// RIDES
		RIDES_LIST: '/controller/api/rides',
		// RIDES_WS
		RIDES_WS: '/controller/api/rides/ws',
		// RIDE_ACCEPTANCE_CHANGE_STATUS
		RIDE_ACCEPTANCE_CHANGE_STATUS: '/controller/api/ride-acceptance/change-status',
		// RIDE_ACCEPTANCE_COMMENT
		RIDE_ACCEPTANCE_COMMENT: '/controller/api/ride-acceptance/comment',
		// RIDE_ACCEPTANCE_JUSTIFY
		RIDE_ACCEPTANCE_JUSTIFY: '/controller/api/ride-acceptance/justify',
		// RIDE_ACCEPTANCE
		RIDE_ACCEPTANCE_LIST: '/controller/api/ride-acceptance',
		// RIDE_ACCEPTANCE_LOCK
		RIDE_ACCEPTANCE_LOCK: '/controller/api/ride-acceptance/lock',
	},

	/* * */
	/* LOCATIONS */
	locations: {
		// LOCATIONS_COORDINATES
		LOCATIONS_COORDINATES: '/locations/api/locations/coordinates',
		// LOCATIONS_DISTRICTS
		LOCATIONS_DISTRICTS: '/locations/api/locations/districts',
		// LOCATIONS_LOCALITIES
		LOCATIONS_LOCALITIES: '/locations/api/locations/localities',
		// LOCATIONS_MUNICIPALITIES
		LOCATIONS_MUNICIPALITIES: '/locations/api/locations/municipalities',
		// LOCATIONS_PARISHES
		LOCATIONS_PARISHES: '/locations/api/locations/parishes',
	},

	/* * */
	/* PERFORMANCE */
	performance: {
		// METRICS_
		METRICS_: 'METRICNAME:/performance/api/metrics/:metricName',
	},

	/* * */
	/* PLANS */
	plans: {
		// PLANS_APPROVED
		PLANS_APPROVED: '/plans/api/plans/approved',
		// PLANS
		PLANS_DETAIL: (id: string) => `/plans/api/plans/${id}`,
		// PLANS_DETAIL_CHANGE_GTFS
		PLANS_DETAIL_CHANGE_GTFS: (id: string) => `/plans/api/plans/${id}/change-gtfs`,
		// PLANS_DETAIL_CONTROLLER_REPROCESS
		PLANS_DETAIL_CONTROLLER_REPROCESS: (id: string) => `/plans/api/plans/${id}/controller-reprocess`,
		// PLANS_DETAIL_OPERATION_FILE
		PLANS_DETAIL_OPERATION_FILE: (id: string) => `/plans/api/plans/${id}/operation-file`,
		// PLANS_DETAIL_TOGGLE_LOCK
		PLANS_DETAIL_TOGGLE_LOCK: (id: string) => `/plans/api/plans/${id}/toggle-lock`,
		// PLANS_DRT_MODEL_DB
		PLANS_DRT_MODEL_DB: '/plans/api/plans/drt-model.db',
		// PLANS
		PLANS_LIST: '/plans/api/plans',
		// VALIDATIONS
		VALIDATIONS_DETAIL: (id: string) => `/plans/api/validations/${id}`,
		// VALIDATIONS_DETAIL_FILE
		VALIDATIONS_DETAIL_FILE: (id: string) => `/plans/api/validations/${id}/file`,
		// VALIDATIONS_DETAIL_REQUEST_APPROVAL
		VALIDATIONS_DETAIL_REQUEST_APPROVAL: (id: string) => `/plans/api/validations/${id}/request-approval`,
		// VALIDATIONS
		VALIDATIONS_LIST: '/plans/api/validations',
	},

	/* * */
	/* STOPS */
	stops: {
		// STOPS
		STOPS_DETAIL: (id: string) => `/stops/api/stops/${id}`,
		// STOPS
		STOPS_LIST: '/stops/api/stops',
	},
} as const);
