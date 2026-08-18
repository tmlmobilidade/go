'use client';

/* * */

import namespaceDefaultEs from '@/i18n/namespaces/default/es.json' with { type: 'json' };
import namespaceDefaultPt from '@/i18n/namespaces/default/pt.json' with { type: 'json' };
import { i18nResourceKeysEsShared, i18nResourceKeysPtShared } from '@tmlmobilidade/ui';

/* * */

export const i18nResourceKeysPt = {
	...i18nResourceKeysPtShared,
	default: namespaceDefaultPt,
} as const;

export const i18nResourceKeysEs = {
	...i18nResourceKeysEsShared,
	default: namespaceDefaultEs,
} as const;
