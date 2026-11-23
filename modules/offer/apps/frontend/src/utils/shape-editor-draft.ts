/* * */

import { type PatternsDetailPathItem } from '@tmlmobilidade/go-offer-pckg-types';
import { type Shape, type StopsParameter } from '@tmlmobilidade/go-types-offer';
import { generateRandomString } from '@tmlmobilidade/strings';

import { type RoutePreviewPoint, type RoutePreviewResponse } from './route-preview';

/* * */

export interface ShapeEditorDraft {
	parameters?: StopsParameter[]
	path: PatternsDetailPathItem[]
	shape?: Shape
}

/** Old imports could reuse an occurrence ID. Repair identities locally without changing visit order or parameters. */
export function normalizeShapeEditorDraft(values: ShapeEditorDraft, createId = () => generateRandomString({ length: 5 })): ShapeEditorDraft {
	const used = new Set<string>();
	return {
		...values,
		path: values.path.map((item) => {
			let id = item._id;
			while (!id || used.has(id)) id = createId();
			used.add(id);
			return id === item._id ? item : { ...item, _id: id };
		}),
	};
}

/** Parameters are positional on disk; path-item IDs keep repeated stop occurrences distinct while editing. */
export function updateShapeEditorDraft(previous: ShapeEditorDraft, path: PatternsDetailPathItem[], shape: Shape | undefined): ShapeEditorDraft {
	const parameters = previous.parameters?.map((parameter) => {
		const valuesByOccurrence = new Map(previous.path.map((item, index) => [item._id, parameter.path[index]]));
		return {
			...parameter,
			path: path.map((item) => {
				const existing = valuesByOccurrence.get(item._id);
				return existing?.stop_id === item.stop_id
					? { ...existing }
					: { avg_speed: 0, dwell_time: 30, stop_id: item.stop_id };
			}),
		};
	});
	return { parameters, path, shape };
}

export function applyRouteToPath(path: PatternsDetailPathItem[], routeData: RoutePreviewResponse, points: RoutePreviewPoint[]): PatternsDetailPathItem[] {
	const breakIndices = points
		.map((p, i) => (p.type === 'break' ? i : -1))
		.filter(i => i !== -1);

	return path.map((pathItem, index) => {
		if (index === 0) {
			return {
				...pathItem,
				distance_delta: 0,
			};
		}

		const fromBreakIdx = breakIndices[index - 1];
		const toBreakIdx = breakIndices[index];

		const distance = routeData.legs
			.filter(leg => leg.from_index >= fromBreakIdx && leg.to_index <= toBreakIdx)
			.reduce((sum, leg) => sum + leg.distance, 0);

		return {
			...pathItem,
			distance_delta: Math.round(distance),
		};
	});
}
