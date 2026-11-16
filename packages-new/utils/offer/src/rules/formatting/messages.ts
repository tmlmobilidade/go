import { type TFunction } from 'i18next';

import { type SchedulingMessageKey } from '../../i18n/resources.js';

/** Format shared presentation copy without frontend state or dependencies. */
export function schedulingMessage(t: TFunction, key: SchedulingMessageKey, values: Record<string, number | string> = {}): string {
	return t(`offerScheduling:summaries.${key}`, '', values);
}

export function schedulingList(locale: string, labels: string[]): string {
	return new Intl.ListFormat(locale, { style: 'long', type: 'conjunction' }).format(labels);
}
