export const PageRoutes = Object.freeze({
	LOGIN: '/login',
	LOGOUT: '/logout',
	ME: '/users/me',
	ROLE_DETAIL: (id: string) => `/roles/${id}`,
	ROLES: '/roles',
	USER_DETAIL: (id: string) => `/users/${id}`,
	USERS: '/users',
} as const);

export const ApiRoutes = Object.freeze({
	AUTH_API: process.env.NEXT_PUBLIC_AUTH_API_URL ?? 'https://auth.sae.carrismetropolitana.pt/api',
	CMET_API: process.env.NEXT_PUBLIC_CMET_API_URL ?? 'https://api.carrismetropolitana.pt/v2',
});

export const Routes = Object.freeze({
	URL: process.env.NEXT_PUBLIC_URL ?? 'https://auth.sae.carrismetropolitana.pt',
	...PageRoutes,
	...ApiRoutes,
});
