import { events, lines } from '@tmlmobilidade/interfaces';
import { type Event, type EventDerivedRestriction, OPERATING_MODE, type Pattern, type ScheduleRule } from '@tmlmobilidade/types';

// ---- helpers

function eventAffectsLine(event: Event, lineId: string): boolean {
	switch (event.lines_mode) {
		case 'all':
			return true;
		case 'exclude':
			return !(event.lines_to_exclude ?? []).includes(lineId);
		case 'include':
			return (event.lines_to_include ?? []).includes(lineId);
		case 'none':
			return false;
		default:
			return false;
	}
}

// TODO: Refactor these utils (they are maybe similar to utils on frontend. Logic should be unified)
const isWithin = (tp: string, start: string, end: string) => {
	// Check if the time window crosses midnight (e.g., 10:00 to 02:00)
	const crossesMidnight = end < start;
	return crossesMidnight
		? (tp >= start || tp <= end) // Overnight: after start OR before end
		: (tp >= start && tp <= end); // Same day: between start and end
};

function collectPatternTimePoints(pattern: Pattern): string[] {
	const set = new Set<string>();
	for (const r of pattern.rules ?? []) {
		for (const tp of r.timePoints ?? []) set.add(tp);
	}
	return [...set].sort();
}

function buildEventDerivedRestriction(args: {
	event: Event
	pattern: Pattern
}): EventDerivedRestriction | null {
	const { event, pattern } = args;

	if (!event.dates?.length) return null;
	if (!eventAffectsLine(event, pattern.line_id)) return null;

	const patternTimePoints = collectPatternTimePoints(pattern);

	// If all_day is true OR no times provided, affect all timepoints
	const isAllDay = event.all_day || !event.start_time || !event.end_time;
	const windowTimePoints = isAllDay
		? patternTimePoints
		: patternTimePoints.filter(tp => isWithin(tp, event.start_time, event.end_time));

	return {
		_id: `event:${event._id}`,
		dates: event.dates,
		event: {
			all_day: event.all_day,
			end_time: event.end_time,
			id: event._id,
			start_time: event.start_time,
			title: event.title,
		},
		kind: 'event',
		name: `Redução da oferta derivada do evento ${event.title}`,
		operatingMode: OPERATING_MODE.EXCLUDE,
		timePoints: windowTimePoints,
	};
}

// ---- main util

export async function mergePatternWithEventRules(pattern: Pattern): Promise<Pattern> {
	const line = await lines.findById(pattern.line_id);
	if (!line) return pattern;

	// Coarse DB filter (cheap). Precise filtering is in JS (eventAffectsLine).
	const candidateEvents = await events.findMany({
		$or: [
			{ lines_mode: 'all' },
			{ lines_mode: 'include', lines_to_include: pattern.line_id },
			{ lines_mode: 'exclude', lines_to_exclude: { $ne: pattern.line_id } },
		],
		agency_ids: { $in: [line.agency_id] },
		lines_mode: { $ne: 'none' },
	});

	const derived = candidateEvents
		.map(event => buildEventDerivedRestriction({ event, pattern }))
		.filter((x): x is EventDerivedRestriction => Boolean(x));

	// IMPORTANT:
	// - Keep only manual rules persisted on pattern
	// - Return union list to the frontend by appending event rules
	return {
		...pattern,
		rules: ([...(pattern.rules ?? []), ...derived] as unknown) as ScheduleRule[],
	};
}
