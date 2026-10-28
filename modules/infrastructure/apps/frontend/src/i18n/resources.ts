'use client';

import namespaceStopsEn from '@/i18n/namespaces/stops/en.json' with { type: 'json' };
import namespaceStopsEs from '@/i18n/namespaces/stops/es.json' with { type: 'json' };
import namespaceStopsPt from '@/i18n/namespaces/stops/pt.json' with { type: 'json' };
import { i18nResourceKeysEnShared, i18nResourceKeysEsShared, i18nResourceKeysPtShared } from '@tmlmobilidade/ui';

/**
 * Resource keys for i18n translations in Portuguese.
 * These keys map to the respective translation files
 * for each language and namespace. They are the glue that
 * connects the i18n system to the actual translation strings.
 * Don't forget to import shared keys from the UI package.
 */
export const i18nResourceKeysPt = {
	...i18nResourceKeysPtShared,
	stops: namespaceStopsPt,
} as const;

/**
 * Resource keys for i18n translations in Spanish.
 */
export const i18nResourceKeysEs = {
	...i18nResourceKeysEsShared,
	stops: namespaceStopsEs,
} as const;

/**
 * Resource keys for i18n translations in English.
 */
export const i18nResourceKeysEn = {
	...i18nResourceKeysEnShared,
	stops: namespaceStopsEn,
} as const;
