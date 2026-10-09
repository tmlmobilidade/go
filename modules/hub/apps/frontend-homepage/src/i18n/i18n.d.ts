import { i18nResourceKeysPt } from '@/i18n/resources';

declare module 'i18next' {
	interface CustomTypeOptions {
		resources: typeof i18nResourceKeysPt
	}
}
