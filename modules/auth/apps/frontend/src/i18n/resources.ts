'use client';

import namespaceDefaultPt from '@/i18n/namespaces/default/pt.json' with { type: 'json' };
import namespaceUnauthenticatedPt from '@/i18n/namespaces/unauthenticated/pt.json' with { type: 'json' };
import { i18nResourceKeysPtShared } from '@tmlmobilidade/ui';

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
	unauthenticated: namespaceUnauthenticatedPt,
} as const;
