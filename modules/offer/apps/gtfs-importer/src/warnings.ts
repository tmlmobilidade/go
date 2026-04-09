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
const details = new Map<WarningType, Record<string, unknown>[]>();

export function warn(type: WarningType, info?: Record<string, unknown>): void {
	counts.set(type, (counts.get(type) ?? 0) + 1);
	if (info) {
		if (!details.has(type)) details.set(type, []);
		details.get(type)!.push(info);
	}
	console.warn(`[gtfs-importer] ${type}`, info ?? '');
}

export function printWarningSummary(): void {
	const total = [...counts.values()].reduce((a, b) => a + b, 0);

	if (!total) return;

	const lines = [...counts.entries()]
		.map(([type, count]) => {
			const typeDetails = details.get(type);
			if (typeDetails?.length) {
				const detailLines = typeDetails.map(d => `      ${JSON.stringify(d)}`).join('\n');
				return `  - ${count}x ${type}:\n${detailLines}`;
			}
			return `  - ${count}x ${type}`;
		})
		.join('\n');

	console.warn(`[gtfs-importer] Finished with ${total} warning(s):\n${lines}`);
}

export function resetWarnings(): void {
	counts.clear();
	details.clear();
}
