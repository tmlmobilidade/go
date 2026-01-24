/* * */

import { i18nResourceKeys } from './resources';

/* * */

declare module 'i18next' {
	interface CustomTypeOptions {
		resources: typeof i18nResourceKeys.pt
	}
}
