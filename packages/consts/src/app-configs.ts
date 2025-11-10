/* * */

import { type Environment, getCurrentEnvironment } from '@tmlmobilidade/types';

/* * */

interface AppConfigGroup {
	api_port: number
	api_url: string
	cookie_domain: string
	cors_origin: RegExp | string | true
	frontend_port: number
	frontend_url: string
}

/* * */

const DEFAULT_NON_DEV_CONFIG: Omit<AppConfigGroup, 'api_url' | 'frontend_url'> = {
	api_port: 5050,
	cookie_domain: '.go.tmlmobilidade.pt',
	cors_origin: new RegExp(`https://.*\\.go\\.tmlmobilidade\\.pt$`),
	frontend_port: 3000,
};

const APP_CONFIGS: Record<string, Record<Environment, AppConfigGroup>> = {

	alerts: {
		development: {
			api_port: 52001,
			api_url: 'http://localhost:52001/alerts/api',
			cookie_domain: 'localhost',
			cors_origin: true,
			frontend_port: 51001,
			frontend_url: 'http://localhost:51001/alerts',
		},
		production: {
			api_url: 'https://go.tmlmobilidade.pt/alerts/api',
			frontend_url: 'https://go.tmlmobilidade.pt/alerts',
			...DEFAULT_NON_DEV_CONFIG,
		},
		staging: {
			api_url: 'https://staging.go.tmlmobilidade.pt/alerts/api',
			frontend_url: 'https://staging.go.tmlmobilidade.pt/alerts',
			...DEFAULT_NON_DEV_CONFIG,
		},
	},

	auth: {
		development: {
			api_port: 52000,
			api_url: 'http://localhost:52000/auth/api',
			cookie_domain: 'localhost',
			cors_origin: true,
			frontend_port: 51000,
			frontend_url: 'http://localhost:51000/auth',
		},
		production: {
			api_url: 'https://go.tmlmobilidade.pt/auth/api',
			frontend_url: 'https://go.tmlmobilidade.pt/auth',
			...DEFAULT_NON_DEV_CONFIG,
		},
		staging: {
			api_url: 'https://staging.go.tmlmobilidade.pt/auth/api',
			frontend_url: 'https://staging.go.tmlmobilidade.pt/auth',
			...DEFAULT_NON_DEV_CONFIG,
		},
	},

	controller: {
		development: {
			api_port: 52002,
			api_url: 'http://localhost:52002/controller/api',
			cookie_domain: 'localhost',
			cors_origin: true,
			frontend_port: 51002,
			frontend_url: 'http://localhost:51002/controller',
		},
		production: {
			api_url: 'https://go.tmlmobilidade.pt/controller/api',
			frontend_url: 'https://go.tmlmobilidade.pt/controller',
			...DEFAULT_NON_DEV_CONFIG,
		},
		staging: {
			api_url: 'https://staging.go.tmlmobilidade.pt/controller/api',
			frontend_url: 'https://staging.go.tmlmobilidade.pt/controller',
			...DEFAULT_NON_DEV_CONFIG,
		},
	},

	locations: {
		development: {
			api_port: 52005,
			api_url: 'http://localhost:52005/locations/api',
			cookie_domain: 'localhost',
			cors_origin: true,
			frontend_port: 51005,
			frontend_url: 'http://localhost:51005/locations',
		},
		production: {
			api_url: 'https://go.tmlmobilidade.pt/locations/api',
			frontend_url: 'https://go.tmlmobilidade.pt/locations',
			...DEFAULT_NON_DEV_CONFIG,
		},
		staging: {
			api_url: 'https://staging.go.tmlmobilidade.pt/locations/api',
			frontend_url: 'https://staging.go.tmlmobilidade.pt/locations',
			...DEFAULT_NON_DEV_CONFIG,
		},
	},

	performance: {
		development: {
			api_port: 52006,
			api_url: 'http://localhost:52006/performance/api',
			cookie_domain: 'localhost',
			cors_origin: true,
			frontend_port: 51006,
			frontend_url: 'http://localhost:51006/performance',
		},
		production: {
			api_url: 'https://go.tmlmobilidade.pt/performance/api',
			frontend_url: 'https://go.tmlmobilidade.pt/performance',
			...DEFAULT_NON_DEV_CONFIG,
		},
		staging: {
			api_url: 'https://staging.go.tmlmobilidade.pt/performance/api',
			frontend_url: 'https://staging.go.tmlmobilidade.pt/performance',
			...DEFAULT_NON_DEV_CONFIG,
		},
	},

	plans: {
		development: {
			api_port: 52004,
			api_url: 'http://localhost:52004/plans/api',
			cookie_domain: 'localhost',
			cors_origin: true,
			frontend_port: 51004,
			frontend_url: 'http://localhost:51004/plans',
		},
		production: {
			api_url: 'https://go.tmlmobilidade.pt/plans/api',
			frontend_url: 'https://go.tmlmobilidade.pt/plans',
			...DEFAULT_NON_DEV_CONFIG,
		},
		staging: {
			api_url: 'https://staging.go.tmlmobilidade.pt/plans/api',
			frontend_url: 'https://staging.go.tmlmobilidade.pt/plans',
			...DEFAULT_NON_DEV_CONFIG,
		},
	},

	stops: {
		development: {
			api_port: 52003,
			api_url: 'http://localhost:52003/stops/api',
			cookie_domain: 'localhost',
			cors_origin: true,
			frontend_port: 51003,
			frontend_url: 'http://localhost:51003/stops',
		},
		production: {
			api_url: 'https://go.tmlmobilidade.pt/stops/api',
			frontend_url: 'https://go.tmlmobilidade.pt/stops',
			...DEFAULT_NON_DEV_CONFIG,
		},
		staging: {
			api_url: 'https://staging.go.tmlmobilidade.pt/stops/api',
			frontend_url: 'https://staging.go.tmlmobilidade.pt/stops',
			...DEFAULT_NON_DEV_CONFIG,
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
