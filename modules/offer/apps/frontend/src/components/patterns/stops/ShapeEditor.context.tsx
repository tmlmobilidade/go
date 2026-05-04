'use client';

/* * */

import { usePatternDetailContext } from '@/components/patterns/detail/PatternDetail.context';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { generateRandomString } from '@tmlmobilidade/strings';
import { Path, Stop } from '@tmlmobilidade/types';
import { useToast } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { createContext, PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';

/* * */

interface ShapeAnchor {
	_id: string
	after_stop_id: number
	before_stop_id: number
	lat: number
	lon: number
	sequence: number
	type: 'through' | 'via'
}

interface RoutePreviewPoint {
	lat: number
	lon: number
	type: 'break' | 'through' | 'via'
}

interface RoutePreviewLeg {
	distance: number
	duration: number
	from_index: number
	geojson: GeoJSON.Feature<GeoJSON.LineString, {
		distance: number
		duration: number
		from_index: number
		to_index: number
	}>
	geometry: [number, number][]
	to_index: number
}

interface RoutePreviewResponse {
	distance: number
	duration: number
	geojson: GeoJSON.Feature<GeoJSON.LineString, {
		distance: number
		duration: number
	}>
	geometry: [number, number][]
	legs: RoutePreviewLeg[]
}

interface StopsEditorContextState {
	actions: {
		addShapeAnchor: (anchor: Omit<ShapeAnchor, '_id' | 'sequence'>) => Promise<void>
		addStop: (stop: Stop, index: number) => Promise<void>
		appendStop: (stop: Stop) => Promise<void>
		convertShapeToEditable: () => Promise<void>
		moveShapeAnchor: (anchorId: string, lat: number, lon: number) => Promise<void>
		prependStop: (stop: Stop) => Promise<void>
		recomputeRoute: (path: Path[], anchors?: ShapeAnchor[]) => Promise<void>
		removeShapeAnchor: (anchorId: string) => Promise<void>
		removeStop: (index: number) => Promise<void>
		reorderStops: (path: Path[]) => Promise<void>
		revertPath: () => void
		submit: () => void
	}
	data: {
		anchors: ShapeAnchor[]
		hasUnsavedChanges: boolean
		path: Path[]
		routeData: null | RoutePreviewResponse
	}
	flags: {
		isEditableShape: boolean
		isLoadingRoute: boolean
	}
}

/* * */

const StopsEditorContext = createContext<StopsEditorContextState | undefined>(undefined);

export function useStopsEditorContext() {
	const context = useContext(StopsEditorContext);

	if (!context) {
		throw new Error('useStopsEditorContext must be used within StopsEditorContextProvider');
	}

	return context;
}

/* * */

function createPathItemFromStop(stop: Stop): Path {
	return {
		_id: generateRandomString({ length: 5 }),
		allow_drop_off: true,
		allow_pickup: true,
		distance_delta: 0,
		stop,
		stop_id: stop._id,
		timepoint: true,
		// zones: stop.zone_ids ?? [],
	};
}

function applyRouteToPath(path: Path[], routeData: RoutePreviewResponse, points: RoutePreviewPoint[]): Path[] {
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

function buildRoutePreviewPoints(path: Path[], anchors: ShapeAnchor[]): RoutePreviewPoint[] {
	return path
		.filter(pathItem => pathItem.stop)
		.flatMap((pathItem, index, filteredPath) => {
			const stopPoint: RoutePreviewPoint = {
				lat: pathItem.stop?.latitude ?? 0,
				lon: pathItem.stop?.longitude ?? 0,
				type: 'break',
			};

			const nextPathItem = filteredPath[index + 1];

			if (!nextPathItem) {
				return [stopPoint];
			}

			const segmentAnchors = anchors
				.filter(anchor => anchor.after_stop_id === pathItem.stop_id && anchor.before_stop_id === nextPathItem.stop_id)
				.sort((a, b) => a.sequence - b.sequence)
				.map<RoutePreviewPoint>(anchor => ({
					lat: anchor.lat,
					lon: anchor.lon,
					type: anchor.type,
				}));

			return [stopPoint, ...segmentAnchors];
		});
}

/* * */

export function StopsEditorContextProvider({ children, onClose }: PropsWithChildren<{ onClose: () => void }>) {
	const patternDetailContext = usePatternDetailContext();

	const [routeData, setRouteData] = useState<null | RoutePreviewResponse>(null);
	const [isLoadingRoute, setIsLoadingRoute] = useState(false);

	const path = useMemo(() => patternDetailContext.data.form.values.path ?? [], [patternDetailContext.data.form.values.path]);

	const hasUnsavedChanges = useMemo(() => {
		const dbPath = patternDetailContext.data.pattern?.path ?? [];
		return JSON.stringify(path) !== JSON.stringify(dbPath);
	}, [path, patternDetailContext.data.pattern?.path]);

	const anchors = useMemo(() => {
		return patternDetailContext.data.form.values.shape?.anchors;
	}, [patternDetailContext.data.form.values.shape?.anchors]);

	const isEditableShape = anchors?.length !== undefined;

	const recomputeRoute = useCallback(async (nextPath: Path[], nextAnchors: ShapeAnchor[] = anchors) => {
		try {
			setIsLoadingRoute(true);

			const points = buildRoutePreviewPoints(nextPath, nextAnchors);

			const res = await fetchData<RoutePreviewResponse>(
				API_ROUTES.offer.SHAPES_ROUTE_PREVIEW,
				'POST',
				{
					costing: 'auto',
					points,
				},
			);

			if (!res.isOk) {
				useToast.error({
					message: res.error,
					title: 'Erro ao recalcular percurso',
				});
				return;
			}

			const updatedPath = applyRouteToPath(nextPath, res.data, points);

			patternDetailContext.data.form.setFieldValue('path', updatedPath);

			patternDetailContext.data.form.setFieldValue('shape', {
				...(patternDetailContext.data.form.values.shape ?? {}),
				anchors: nextAnchors,
				extension: Math.round(res.data.distance),
				geojson: res.data.geojson,
				legs: res.data.legs,
			});

			setRouteData(res.data);
		} catch (error) {
			useToast.error({
				message: error instanceof Error ? error.message : 'Erro desconhecido',
				title: 'Erro ao recalcular percurso',
			});
		} finally {
			setIsLoadingRoute(false);
		}
	}, [anchors, patternDetailContext.data.form]);

	const convertShapeToEditable = useCallback(async () => {
		await recomputeRoute(path, []);
	}, [path, recomputeRoute]);

	const addShapeAnchor = useCallback(async (anchor: Omit<ShapeAnchor, '_id' | 'sequence'>) => {
		const segmentAnchorsCount = anchors.filter((existingAnchor) => {
			return existingAnchor.after_stop_id === anchor.after_stop_id && existingAnchor.before_stop_id === anchor.before_stop_id;
		}).length;

		const nextAnchors: ShapeAnchor[] = [
			...anchors,
			{
				...anchor,
				_id: generateRandomString({ length: 5 }),
				sequence: segmentAnchorsCount,
			},
		];

		patternDetailContext.data.form.setFieldValue('shape.anchors', nextAnchors);

		await recomputeRoute(path, nextAnchors);
	}, [anchors, path, patternDetailContext.data.form, recomputeRoute]);

	const addStop = useCallback(async (stop: Stop, index: number) => {
		const nextPath = [...path];
		nextPath.splice(index, 0, createPathItemFromStop(stop));

		patternDetailContext.data.form.setFieldValue('path', nextPath);
		await recomputeRoute(nextPath, anchors);
	}, [anchors, path, patternDetailContext.data.form, recomputeRoute]);

	const prependStop = useCallback(async (stop: Stop) => {
		await addStop(stop, 0);
	}, [addStop]);

	const appendStop = useCallback(async (stop: Stop) => {
		await addStop(stop, path.length);
	}, [addStop, path.length]);

	const removeStop = useCallback(async (index: number) => {
		const nextPath = path.filter((_, pathIndex) => pathIndex !== index);
		const removedPathItem = path[index];

		const nextAnchors = anchors.filter((anchor) => {
			return anchor.after_stop_id !== removedPathItem?.stop_id && anchor.before_stop_id !== removedPathItem?.stop_id;
		});

		patternDetailContext.data.form.setFieldValue('path', nextPath);
		await recomputeRoute(nextPath, nextAnchors);
	}, [anchors, path, patternDetailContext.data.form, recomputeRoute]);

	const reorderStops = useCallback(async (nextPath: Path[]) => {
		const nextStopIds = new Set(nextPath.map(pathItem => pathItem.stop_id));

		const nextAnchors = anchors.filter((anchor) => {
			return nextStopIds.has(anchor.after_stop_id) && nextStopIds.has(anchor.before_stop_id);
		});

		patternDetailContext.data.form.setFieldValue('path', nextPath);
		await recomputeRoute(nextPath, nextAnchors);
	}, [anchors, patternDetailContext.data.form, recomputeRoute]);

	const removeShapeAnchor = useCallback(async (anchorId: string) => {
		const nextAnchors = anchors.filter(a => a._id !== anchorId);
		patternDetailContext.data.form.setFieldValue('shape.anchors', nextAnchors);
		await recomputeRoute(path, nextAnchors);
	}, [anchors, path, patternDetailContext.data.form, recomputeRoute]);

	const moveShapeAnchor = useCallback(async (anchorId: string, lat: number, lon: number) => {
		const nextAnchors = anchors.map(a => a._id === anchorId ? { ...a, lat, lon } : a);
		patternDetailContext.data.form.setFieldValue('shape.anchors', nextAnchors);
		await recomputeRoute(path, nextAnchors);
	}, [anchors, path, patternDetailContext.data.form, recomputeRoute]);

	const revertPath = useCallback(() => {
		const originalPattern = patternDetailContext.data.pattern;
		if (!originalPattern) return;
		patternDetailContext.data.form.setFieldValue('path', originalPattern.path ?? []);
		patternDetailContext.data.form.setFieldValue('shape', originalPattern.shape);
		setRouteData(null);
	}, [patternDetailContext.data.pattern, patternDetailContext.data.form]);

	const submit = useCallback(() => {
		onClose();
	}, [onClose]);

	const contextValue: StopsEditorContextState = useMemo(() => ({
		actions: {
			addShapeAnchor,
			addStop,
			appendStop,
			convertShapeToEditable,
			moveShapeAnchor,
			prependStop,
			recomputeRoute,
			removeShapeAnchor,
			removeStop,
			reorderStops,
			revertPath,
			submit,
		},
		data: {
			anchors,
			hasUnsavedChanges,
			path,
			routeData,
		},
		flags: {
			isEditableShape,
			isLoadingRoute,
		},
	}), [addShapeAnchor, addStop, appendStop, convertShapeToEditable, moveShapeAnchor, prependStop, recomputeRoute, removeShapeAnchor, removeStop, reorderStops, revertPath, submit, anchors, hasUnsavedChanges, path, routeData, isEditableShape, isLoadingRoute]);

	return (
		<StopsEditorContext.Provider value={contextValue}>
			{children}
		</StopsEditorContext.Provider>
	);
}
