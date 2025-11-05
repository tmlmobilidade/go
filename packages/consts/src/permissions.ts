/* * */

import { AlertPermissionSchema, GtfsValidationPermissionSchema, NotificationSchema, PlanPermissionSchema, RidePermissionSchema } from '@go/types';

/* * */

export const ALLOW_ALL_FLAG = 'allow_all';

/* * */

export const Permissions = Object.freeze({
	agencies: {
		actions: {
			create: 'create',
			delete: 'delete',
			read: 'read',
			toggle_lock: 'toggle_lock',
			update: 'update',
		},
		resources: {},
		scope: 'agencies',
	},
	alerts: {
		actions: {
			create: 'create',
			delete: 'delete',
			read: 'read',
			toggle_lock: 'toggle_lock',
			update: 'update',
		},
		resources: {},
		scope: 'alerts',
	},
	alerts_realtime: {
		actions: {
			create: 'create',
			delete: 'delete',
			read: 'read',
			toggle_lock: 'toggle_lock',
			update: 'update',
		},
		resources: AlertPermissionSchema.shape,
		scope: 'alerts_realtime',
	},
	home: {
		actions: {
			read_links: 'read_links',
			read_wiki: 'read_wiki',
		},
		resources: {},
		scope: 'home',
	},
	organizations: {
		actions: {
			create: 'create',
			delete: 'delete',
			read: 'read',
			update: 'update',
		},
		scope: 'organizations',
	},
	performance: {
		actions: {
			read: 'read',
		},
		resources: {},
		scope: 'performance',
	},
	plans: {
		actions: {
			create: 'create',
			delete: 'delete',
			read: 'read',
			read_controller: 'read_controller',
			read_pcgi_legacy: 'pcgi_legacy_read',
			toggle_lock: 'toggle_lock',
			update: 'update',
			update_controller: 'update_controller',
			update_feed_info_dates: 'update_feed_info_dates',
			update_gtfs_plan: 'update_gtfs_plan',
			update_pcgi_legacy: 'update_pcgi_legacy',
		},
		resources: PlanPermissionSchema.shape,
		scope: 'plans',
	},
	proposed_changes: {
		actions: {
			approve: 'approve',
			create: 'create',
			read: 'read',
			reject: 'reject',
		},
		resources: {
		},
		scope: 'proposed_changes',
	},
	rides: {
		actions: {
			acceptance_change_status: 'acceptance_change_status',
			acceptance_justify: 'acceptance_justify',
			acceptance_lock: 'acceptance_lock',
			acceptance_read: 'acceptance_read',
			analsys_lock: 'analsys_lock',
			analysis_lock: 'analysis_lock',
			analysis_read: 'analysis_read',
			analysis_reprocess: 'analysis_reprocess',
			analysis_update: 'analysis_update',
			audit_lock: 'audit_lock',
			audit_read: 'audit_read',
			audit_update: 'audit_update',
		},
		resources: RidePermissionSchema.shape,
		scope: 'rides',
	},
	roles: {
		actions: {
			create: 'create',
			delete: 'delete',
			read: 'read',
			update: 'update',
		},
		resources: {},
		scope: 'roles',
	},
	stops: {
		actions: {
			create: 'create',
			delete: 'delete',
			read: 'read',
			toggle_lock: 'toggle_lock',
			update: 'update',
		},
		resources: {},
		scope: 'stops',
	},
	topics: {
		actions: {
			acceptance_state_modified: 'acceptance_state_modified',
			active_plan: 'active_plan',
			approved_plan: 'approved_plan',
			approved_validation: 'approved_validation',
			concluded_validation: 'plan_continue_validation',
			created_alert: 'created_alert',
			created_plan: 'created_plan',
			new_comentary_network_acceptance: 'new_comentary_network_acceptance',
			ride_requires_justification: 'ride_requires_justification',
			sent_validation: 'sent_validation',
			submit_justification: 'justification_submit',
			submit_plan: 'plan_submit',
		},
		resources: NotificationSchema.shape,
		scope: 'notifications',
	},
	users: {
		actions: {
			create: 'create',
			delete: 'delete',
			read: 'read',
			update: 'update',
		},
		resources: {},
		scope: 'users',
	},
	validations: {
		actions: {
			create: 'create',
			read: 'read',
			request_approval: 'request_approval',
		},
		resources: GtfsValidationPermissionSchema.shape,
		scope: 'validations',
	},
});
