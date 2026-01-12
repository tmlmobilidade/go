'use client';

/* * */

import ptController from './namespaces/controller/pt.json' with { type: 'json' };

/* * */

export const i18nResourceKeys = {
	pt: {
		controller: ptController,
	},
} as const;

/* * */

export const i18nNamespaces = [
	{ namespace: 'controller', pt: ptController },
];
