export const PAGE_ROUTES = Object.freeze({
	/* * */
	/* ALERTS */
	alerts: {
		// ALERTS
		ALERTS_DETAIL: (id: string) => `/${id}`,

		// REALTIME
		REALTIME_DETAIL: (id: string) => `/realtime/${id}`,
		REALTIME_LIST: '/realtime',
		REALTIME_NEW_LIST: '/realtime/new',
	},

	/* * */
	/* AUTH */
	auth: {
		// AGENCIES
		AGENCIES_DETAIL: (id: string) => `/agencies/${id}`,
		AGENCIES_LIST: '/agencies',

		// HOME
		HOME_DETAIL: (id: string) => `/home/${id}`,
		HOME_LIST: '/home',

		// LOGIN
		LOGIN_LIST: '/login',

		// ORGANIZATIONS
		ORGANIZATIONS_DETAIL: (id: string) => `/organizations/${id}`,
		ORGANIZATIONS_LIST: '/organizations',

		// RESET_PASSWORD
		RESET_PASSWORD_LIST: '/reset-password',

		// ROLES
		ROLES_DETAIL: (id: string) => `/roles/${id}`,
		ROLES_LIST: '/roles',

		// USERS
		USERS_DETAIL: (id: string) => `/users/${id}`,
		USERS_LIST: '/users',

		// VERIFICATION
		VERIFICATION_LIST: '/verification',
	},

	/* * */
	/* CONTROLLER */
	controller: {
		// RIDES
		RIDES_DETAIL: (id: string) => `/rides/${id}`,
		RIDES_LIST: '/rides',
	},

	/* * */
	/* PERFORMANCE */
	performance: {
		// AREAS_1
		AREAS_1_LIST: '/areas/1',

		// AREAS_2
		AREAS_2_LIST: '/areas/2',

		// PERFORMANCE
		PERFORMANCE_LIST: '/',

		// SUPPLY_DEMAND_DEMAND_BY_LINE
		SUPPLY_DEMAND_DEMAND_BY_LINE_LIST: '/supply-demand/demand-by-line',

		// SUPPLY_DEMAND
		SUPPLY_DEMAND_LIST: '/supply-demand',

		// SUPPLY_DEMAND_OCCUPANCY_RATE
		SUPPLY_DEMAND_OCCUPANCY_RATE_LIST: '/supply-demand/occupancy-rate',
	},

	/* * */
	/* PLANS */
	plans: {
		// PLANS
		PLANS_DETAIL: (id: string) => `/${id}`,
		PLANS_LIST: '/',

		// VALIDATIONS
		VALIDATIONS_DETAIL: (id: string) => `/validations/${id}`,
		VALIDATIONS_LIST: '/validations',
	},

	/* * */
	/* STOPS */
	stops: {
		// STOPS
		STOPS_DETAIL: (id: string) => `/${id}`,
		STOPS_LIST: '/',
	},
} as const);

