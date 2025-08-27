export const PageRoutes = Object.freeze({
	ALERT_DETAIL: (id: string) => `/alerts/${id}`,
	ALERT_IMAGE: (id: string) => `/alerts/${id}/image`,
	ALERT_LIST: '/alerts',
	ME: '/api/users/me',
	REALTIME_DETAIL: (id: string) => `/realtime/${id}`,
	REALTIME_IMAGE: (id: string) => `/realtime/${id}/image`,
	REALTIME_LIST: '/realtime',
});

export const ApiRoutes = Object.freeze({
	ALERTS_API: '/api',
	CMET_API: process.env.NEXT_PUBLIC_CMET_API_URL ?? 'https://api.carrismetropolitana.pt/v2',
});

export const Routes = Object.freeze({
	URL: process.env.PUBLIC_URL ?? 'https://alerts.sae.carrismetropolitana.pt',
	...PageRoutes,
	...ApiRoutes,
});
