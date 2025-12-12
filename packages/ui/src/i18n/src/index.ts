'use client';
/* * */

import i18next from 'i18next';
import ICU from 'i18next-icu';
import { initReactI18next } from 'react-i18next';

/* * */

import enKeys from '@/translations/en.json' with { type: 'json' }; ;
import ptKeys from '@/translations/pt.json' with { type: 'json' }; ;

/* * */

export const resourceKeys = {
	en: { global: enKeys },
	pt: { global: ptKeys },
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
