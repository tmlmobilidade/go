'use client';

import namespaceAlertsEs from '@/i18n/namespaces/alerts/es.json' with { type: 'json' };
import namespaceAlertsPt from '@/i18n/namespaces/alerts/pt.json' with { type: 'json' };
import { i18nResourceKeysEsShared, i18nResourceKeysPtShared } from '@tmlmobilidade/ui';

/**
 * Resource keys for i18n translations in Portuguese.
 * These keys map to the respective translation files
 * for each language and namespace. They are the glue that
 * connects the i18n system to the actual translation strings.
 * Don't forget to import shared keys from the UI package.
 */
export const i18nResourceKeysPt = {
	...i18nResourceKeysPtShared,
	alerts: namespaceAlertsPt,
} as const;

/**
 * Resource keys for i18n translations in Spanish.
 */
export const i18nResourceKeysEs = {
	...i18nResourceKeysEsShared,
	alerts: namespaceAlertsEs,
} as const;