export const API_ROUTES = Object.freeze({
	/* * */
	/* ALERTS */
	alerts: {
		// ALERTS
		ALERTS_DETAIL: (id: string) => `/alerts/api/alerts/${id}`,
		ALERTS_DETAIL_IMAGE: (id: string) => `/alerts/api/alerts/${id}/image`,
		ALERTS_GTFS: '/alerts/api/alerts/gtfs',
		ALERTS_LIST: '/alerts/api/alerts',

		// RIDES
		RIDES_LIST: '/alerts/api/rides',
	},

	/* * */
	/* AUTH */
	auth: {
		// AGENCIES
		AGENCIES_DETAIL: (id: string) => `/auth/api/agencies/${id}`,
		AGENCIES_LIST: '/auth/api/agencies',

		// AUTH
		AUTH_CHANGE_PASSWORD: '/auth/api/auth/change-password',
		AUTH_LOGIN: '/auth/api/auth/login',
		AUTH_LOGOUT: '/auth/api/auth/logout',
		AUTH_PERMISSIONS: '/auth/api/auth/permissions',
		AUTH_VERIFY: '/auth/api/auth/verify',
		AUTH_VERIFY_EMAIL: '/auth/api/auth/verify-email',

		// FILE-EXPORTS
		FILE_EXPORTS_DETAIL_DOWNLOAD: (id: string) => `/auth/api/file-exports/${id}/download`,
		FILE_EXPORTS_LIST: '/auth/api/file-exports',

		// NOTIFICATIONS
		NOTIFICATIONS_DETAIL: (id: string) => `/auth/api/notifications/${id}`,
		NOTIFICATIONS_DETAIL_MARK_AS_READ: (id: string) => `/auth/api/notifications/${id}/mark-as-read`,
		NOTIFICATIONS_LIST: '/auth/api/notifications',

		// ORGANIZATIONS
		ORGANIZATIONS_DETAIL: (id: string) => `/auth/api/organizations/${id}`,
		ORGANIZATIONS_DETAIL_: (id: string) => `THEME_IMAGE:/auth/api/organizations/${id}/:theme/image`,
		ORGANIZATIONS_DETAIL_IMAGE: (id: string) => `/auth/api/organizations/${id}/image`,
		ORGANIZATIONS_DETAIL_LOGO: (id: string) => `/auth/api/organizations/${id}/logo`,
		ORGANIZATIONS_LIST: '/auth/api/organizations',

		// PROPOSED-CHANGES
		PROPOSED_CHANGES_DETAIL: (id: string) => `/auth/api/proposed-changes/${id}`,
		PROPOSED_CHANGES_LIST: '/auth/api/proposed-changes',

		// ROLES
		ROLES_DETAIL: (id: string) => `/auth/api/roles/${id}`,
		ROLES_LIST: '/auth/api/roles',

		// USERS
		USERS_DETAIL: (id: string) => `/auth/api/users/${id}`,
		USERS_LIST: '/auth/api/users',
		USERS_ME: '/auth/api/users/me',

		// WIKI
		WIKI_DETAIL: (id: string) => `/auth/api/wiki/${id}`,
		WIKI_LIST: '/auth/api/wiki',
	},

	/* * */
	/* CONTROLLER */
	controller: {
		// RIDE-ACCEPTANCE
		ACCEPTANCE_CHANGE_STATUS: (id: string) => `/controller/api/rides/${id}/acceptance/change-status`,
		ACCEPTANCE_COMMENT: (id: string) => `/controller/api/rides/${id}/acceptance/comment`,
		ACCEPTANCE_DETAIL: (id: string) => `/controller/api/rides/${id}/acceptance`,
		ACCEPTANCE_JUSTIFY: (id: string) => `/controller/api/rides/${id}/acceptance/justify`,
		ACCEPTANCE_LOCK: (id: string) => `/controller/api/rides/${id}/acceptance/lock`,

		// RIDES
		RIDES_DETAIL_HASHED_SHAPE: (id: string) => `/controller/api/rides/${id}/hashed-shape`,
		RIDES_DETAIL_HASHED_TRIP: (id: string) => `/controller/api/rides/${id}/hashed-trip`,
		RIDES_DETAIL_REPROCESS: (id: string) => `/controller/api/rides/${id}/reprocess`,
		RIDES_DETAIL_RIDE: (id: string) => `/controller/api/rides/${id}/ride`,
		RIDES_DETAIL_SIMPLIFIED_APEX_LOCATIONS: (id: string) => `/controller/api/rides/${id}/simplified-apex-locations`,
		RIDES_DETAIL_SIMPLIFIED_APEX_ON_BOARD_REFUNDS: (id: string) => `/controller/api/rides/${id}/simplified-apex-on-board-refunds`,
		RIDES_DETAIL_SIMPLIFIED_APEX_ON_BOARD_SALES: (id: string) => `/controller/api/rides/${id}/simplified-apex-on-board-sales`,
		RIDES_DETAIL_SIMPLIFIED_APEX_VALIDATIONS: (id: string) => `/controller/api/rides/${id}/simplified-apex-validations`,
		RIDES_DETAIL_VEHICLE_EVENTS: (id: string) => `/controller/api/rides/${id}/vehicle-events`,
		RIDES_LIST: '/controller/api/rides',
		RIDES_WS: '/controller/api/rides/ws',
	},

	/* * */
	/* LOCATIONS */
	locations: {
		// LOCATIONS
		LOCATIONS_COORDINATES: '/locations/api/locations/coordinates',
		LOCATIONS_DISTRICTS: '/locations/api/locations/districts',
		LOCATIONS_LOCALITIES: '/locations/api/locations/localities',
		LOCATIONS_MUNICIPALITIES: '/locations/api/locations/municipalities',
		LOCATIONS_PARISHES: '/locations/api/locations/parishes',
	},

	/* * */
	/* PERFORMANCE */
	performance: {
		// METRICS
		METRICS_: 'METRICNAME:/performance/api/metrics/:metricName',
	},

	/* * */
	/* PLANS */
	plans: {
		// PLANS
		PLANS_APPROVED: '/plans/api/plans/approved',
		PLANS_DETAIL: (id: string) => `/plans/api/plans/${id}`,
		PLANS_DETAIL_CHANGE_GTFS: (id: string) => `/plans/api/plans/${id}/change-gtfs`,
		PLANS_DETAIL_CONTROLLER_REPROCESS: (id: string) => `/plans/api/plans/${id}/controller-reprocess`,
		PLANS_DETAIL_OPERATION_FILE: (id: string) => `/plans/api/plans/${id}/operation-file`,
		PLANS_DETAIL_TOGGLE_LOCK: (id: string) => `/plans/api/plans/${id}/toggle-lock`,
		PLANS_DRT_MODEL_DB: '/plans/api/plans/drt-model.db',
		PLANS_LIST: '/plans/api/plans',

		// VALIDATIONS
		VALIDATIONS_DETAIL: (id: string) => `/plans/api/validations/${id}`,
		VALIDATIONS_DETAIL_FILE: (id: string) => `/plans/api/validations/${id}/file`,
		VALIDATIONS_DETAIL_REQUEST_APPROVAL: (id: string) => `/plans/api/validations/${id}/request-approval`,
		VALIDATIONS_LIST: '/plans/api/validations',
	},

	/* * */
	/* STOPS */
	stops: {
		// STOPS
		STOPS_DETAIL: (id: string) => `/stops/api/stops/${id}`,
		STOPS_LIST: '/stops/api/stops',
	},
} as const);
