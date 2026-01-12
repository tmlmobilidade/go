'use client';

/* * */

import i18next from 'i18next';
import ICU from 'i18next-icu';
import { initReactI18next } from 'react-i18next';

import { i18nResourceKeys } from './resources';

/* * */

i18next
	.use(ICU)
	.use(initReactI18next)
	.init({
		fallbackLng: 'pt',
		resources: i18nResourceKeys,
	});
