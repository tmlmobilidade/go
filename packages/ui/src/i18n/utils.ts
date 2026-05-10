'use client';

import i18next from 'i18next';

/* * */

export function registerModuleTranslations(namespace: string, translations: Record<string, unknown>) {
	for (const [lng, data] of Object.entries(translations)) {
		i18next.addResourceBundle(lng, namespace, data, true, false);
	}
}
