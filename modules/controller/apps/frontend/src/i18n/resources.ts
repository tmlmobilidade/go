'use client';

import namespaceDefaultEs from '@/i18n/namespaces/default/es.json' with { type: 'json' };
import namespaceDefaultPt from '@/i18n/namespaces/default/pt.json' with { type: 'json' };
import namespaceAnalysisEs from '@/i18n/namespaces/ride-analysis/es.json' with { type: 'json' };
import namespaceAnalysisPt from '@/i18n/namespaces/ride-analysis/pt.json' with { type: 'json' };
import namespaceStatusEs from '@/i18n/namespaces/ride-status/es.json' with { type: 'json' };
import namespaceStatusPt from '@/i18n/namespaces/ride-status/pt.json' with { type: 'json' };
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
	default: namespaceDefaultPt,
	ride_analysis: namespaceAnalysisPt,
	ride_status: namespaceStatusPt,
} as const;

/**
 * Resource keys for i18n translations in Spanish.
 */
export const i18nResourceKeysEs = {
	...i18nResourceKeysEsShared,
	default: namespaceDefaultEs,
	ride_analysis: namespaceAnalysisEs,
	ride_status: namespaceStatusEs,
} as const;
