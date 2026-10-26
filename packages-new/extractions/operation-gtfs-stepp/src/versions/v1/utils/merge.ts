/* * */

import { Logger } from '@tmlmobilidade/go-utils-telemetry';

import { type PlanExportConfig, type SharedRow } from '../types.js';
import { type OutputRow } from './writers.js';

/* * */

/**
 * Returns the source row for the given row.
 * @param config - The configuration of the plan export.
 * @param row - The row to get the source row for.
 * @returns The source row for the given row.
 */
export function rowSource(config: PlanExportConfig, row: OutputRow): SharedRow {
	return { activeFrom: config.planActiveFrom, createdAt: config.planCreatedAt, endDate: config.endDate, planId: config.planId, row: { ...row }, startDate: config.startDate };
}

/**
 * Uses original plan dates, since clipping can give several plans the same export start.
 * @param current - The current shared row.
 * @param previous - The previous shared row.
 * @returns Whether the current shared row is newer than the previous shared row.
 */
export function isNewerSource(current: SharedRow, previous: SharedRow): boolean {
	if (current.activeFrom !== previous.activeFrom) return current.activeFrom > previous.activeFrom;
	if (current.createdAt !== previous.createdAt) return current.createdAt > previous.createdAt;
	return current.planId > previous.planId;
}

/**
 * Keeps source IDs stable and selects the complete definition from the latest plan.
 * @param config - The configuration of the plan export.
 * @param table - The table containing the definition.
 * @param id - The original ID of the definition or row group.
 * @param row - The row to merge (empty for streamed groups).
 */
export function mergeSharedRow(config: PlanExportConfig, table: 'agency' | 'routes' | 'routes_stepp' | 'shapes' | 'stops' | 'trips', id: string, row: OutputRow) {
	const key = `${table}:${id}`;
	const current = rowSource(config, row);
	const previous = config.sharedRows.get(key);
	const replace = previous === undefined || isNewerSource(current, previous);
	if (previous && JSON.stringify(previous.row) !== JSON.stringify(row)) {
		const differences = [...new Set([...Object.keys(previous.row), ...Object.keys(row)])]
			.filter(field => previous.row[field] !== row[field])
			.map(field => ({ current: row[field] ?? null, field, previous: previous.row[field] ?? null }));
		const chosen = replace ? current : previous;
		Logger.info({
			attributes: {
				chosen_plan_id: chosen.planId,
				current_active_from: current.activeFrom,
				current_plan_id: current.planId,
				differences,
				event: 'operation_gtfs_stepp.definition_merge',
				file: `${table}.txt`,
				id,
				previous_active_from: previous.activeFrom,
				previous_plan_id: previous.planId,
				replaced: replace,
			},
			message: [
				`Selected ${table}.txt definition ${JSON.stringify(id)} using newer plan ${JSON.stringify(chosen.planId)} (active_from ${chosen.activeFrom}).`,
				...differences.map(diff => `  ${diff.field}: plan ${JSON.stringify(previous.planId)} = ${JSON.stringify(diff.previous)}; plan ${JSON.stringify(current.planId)} = ${JSON.stringify(diff.current)}`),
			].join('\n'),
		});
	}
	if (replace) config.sharedRows.set(key, current);
}

/** Identifies a complete streamed group from one source plan. */
export function groupSource(id: string, planId: string): string {
	return JSON.stringify([id, planId]);
}
