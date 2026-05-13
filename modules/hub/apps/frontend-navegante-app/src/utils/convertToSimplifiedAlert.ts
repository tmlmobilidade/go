/* * */

import type { Alert, SimplifiedAlert } from '@tmlmobilidade/go-hub-pckg-types';

import { DateTime } from 'luxon';

/* * */

function pickLocalizedTranslation(
	translations: undefined | { language: string, text: string }[],
	currentLocale: string,
): string {
	if (!translations?.length) return '';
	const lang = currentLocale.split('-')[0];
	const match = translations.find(item => item.language === lang)?.text;
	const first = translations[0]?.text;
	return match ?? first ?? '';
}

/* * */

export default (alertData: Alert, currentLocale = 'pt'): SimplifiedAlert => {
	//
	const localizedHeaderText = pickLocalizedTranslation(alertData.header_text?.translation, currentLocale);
	const localizedDescriptionText = pickLocalizedTranslation(alertData.description_text?.translation, currentLocale);
	// Find the localized image URL
	let localizedImageUrl: null | string = null;
	if (alertData.image?.localized_image?.length) {
		const imageLocaleMatch = alertData.image.localized_image.find(item => item.language === currentLocale.split('-')[0]);
		if (!imageLocaleMatch) localizedImageUrl = alertData.image.localized_image[0].url.length > 0 ? alertData.image.localized_image[0].url : null;
		else localizedImageUrl = imageLocaleMatch.url.length > 0 ? imageLocaleMatch.url : null;
	}
	// Start date
	const startDate = alertData.active_period[0].start ? alertData.active_period[0].start : -Infinity;
	const startDateObject = DateTime.fromSeconds(startDate, { zone: 'UTC' }).toLocal().toJSDate();
	// End date
	const endDate = alertData.active_period[0].end ? alertData.active_period[0].end : +Infinity;
	const endDateObject = endDate === +Infinity ? undefined : DateTime.fromSeconds(endDate, { zone: 'UTC' }).toLocal().toJSDate();
	//
	return {
		alert_id: alertData.alert_id,
		cause: alertData.cause,
		coordinates: alertData.coordinates,
		description: localizedDescriptionText,
		effect: alertData.effect,
		end_date: endDateObject,
		image_url: localizedImageUrl,
		informed_entity: alertData.informed_entity,
		locale: currentLocale,
		start_date: startDateObject,
		title: localizedHeaderText,
		url: null,
	};
	//
};
