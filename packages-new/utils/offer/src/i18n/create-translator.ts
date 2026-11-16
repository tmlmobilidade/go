import { createInstance, type TFunction } from 'i18next';
import ICU from 'i18next-icu';

import { offerSchedulingResources } from './resources.js';

/* * */

export type OfferSchedulingTranslator = TFunction;

/** Create once per export agency; the returned translator is fixed to its language. */
export async function createOfferTranslator(locale: string): Promise<OfferSchedulingTranslator> {
	const instance = createInstance();
	await instance.use(ICU).init({
		defaultNS: 'offerScheduling',
		fallbackLng: 'en',
		initAsync: false,
		lng: locale,
		resources: offerSchedulingResources,
	});

	// Shared helpers qualify their keys so the same signatures also accept frontend t functions.
	return instance.getFixedT(locale);
}
