export const PageRoutes = Object.freeze({
	HOME: '/',
	STOP_DETAIL: (id: string) => `/stops/${id}`,
	STOP_FILE: (id: string) => `/stops/${id}/file`,
	STOP_IMAGE: (id: string) => `/stops/${id}/image`,
	STOP_LIST: '/stops',
	// Stops
	// Example: STOP_DETAIL: (id: string) => `/stops/${id}`,
});

export const ApiRoutes = Object.freeze({
	// Common
	AUTH_API: (process.env.NEXT_PUBLIC_AUTH_URL ?? 'https://auth.sae.carrismetropolitana.pt') + '/api',
	CMET_API: process.env.NEXT_PUBLIC_CMET_API_URL ?? 'https://api.carrismetropolitana.pt/v2',
	STOPS_API: '/api',

	// Page routes
	// Example: STOP_DETAIL_API: (id: string) => `/api/stops/${id}`,
});

export const Routes = Object.freeze({
	// Common
	AUTH_URL: process.env.NEXT_PUBLIC_AUTH_URL ?? 'https://auth.sae.carrismetropolitana.pt',
	URL: process.env.NEXT_PUBLIC_URL ?? 'https://stops.sae.carrismetropolitana.pt',

	// Other
	...PageRoutes,
	...ApiRoutes,
});
