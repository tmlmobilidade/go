import { OperationalDate, Period, ScheduleRule, WEEKDAYS } from '@tmlmobilidade/types';

interface CalendarContext {
	endDate: Date
	events: Set<string> // yyyy-mm-dd
	holidays: Set<string> // yyyy-mm-dd
	periods: Period[] // Array of periods with their date ranges
	startDate: Date
}

function ruleAppliesToDate(
	rule: ScheduleRule,
	date: Date,
	ctx: CalendarContext,
): boolean {
	const iso = date.toISOString().slice(0, 10);
	const weekday = date.getDay();

	// 1️⃣ Period - Required
	if (!rule.periodIds || rule.periodIds.length === 0) {
		return false;
	}

	const yyyymmdd = iso.replace(/-/g, ''); // Convert yyyy-mm-dd to yyyyMMdd
	const matchingPeriod = ctx.periods.find(period =>
		rule.periodIds?.includes(period._id)
		&& period.dates?.includes(yyyymmdd as OperationalDate),
	);
	if (!matchingPeriod) {
		return false;
	}

	// 2️⃣ Holiday precedence
	const isHoliday = rule.holidays?.mode === 'all' || (rule.holidays?.mode === 'specific') || ctx.holidays.has(iso);

	//   || (rule.holidays?.mode === 'specific' && rule.holidays?.specific?.includes(iso)) - Check if holiday is today (iso)

	if (isHoliday) {
		const result = !!rule.holidays;
		return result;
	}

	// 3️⃣ Weekdays - Required
	if (!rule.weekdays || rule.weekdays.length === 0) {
		return false;
	}

	if (!rule.weekdays.includes(weekday as WEEKDAYS)) {
		return false;
	}

	// 4️⃣ Events
	if (rule.events && !ctx.events.has(iso)) {
		return false;
	}

	return true;
}

export function computeRuleImpact(
	rule: ScheduleRule,
	ctx: CalendarContext,
) {
	const affectedDates: string[] = [];

	const currentDate = new Date(ctx.startDate);
	currentDate.setHours(0, 0, 0, 0);

	const endDate = new Date(ctx.endDate);
	endDate.setHours(0, 0, 0, 0);

	while (currentDate.getTime() <= endDate.getTime()) {
		if (ruleAppliesToDate(rule, currentDate, ctx)) {
			affectedDates.push(currentDate.toISOString().slice(0, 10));
		}
		currentDate.setDate(currentDate.getDate() + 1);
	}

	return {
		count: affectedDates.length,
		dates: affectedDates,
	};
}
