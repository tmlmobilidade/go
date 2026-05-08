/* * */

import { type SamTimelineAccent } from '@tmlmobilidade/types';

/**
 * API / persisted timeline row shape (list batch or detail). Total analyses = successful + failed;
 * chip color uses {@link accentFromSuccessFailedCounts}.
 */
export interface TimelineCountSource {
	count?: unknown
	failed_count?: unknown
	successful_count?: unknown
}

/** Coerce API / BSON-friendly values to a non-negative int (handles Long-like objects). */
export function safeTimelineInt(value: unknown): number {
	if (typeof value === 'number' && Number.isFinite(value))
		return Math.max(0, Math.trunc(value));
	if (value != null && typeof value === 'object' && 'toNumber' in value && typeof (value as { toNumber: () => unknown }).toNumber === 'function') {
		const n = Number((value as { toNumber: () => unknown }).toNumber());
		if (Number.isFinite(n))
			return Math.max(0, Math.trunc(n));
	}
	const n = Number(value);
	if (!Number.isFinite(n))
		return 0;
	return Math.max(0, Math.trunc(n));
}

/**
 * Resolves successful / failed / total for one timeline bucket (`total` = successful + failed).
 */
export function normalizeTimelineCounts(item: TimelineCountSource): { failed: number, successful: number, total: number } {
	const successful = safeTimelineInt(item.successful_count ?? 0);
	const failed = safeTimelineInt(item.failed_count ?? 0);
	if (successful > 0 || failed > 0)
		return { failed, successful, total: successful + failed };

	const total = safeTimelineInt(item.count ?? 0);
	if (total <= 0)
		return { failed: 0, successful: 0, total: 0 };

	return { failed: 0, successful: total, total };
}

/** Square / chip color from resolved totals. */
export function accentFromSuccessFailedCounts(successfulCount: number, failedCount: number): SamTimelineAccent {
	if (successfulCount > 0 && failedCount > 0) return 'orange';
	if (successfulCount > 0) return 'green';
	if (failedCount > 0) return 'red';
	return 'white';
}
