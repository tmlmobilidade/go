'use client';

import namespaceAnnotationsEn from '@/i18n/namespaces/annotations/en.json' with { type: 'json' };
import namespaceAnnotationsEs from '@/i18n/namespaces/annotations/es.json' with { type: 'json' };
import namespaceAnnotationsPt from '@/i18n/namespaces/annotations/pt.json' with { type: 'json' };
import namespaceDefaultEn from '@/i18n/namespaces/default/en.json' with { type: 'json' };
import namespaceDefaultEs from '@/i18n/namespaces/default/es.json' with { type: 'json' };
import namespaceDefaultPt from '@/i18n/namespaces/default/pt.json' with { type: 'json' };
import { i18nResourceKeysEnShared, i18nResourceKeysEsShared, i18nResourceKeysPtShared } from '@tmlmobilidade/ui';

/* * */

export const i18nResourceKeysPt = {
	...i18nResourceKeysPtShared,
	annotations: namespaceAnnotationsPt,
	default: namespaceDefaultPt,
} as const;
/* * */

export const i18nResourceKeysEs = {
	...i18nResourceKeysEsShared,
	annotations: namespaceAnnotationsEs,
	default: namespaceDefaultEs,
} as const;
/* * */

export const i18nResourceKeysEn = {
	...i18nResourceKeysEnShared,
	annotations: namespaceAnnotationsEn,
	default: namespaceDefaultEn,
} as const;
