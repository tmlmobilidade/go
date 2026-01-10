'use client';

/* * */

import ptGlobal from './namespaces/global/pt.json' with { type: 'json' };
import ptOperations from './namespaces/operations/pt.json' with { type: 'json' };
import ptStatuses from './namespaces/statuses/pt.json' with { type: 'json' };

/* * */

export const i18nResourceKeys = {
	pt: {
		global: ptGlobal,
		operations: ptOperations,
		statuses: ptStatuses,
	},
} as const;
