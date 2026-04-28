/* * */

import type { i18n, TFunction } from 'i18next';

import { i18nResourceKeys } from '@/i18n/resources';

/* * */

type PlansResources = typeof i18nResourceKeys.pt;

declare module 'i18next' {
	interface CustomTypeOptions {
		defaultNS: 'plans'
		resources: PlansResources
	}
}

declare module 'react-i18next' {
	export function useTranslation(): {
		i18n: i18n
		ready: boolean
		t: TFunction<'plans', undefined>
	};
}
