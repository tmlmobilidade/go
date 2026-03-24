import { events, lines } from '@tmlmobilidade/interfaces';
import { type Event, type EventReplacementRule, type EventRestrictionRule, type EventRule, type Pattern, type ScheduleRule } from '@tmlmobilidade/types';

// ---- helpers

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

// ---- main util

export async function mergePatternWithEventRules(pattern: Pattern): Promise<Pattern> {
	const line = await lines.findById(pattern.line_id);
	if (!line) return pattern;

	// Fetch all events for this agency - filtering happens at the rule level
	const candidateEvents = await events.findMany({
		agency_ids: { $in: [line.agency_id] },
	});

	const derivedRules: (EventReplacementRule | EventRestrictionRule)[] = [];

	for (const event of candidateEvents) {
		// Process each rule within the event
		const eventRules = event.rules ?? [];

		for (const rule of eventRules) {
			if (rule.kind === 'event_restriction') {
				const restrictionRule = buildEventDerivedRestriction({ event, pattern, rule });
				if (restrictionRule) derivedRules.push(restrictionRule);
			} else if (rule.kind === 'event_replacement') {
				const replacementRule = buildEventDerivedReplacement({ event, pattern, rule });
				if (replacementRule) derivedRules.push(replacementRule);
			}
		}
	}

	console.log('Derived events', derivedRules);

	// IMPORTANT:
	// - Keep only manual rules persisted on pattern
	// - Return union list to the frontend by appending event rules
	return {
		...pattern,
		rules: [...(pattern.rules ?? []), ...derivedRules] as ScheduleRule[],
	};
}
