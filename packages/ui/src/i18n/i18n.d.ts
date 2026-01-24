/* * */

import { type I18nRegistry } from './registry';

/* * */

declare module 'i18next' {
	interface CustomTypeOptions {
		resources: I18nRegistry['pt']
	}
}
