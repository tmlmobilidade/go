'use client';

import namespaceDefaultEn from '@/i18n/namespaces/default/en.json' with { type: 'json' };
import namespaceDefaultEs from '@/i18n/namespaces/default/es.json' with { type: 'json' };
import namespaceDefaultPt from '@/i18n/namespaces/default/pt.json' with { type: 'json' };
import namespaceLandingEn from '@/i18n/namespaces/landing/en.json' with { type: 'json' };
import namespaceLandingEs from '@/i18n/namespaces/landing/es.json' with { type: 'json' };
import namespaceLandingPt from '@/i18n/namespaces/landing/pt.json' with { type: 'json' };
import namespaceUnauthenticatedEn from '@/i18n/namespaces/unauthenticated/en.json' with { type: 'json' };
import namespaceUnauthenticatedEs from '@/i18n/namespaces/unauthenticated/es.json' with { type: 'json' };
import namespaceUnauthenticatedPt from '@/i18n/namespaces/unauthenticated/pt.json' with { type: 'json' };
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
	default: namespaceDefaultPt,
	landing: namespaceLandingPt,
	unauthenticated: namespaceUnauthenticatedPt,
} as const;

/**
 * Resource keys for i18n translations in Spanish.
 */
export const i18nResourceKeysEs = {
	...i18nResourceKeysEsShared,
	default: namespaceDefaultEs,
	landing: namespaceLandingEs,
	unauthenticated: namespaceUnauthenticatedEs,
} as const;

/**
 * Resource keys for i18n translations in English.
 */
export const i18nResourceKeysEn = {
	...i18nResourceKeysEnShared,
	default: namespaceDefaultEn,
	landing: namespaceLandingEn,
	unauthenticated: namespaceUnauthenticatedEn,
} as const;
