/* * */

import { type Environment, getCurrentEnvironment } from '@tmlmobilidade/types';

/* * */

interface ModuleConfigGroup {
	api_port: number
	api_url: string
	cors_origin: RegExp | string | true
	frontend_port: null | number
	frontend_url: null | string
}

/* * */

const DEFAULT_PRD_CONFIG: Omit<ModuleConfigGroup, 'api_url' | 'frontend_url'> = {
	api_port: 5050,
	cors_origin: new RegExp(`https://go.tmlmobilidade.pt$`),
	frontend_port: 3000,
};

const DEFAULT_STG_CONFIG: Omit<ModuleConfigGroup, 'api_url' | 'frontend_url'> = {
	api_port: 5050,
	cors_origin: new RegExp(`https://*.go-stg.tmlmobilidade.pt$`),
	frontend_port: 3000,
};

const MODULE_CONFIGS: Record<string, Record<Environment, ModuleConfigGroup>> = {

	alerts: {
		dev: {
			api_port: 52001,
			api_url: 'http://localhost:52001',
			cors_origin: true,
			frontend_port: 51001,
			frontend_url: 'http://localhost:51001/alerts',
		},
		prd: {
			api_url: 'https://go.tmlmobilidade.pt/alerts/api',
			frontend_url: 'https://go.tmlmobilidade.pt/alerts',
			...DEFAULT_PRD_CONFIG,
		},
		stg: {
			api_url: `https://${process.env.ENVIRONMENT || process.env.NEXT_PUBLIC_ENVIRONMENT}.go-stg.tmlmobilidade.pt/alerts/api`,
			frontend_url: `https://${process.env.ENVIRONMENT || process.env.NEXT_PUBLIC_ENVIRONMENT}.go-stg.tmlmobilidade.pt/alerts`,
			...DEFAULT_STG_CONFIG,
		},
	},

	auth: {
		dev: {
			api_port: 52000,
			api_url: 'http://localhost:52000',
			cors_origin: true,
			frontend_port: 51000,
			frontend_url: 'http://localhost:51000/auth',
		},
		prd: {
			api_url: 'https://go.tmlmobilidade.pt/auth/api',
			frontend_url: 'https://go.tmlmobilidade.pt/auth',
			...DEFAULT_PRD_CONFIG,
		},
		stg: {
			api_url: `https://${process.env.ENVIRONMENT || process.env.NEXT_PUBLIC_ENVIRONMENT}.go-stg.tmlmobilidade.pt/auth/api`,
			frontend_url: `https://${process.env.ENVIRONMENT || process.env.NEXT_PUBLIC_ENVIRONMENT}.go-stg.tmlmobilidade.pt/auth`,
			...DEFAULT_STG_CONFIG,
		},
	},

	controller: {
		dev: {
			api_port: 52002,
			api_url: 'http://localhost:52002',
			cors_origin: true,
			frontend_port: 51002,
			frontend_url: 'http://localhost:51002/controller',
		},
		prd: {
			api_url: 'https://go.tmlmobilidade.pt/controller/api',
			frontend_url: 'https://go.tmlmobilidade.pt/controller',
			...DEFAULT_PRD_CONFIG,
		},
		stg: {
			api_url: `https://${process.env.ENVIRONMENT || process.env.NEXT_PUBLIC_ENVIRONMENT}.go-stg.tmlmobilidade.pt/controller/api`,
			frontend_url: `https://${process.env.ENVIRONMENT || process.env.NEXT_PUBLIC_ENVIRONMENT}.go-stg.tmlmobilidade.pt/controller`,
			...DEFAULT_STG_CONFIG,
		},
	},

	dates: {
		dev: {
			api_port: 52008,
			api_url: 'http://localhost:52008',
			cors_origin: true,
			frontend_port: 51008,
			frontend_url: 'http://localhost:51008/dates',
		},
		prd: {
			api_url: 'https://go.tmlmobilidade.pt/dates/api',
			frontend_url: 'https://go.tmlmobilidade.pt/dates',
			...DEFAULT_PRD_CONFIG,
		},
		stg: {
			api_url: `https://${process.env.ENVIRONMENT || process.env.NEXT_PUBLIC_ENVIRONMENT}.go-stg.tmlmobilidade.pt/dates/api`,
			frontend_url: `https://${process.env.ENVIRONMENT || process.env.NEXT_PUBLIC_ENVIRONMENT}.go-stg.tmlmobilidade.pt/dates`,
			...DEFAULT_STG_CONFIG,
		},
	},

	exporter: {
		dev: {
			api_port: 52007,
			api_url: 'http://localhost:52007',
			cors_origin: true,
			frontend_port: 51007,
			frontend_url: 'http://localhost:51007/exporter',
		},
		prd: {
			api_url: 'https://go.tmlmobilidade.pt/exporter/api',
			frontend_url: 'https://go.tmlmobilidade.pt/exporter',
			...DEFAULT_PRD_CONFIG,
		},
		stg: {
			api_url: `https://${process.env.ENVIRONMENT || process.env.NEXT_PUBLIC_ENVIRONMENT}.go-stg.tmlmobilidade.pt/exporter/api`,
			frontend_url: `https://${process.env.ENVIRONMENT || process.env.NEXT_PUBLIC_ENVIRONMENT}.go-stg.tmlmobilidade.pt/exporter`,
			...DEFAULT_STG_CONFIG,
		},
	},

	fleet: {
		dev: {
			api_port: 52009,
			api_url: 'http://localhost:52009',
			cors_origin: true,
			frontend_port: 51009,
			frontend_url: 'http://localhost:51009/fleet',
		},
		prd: {
			api_url: 'https://go.tmlmobilidade.pt/fleet/api',
			frontend_url: 'https://go.tmlmobilidade.pt/fleet',
			...DEFAULT_PRD_CONFIG,
		},
		stg: {
			api_url: `https://${process.env.ENVIRONMENT || process.env.NEXT_PUBLIC_ENVIRONMENT}.go-stg.tmlmobilidade.pt/fleet/api`,
			frontend_url: `https://${process.env.ENVIRONMENT || process.env.NEXT_PUBLIC_ENVIRONMENT}.go-stg.tmlmobilidade.pt/fleet`,
			...DEFAULT_STG_CONFIG,
		},
	},

	locations: {
		dev: {
			api_port: 52005,
			api_url: 'http://localhost:52005',
			cors_origin: true,
			frontend_port: 51005,
			frontend_url: 'http://localhost:51005/locations',
		},
		prd: {
			api_url: 'https://go.tmlmobilidade.pt/locations/api',
			frontend_url: 'https://go.tmlmobilidade.pt/locations',
			...DEFAULT_PRD_CONFIG,
		},
		stg: {
			api_url: `https://${process.env.ENVIRONMENT || process.env.NEXT_PUBLIC_ENVIRONMENT}.go-stg.tmlmobilidade.pt/locations/api`,
			frontend_url: `https://${process.env.ENVIRONMENT || process.env.NEXT_PUBLIC_ENVIRONMENT}.go-stg.tmlmobilidade.pt/locations`,
			...DEFAULT_STG_CONFIG,
		},
	},

	offer: {
		dev: {
			api_port: 52010,
			api_url: 'http://localhost:52010',
			cors_origin: true,
			frontend_port: 51010,
			frontend_url: 'http://localhost:51010/offer',
		},
		prd: {
			api_url: 'https://go.tmlmobilidade.pt/offer/api',
			frontend_url: 'https://go.tmlmobilidade.pt/offer',
			...DEFAULT_PRD_CONFIG,
		},
		stg: {
			api_url: `https://${process.env.ENVIRONMENT || process.env.NEXT_PUBLIC_ENVIRONMENT}.go-stg.tmlmobilidade.pt/offer/api`,
			frontend_url: `https://${process.env.ENVIRONMENT || process.env.NEXT_PUBLIC_ENVIRONMENT}.go-stg.tmlmobilidade.pt/offer`,
			...DEFAULT_STG_CONFIG,
		},
	},

	performance: {
		dev: {
			api_port: 52006,
			api_url: 'http://localhost:52006',
			cors_origin: true,
			frontend_port: 51006,
			frontend_url: 'http://localhost:51006/performance',
		},
		prd: {
			api_url: 'https://go.tmlmobilidade.pt/performance/api',
			frontend_url: 'https://go.tmlmobilidade.pt/performance',
			...DEFAULT_PRD_CONFIG,
		},
		stg: {
			api_url: `https://${process.env.ENVIRONMENT || process.env.NEXT_PUBLIC_ENVIRONMENT}.go-stg.tmlmobilidade.pt/performance/api`,
			frontend_url: `https://${process.env.ENVIRONMENT || process.env.NEXT_PUBLIC_ENVIRONMENT}.go-stg.tmlmobilidade.pt/performance`,
			...DEFAULT_STG_CONFIG,
		},
	},

	plans: {
		dev: {
			api_port: 52004,
			api_url: 'http://localhost:52004',
			cors_origin: true,
			frontend_port: 51004,
			frontend_url: 'http://localhost:51004/plans',
		},
		prd: {
			api_url: 'https://go.tmlmobilidade.pt/plans/api',
			frontend_url: 'https://go.tmlmobilidade.pt/plans',
			...DEFAULT_PRD_CONFIG,
		},
		stg: {
			api_url: `https://${process.env.ENVIRONMENT || process.env.NEXT_PUBLIC_ENVIRONMENT}.go-stg.tmlmobilidade.pt/plans/api`,
			frontend_url: `https://${process.env.ENVIRONMENT || process.env.NEXT_PUBLIC_ENVIRONMENT}.go-stg.tmlmobilidade.pt/plans`,
			...DEFAULT_STG_CONFIG,
		},
	},

	stops: {
		dev: {
			api_port: 52003,
			api_url: 'http://localhost:52003',
			cors_origin: true,
			frontend_port: 51003,
			frontend_url: 'http://localhost:51003/stops',
		},
		prd: {
			api_url: 'https://go.tmlmobilidade.pt/stops/api',
			frontend_url: 'https://go.tmlmobilidade.pt/stops',
			...DEFAULT_PRD_CONFIG,
		},
		stg: {
			api_url: `https://${process.env.ENVIRONMENT || process.env.NEXT_PUBLIC_ENVIRONMENT}.go-stg.tmlmobilidade.pt/stops/api`,
			frontend_url: `https://${process.env.ENVIRONMENT || process.env.NEXT_PUBLIC_ENVIRONMENT}.go-stg.tmlmobilidade.pt/stops`,
			...DEFAULT_STG_CONFIG,
		},
	},
} as const;

