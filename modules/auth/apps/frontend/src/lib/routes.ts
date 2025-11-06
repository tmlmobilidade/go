export const PageRoutes = Object.freeze({
	// Agencies
	AGENCY_DETAIL: (id: string) => `/agencies/${id}`,
	AGENCY_LIST: '/agencies',

	// Organizations
	ORGANIZATION_DETAIL: (id: string) => `/organizations/${id}`,
	ORGANIZATION_IMAGE: (id: string, theme: string) => `/organizations/${id}/${theme}/image`,
	ORGANIZATION_IMAGE_NO_THEME: (id: string) => `/organizations/${id}/image`,
	ORGANIZATION_LIST: '/organizations',
	ORGANIZATION_LOGO: (id: string) => `/organizations/${id}/logo`,

	// Auth
	LOGIN: '/auth/login',
	LOGOUT: '/auth/logout',
	RESET_PASSWORD: '/auth/reset-password',

	//
	ME: '/auth/users/me',
	ROLE_DETAIL: (id: string) => `/auth/roles/${id}`,
	ROLES: '/auth/roles',
	USER_DETAIL: (id: string) => `/auth/users/${id}`,

	USERS: '/auth/users',
} as const);

export const ApiRoutes = Object.freeze({
	AUTH_API: '/auth/api',
	CMET_API: process.env.NEXT_PUBLIC_CMET_API_URL ?? 'https://api.carrismetropolitana.pt/v2',

	// APP
	API: (path: string) => `/api${path}`,
});

export const Routes = Object.freeze({
	URL: process.env.NEXT_PUBLIC_URL ?? 'https://auth.sae.carrismetropolitana.pt',
	...PageRoutes,
	...ApiRoutes,
});
