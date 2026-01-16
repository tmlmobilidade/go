import { IsoWeekday, Period, ScheduleRule, WEEKDAY_OPTIONS } from '@tmlmobilidade/types';

export function buildRuleSummary(
	rule: ScheduleRule,
	options: {
		eventNames?: Record<string, string>
		holidayNames?: Record<string, string>
		periods?: Period[]
	},
): string {
	const parts: string[] = [];

	const holidayNames = options?.holidayNames ?? {};
	const eventNames = options?.eventNames ?? {};

	/* ---------------- Periods ---------------- */

	if (!rule.periodIds || rule.periodIds.length === 0) {
		parts.push('Em todos os períodos');
	}
	else {
		const labels = rule.periodIds.map(
			id => options?.periods?.find(p => p._id === id)?.name ?? 'período desconhecido',
		);

		if (labels.length === 1) {
			parts.push(`Durante o ${labels[0]}`);
		}
		else {
			parts.push(`Durante os períodos de ${labels.join(' e ')}`);
		}
	}

	/* ---------------- Weekdays ---------------- */

	if (!rule.weekdays || rule.weekdays.length === 0) {
		parts.push('em todos os dias');
	}
	else if (rule.weekdays.length === 7) {
		parts.push('todos os dias');
	}
	else {
		const weekdaySet = new Set<IsoWeekday>(rule.weekdays as IsoWeekday[]);

		const hasMonFri = ([1, 2, 3, 4, 5] as IsoWeekday[]).every(d => weekdaySet.has(d));
		const hasWeekend = weekdaySet.has(6) && weekdaySet.has(7);

		const getDayLabel = (value: IsoWeekday) =>
			WEEKDAY_OPTIONS.find(opt => opt.value === value)?.label ?? '?';

		if (hasMonFri && hasWeekend) {
			parts.push('todos os dias');
		}
		else if (hasMonFri) {
			// extra = not Mon..Fri
			const extraDays = (rule.weekdays as IsoWeekday[])
				.filter(d => d < 1 || d > 5) // catches 6,7
				.sort((a, b) => a - b);

			if (extraDays.length === 0) {
				parts.push('nos dias úteis');
			}
			else {
				const extraLabels = extraDays.map(getDayLabel);
				parts.push(`nos dias úteis e ${extraLabels.join(', ')}`);
			}
		}
		else if (hasWeekend && rule.weekdays.length === 2) {
			parts.push('no fim de semana');
		}
		else if (hasWeekend) {
			const extraDays = (rule.weekdays as IsoWeekday[])
				.filter(d => d !== 6 && d !== 7)
				.sort((a, b) => a - b);

			const extraLabels = extraDays.map(getDayLabel);
			parts.push(`no fim de semana e ${extraLabels.join(', ')}`);
		}
		else {
			const sortedDays = [...(rule.weekdays as IsoWeekday[])].sort((a, b) => a - b);
			const dayLabels = sortedDays.map(getDayLabel);
			parts.push(`à ${dayLabels.join(', ')}`);
		}
	}

	/* ---------------- Holidays ---------------- */

	if (rule.holidays?.mode === 'all') {
		parts.push('incluindo feriados');
	}
	else if (rule.holidays?.mode === 'specific' && rule.holidays.ids?.length) {
		const labels = rule.holidays.ids.map(
			id => holidayNames[id] ?? 'feriado',
		);

		if (labels.length === 1) {
			parts.push(`apenas no feriado ${labels[0]}`);
		}
		else {
			parts.push(`apenas nos feriados ${labels.join(' e ')}`);
		}
	}
	else {
		parts.push('excepto feriados');
	}

	/* ---------------- Events ---------------- */

	if (rule.events?.length) {
		const labels = rule.events.map(
			id => eventNames[id] ?? 'evento',
		);

		if (labels.length === 1) {
			parts.push(`durante o evento ${labels[0]}`);
		}
		else {
			parts.push(`durante os eventos ${labels.join(' e ')}`);
		}
	}

	return parts.join(', ') + '.';
}
