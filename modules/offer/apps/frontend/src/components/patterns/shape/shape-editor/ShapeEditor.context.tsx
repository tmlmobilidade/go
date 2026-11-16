'use client';

/* * */

import { usePatternDetailContext } from '@/components/patterns/detail/PatternDetail.context';
import { type RoutePreviewResponse } from '@/utils/route-preview';
import { resolveShapeAnchors, type ShapeAnchorIssue } from '@/utils/shape-anchors';
import { type ShapeEditorDraft } from '@/utils/shape-editor-draft';
import { type PatternsDetailPathItem } from '@tmlmobilidade/go-offer-pckg-types';
import { type Stop } from '@tmlmobilidade/go-types-infrastructure';
import { type Path, type Shape, type ShapeAnchor } from '@tmlmobilidade/go-types-offer';
import { generateRandomString } from '@tmlmobilidade/strings';
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { useShapeEditorDraft } from './use-shape-editor-draft';
import { useShapeRoutePreview } from './use-shape-route-preview';

/* * */

type NewShapeAnchor = Pick<ShapeAnchor, 'lat' | 'lon' | 'type'> & { after_path_item_id: string, before_path_item_id: string };

interface ShapeEditorContextState {
	actions: {
		addShapeAnchor: (anchor: NewShapeAnchor) => Promise<void>
		addStop: (stop: Stop, index: number) => Promise<void>
		appendStop: (stop: Stop) => Promise<void>
		cancel: () => void
		convertShapeToEditable: () => Promise<void>
		dismissMigrationWarning: () => void
		initializePath: (firstStop: Stop, secondStop: Stop) => Promise<void>
		moveShapeAnchor: (anchorId: string, lat: number, lon: number) => Promise<void>
		prependStop: (stop: Stop) => Promise<void>
		previewRoute: (path: PatternsDetailPathItem[], anchors?: ShapeAnchor[]) => Promise<void>
		redo: () => void
		removeShapeAnchor: (anchorId: string) => Promise<void>
		removeStop: (index: number) => Promise<void>
		reorderStops: (path: PatternsDetailPathItem[]) => Promise<void>
		requestRecalculation: () => void
		revertPath: () => void
		submit: () => void
		undo: () => void
		updateStop: (index: number, values: Partial<Pick<Path, 'allow_drop_off' | 'allow_pickup' | 'timepoint'>>) => void
	}
	data: {
		anchorIssues: ShapeAnchorIssue[]
		anchors: ShapeAnchor[]
		hasUnsavedChanges: boolean
		path: PatternsDetailPathItem[]
		routeData: null | RoutePreviewResponse
		shape: Shape | undefined
	}
	flags: {
		canRecalculate: boolean
		canRedo: boolean
		canSubmit: boolean
		canUndo: boolean
		isEditableShape: boolean
		isLoadingRoute: boolean
		migrationWarningVisible: boolean
		needsMigration: boolean
	}
}

/* * */

const ShapeEditorContext = createContext<ShapeEditorContextState | undefined>(undefined);

export function useShapeEditorContext() {
	const context = useContext(ShapeEditorContext);
	if (!context) throw new Error('useShapeEditorContext must be used within ShapeEditorContextProvider');
	return context;
}

/* * */

function createPathItemFromStop(stop: Stop): PatternsDetailPathItem {
	return {
		_id: generateRandomString({ length: 5 }),
		allow_drop_off: true,
		allow_pickup: true,
		distance_delta: 0,
		stop,
		stop_id: stop._id,
		timepoint: true,
		// Zone assignments belong to this Pattern visit, not to the global stop.
		zones: [],
	};
}

