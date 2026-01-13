/* * */

import { i18nResourceKeys } from '@/i18n/resources';

/* * */

type PerformanceResources = typeof i18nResourceKeys.pt;

declare module 'i18next' {
	interface CustomTypeOptions {
		defaultNS: 'performance'
		resources: PerformanceResources
	}
}
