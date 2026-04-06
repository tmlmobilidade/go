/* * */

import { type Environment, getCurrentEnvironment } from '@tmlmobilidade/types';

/* * */

interface AppConfigGroup {
	api_port: number
	api_url: string
	cors_origin: RegExp | string | true
	frontend_port: null | number
	frontend_url: null | string
}

/* * */

const DEFAULT_PRODUCTION_CONFIG: Omit<AppConfigGroup, 'api_url' | 'frontend_url'> = {
	api_port: 5050,
	cors_origin: new RegExp(`https://go.tmlmobilidade.pt$`),
	frontend_port: 3000,
};

const DEFAULT_STAGING_CONFIG: Omit<AppConfigGroup, 'api_url' | 'frontend_url'> = {
	api_port: 5050,
	cors_origin: new RegExp(`https://go-stg.tmlmobilidade.pt$`),
	frontend_port: 3000,
};

const APP_CONFIGS: Record<string, Record<Environment, AppConfigGroup>> = {

	alerts: {
		development: {
			api_port: 52001,
			api_url: 'http://localhost:52001',
			cors_origin: true,
			frontend_port: 51001,
			frontend_url: 'http://localhost:51001/alerts',
		},
		production: {
			api_url: 'https://go.tmlmobilidade.pt/alerts/api',
			frontend_url: 'https://go.tmlmobilidade.pt/alerts',
			...DEFAULT_PRODUCTION_CONFIG,
		},
		staging: {
			api_url: 'https://go-stg.tmlmobilidade.pt/alerts/api',
			frontend_url: 'https://go-stg.tmlmobilidade.pt/alerts',
			...DEFAULT_STAGING_CONFIG,
		},
	},

	auth: {
		development: {
			api_port: 52000,
			api_url: 'http://localhost:52000',
			cors_origin: true,
			frontend_port: 51000,
			frontend_url: 'http://localhost:51000/auth',
		},
		production: {
			api_url: 'https://go.tmlmobilidade.pt/auth/api',
			frontend_url: 'https://go.tmlmobilidade.pt/auth',
			...DEFAULT_PRODUCTION_CONFIG,
		},
		staging: {
			api_url: 'https://go-stg.tmlmobilidade.pt/auth/api',
			frontend_url: 'https://go-stg.tmlmobilidade.pt/auth',
			...DEFAULT_STAGING_CONFIG,
		},
	},

	controller: {
		development: {
			api_port: 52002,
			api_url: 'http://localhost:52002',
			cors_origin: true,
			frontend_port: 51002,
			frontend_url: 'http://localhost:51002/controller',
		},
		production: {
			api_url: 'https://go.tmlmobilidade.pt/controller/api',
			frontend_url: 'https://go.tmlmobilidade.pt/controller',
			...DEFAULT_PRODUCTION_CONFIG,
		},
		staging: {
			api_url: 'https://go-stg.tmlmobilidade.pt/controller/api',
			frontend_url: 'https://go-stg.tmlmobilidade.pt/controller',
			...DEFAULT_STAGING_CONFIG,
		},
	},

	dates: {
		development: {
			api_port: 52008,
			api_url: 'http://localhost:52008',
			cors_origin: true,
			frontend_port: 51008,
			frontend_url: 'http://localhost:51008/dates',
		},
		production: {
			api_url: 'https://go.tmlmobilidade.pt/dates/api',
			frontend_url: 'https://go.tmlmobilidade.pt/dates',
			...DEFAULT_PRODUCTION_CONFIG,
		},
		staging: {
			api_url: 'https://go-stg.tmlmobilidade.pt/dates/api',
			frontend_url: 'https://go-stg.tmlmobilidade.pt/dates',
			...DEFAULT_STAGING_CONFIG,
		},
	},

	exporter: {
		development: {
			api_port: 52007,
			api_url: 'http://localhost:52007',
			cors_origin: true,
			frontend_port: 51007,
			frontend_url: 'http://localhost:51007/exporter',
		},
		production: {
			api_url: 'https://go.tmlmobilidade.pt/exporter/api',
			frontend_url: 'https://go.tmlmobilidade.pt/exporter',
			...DEFAULT_PRODUCTION_CONFIG,
		},
		staging: {
			api_url: 'https://go-stg.tmlmobilidade.pt/exporter/api',
			frontend_url: 'https://go-stg.tmlmobilidade.pt/exporter',
			...DEFAULT_STAGING_CONFIG,
		},
	},

	fleet: {
		development: {
			api_port: 52009,
			api_url: 'http://localhost:52009',
			cors_origin: true,
			frontend_port: 51009,
			frontend_url: 'http://localhost:51009/fleet',
		},
		production: {
			api_url: 'https://go.tmlmobilidade.pt/fleet/api',
			frontend_url: 'https://go.tmlmobilidade.pt/fleet',
			...DEFAULT_PRODUCTION_CONFIG,
		},
		staging: {
			api_url: 'https://go-stg.tmlmobilidade.pt/fleet/api',
			frontend_url: 'https://go-stg.tmlmobilidade.pt/fleet',
			...DEFAULT_STAGING_CONFIG,
		},
	},

	locations: {
		development: {
			api_port: 52005,
			api_url: 'http://localhost:52005',
			cors_origin: true,
			frontend_port: 51005,
			frontend_url: 'http://localhost:51005/locations',
		},
		production: {
			api_url: 'https://go.tmlmobilidade.pt/locations/api',
			frontend_url: 'https://go.tmlmobilidade.pt/locations',
			...DEFAULT_PRODUCTION_CONFIG,
		},
		staging: {
			api_url: 'https://go-stg.tmlmobilidade.pt/locations/api',
			frontend_url: 'https://go-stg.tmlmobilidade.pt/locations',
			...DEFAULT_STAGING_CONFIG,
		},
	},

	offer: {
		development: {
			api_port: 52010,
			api_url: 'http://localhost:52010',
			cors_origin: true,
			frontend_port: 51010,
			frontend_url: 'http://localhost:51010/offer',
		},
		production: {
			api_url: 'https://go.tmlmobilidade.pt/offer/api',
			frontend_url: 'https://go.tmlmobilidade.pt/offer',
			...DEFAULT_PRODUCTION_CONFIG,
		},
		staging: {
			api_url: 'https://go-stg.tmlmobilidade.pt/offer/api',
			frontend_url: 'https://go-stg.tmlmobilidade.pt/offer',
			...DEFAULT_STAGING_CONFIG,
		},
	},

	performance: {
		development: {
			api_port: 52006,
			api_url: 'http://localhost:52006',
			cors_origin: true,
			frontend_port: 51006,
			frontend_url: 'http://localhost:51006/performance',
		},
		production: {
			api_url: 'https://go.tmlmobilidade.pt/performance/api',
			frontend_url: 'https://go.tmlmobilidade.pt/performance',
			...DEFAULT_PRODUCTION_CONFIG,
		},
		staging: {
			api_url: 'https://go-stg.tmlmobilidade.pt/performance/api',
			frontend_url: 'https://go-stg.tmlmobilidade.pt/performance',
			...DEFAULT_STAGING_CONFIG,
		},
	},

	plans: {
		development: {
			api_port: 52004,
			api_url: 'http://localhost:52004',
			cors_origin: true,
			frontend_port: 51004,
			frontend_url: 'http://localhost:51004/plans',
		},
		production: {
			api_url: 'https://go.tmlmobilidade.pt/plans/api',
			frontend_url: 'https://go.tmlmobilidade.pt/plans',
			...DEFAULT_PRODUCTION_CONFIG,
		},
		staging: {
			api_url: 'https://go-stg.tmlmobilidade.pt/plans/api',
			frontend_url: 'https://go-stg.tmlmobilidade.pt/plans',
			...DEFAULT_STAGING_CONFIG,
		},
	},

	stops: {
		development: {
			api_port: 52003,
			api_url: 'http://localhost:52003',
			cors_origin: true,
			frontend_port: 51003,
			frontend_url: 'http://localhost:51003/stops',
		},
		production: {
			api_url: 'https://go.tmlmobilidade.pt/stops/api',
			frontend_url: 'https://go.tmlmobilidade.pt/stops',
			...DEFAULT_PRODUCTION_CONFIG,
		},
		staging: {
			api_url: 'https://go-stg.tmlmobilidade.pt/stops/api',
			frontend_url: 'https://go-stg.tmlmobilidade.pt/stops',
			...DEFAULT_STAGING_CONFIG,
		},
	},
} as const;

