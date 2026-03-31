import { Event, EventReplacementRule, EventRestrictionRule, EventRule, Pattern, ScheduleRule } from '@tmlmobilidade/types';

function eventRuleAffectsLine(rule: EventRule, lineId: string): boolean {
	switch (rule.lines_mode) {
		case 'all':
			return true;
		case 'exclude':
			return !(rule.lines_to_exclude ?? []).includes(lineId);
		case 'include':
			return (rule.lines_to_include ?? []).includes(lineId);
		default:
			return false;
	}
}

function buildEventDerivedRestriction(args: {
	event: Event
	pattern: Pattern
	rule: EventRestrictionRule
}): EventRestrictionRule | null {
	const { event, pattern, rule } = args;

	if (!rule.dates?.length) return null;
	if (!eventRuleAffectsLine(rule, pattern.line_id)) return null;

	return {
		_id: `event:${event._id}:rule:${rule._id || 'unnamed'}`,
		all_day: rule.all_day,
		dates: rule.dates,
		end_time: rule.end_time,
		event: {
			id: event._id,
			title: event.title,
		},
		kind: 'event_restriction',
		lines_mode: rule.lines_mode,
		lines_to_exclude: rule.lines_to_exclude,
		lines_to_include: rule.lines_to_include,
		name: rule.name,
		start_time: rule.start_time,
	};
}

function buildEventDerivedReplacement(args: {
	event: Event
	pattern: Pattern
	rule: EventReplacementRule
}): EventReplacementRule | null {
	const { event, pattern, rule } = args;

	if (!rule.dates?.length) return null;
	if (!eventRuleAffectsLine(rule, pattern.line_id)) return null;
	if (!rule.weekdays?.length && !rule.year_period_ids?.length) return null;

	return {
		_id: `event:${event._id}:rule:${rule._id || 'unnamed'}`,
		dates: rule.dates,
		event: {
			id: event._id,
			title: event.title,
		},
		kind: 'event_replacement',
		lines_mode: rule.lines_mode,
		lines_to_exclude: rule.lines_to_exclude,
		lines_to_include: rule.lines_to_include,
		name: rule.name,
		same_weekday: rule.same_weekday,
		weekdays: rule.weekdays,
		year_period_ids: rule.year_period_ids,
	};
}

/**
 * Merges persisted pattern rules with event-derived rules relevant to this pattern.
 */
export function resolvePatternRules(
	pattern: Pattern,
	events: Event[],
): ScheduleRule[] {
	const derivedRules: ScheduleRule[] = [];

	for (const event of events) {
		for (const rule of event.rules ?? []) {
			if (rule.kind === 'event_restriction') {
				const derived = buildEventDerivedRestriction({ event, pattern, rule });
				if (derived) derivedRules.push(derived);
			} else if (rule.kind === 'event_replacement') {
				const derived = buildEventDerivedReplacement({ event, pattern, rule });
				if (derived) derivedRules.push(derived);
			}
		}
	}

	return [...(pattern.rules ?? []), ...derivedRules];
}
