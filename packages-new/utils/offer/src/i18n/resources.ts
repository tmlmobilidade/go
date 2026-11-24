import { type DayPeriod } from '@tmlmobilidade/go-types-offer';

import en from './en.json' with { type: 'json' };
import es from './es.json' with { type: 'json' };
import pt from './pt.json' with { type: 'json' };

/* * */

export type SchedulingLanguage = 'en' | 'es' | 'pt';
export type SchedulingMessageKey = keyof typeof en.summaries;

interface SchedulingResources {
	dayPeriods: Record<DayPeriod, { long: string, short: string }>
	gtfs: { businessDays: string }
	summaries: Record<SchedulingMessageKey, string>
}

const resources = { en, es, pt } satisfies Record<SchedulingLanguage, SchedulingResources>;

/** Offer-owned namespaces can be registered in frontend or standalone i18next instances. */
export const offerSchedulingResources = {
	en: { offerScheduling: resources.en },
	es: { offerScheduling: resources.es },
	pt: { offerScheduling: resources.pt },
};
