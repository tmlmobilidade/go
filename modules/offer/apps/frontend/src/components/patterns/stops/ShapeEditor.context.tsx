'use client';

/* * */

import { usePatternDetailContext } from '@/components/patterns/detail/PatternDetail.context';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { generateRandomString } from '@tmlmobilidade/strings';
import { Path, PopulatedPath, Shape, Stop } from '@tmlmobilidade/types';
import { useToast } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { createContext, PropsWithChildren, useCallback, useContext, useMemo, useRef, useState } from 'react';

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

interface HistoryEntry {
	path: PopulatedPath[]
	shape: Shape | undefined
}

interface StopsEditorContextState {
	actions: {
		addShapeAnchor: (anchor: Omit<ShapeAnchor, '_id' | 'sequence'>) => Promise<void>
		addStop: (stop: Stop, index: number) => Promise<void>
		appendStop: (stop: Stop) => Promise<void>
		cancel: () => void
		convertShapeToEditable: () => Promise<void>
		dismissMigrationWarning: () => void
		moveShapeAnchor: (anchorId: string, lat: number, lon: number) => Promise<void>
		prependStop: (stop: Stop) => Promise<void>
		previewRoute: (path: Path[], anchors?: ShapeAnchor[]) => Promise<void>
		recomputeRoute: (path: Path[], anchors?: ShapeAnchor[]) => Promise<void>
		redo: () => void
		removeShapeAnchor: (anchorId: string) => Promise<void>
		removeStop: (index: number) => Promise<void>
		reorderStops: (path: Path[]) => Promise<void>
		revertPath: () => void
		submit: () => void
		undo: () => void
	}
	data: {
		anchors: ShapeAnchor[]
		hasUnsavedChanges: boolean
		path: Path[]
		routeData: null | RoutePreviewResponse
		shape: Shape | undefined
	}
	flags: {
		canRedo: boolean
		canUndo: boolean
		isEditableShape: boolean
		isLoadingRoute: boolean
		migrationWarningVisible: boolean
		needsMigration: boolean
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

function createPathItemFromStop(stop: Stop): PopulatedPath {
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

function applyRouteToPath(path: PopulatedPath[], routeData: RoutePreviewResponse, points: RoutePreviewPoint[]): PopulatedPath[] {
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

function buildRoutePreviewPoints(path: PopulatedPath[], anchors: ShapeAnchor[]): RoutePreviewPoint[] {
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

	// Local intermediate state — only written back to the pattern form on submit
	const [initialPath] = useState<PopulatedPath[]>(() =>
		(patternDetailContext.data.form.values.path ?? patternDetailContext.data.pattern?.path ?? []) as PopulatedPath[],
	);
	const [initialShape] = useState<Shape | undefined>(() =>
		patternDetailContext.data.form.values.shape,
	);

	const [localPath, setLocalPath] = useState<PopulatedPath[]>(initialPath);
	const [localShape, setLocalShape] = useState<Shape | undefined>(initialShape);

	// Keep a ref so recomputeRoute can read the latest shape without stale closures
	const localShapeRef = useRef<Shape | undefined>(initialShape);
	localShapeRef.current = localShape;

	// History stack — stored in refs to avoid re-renders on push; a small state
	// object is used only to make canUndo / canRedo reactive.
	const historyRef = useRef<HistoryEntry[]>([{ path: initialPath, shape: initialShape }]);
	const historyIndexRef = useRef(0);
	const [historyMeta, setHistoryMeta] = useState({ index: 0, length: 1 });

	const canUndo = historyMeta.index > 0;
	const canRedo = historyMeta.index < historyMeta.length - 1;

	const pushToHistory = useCallback((newPath: PopulatedPath[], newShape: Shape | undefined) => {
		const newStack = historyRef.current.slice(0, historyIndexRef.current + 1);
		newStack.push({ path: newPath, shape: newShape });
		historyRef.current = newStack;
		historyIndexRef.current = newStack.length - 1;
		setLocalPath(newPath);
		setLocalShape(newShape);
		setHistoryMeta({ index: historyIndexRef.current, length: newStack.length });
	}, []);

	const path = localPath;

	const anchors = useMemo(() => localShape?.anchors ?? [], [localShape]);

	const isEditableShape = localShape !== undefined;

	// A shape is "unmigrated" when imported from GTFS (has geometry) but has never
	// been processed by Valhalla (no legs). No shape at all = blank slate, fully editable.
	const needsMigration = localShape !== undefined && !(localShape.legs?.length);
	const needsMigrationRef = useRef(false);
	needsMigrationRef.current = needsMigration;

	const [migrationWarningVisible, setMigrationWarningVisible] = useState(false);

	const dismissMigrationWarning = useCallback(() => {
		setMigrationWarningVisible(false);
	}, []);

	const hasUnsavedChanges = useMemo(() =>
		JSON.stringify(localPath) !== JSON.stringify(initialPath),
	[localPath, initialPath]);

	const recomputeRoute = useCallback(async (nextPath: PopulatedPath[], nextAnchors: ShapeAnchor[] = anchors) => {
		try {
			setIsLoadingRoute(true);

			const points = buildRoutePreviewPoints(nextPath, nextAnchors);

			const res = await fetchData<RoutePreviewResponse>(
				API_ROUTES.offer.SHAPES_ROUTE_PREVIEW,
				'POST',
				{
					costing: 'bus', // later change this to be dynamic based on pattern typology
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

			const updatedShape: Shape = {
				...(localShapeRef.current ?? {}),
				anchors: nextAnchors,
				extension: Math.round(res.data.distance),
				geojson: res.data.geojson,
				legs: res.data.legs,
			};

			pushToHistory(updatedPath, updatedShape);
			setRouteData(res.data);
		} catch (error) {
			useToast.error({
				message: error instanceof Error ? error.message : 'Erro desconhecido',
				title: 'Erro ao recalcular percurso',
			});
		} finally {
			setIsLoadingRoute(false);
		}
	}, [anchors, pushToHistory]);

	const previewRoute = useCallback(async (nextPath: PopulatedPath[], nextAnchors: ShapeAnchor[] = anchors) => {
		try {
			const points = buildRoutePreviewPoints(nextPath, nextAnchors);

			const res = await fetchData<RoutePreviewResponse>(
				API_ROUTES.offer.SHAPES_ROUTE_PREVIEW,
				'POST',
				{
					costing: 'bus',
					points,
				},
			);

			if (!res.isOk) return;

			setRouteData(res.data);
		} catch {
			// Silent — preview failures are non-critical
		}
	}, [anchors]);

	const convertShapeToEditable = useCallback(async () => {
		setMigrationWarningVisible(false);
		await recomputeRoute(path, []);
	}, [path, recomputeRoute]);

	const addShapeAnchor = useCallback(async (anchor: Omit<ShapeAnchor, '_id' | 'sequence'>) => {
		if (needsMigrationRef.current) {
			setMigrationWarningVisible(true);
			return;
		}
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

		await recomputeRoute(path, nextAnchors);
	}, [anchors, path, recomputeRoute]);

	const addStop = useCallback(async (stop: Stop, index: number) => {
		if (needsMigrationRef.current) {
			setMigrationWarningVisible(true);
			return;
		}
		const nextPath = [...path];
		nextPath.splice(index, 0, createPathItemFromStop(stop));

		setLocalPath(nextPath);
		await recomputeRoute(nextPath, anchors);
	}, [anchors, path, recomputeRoute]);

	const prependStop = useCallback(async (stop: Stop) => {
		await addStop(stop, 0);
	}, [addStop]);

	const appendStop = useCallback(async (stop: Stop) => {
		await addStop(stop, path.length);
	}, [addStop, path.length]);

	const removeStop = useCallback(async (index: number) => {
		if (needsMigrationRef.current) {
			setMigrationWarningVisible(true);
			return;
		}
		const nextPath = path.filter((_, pathIndex) => pathIndex !== index);
		const removedPathItem = path[index];

		const nextAnchors = anchors.filter((anchor) => {
			return anchor.after_stop_id !== removedPathItem?.stop_id && anchor.before_stop_id !== removedPathItem?.stop_id;
		});

		setLocalPath(nextPath);
		await recomputeRoute(nextPath, nextAnchors);
	}, [anchors, path, recomputeRoute]);

	const reorderStops = useCallback(async (nextPath: PopulatedPath[]) => {
		if (needsMigrationRef.current) {
			setMigrationWarningVisible(true);
			return;
		}
		const nextStopIds = new Set(nextPath.map(pathItem => pathItem.stop_id));

		const nextAnchors = anchors.filter((anchor) => {
			return nextStopIds.has(anchor.after_stop_id) && nextStopIds.has(anchor.before_stop_id);
		});

		setLocalPath(nextPath);
		await recomputeRoute(nextPath, nextAnchors);
	}, [anchors, recomputeRoute]);

	const removeShapeAnchor = useCallback(async (anchorId: string) => {
		if (needsMigrationRef.current) {
			setMigrationWarningVisible(true);
			return;
		}
		const nextAnchors = anchors.filter(a => a._id !== anchorId);
		await recomputeRoute(path, nextAnchors);
	}, [anchors, path, recomputeRoute]);

	const moveShapeAnchor = useCallback(async (anchorId: string, lat: number, lon: number) => {
		if (needsMigrationRef.current) {
			setMigrationWarningVisible(true);
			return;
		}
		const nextAnchors = anchors.map(a => a._id === anchorId ? { ...a, lat, lon } : a);
		await recomputeRoute(path, nextAnchors);
	}, [anchors, path, recomputeRoute]);

	const undo = useCallback(() => {
		if (historyIndexRef.current <= 0) return;
		historyIndexRef.current--;
		const entry = historyRef.current[historyIndexRef.current];
		setLocalPath(entry.path);
		setLocalShape(entry.shape);
		setRouteData(null);
		setHistoryMeta({ index: historyIndexRef.current, length: historyRef.current.length });
	}, []);

	const redo = useCallback(() => {
		if (historyIndexRef.current >= historyRef.current.length - 1) return;
		historyIndexRef.current++;
		const entry = historyRef.current[historyIndexRef.current];
		setLocalPath(entry.path);
		setLocalShape(entry.shape);
		setRouteData(null);
		setHistoryMeta({ index: historyIndexRef.current, length: historyRef.current.length });
	}, []);

	const revertPath = useCallback(() => {
		pushToHistory(initialPath, initialShape);
		setRouteData(null);
	}, [initialPath, initialShape, pushToHistory]);

	const submit = useCallback(() => {
		patternDetailContext.data.form.setFieldValue('path', localPath);
		patternDetailContext.data.form.setFieldValue('shape', localShape);
		onClose();
	}, [localPath, localShape, onClose, patternDetailContext.data.form]);

	const cancel = useCallback(() => {
		onClose();
	}, [onClose]);

	const contextValue: StopsEditorContextState = useMemo(() => ({
		actions: {
			addShapeAnchor,
			addStop,
			appendStop,
			cancel,
			convertShapeToEditable,
			dismissMigrationWarning,
			moveShapeAnchor,
			prependStop,
			previewRoute,
			recomputeRoute,
			redo,
			removeShapeAnchor,
			removeStop,
			reorderStops,
			revertPath,
			submit,
			undo,
		},
		data: {
			anchors,
			hasUnsavedChanges,
			path,
			routeData,
			shape: localShape,
		},
		flags: {
			canRedo,
			canUndo,
			isEditableShape,
			isLoadingRoute,
			migrationWarningVisible,
			needsMigration,
		},
	}), [addShapeAnchor, addStop, appendStop, cancel, convertShapeToEditable, dismissMigrationWarning, moveShapeAnchor, previewRoute, prependStop, recomputeRoute, redo, removeShapeAnchor, removeStop, reorderStops, revertPath, submit, undo, anchors, canRedo, canUndo, hasUnsavedChanges, migrationWarningVisible, needsMigration, path, routeData, localShape, isEditableShape, isLoadingRoute]);

	return (
		<StopsEditorContext.Provider value={contextValue}>
			{children}
		</StopsEditorContext.Provider>
	);
}
