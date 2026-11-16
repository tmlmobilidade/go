'use client';

import { normalizeShapeEditorDraft, type ShapeEditorDraft, updateShapeEditorDraft } from '@/utils/shape-editor-draft';
import { type PatternsDetailPathItem } from '@tmlmobilidade/go-offer-pckg-types';
import { type Shape } from '@tmlmobilidade/go-types-offer';
import { useCallback, useMemo, useRef, useState } from 'react';

/* * */

interface UseShapeEditorDraftReturnType {
	canRedo: boolean
	canUndo: boolean
	data: ShapeEditorDraft
	hasUnsavedChanges: boolean
	push: (path: PatternsDetailPathItem[], shape: Shape | undefined) => void
	redo: () => void
	revert: () => void
	undo: () => void
}

/** Owns the complete local graph draft. History never writes into the parent form. */
export function useShapeEditorDraft(initialValues: ShapeEditorDraft): UseShapeEditorDraftReturnType {
	//

	//
	// A. Capture the session and its history

	const [baseline] = useState(() => structuredClone(initialValues));
	const [initial] = useState(() => normalizeShapeEditorDraft(baseline));
	const [data, setData] = useState(initial);
	// History stays in refs; historyMeta drives Undo/Redo button state.
	const history = useRef([initial]);
	const index = useRef(0);
	const [historyMeta, setHistoryMeta] = useState({ index: 0, length: 1 });

	//
	// B. Handle local draft changes

	const push = useCallback((path: PatternsDetailPathItem[], shape: Shape | undefined) => {
		const previous = history.current[index.current];
		const next = updateShapeEditorDraft(previous, path, shape);
		history.current = [...history.current.slice(0, index.current + 1), next];
		index.current++;
		setData(next);
		setHistoryMeta({ index: index.current, length: history.current.length });
	}, []);

	const undo = useCallback(() => {
		if (index.current === 0) return;
		index.current--;
		setData(history.current[index.current]);
		setHistoryMeta({ index: index.current, length: history.current.length });
	}, []);

	const redo = useCallback(() => {
		if (index.current >= history.current.length - 1) return;
		index.current++;
		setData(history.current[index.current]);
		setHistoryMeta({ index: index.current, length: history.current.length });
	}, []);

	const revert = useCallback(() => {
		history.current = [...history.current.slice(0, index.current + 1), initial];
		index.current++;
		setData(initial);
		setHistoryMeta({ index: index.current, length: history.current.length });
	}, [initial]);

	//
	// C. Return draft state

	return useMemo(() => ({
		canRedo: historyMeta.index < historyMeta.length - 1,
		canUndo: historyMeta.index > 0,
		data,
		hasUnsavedChanges: JSON.stringify(data) !== JSON.stringify(baseline),
		push,
		redo,
		revert,
		undo,
	}), [data, baseline, historyMeta, push, redo, revert, undo]);
}
