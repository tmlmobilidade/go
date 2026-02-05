import { Dates, Formats } from '@tmlmobilidade/dates';
import { EventDerivedRestriction, IsoWeekday, ManualScheduleRule, Period, ScheduleRule, WEEKDAY_OPTIONS } from '@tmlmobilidade/types';

export interface RuleSummary {
	long: string
	short: string
	tooltip: string
}

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

const isEventRule = (r: ScheduleRule): r is EventDerivedRestriction => r.kind === 'event';

/* ---------------- helpers ---------------- */

function buildRuleSummaryShort(
	rule: ScheduleRule,
	options: { periods?: Period[] },
): string {
	if (isEventRule(rule)) {
		// Desired: pill shows just the event name
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

function buildRuleSummaryLong(
	rule: ScheduleRule,
	options: { periods?: Period[] },
): string {
	if (isEventRule(rule)) {
		return `Redução da oferta derivada do evento ${rule.event?.title ?? ''}`;
	}

	// manual
	const parts: string[] = [];

	const periodPart = buildPeriodsPart(rule, options, { mode: 'long' });
	if (periodPart) parts.push(periodPart);

	const weekdayPart = buildWeekdaysPart(rule, { mode: 'long' });
	if (weekdayPart) parts.push(weekdayPart);

	return parts.join(', ');
}

function buildRuleSummaryTooltip(
	rule: ScheduleRule,
): string {
	if (isEventRule(rule)) {
		const eventDates = (rule.dates ?? [])
			.map(d =>
				Dates.fromOperationalDate(d, 'Europe/Lisbon')
					.toLocaleString(Formats.DATE_SHORT, 'pt-PT'),
			)
			.join(', ');

		const eventDatesString
			= (rule.dates?.length ?? 0) > 1 ? `nos dias ${eventDates}` : `no dia ${eventDates}`;

		const wStart = rule.event?.start_time;
		const wEnd = rule.event?.end_time;
		const windowString = (wStart && wEnd) ? `entre as ${wStart}h e ${wEnd}h` : '';

		return `Apenas em ${rule.event?.title ?? ''} ${windowString} ${eventDatesString}`.trim();
	}
	return '';
}

/* ---------------- Parts builders (manual only) ---------------- */

function buildPeriodsPart(
	rule: ManualScheduleRule,
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

function buildWeekdaysPart(rule: ManualScheduleRule, cfg: { mode: 'long' | 'short' }): string {
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
