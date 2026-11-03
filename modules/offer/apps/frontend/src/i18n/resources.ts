'use client';

import namespaceDefaultEn from '@/i18n/namespaces/default/en.json' with { type: 'json' };
import namespaceDefaultEs from '@/i18n/namespaces/default/es.json' with { type: 'json' };
import namespaceDefaultPt from '@/i18n/namespaces/default/pt.json' with { type: 'json' };
import { offerSchedulingResources } from '@tmlmobilidade/go-utils-offer';
import { i18nResourceKeysEnShared, i18nResourceKeysEsShared, i18nResourceKeysPtShared } from '@tmlmobilidade/ui';

/* * */

export const i18nResourceKeysPt = {
	...i18nResourceKeysPtShared,
	...offerSchedulingResources.pt,
	default: namespaceDefaultPt,
} as const;
/* * */

export const i18nResourceKeysEs = {
	...i18nResourceKeysEsShared,
	...offerSchedulingResources.es,
	default: namespaceDefaultEs,
} as const;
/* * */

export const i18nResourceKeysEn = {
	...i18nResourceKeysEnShared,
	...offerSchedulingResources.en,
	default: namespaceDefaultEn,
} as const;