/* * */

/**
 * Retrieves the value of a specific property from the module configuration for a given module and environment.
 * @param module The module ID.
 * @param property The property of the module configuration to retrieve (e.g., 'api_url', 'frontend_url').
 * @param environment The environment to get the property for. If not provided, it will use the ENVIRONMENT environment variable.
 * @returns The value of the specified property for the given module and environment.
 */
export function getModuleConfig<Prop extends keyof ModuleConfigGroup>(module: keyof typeof MODULE_CONFIGS, property: Prop, environment?: Environment): ModuleConfigGroup[Prop] {
	// Get the desired module object
	const moduleObject = MODULE_CONFIGS[module];
	if (!moduleObject) throw new Error(`[@core/lib] Module Config Object for "${module}" module not found. Available modules: ${Object.keys(MODULE_CONFIGS).join(', ')}`);
	// Extract the current module environment either from the parameter
	// or automatically from the set environment variable.
	const currentEnvironment = environment || getCurrentEnvironment();
	// Get the config group for the current environment
	const configGroupForEnvironment = moduleObject[currentEnvironment] || moduleObject['stg'];
	// Get the property value from the config group
	const propertyValue = configGroupForEnvironment[property];
	if (propertyValue === undefined) throw new Error(`[@core/lib] Property "${property}" for module "${module}" in environment "${currentEnvironment}" not found. Available properties: ${Object.keys(configGroupForEnvironment).join(', ')}`);
	// Return the value
	return propertyValue;
}
