'use client';

/* * */

import ptDates from './namespaces/dates/pt.json' with { type: 'json' };

/* * */

export const i18nResourceKeys = {
	pt: {
		dates: ptDates,
	},
} as const;

/* * */

export const i18nNamespaces = [
	{ namespace: 'dates', pt: ptDates },
];
