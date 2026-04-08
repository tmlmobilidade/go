/* * */

export const WARNING = {
	INVALID_DEPARTURE_TIME: 'invalid-departure-time',
	MISSING_ROUTE: 'missing-route',
	MISSING_STOP: 'missing-stop',
	MISSING_ZONE_CODE: 'missing-zone-code',
	NO_SCHEDULE_RULES_PATTERN: 'no-schedule-rules-pattern',
	NO_SCHEDULE_RULES_ROUTE: 'no-schedule-rules-route',
	UNKNOWN_EVENT: 'unknown-event',
	UNKNOWN_SERVICE_ID: 'unknown-service-id',
} as const;

export type WarningType = typeof WARNING[keyof typeof WARNING];

/* * */

const counts = new Map<WarningType, number>();

export function warn(type: WarningType, details?: Record<string, unknown>): void {
	counts.set(type, (counts.get(type) ?? 0) + 1);
	console.warn(`[gtfs-importer] ${type}`, details ?? '');
}

export function printWarningSummary(): void {
	const total = [...counts.values()].reduce((a, b) => a + b, 0);

	if (!total) return;

	const lines = [...counts.entries()]
		.map(([type, count]) => `  - ${count}x ${type}`)
		.join('\n');

	console.warn(`[gtfs-importer] Finished with ${total} warning(s):\n${lines}`);
}

export function resetWarnings(): void {
	counts.clear();
}
