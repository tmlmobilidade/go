/* * */

import 'i18next';
import type { i18n } from 'i18next';

import { i18nResourceKeys } from '@/i18n/resources';

/* * */

declare module 'i18next' {
	interface CustomTypeOptions {
		resources: typeof i18nResourceKeys.pt
	}
}

declare module 'react-i18next' {
	export function useTranslation(): {
		i18n: i18n
		ready: boolean
		t: (key: string, options?: Record<string, unknown>) => string
	};
}
