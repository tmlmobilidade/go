'use client';

/* * */

import ptPerformance from './namespaces/performance/pt.json' with { type: 'json' };

/* * */

export const i18nResourceKeys = {
	pt: {
		performance: ptPerformance,
	},
} as const;

/* * */

export const i18nNamespaces = [
	{ namespace: 'performance', pt: ptPerformance },
];
