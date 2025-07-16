export const PageRoutes = Object.freeze({
	ME: '/api/stops',
	STOPS_DETAIL: (id: string) => `/stops/${id}`,
	STOPS_LIST: '/stops',
	STOPS_NEW: '/stops/new',
});

export const ApiRoutes = Object.freeze({
	API: '/api',
	AUTH_API: process.env.NEXT_PUBLIC_AUTH_URL ?? 'https://auth.sae.carrismetropolitana.pt',
	CMET_API: process.env.NEXT_PUBLIC_CMET_API_URL ?? 'https://api.carrismetropolitana.pt/v2',
});

export const Routes = Object.freeze({
	URL: process.env.PUBLIC_URL ?? 'https://alerts.sae.carrismetropolitana.pt',
	...PageRoutes,
	...ApiRoutes,
});
