/**
 * @file i18n TypeScript declarations
 * @description Declares custom types for i18next resources.
 * Include this file in your TypeScript project to enable
 * type checking for i18n resources.
 */

import { i18nRegistry } from '@/i18n/resources';

// declare module '@tmlmobilidade/ui' {
// 	interface i18nRegistry {
// 		pt: typeof i18nRegistry.pt
// 	}
// }

declare module 'i18next' {
	interface CustomTypeOptions {
		resources: typeof i18nRegistry.pt
	}
}