export function ShapeEditorContextProvider({ children, onClose }: PropsWithChildren<{ onClose: () => void }>) {
	//
	// A. Capture a local editing session

	const pattern = usePatternDetailContext();
	const [initialValues] = useState<ShapeEditorDraft>(() => ({
		parameters: pattern.form.getValues().parameters,
		path: pattern.data.path,
		shape: pattern.data.shape ?? undefined,
	}));
	const { canRedo, canUndo, data: draftData, hasUnsavedChanges, push: pushDraft, redo: redoDraft, revert: revertDraft, undo: undoDraft } = useShapeEditorDraft(initialValues);
	const { cancelPending, dispose, isLoading, preview: requestPreview, recompute: recomputeRoute, routeData } = useShapeRoutePreview({ draft: draftData, editEnabled: pattern.capabilities.editEnabled, onApply: pushDraft, patternId: pattern.data.id });
	const access = useRef(pattern.capabilities.editEnabled);
	access.current = pattern.capabilities.editEnabled;
	const closed = useRef(false);
	useEffect(() => {
		closed.current = false;
		return () => {
			closed.current = true;
		};
	}, []);
	const [migrationWarningVisible, setMigrationWarningVisible] = useState(false);

	//
	// B. Resolve segment identities and edit capabilities

	const { path, shape } = draftData;
	const { anchors, issues: anchorIssues } = useMemo(() => resolveShapeAnchors(path, shape?.anchors ?? []), [path, shape?.anchors]);
	const needsMigration = Boolean(shape && !shape.legs?.length) || anchorIssues.length > 0;
	const canRecalculate = pattern.capabilities.editEnabled && !isLoading && path.length >= 2 && path.every(item => item.stop);

	const canMutate = useCallback(() => access.current && !closed.current, []);
	const ensureEditableShape = useCallback(() => {
		if (!canMutate()) return false;
		if (needsMigration) {
			setMigrationWarningVisible(true);
			return false;
		}
		return true;
	}, [canMutate, needsMigration]);

	const pushToHistory = useCallback((nextPath: PatternsDetailPathItem[], nextShape: Shape | undefined) => {
		if (!canMutate()) return;
		cancelPending();
		pushDraft(nextPath, nextShape);
	}, [canMutate, cancelPending, pushDraft]);

	//
	// C. Change path occurrences and anchors within the draft

	const convertShapeToEditable = useCallback(async () => {
		if (!canMutate()) return;
		setMigrationWarningVisible(false);
		// Explicit recalculation keeps resolvable anchors and discards only unresolved ones.
		await recomputeRoute(path, anchors, true);
	}, [canMutate, recomputeRoute, path, anchors]);

	const requestRecalculation = useCallback(() => {
		if (!canMutate()) return;
		if (needsMigration) setMigrationWarningVisible(true);
		else void convertShapeToEditable();
	}, [canMutate, needsMigration, convertShapeToEditable]);

	const addShapeAnchor = useCallback(async (anchor: NewShapeAnchor) => {
		if (!ensureEditableShape()) return;
		const sequence = anchors.filter(item => item.after_path_item_id === anchor.after_path_item_id && item.before_path_item_id === anchor.before_path_item_id).length;
		await recomputeRoute(path, [...anchors, { ...anchor, _id: generateRandomString({ length: 5 }), sequence }]);
	}, [ensureEditableShape, anchors, path, recomputeRoute]);

	const addStop = useCallback(async (stop: Stop, index: number) => {
		if (!ensureEditableShape()) return;
		const nextPath = [...path];
		nextPath.splice(index, 0, createPathItemFromStop(stop));
		if (nextPath.length < 2) {
			pushToHistory(nextPath, undefined);
			return;
		}
		await recomputeRoute(nextPath, resolveShapeAnchors(nextPath, anchors).anchors);
	}, [ensureEditableShape, path, anchors, pushToHistory, recomputeRoute]);

	const initializePath = useCallback(async (firstStop: Stop, secondStop: Stop) => {
		if (!canMutate()) return;
		await recomputeRoute([createPathItemFromStop(firstStop), createPathItemFromStop(secondStop)], []);
	}, [canMutate, recomputeRoute]);

	const prependStop = useCallback(async (stop: Stop) => {
		await addStop(stop, 0);
	}, [addStop]);
	const appendStop = useCallback(async (stop: Stop) => {
		await addStop(stop, path.length);
	}, [addStop, path.length]);

	const removeStop = useCallback(async (index: number) => {
		if (!ensureEditableShape()) return;
		const nextPath = path.filter((_, currentIndex) => currentIndex !== index);
		if (nextPath.length < 2) {
			pushToHistory(nextPath, undefined);
			return;
		}
		await recomputeRoute(nextPath, resolveShapeAnchors(nextPath, anchors).anchors);
	}, [ensureEditableShape, path, anchors, pushToHistory, recomputeRoute]);

	const reorderStops = useCallback(async (nextPath: PatternsDetailPathItem[]) => {
		if (!ensureEditableShape()) return;
		await recomputeRoute(nextPath, resolveShapeAnchors(nextPath, anchors).anchors);
	}, [ensureEditableShape, anchors, recomputeRoute]);

	const removeShapeAnchor = useCallback(async (anchorId: string) => {
		if (!ensureEditableShape()) return;
		await recomputeRoute(path, anchors.filter(anchor => anchor._id !== anchorId));
	}, [ensureEditableShape, path, anchors, recomputeRoute]);

	const moveShapeAnchor = useCallback(async (anchorId: string, lat: number, lon: number) => {
		if (!ensureEditableShape()) return;
		await recomputeRoute(path, anchors.map(anchor => anchor._id === anchorId ? { ...anchor, lat, lon } : anchor));
	}, [ensureEditableShape, path, anchors, recomputeRoute]);

	const previewRoute = useCallback(async (nextPath: PatternsDetailPathItem[], nextAnchors: ShapeAnchor[] = anchors) => {
		if (!canMutate() || needsMigration) return;
		await requestPreview(nextPath, nextAnchors);
	}, [canMutate, needsMigration, anchors, requestPreview]);

	//
	// D. Restore complete local history

	const undo = useCallback(() => {
		if (!canMutate()) return;
		cancelPending();
		undoDraft();
	}, [canMutate, cancelPending, undoDraft]);

	const redo = useCallback(() => {
		if (!canMutate()) return;
		cancelPending();
		redoDraft();
	}, [canMutate, cancelPending, redoDraft]);

	const revertPath = useCallback(() => {
		if (!canMutate()) return;
		cancelPending();
		revertDraft();
	}, [canMutate, cancelPending, revertDraft]);

	const updateStop = useCallback((index: number, values: Partial<Pick<Path, 'allow_drop_off' | 'allow_pickup' | 'timepoint'>>) => {
		pushToHistory(path.map((item, currentIndex) => currentIndex === index ? { ...item, ...values } : item), shape);
	}, [path, shape, pushToHistory]);

	const dismissMigrationWarning = useCallback(() => setMigrationWarningVisible(false), []);

	//
	// E. Apply once or discard the entire editing session

	const submit = useCallback(() => {
		if (!canMutate() || isLoading || !hasUnsavedChanges || anchorIssues.length > 0) return;
		closed.current = true;
		dispose();
		pattern.actions.applyChanges({ parameters: draftData.parameters, path, shape: shape ?? null });
		onClose();
	}, [canMutate, isLoading, dispose, anchorIssues.length, hasUnsavedChanges, draftData.parameters, path, shape, pattern.actions, onClose]);

	const cancel = useCallback(() => {
		closed.current = true;
		dispose();
		onClose();
	}, [dispose, onClose]);

	//
	// F. Return context value

	const contextValue: ShapeEditorContextState = useMemo(() => ({
		actions: {
			addShapeAnchor,
			addStop,
			appendStop,
			cancel,
			convertShapeToEditable,
			dismissMigrationWarning,
			initializePath,
			moveShapeAnchor,
			prependStop,
			previewRoute,
			redo,
			removeShapeAnchor,
			removeStop,
			reorderStops,
			requestRecalculation,
			revertPath,
			submit,
			undo,
			updateStop,
		},
		data: {
			anchorIssues,
			anchors,
			hasUnsavedChanges: hasUnsavedChanges,
			path,
			routeData: routeData,
			shape,
		},
		flags: {
			canRecalculate,
			canRedo: canRedo,
			canSubmit: pattern.capabilities.editEnabled && !isLoading && hasUnsavedChanges && anchorIssues.length === 0,
			canUndo: canUndo,
			isEditableShape: Boolean(shape) && !needsMigration,
			isLoadingRoute: isLoading,
			migrationWarningVisible,
			needsMigration,
		},
	}), [addShapeAnchor, addStop, appendStop, cancel, convertShapeToEditable, dismissMigrationWarning, initializePath, moveShapeAnchor, prependStop, previewRoute, redo, removeShapeAnchor, removeStop, reorderStops, requestRecalculation, revertPath, submit, undo, updateStop, anchorIssues, anchors, hasUnsavedChanges, canRedo, canUndo, path, routeData, isLoading, shape, canRecalculate, pattern.capabilities.editEnabled, migrationWarningVisible, needsMigration]);

	return (
		<ShapeEditorContext.Provider value={contextValue}>
			{children}
		</ShapeEditorContext.Provider>
	);
}
