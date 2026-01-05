'use client';

/* * */

import i18next from 'i18next';
import ICU from 'i18next-icu';
import { initReactI18next } from 'react-i18next';

/* * */

import ptGlobal from './namespaces/global/pt.json' with { type: 'json' };
import ptOperations from './namespaces/operations/pt.json' with { type: 'json' };
import ptStatuses from './namespaces/statuses/pt.json' with { type: 'json' };
/* * */

export * from './config';

/* * */

export const resourceKeys = {
	pt: {
		global: ptGlobal,
		operations: ptOperations,
		statuses: ptStatuses,
	},
} as const;

/* * */

i18next
	.use(ICU)
	.use(initReactI18next)
	.init({
		fallbackLng: 'pt',
		resources: resourceKeys,
	});

export function registerModuleTranslations(namespace: string, translations: Record<string, unknown>) {
	for (const [lng, data] of Object.entries(translations)) {
		i18next.addResourceBundle(lng, namespace, data, true, false);
	}
}