/* * */

/**
 * Retrieves the value of a specific property from the app configuration for a given app and environment.
 * @param app The app ID.
 * @param property The property of the app configuration to retrieve (e.g., 'api_url', 'frontend_url').
 * @param environment The environment to get the property for. If not provided, it will use the ENVIRONMENT environment variable.
 * @returns The value of the specified property for the given app and environment.
 */
export function getAppConfig<Prop extends keyof AppConfigGroup>(app: keyof typeof APP_CONFIGS, property: Prop, environment?: Environment): AppConfigGroup[Prop] {
	// Get the desired app object
	const appObject = APP_CONFIGS[app];
	if (!appObject) throw new Error(`[@core/lib] App Config Object for "${app}" app not found. Available apps: ${Object.keys(APP_CONFIGS).join(', ')}`);
	// Extract the current app environment either from the parameter
	// or automatically from the set environment variable.
	const currentEnvironment = environment || getCurrentEnvironment();
	// Get the config group for the current environment
	const configGroupForEnvironment = appObject[currentEnvironment];
	if (!configGroupForEnvironment) throw new Error(`[@core/lib] AppConfig group for app "${app}" in environment "${currentEnvironment}" environment not found. Available environments: ${Object.keys(appObject).join(', ')}`);
	// Get the property value from the config group
	const propertyValue = configGroupForEnvironment[property];
	if (propertyValue === undefined) throw new Error(`[@core/lib] Property "${property}" for app "${app}" in environment "${currentEnvironment}" not found. Available properties: ${Object.keys(configGroupForEnvironment).join(', ')}`);
	// Return the value
	return propertyValue;
}
