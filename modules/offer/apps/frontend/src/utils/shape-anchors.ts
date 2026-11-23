/* * */

import { type Path, type ShapeAnchor } from '@tmlmobilidade/go-types-offer';

/* * */

export interface ShapeAnchorIssue {
	anchorId: string
	candidates: { afterId: string, afterIndex: number, afterStopId: string, beforeId: string, beforeIndex: number, beforeStopId: string }[]
	reason: 'ambiguous' | 'missing'
}

/** Legacy stop pairs resolve only when exactly one adjacent occurrence matches. Never guess on loops. */
export function resolveShapeAnchors(path: Pick<Path, '_id' | 'stop_id'>[], anchors: ShapeAnchor[]) {
	const resolved: ShapeAnchor[] = [];
	const issues: ShapeAnchorIssue[] = [];
	for (const anchor of anchors) {
		const candidates = path.flatMap((after, index) => {
			const before = path[index + 1];
			if (!before) return [];
			const matches = anchor.after_path_item_id && anchor.before_path_item_id
				? anchor.after_path_item_id === after._id && anchor.before_path_item_id === before._id
				: anchor.after_stop_id === after.stop_id && anchor.before_stop_id === before.stop_id;
			return matches ? [{ afterId: after._id, afterIndex: index, afterStopId: after.stop_id, beforeId: before._id, beforeIndex: index + 1, beforeStopId: before.stop_id }] : [];
		});
		if (candidates.length !== 1) {
			issues.push({ anchorId: anchor._id, candidates, reason: candidates.length > 1 ? 'ambiguous' : 'missing' });
			continue;
		}
		resolved.push({
			_id: anchor._id,
			after_path_item_id: candidates[0].afterId,
			before_path_item_id: candidates[0].beforeId,
			lat: anchor.lat,
			lon: anchor.lon,
			sequence: anchor.sequence ?? 0,
			type: anchor.type ?? 'via',
		});
	}
	return { anchors: resolved, issues };
}
