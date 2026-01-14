import { Period, ScheduleRule, WEEKDAY_OPTIONS } from '@tmlmobilidade/types';

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
	else if (rule.weekdays.length === 5) {
		parts.push('nos dias úteis');
	}
	else if (rule.weekdays.length === 7) {
		parts.push('todos os dias');
	}
	else {
		const dayLabels = rule.weekdays.map(d => WEEKDAY_OPTIONS[d].label);
		parts.push(`à ${dayLabels.join(', ')}`);
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
		parts.push('exceto feriados');
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
