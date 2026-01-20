import { IsoWeekday, Period, ScheduleRule, WEEKDAY_OPTIONS } from '@tmlmobilidade/types';

export interface RuleSummary {
	long: string
	short: string
}

export function buildRuleSummary(
	rule: ScheduleRule,
	options: {
		eventNames?: Record<string, string>
		holidayNames?: Record<string, string>
		periods?: Period[]
	},
): RuleSummary {
	return {
		long: buildRuleSummaryLong(rule, options),
		short: buildRuleSummaryShort(rule, options),
	};
}

/* ---------------- helpers ---------------- */

function buildRuleSummaryShort(
	rule: ScheduleRule,
	options: {
		eventNames?: Record<string, string>
		holidayNames?: Record<string, string>
		periods?: Period[]
	},
): string {
	const parts: string[] = [];

	// Periods (short)
	const periodPart = buildPeriodsPart(rule, options, { mode: 'short' });
	if (periodPart) parts.push(periodPart);

	// Weekdays (short)
	const weekdayPart = buildWeekdaysPart(rule, { mode: 'short' });
	if (weekdayPart) parts.push(weekdayPart);

	// Holidays (short) – only mention when it’s not the default “excepto”
	// const holidayPart = buildHolidaysPart(rule, options, { mode: 'short' });
	// if (holidayPart) parts.push(holidayPart);

	// Events (short) – usually omit in short unless you really need it
	// const eventPart = buildEventsPart(rule, options, { mode: 'short' });
	// if (eventPart) parts.push(eventPart);

	return parts.join(' · ');
}

function buildRuleSummaryLong(
	rule: ScheduleRule,
	options: {
		eventNames?: Record<string, string>
		holidayNames?: Record<string, string>
		periods?: Period[]
	},
): string {
	const parts: string[] = [];

	// Periods (long)
	const periodPart = buildPeriodsPart(rule, options, { mode: 'long' });
	if (periodPart) parts.push(periodPart);

	// Weekdays (long)
	const weekdayPart = buildWeekdaysPart(rule, { mode: 'long' });
	if (weekdayPart) parts.push(weekdayPart);

	// Holidays (long)
	const holidayPart = buildHolidaysPart(rule, options, { mode: 'long' });
	if (holidayPart) parts.push(holidayPart);

	// Events (long)
	const eventPart = buildEventsPart(rule, options, { mode: 'long' });
	if (eventPart) parts.push(eventPart);

	return parts.join(', ') + '.';
}

/* ---------------- Parts builders ---------------- */

function buildPeriodsPart(
	rule: ScheduleRule,
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

	// long
	if (labels.length === 1) return `Durante o ${labels[0]}`;
	return `Durante os períodos de ${labels.join(' e ')}`;
}

function buildWeekdaysPart(rule: ScheduleRule, cfg: { mode: 'long' | 'short' }): string {
	if (!rule.weekdays || rule.weekdays.length === 0) {
		return cfg.mode === 'short' ? 'Todos os dias' : 'em todos os dias';
	}
	if (rule.weekdays.length === 7) {
		return 'Todos os dias';
	}

	const weekdaySet = new Set<IsoWeekday>(rule.weekdays as IsoWeekday[]);
	const hasMonFri = ([1, 2, 3, 4, 5] as IsoWeekday[]).every(d => weekdaySet.has(d));
	const hasWeekend = weekdaySet.has(6) && weekdaySet.has(7);

	const getDayLabel = (value: IsoWeekday) =>
		WEEKDAY_OPTIONS.find(opt => opt.value === value)?.label ?? '?';

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

function buildHolidaysPart(
	rule: ScheduleRule,
	options: { holidayNames?: Record<string, string> },
	cfg: { mode: 'long' | 'short' },
): string {
	const holidayNames = options?.holidayNames ?? {};

	if (rule.holidays?.mode === 'all') {
		return cfg.mode === 'short' ? 'Feriados' : 'incluindo feriados';
	}

	if (rule.holidays?.mode === 'specific' && rule.holidays.ids?.length) {
		const labels = rule.holidays.ids.map(id => holidayNames[id] ?? 'feriado');
		if (cfg.mode === 'short') {
			return labels.length === 1 ? `Só ${labels[0]}` : `${labels.length} feriados`;
		}
		// long
		return labels.length === 1
			? `apenas no feriado ${labels[0]}`
			: `apenas nos feriados ${labels.join(' e ')}`;
	}

	// default is “excepto feriados”
	return cfg.mode === 'short' ? 'Exceto feriados' : 'excepto feriados';
}

function buildEventsPart(
	rule: ScheduleRule,
	options: { eventNames?: Record<string, string> },
	cfg: { mode: 'long' | 'short' },
): string {
	const eventNames = options?.eventNames ?? {};
	if (!rule.events?.length) return '';

	const labels = rule.events.map(id => eventNames[id] ?? 'evento');

	if (cfg.mode === 'short') {
		return labels.length === 1 ? `Evento: ${labels[0]}` : `Eventos: ${labels.length}`;
	}

	return labels.length === 1
		? `durante o evento ${labels[0]}`
		: `durante os eventos ${labels.join(' e ')}`;
}
