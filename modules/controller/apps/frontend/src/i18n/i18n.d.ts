/* * */

import { i18nResourceKeys } from '@/i18n/resources';

/* * */

declare module 'i18next' {
	interface CustomTypeOptions {
		resources: typeof i18nResourceKeys.pt
	}
}
