/* * */

import { i18nResourceKeysPtShared } from './resources';

/* * */

declare module 'i18next' {
	interface CustomTypeOptions {
		resources: typeof i18nResourceKeysPtShared
	}
}
