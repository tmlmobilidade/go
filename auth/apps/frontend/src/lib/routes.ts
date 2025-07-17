export const PageRoutes = Object.freeze({
	// Agencies
	AGENCY_DETAIL: (id: string) => `/agencies/${id}`,
	AGENCY_LIST: '/agencies',

	// Auth
	LOGIN: '/login',
	LOGOUT: '/logout',
	RESET_PASSWORD: '/reset-password',

	//
	ME: '/users/me',
	ROLE_DETAIL: (id: string) => `/roles/${id}`,
	ROLES: '/roles',
	USER_DETAIL: (id: string) => `/users/${id}`,

	USERS: '/users',
} as const);

export const ApiRoutes = Object.freeze({
	AUTH_API: '/api',
	CMET_API: process.env.NEXT_PUBLIC_CMET_API_URL ?? 'https://api.carrismetropolitana.pt/v2',

	// APP
	API: (path: string) => `/api${path}`,
});

export const Routes = Object.freeze({
	URL: process.env.NEXT_PUBLIC_URL ?? 'https://auth.sae.carrismetropolitana.pt',
	...PageRoutes,
	...ApiRoutes,
});
