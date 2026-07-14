'use client';

import i18next from 'i18next';
import ICU from 'i18next-icu';
import { initReactI18next } from 'react-i18next';

import { i18nResourceKeysEsShared, i18nResourceKeysPtShared } from './resources';

/* * */

await i18next
	.use(ICU)
	.use(initReactI18next)
	.init({
		fallbackLng: 'pt',
		interpolation: {
			escapeValue: true,
		},
		resources: {
			es: i18nResourceKeysEsShared,
			pt: i18nResourceKeysPtShared,
		},
	});
