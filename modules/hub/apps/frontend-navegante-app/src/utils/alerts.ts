/* * */

import type { Alert } from '@tmlmobilidade/go-hub-pckg-types';

import { AlertCause, AlertEffect } from '@tmlmobilidade/go-hub-pckg-types';
import { DateTime } from 'luxon';

/* * */

function localeLanguagePrefix(locale: string): string {
	return locale.split('-')[0];
}

/* * */

export function pickLocalizedText(
	translations: undefined | { language: string, text: string }[],
	locale: string,
): string {
	if (!translations?.length) return '';
	const prefix = localeLanguagePrefix(locale);
	const match = translations.find(row => row.language === prefix);
	return match?.text ?? translations[0]?.text ?? '';
}

/* * */

export function getAlertTitle(alert: Alert, locale: string): string {
	return pickLocalizedText(alert.header_text?.translation, locale);
}

/* * */

export function getAlertDescription(alert: Alert, locale: string): string {
	return pickLocalizedText(alert.description_text?.translation, locale);
}

/* * */

export function getAlertMoreInfoUrl(alert: Alert, locale: string): string {
	return pickLocalizedText(alert.url?.translation, locale);
}

/* * */

export function getAlertImageUrl(alert: Alert, locale: string): null | string {
	const localized = alert.image?.localized_image;
	if (!localized?.length) return null;
	const prefix = localeLanguagePrefix(locale);
	const match = localized.find(row => row.language === prefix);
	const chosen = match ?? localized[0];
	return chosen?.url?.length ? chosen.url : null;
}

/* * */

function firstActivePeriod(alert: Alert) {
	const raw = alert.active_period;
	return Array.isArray(raw) ? raw[0] : raw;
}

/* * */

export function getAlertStartDate(alert: Alert): Date | null {
	const period = firstActivePeriod(alert);
	const startSeconds = period?.start != null ? period.start : null;
	if (startSeconds == null) return null;
	return DateTime.fromSeconds(startSeconds, { zone: 'UTC' }).toLocal().toJSDate();
}

/* * */

export function getAlertStartDateOrEpoch(alert: Alert): Date {
	return getAlertStartDate(alert) ?? new Date(0);
}

/* * */

export function getAlertEndDate(alert: Alert): Date | undefined {
	const period = firstActivePeriod(alert);
	const endSeconds = period?.end != null ? period.end : null;
	if (endSeconds == null) return undefined;
	return DateTime.fromSeconds(endSeconds, { zone: 'UTC' }).toLocal().toJSDate();
}

/* * */

export function isAlertActiveNow(alert: Alert): boolean {
	const end = getAlertEndDate(alert);
	if (!end) return true;
	return !Number.isNaN(end.getTime()) && end.getTime() >= Date.now();
}

/* * */

export function getCauseSeverityLevel(cause: AlertCause): number {
	switch (cause) {
		case AlertCause.ACCIDENT:
		case AlertCause.CONSTRUCTION:
		case AlertCause.DEMONSTRATION:
		case AlertCause.DRIVER_ABSENCE:
		case AlertCause.DRIVER_ISSUE:
		case AlertCause.HIGH_PASSENGER_LOAD:
			return 3;
		case AlertCause.HOLIDAY:
			return 0;
		case AlertCause.MAINTENANCE:
		case AlertCause.MEDICAL_EMERGENCY:
		case AlertCause.POLICE_ACTIVITY:
		case AlertCause.ROAD_INCIDENT:
		case AlertCause.STRIKE:
		case AlertCause.SYSTEM_FAILURE:
		case AlertCause.TECHNICAL_PROBLEM:
		case AlertCause.TRAFFIC_JAM:
		case AlertCause.VEHICLE_ISSUE:
		case AlertCause.WEATHER:
			return 3;
	}
}

/* * */

export function getEffectSeverityLevel(effect: AlertEffect): number {
	switch (effect) {
		case AlertEffect.ACCESSIBILITY_ISSUE:
		case AlertEffect.MODIFIED_SERVICE:
			return 0;
		case AlertEffect.ADDITIONAL_SERVICE:
			return 1;
		case AlertEffect.DETOUR:
		case AlertEffect.NO_EFFECT:
		case AlertEffect.OTHER_EFFECT:
		case AlertEffect.REDUCED_SERVICE:
		case AlertEffect.STOP_MOVED:
		case AlertEffect.UNKNOWN_EFFECT:
			return 2;
		case AlertEffect.NO_SERVICE:
		case AlertEffect.SIGNIFICANT_DELAYS:
			return 3;
	}
}
