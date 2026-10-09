'use client';

import { createInstance, type Resource } from 'i18next';
import ICU from 'i18next-icu';
import { initReactI18next } from 'react-i18next';

import { DEFAULT_LOCALE_CODE } from './locales';
import { i18nResourceKeysEsShared, i18nResourceKeysPtShared } from './resources';

/* * */

export function createI18nInstance(resources: Resource = {}) {
	const instance = createInstance();

	instance
		.use(ICU)
		.use(initReactI18next);

	void instance.init({
		fallbackLng: DEFAULT_LOCALE_CODE,
		initAsync: false,
		interpolation: {
			escapeValue: true,
		},
		lng: DEFAULT_LOCALE_CODE,
		resources: {
			es: {
				...i18nResourceKeysEsShared,
				...(resources.es ?? {}),
			},
			pt: {
				...i18nResourceKeysPtShared,
				...(resources.pt ?? {}),
			},
		},
	});

	return instance;
}
