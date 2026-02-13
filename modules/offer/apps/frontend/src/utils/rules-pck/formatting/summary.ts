import { Dates, Formats } from '@tmlmobilidade/dates';
import { EventReplacementRule, EventRestrictionRule, IsoWeekday, ManualRule, Period, ScheduleRule, WEEKDAY_OPTIONS } from '@tmlmobilidade/types';

/**
 * Human-readable summary of a rule in multiple formats.
 * Used for displaying rule information in UI components.
 */
export interface RuleSummary {
	/** Full descriptive text (e.g., "Durante o Período Escolar, nos dias úteis") */
	long: string
	/** Compact label (e.g., "Dias úteis · Período Escolar") */
	short: string
	/** Detailed tooltip with event dates/times if applicable */
	tooltip: string
}

/**
 * Builds human-readable summaries of a scheduling rule.
 *
 * Generates three text formats optimized for different UI contexts:
 * - **short**: Compact label for badges/pills (e.g., "Dias úteis · Período Escolar")
 * - **long**: Full description for tooltips (e.g., "Durante o Período Escolar, nos dias úteis")
 * - **tooltip**: Detailed event information with dates and times
 *
 * @param rule - The scheduling rule to summarize
 * @param options - Configuration options (periods array for name resolution)
 * @returns RuleSummary with short, long, and tooltip text
 *
 * @example
 * ```ts
 * const rule = { kind: 'manual', weekdays: [1,2,3,4,5], periodIds: ['school'], ... };
 * const summary = buildRuleSummary(rule, { periods });
 * // summary = {
 * //   short: "Dias úteis · Período Escolar",
 * //   long: "Durante o Período Escolar, nos dias úteis",
 * //   tooltip: ""
 * // }
 * ```
 */
export function buildRuleSummary(
	rule: ScheduleRule,
	options: {
		periods?: Period[]
	},
): RuleSummary {
	return {
		long: buildRuleSummaryLong(rule, options),
		short: buildRuleSummaryShort(rule, options),
		tooltip: buildRuleSummaryTooltip(rule),
	};
}

/**
 * Type guard for event restriction rules.
 */
const isEventRestriction = (r: ScheduleRule): r is EventRestrictionRule => r.kind === 'event_restriction';

/**
 * Type guard for event replacement rules.
 */
const isEventReplacement = (r: ScheduleRule): r is EventReplacementRule => r.kind === 'event_replacement';

/* ---------------- helpers ---------------- */

/**
 * Builds the short summary format for a rule.
 *
 * Event rules: Returns event title
 * Manual rules: Returns "Period · Weekdays" format
 */
function buildRuleSummaryShort(
	rule: ScheduleRule,
	options: { periods?: Period[] },
): string {
	if (isEventRestriction(rule)) {
		// Restriction: show event name
		return rule.event?.title ?? '';
	}

	if (isEventReplacement(rule)) {
		// Replacement: show event name
		return rule.event?.title ?? '';
	}

	// manual
	const parts: string[] = [];

	const periodPart = buildPeriodsPart(rule, options, { mode: 'short' });
	if (periodPart) parts.push(periodPart);

	const weekdayPart = buildWeekdaysPart(rule, { mode: 'short' });
	if (weekdayPart) parts.push(weekdayPart);

	return parts.join(' · ');
}

/**
 * Builds the long summary format for a rule.
 *
 * Event rules: Returns event title
 * Manual rules: Returns "During [period], on [weekdays]" format in Portuguese
 */
function buildRuleSummaryLong(
	rule: ScheduleRule,
	options: { periods?: Period[] },
): string {
	if (isEventReplacement(rule) || isEventRestriction(rule)) {
		return rule.event?.title ?? '';
	}

	// manual
	const parts: string[] = [];

	const periodPart = buildPeriodsPart(rule, options, { mode: 'long' });
	if (periodPart) parts.push(periodPart);

	const weekdayPart = buildWeekdaysPart(rule, { mode: 'long' });
	if (weekdayPart) parts.push(weekdayPart);

	return parts.join(', ');
}

/**
 * Builds detailed tooltip text for event rules.
 *
 * Restriction rules: "Apenas em [event] [time window] [on dates]"
 * Replacement rules: "Substituição por [event] [on dates]"
 * Manual rules: Returns empty string (no tooltip needed)
 */
