import { Period, StopsParameter } from '@tmlmobilidade/types';

import { buildBusinessPeriodsPart, buildPeriodsPart, buildWeekdaysPart } from './common.js';

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
 * Currently uses only business periods (day_periods).
 */
export function buildParameterSummary(
	parameter: StopsParameter,
	options: {
		periods?: Period[]
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
 * Manual parameters: Returns "Period · Weekdays" format
 */
function buildParameterSummaryShort(
	parameter: StopsParameter,
	options: { periods?: Period[] },
): string {
	// manual
	const parts: string[] = [];

	if (parameter.kind === 'default') {
		return 'Configuração padrão';
	}

	const businessDayPart = buildBusinessPeriodsPart(parameter, { mode: 'short' });
	if (businessDayPart) parts.push(businessDayPart);

	const periodPart = buildPeriodsPart(parameter, options, { mode: 'short' });
	if (periodPart) parts.push(periodPart);

	const weekdayPart = buildWeekdaysPart(parameter, { mode: 'short' });
	if (weekdayPart) parts.push(weekdayPart);

	return parts.join(' · ');
}

/**
 * Builds the long summary format for a parameter.
 *
 * Event parameters: Returns event title
 * Manual parameters: Returns "During [period], on [weekdays]" format in Portuguese
 */
function buildParameterSummaryLong(
	parameter: StopsParameter,
	options: { periods?: Period[] },
): string {
	if (parameter.kind === 'default') {
		return 'Configuração padrão';
	}

	const businessDayPart = buildBusinessPeriodsPart(parameter, { mode: 'long' });

	const periodPart = buildPeriodsPart(parameter, options, { mode: 'short' });

	const weekdayPart = buildWeekdaysPart(parameter, { mode: 'short' });

	return `${businessDayPart}, ${periodPart} · ${weekdayPart}`;
}
