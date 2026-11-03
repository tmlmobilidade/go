import { StopsParameter, YearPeriod } from '@tmlmobilidade/go-types-offer';
import { type TFunction } from 'i18next';

import { buildDayPeriodsPart, buildWeekdaysPart, buildYearPeriodsPart } from './common.js';
import { schedulingMessage } from './messages.js';

/**
 * Human-readable summary for a stops parameter.
 */
export interface StopsParameterSummary {
	/** Full descriptive text (e.g., "Durante o Período Escolar, nos dias úteis") */
	long: string
	/** Compact label (e.g., "Dias úteis · Período Escolar") */
	short: string
}

/**
 * Builds human-readable summaries of a stops parameter.
 * Formats year periods, weekdays and day periods in the viewer locale.
 */
export function buildParameterSummary(
	parameter: StopsParameter,
	options: {
		locale: string
		periods?: YearPeriod[]
		t: TFunction
	},
): StopsParameterSummary {
	return {
		long: buildParameterSummaryLong(parameter, options),
		short: buildParameterSummaryShort(parameter, options),
	};
}

/* ---------------- helpers ---------------- */

/**
 * Builds the short summary format for a parameter.
 *
 * Event parameters: Returns event title
 * Manual parameters: Returns "YearPeriod · Weekdays" format
 */
function buildParameterSummaryShort(
	parameter: StopsParameter,
	options: { locale: string, periods?: YearPeriod[], t: TFunction },
): string {
	// manual
	const parts: string[] = [];

	if (parameter.kind === 'default') {
		return schedulingMessage(options.t, 'defaultConfiguration');
	}

	const dayPeriodsPart = buildDayPeriodsPart(parameter, { locale: options.locale, mode: 'short', t: options.t });
	if (dayPeriodsPart) parts.push(dayPeriodsPart);

	const periodPart = buildYearPeriodsPart(parameter, options, { mode: 'short' });
	if (periodPart) parts.push(periodPart);

	const weekdayPart = buildWeekdaysPart(parameter, { locale: options.locale, mode: 'short', t: options.t });
	if (weekdayPart) parts.push(weekdayPart);

	return parts.join(' · ');
}

/**
 * Builds the long summary format for a parameter.
 *
 * Event parameters: Returns event title
 * Override parameters: Formats conditions in the explicitly supplied viewer locale.
 */
function buildParameterSummaryLong(
	parameter: StopsParameter,
	options: { locale: string, periods?: YearPeriod[], t: TFunction },
): string {
	if (parameter.kind === 'default') {
		return schedulingMessage(options.t, 'defaultConfiguration');
	}

	const dayPeriodsPart = buildDayPeriodsPart(parameter, { locale: options.locale, mode: 'long', t: options.t });

	const periodPart = buildYearPeriodsPart(parameter, options, { mode: 'short' });

	const weekdayPart = buildWeekdaysPart(parameter, { locale: options.locale, mode: 'short', t: options.t });

	return `${dayPeriodsPart}, ${periodPart} · ${weekdayPart}`;
}
