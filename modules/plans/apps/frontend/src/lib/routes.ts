export const PageRoutes = Object.freeze({
	HOME: '/',
	PLAN_DETAIL: (id: string) => `/plans/${id}`,
	PLAN_LIST: '/plans',
	VALIDATION_DETAIL: (id: string) => `/validations/${id}`,
	VALIDATION_LIST: '/validations',

	// Plans
	// Example: PLAN_DETAIL: (id: string) => `/plans/${id}`,
});

export const ApiRoutes = Object.freeze({
	// Common
	AUTH_API: (process.env.NEXT_PUBLIC_AUTH_URL ?? 'https://auth.sae.carrismetropolitana.pt') + '/api',
	CMET_API: process.env.NEXT_PUBLIC_CMET_API_URL ?? 'https://api.carrismetropolitana.pt/v2',

	// APP
	API: (path: string) => `/api${path}`,
});

export const Routes = Object.freeze({
	// Other
	...PageRoutes,
	...ApiRoutes,
});
