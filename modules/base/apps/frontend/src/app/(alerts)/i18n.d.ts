/**
 * @file i18n TypeScript declarations
 * @description Declares custom types for i18next resources.
 */

import { i18nResourceKeysPt } from '@/i18n/resources';

declare module 'i18next' {
	interface CustomTypeOptions {
		resources: typeof i18nResourceKeysPt
	}
}
