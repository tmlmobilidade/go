import { DAY_PERIOD_LABELS, EventReplacementRule, IsoWeekday, ManualRule, StopsParameterOverride, WEEKDAY_OPTIONS, YearPeriod } from '@tmlmobilidade/types';

/**
 * Builds the period portion of a rule summary.
 *
 * Handles smart formatting:
 * - All periods selected: "Todos os períodos" / "Em todos os períodos"
 * - Single period: Shows period name
 * - Multiple periods: "N períodos" (short) or "Durante os períodos de X e Y" (long)
 */
export function buildYearPeriodsPart(
	rule: EventReplacementRule | ManualRule | StopsParameterOverride,
	options: { periods?: YearPeriod[] },
	cfg: { mode: 'long' | 'short', omitIfAll?: boolean } = { mode: 'long', omitIfAll: false },
): string {
	const allPeriodIds = options?.periods?.map(p => p._id) ?? [];
	const selectedPeriodIds = rule.year_period_ids || [];
	const isAll = allPeriodIds.length > 0 && selectedPeriodIds.length === allPeriodIds.length && allPeriodIds.every(id => selectedPeriodIds.includes(id));

	if (!selectedPeriodIds.length || isAll) {
		if (cfg.omitIfAll) return '';
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
export function buildWeekdaysPart(rule: EventReplacementRule | ManualRule | StopsParameterOverride, cfg: { mode: 'long' | 'short', omitIfAll?: boolean } = { mode: 'long' }): string {
	if (!rule.weekdays || rule.weekdays.length === 0 || rule.weekdays.length === 7) {
		if (cfg.omitIfAll) return '';
		return cfg.mode === 'short' ? 'Todos os dias' : 'em todos os dias';
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

export function buildDayPeriodsPart(
	parameter: StopsParameterOverride,
	cfg: { mode: 'long' | 'short' },
): string {
	const selected = (parameter.day_periods ?? []);
	if (!selected.length) return 'Todo o dia';

	const labels = selected.map(p => DAY_PERIOD_LABELS[p]?.[cfg.mode] ?? p.toUpperCase());

	if (cfg.mode === 'short') return labels.join(' · ');
	if (labels.length === 1) return `Durante ${labels[0]}`;
	return `Durante ${labels.join(' e ')}`;
}
