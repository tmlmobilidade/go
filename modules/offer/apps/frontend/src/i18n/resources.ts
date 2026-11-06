'use client';

import namespaceDefaultEn from '@/i18n/namespaces/default/en.json' with { type: 'json' };
import namespaceDefaultEs from '@/i18n/namespaces/default/es.json' with { type: 'json' };
import namespaceDefaultPt from '@/i18n/namespaces/default/pt.json' with { type: 'json' };
import { offerSchedulingResources } from '@tmlmobilidade/go-utils-offer';
import { i18nResourceKeysEnShared, i18nResourceKeysEsShared, i18nResourceKeysPtShared } from '@tmlmobilidade/ui/i18n';

import namespaceEventsEn from './namespaces/events/en.json' with { type: 'json' };
import namespaceEventsEs from './namespaces/events/es.json' with { type: 'json' };
import namespaceEventsPt from './namespaces/events/pt.json' with { type: 'json' };
import namespaceLinesEn from './namespaces/lines/en.json' with { type: 'json' };
import namespaceLinesEs from './namespaces/lines/es.json' with { type: 'json' };
import namespaceLinesPt from './namespaces/lines/pt.json' with { type: 'json' };
import namespacePatternsEn from './namespaces/patterns/en.json' with { type: 'json' };
import namespacePatternsEs from './namespaces/patterns/es.json' with { type: 'json' };
import namespacePatternsPt from './namespaces/patterns/pt.json' with { type: 'json' };
import namespaceRoutesEn from './namespaces/routes/en.json' with { type: 'json' };
import namespaceRoutesEs from './namespaces/routes/es.json' with { type: 'json' };
import namespaceRoutesPt from './namespaces/routes/pt.json' with { type: 'json' };
import namespaceOfferSharedEn from './namespaces/shared/en.json' with { type: 'json' };
import namespaceOfferSharedEs from './namespaces/shared/es.json' with { type: 'json' };
import namespaceOfferSharedPt from './namespaces/shared/pt.json' with { type: 'json' };
import namespaceYearPeriodsEn from './namespaces/year-periods/en.json' with { type: 'json' };
import namespaceYearPeriodsEs from './namespaces/year-periods/es.json' with { type: 'json' };
import namespaceYearPeriodsPt from './namespaces/year-periods/pt.json' with { type: 'json' };

/* * */

export const i18nResourceKeysPt = {
	...i18nResourceKeysPtShared,
	...offerSchedulingResources.pt,
	'default': namespaceDefaultPt,
	'events': namespaceEventsPt,
	'lines': namespaceLinesPt,
	'patterns': namespacePatternsPt,
	'routes': namespaceRoutesPt,
	'shared': { ...i18nResourceKeysPtShared.shared, ...namespaceOfferSharedPt },
	'year-periods': namespaceYearPeriodsPt,
} as const;
/* * */

export const i18nResourceKeysEs = {
	...i18nResourceKeysEsShared,
	...offerSchedulingResources.es,
	'default': namespaceDefaultEs,
	'events': namespaceEventsEs,
	'lines': namespaceLinesEs,
	'patterns': namespacePatternsEs,
	'routes': namespaceRoutesEs,
	'shared': { ...i18nResourceKeysEsShared.shared, ...namespaceOfferSharedEs },
	'year-periods': namespaceYearPeriodsEs,
} as const;
/* * */

export const i18nResourceKeysEn = {
	...i18nResourceKeysEnShared,
	...offerSchedulingResources.en,
	'default': namespaceDefaultEn,
	'events': namespaceEventsEn,
	'lines': namespaceLinesEn,
	'patterns': namespacePatternsEn,
	'routes': namespaceRoutesEn,
	'shared': { ...i18nResourceKeysEnShared.shared, ...namespaceOfferSharedEn },
	'year-periods': namespaceYearPeriodsEn,
} as const;
