'use client';

/* * */

import ptAuth from './namespaces/auth/pt.json' with { type: 'json' };
import ptUnauthenticated from './namespaces/unauthenticated/pt.json' with { type: 'json' };

/* * */

export const i18nResourceKeys = {
	pt: {
		auth: ptAuth,
		unauthenticated: ptUnauthenticated,
	},
} as const;

/* * */

export const i18nNamespaces = [
	{ namespace: 'auth', pt: ptAuth },
	{ namespace: 'unauthenticated', pt: ptUnauthenticated },
];
