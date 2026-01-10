'use client';

/* * */

import ptAuth from './namespaces/auth/pt.json' with { type: 'json' };

/* * */

export const i18nResourceKeys = {
	pt: {
		auth: ptAuth,
	},
} as const;

/* * */

export const i18nNamespaces = [
	{ namespace: 'auth', pt: ptAuth },
];
