'use client';

/* * */

import ptPlans from './namespaces/plans/pt.json' with { type: 'json' };

/* * */

export const i18nResourceKeys = {
	pt: {
		plans: ptPlans,
	},
} as const;

/* * */

export const i18nNamespaces = [
	{ namespace: 'plans', pt: ptPlans },
];
