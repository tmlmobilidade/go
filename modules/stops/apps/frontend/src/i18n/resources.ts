'use client';

/* * */

import ptStops from './namespaces/stops/pt.json' with { type: 'json' };

/* * */

export const i18nResourceKeys = {
	pt: {
		stops: ptStops,
	},
} as const;

/* * */

export const i18nNamespaces = [
	{ namespace: 'stops', pt: ptStops },
];