function buildRuleSummaryTooltip(
	rule: ScheduleRule,
): string {
	if (isEventRestriction(rule)) {
		const eventDates = (rule.dates ?? [])
			.map(d =>
				Dates.fromOperationalDate(d, 'Europe/Lisbon')
					.toLocaleString(Formats.DATE_SHORT, 'pt-PT'),
			)
			.join(', ');

		const eventDatesString
			= (rule.dates?.length ?? 0) > 1 ? `nos dias ${eventDates}` : `no dia ${eventDates}`;

		const wStart = rule?.start_time;
		const wEnd = rule?.end_time;
		const windowString = (wStart && wEnd) ? `entre as ${wStart}h e ${wEnd}h` : '';

		return `Apenas em ${rule.event?.title ?? ''} ${windowString} ${eventDatesString}`.trim();
	}

	if (isEventReplacement(rule)) {
		const eventDates = (rule.dates ?? [])
			.map(d =>
				Dates.fromOperationalDate(d, 'Europe/Lisbon')
					.toLocaleString(Formats.DATE_SHORT, 'pt-PT'),
			)
			.join(', ');

		const eventDatesString
			= (rule.dates?.length ?? 0) > 1 ? `nos dias ${eventDates}` : `no dia ${eventDates}`;

		return `Substituição por ${rule.event?.title ?? ''} ${eventDatesString}`.trim();
	}

	return '';
}

/* ---------------- Parts builders (manual only) ---------------- */

/**
 * Builds the period portion of a rule summary.
 *
 * Handles smart formatting:
 * - All periods selected: "Todos os períodos" / "Em todos os períodos"
 * - Single period: Shows period name
 * - Multiple periods: "N períodos" (short) or "Durante os períodos de X e Y" (long)
 */
function buildPeriodsPart(
	rule: EventReplacementRule | ManualRule,
	options: { periods?: Period[] },
	cfg: { mode: 'long' | 'short' },
): string {
	const allPeriodIds = options?.periods?.map(p => p._id) ?? [];
	const selectedPeriodIds = rule.periodIds || [];
	const isAll = allPeriodIds.length > 0 && selectedPeriodIds.length === allPeriodIds.length && allPeriodIds.every(id => selectedPeriodIds.includes(id));

	if (!selectedPeriodIds.length || isAll) {
		return cfg.mode === 'short' ? 'Todos os períodos' : 'Em todos os períodos';
	}

	const labels = selectedPeriodIds.map(
		id => options?.periods?.find(p => p._id === id)?.name ?? 'período desconhecido',
	);

	if (cfg.mode === 'short') {
		if (labels.length === 1) return labels[0];
		return `${labels.length} períodos`;
	}

	if (labels.length === 1) return `Durante o ${labels[0]}`;
	return `Durante os períodos de ${labels.join(' e ')}`;
}

/**
 * Builds the weekday portion of a rule summary.
 *
 * Handles smart grouping:
 * - All 7 days: "Todos os dias"
 * - Mon-Fri only: "Dias úteis"
 * - Sat-Sun only: "Fim de semana"
 * - Mon-Fri + extras: "Dias úteis + Sábado"
 * - Weekend + extras: "Fim de semana + Segunda-feira"
 * - Other combinations: Lists individual days
 *
 * @param rule - Rule with weekdays array
 * @param cfg - Format mode (short or long)
 * @returns Formatted weekday string in Portuguese
 */
function buildWeekdaysPart(rule: EventReplacementRule | ManualRule, cfg: { mode: 'long' | 'short' }): string {
	if (!rule.weekdays || rule.weekdays.length === 0) {
		return cfg.mode === 'short' ? 'Todos os dias' : 'em todos os dias';
	}
	if (rule.weekdays.length === 7) {
		return 'Todos os dias';
	}

	const weekdaySet = new Set<IsoWeekday>(rule.weekdays as IsoWeekday[]);
	const hasMonFri = ([1, 2, 3, 4, 5] as IsoWeekday[]).every(d => weekdaySet.has(d));
	const hasWeekend = weekdaySet.has(6) && weekdaySet.has(7);

	const getDayLabel = (value: IsoWeekday) => WEEKDAY_OPTIONS.find(opt => opt.value === value)?.label ?? '?';

	if (hasMonFri && hasWeekend) return 'Todos os dias';

	if (hasMonFri) {
		const extraDays = (rule.weekdays as IsoWeekday[])
			.filter(d => d < 1 || d > 5)
			.sort((a, b) => a - b);

		if (extraDays.length === 0) return 'Dias úteis';

		const extraLabels = extraDays.map(getDayLabel);
		return cfg.mode === 'short'
			? `Dias úteis + ${extraLabels.join(', ')}`
			: `nos dias úteis e ${extraLabels.join(', ')}`;
	}

	if (hasWeekend && rule.weekdays.length === 2) {
		return cfg.mode === 'short' ? 'Fim de semana' : 'no fim de semana';
	}

	if (hasWeekend) {
		const extraDays = (rule.weekdays as IsoWeekday[])
			.filter(d => d !== 6 && d !== 7)
			.sort((a, b) => a - b);

		const extraLabels = extraDays.map(getDayLabel);
		return cfg.mode === 'short'
			? `Fim de semana + ${extraLabels.join(', ')}`
			: `no fim de semana e ${extraLabels.join(', ')}`;
	}

	const sortedDays = [...(rule.weekdays as IsoWeekday[])].sort((a, b) => a - b);
	const dayLabels = sortedDays.map(getDayLabel);

	return cfg.mode === 'short'
		? dayLabels.join(', ')
		: `à ${dayLabels.join(', ')}`;
}
