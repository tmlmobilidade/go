/* * */

import type { Alert, SimplifiedAlert } from '@tmlmobilidade/go-hub-pckg-types';

import { Dates } from '@tmlmobilidade/dates';

/* * */

function getLocalizedText(
	translations: undefined | { language: string, text: string }[],
	currentLocale: string,
): string {
	const localePrefix = currentLocale.split('-')[0];
	if (!translations?.length) return '';
	const matchedTranslation = translations.find(item => item.language === localePrefix);
	return matchedTranslation?.text ?? translations[0]?.text ?? '';
}

/* * */

function getLocalizedImageUrl(alertData: Alert, currentLocale: string): null | string {
	const images = alertData.image?.localized_image;
	if (!images?.length) return null;
	const localePrefix = currentLocale.split('-')[0];
	const matchedImage = images.find(item => item.language === localePrefix);
	const imageUrl = matchedImage?.url ?? images[0]?.url;
	return imageUrl?.length ? imageUrl : null;
}

/* * */

function firstActivePeriod(alertData: Alert): undefined | { end?: number, start?: number } {
	const period = alertData.active_period;
	return Array.isArray(period) ? period[0] : period;
}

/* * */

export function convertToSimplifiedAlert(alertData: Alert, currentLocale = 'pt'): null | SimplifiedAlert {
	const activePeriod = firstActivePeriod(alertData);
	const startSeconds = activePeriod?.start;
	if (startSeconds == null || !Number.isFinite(startSeconds)) return null;

	const endSeconds = activePeriod?.end;
	const startDate = Dates.fromSeconds(startSeconds).js_date;
	const endDate = endSeconds != null && Number.isFinite(endSeconds) ? Dates.fromSeconds(endSeconds).js_date : undefined;

	return {
		alert_id: alertData.alert_id,
		cause: alertData.cause,
		coordinates: alertData.coordinates,
		description: getLocalizedText(alertData.description_text.translation, currentLocale),
		effect: alertData.effect,
		end_date: endDate,
		image_url: getLocalizedImageUrl(alertData, currentLocale),
		informed_entity: alertData.informed_entity,
		locale: currentLocale,
		start_date: startDate,
		title: getLocalizedText(alertData.header_text.translation, currentLocale),
		url: getLocalizedText(alertData.url?.translation, currentLocale) || null,
	};
}
