'use client';

import { buildRoutePreviewModel, buildRoutePreviewRecalculationPlan, composeRoutePreviewResponse, mergeRoutePreviewRange, type RoutePreviewPoint, type RoutePreviewResponse } from '@/utils/route-preview';
import { applyRouteToPath, type ShapeEditorDraft } from '@/utils/shape-editor-draft';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type PatternsDetailPathItem, RoutePreviewResponseSchema, ShapesRoutePreviewRequestSchema } from '@tmlmobilidade/go-offer-pckg-types';
import { type ShapeAnchor } from '@tmlmobilidade/go-types-offer';
import { fetchApiData, useToast } from '@tmlmobilidade/ui';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

interface UseShapeRoutePreviewOptions {
	draft: ShapeEditorDraft
	editEnabled: boolean
	onApply: (path: PatternsDetailPathItem[], shape: NonNullable<ShapeEditorDraft['shape']>) => void
	patternId: string
}

interface UseShapeRoutePreviewReturnType {
	cancelPending: () => void
	dispose: () => void
	isLoading: boolean
	preview: (path: PatternsDetailPathItem[], anchors: ShapeAnchor[]) => Promise<void>
	recompute: (path: PatternsDetailPathItem[], anchors: ShapeAnchor[], forceFull?: boolean) => Promise<void>
	routeData: null | RoutePreviewResponse
}

async function requestRoutePreview(patternId: string, points: RoutePreviewPoint[], signal: AbortSignal, emptyResponseMessage: string): Promise<RoutePreviewResponse> {
	const response = await fetchApiData<RoutePreviewResponse>({
		body: ShapesRoutePreviewRequestSchema.parse({
			costing: 'bus',
			costing_options: { bus: { use_ferry: 0 } },
			pattern_id: patternId,
			points,
		}),
		method: 'POST',
		options: { signal },
		url: API_ROUTES.offer.SHAPES_ROUTE_PREVIEW,
	});
	if (response.error || !response.data) throw new Error(response.error || emptyResponseMessage);
	return RoutePreviewResponseSchema.parse(response.data);
}

/** Owns cancellable routing work. Only the latest request may update the local draft. */
export function useShapeRoutePreview(options: UseShapeRoutePreviewOptions): UseShapeRoutePreviewReturnType {
	//

	//
	// A. Setup the request lifecycle

	const { t } = useTranslation();
	const latest = useRef(options);
	latest.current = options;
	const mounted = useRef(true);
	const closed = useRef(false);
	const revision = useRef(0);
	const calculation = useRef<AbortController | null>(null);
	const previewRequest = useRef<AbortController | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [routeData, setRouteData] = useState<null | RoutePreviewResponse>(null);

	const cancelPending = useCallback(() => {
		revision.current++;
		calculation.current?.abort();
		previewRequest.current?.abort();
		calculation.current = null;
		previewRequest.current = null;
		if (mounted.current) {
			setIsLoading(false);
			setRouteData(null);
		}
	}, []);

	const dispose = useCallback(() => {
		closed.current = true;
		cancelPending();
	}, [cancelPending]);

	useEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
			cancelPending();
		};
	}, [cancelPending]);

	//
	// B. Calculate a complete result before publishing any draft changes

	const calculate = useCallback(async (path: PatternsDetailPathItem[], anchors: ShapeAnchor[], signal: AbortSignal, forceFull = false) => {
		if (path.length < 2 || path.some(item => !item.stop)) {
			throw new Error(t('default:patterns.shapeEditor.missingStops'));
		}
		const current = latest.current;
		const previousPoints = buildRoutePreviewModel(current.draft.path, current.draft.shape?.anchors ?? []).points;
		const points = buildRoutePreviewModel(path, anchors).points;
		const plan = buildRoutePreviewRecalculationPlan(previousPoints, points, forceFull ? [] : current.draft.shape?.legs ?? []);
		const results = await Promise.all(plan.ranges.map(async range => ({
			range,
			response: await requestRoutePreview(current.patternId, points.slice(range.from_index, range.to_index + 1), signal, t('patterns:shape.useShapeRoutePreview.empty_response')),
		})));
		for (const { range, response } of results) mergeRoutePreviewRange(plan.legs, range, response.legs);
		return { points, response: composeRoutePreviewResponse(plan.legs) };
	}, [t]);

	const recompute = useCallback(async (path: PatternsDetailPathItem[], anchors: ShapeAnchor[], forceFull = false) => {
		if (!mounted.current || closed.current || !latest.current.editEnabled) return;
		cancelPending();
		const controller = new AbortController();
		calculation.current = controller;
		const currentRevision = revision.current;
		setIsLoading(true);
		try {
			const { points, response } = await calculate(path, anchors, controller.signal, forceFull);
			if (controller.signal.aborted || !mounted.current || closed.current || !latest.current.editEnabled || currentRevision !== revision.current) return;
			const shape = {
				...latest.current.draft.shape,
				anchors,
				encoded_polyline: response.encoded_polyline,
				extension: Math.round(response.distance),
				geojson: response.geojson,
				legs: response.legs,
			};
			latest.current.onApply(applyRouteToPath(path, response, points), shape);
			setRouteData(response);
		} catch (error) {
			const reportError = !controller.signal.aborted && mounted.current && !closed.current && currentRevision === revision.current;
			controller.abort();
			if (reportError) {
				useToast.error({ message: error instanceof Error ? error.message : t('default:patterns.shapeEditor.unknownError'), title: t('default:patterns.shapeEditor.routeErrorTitle') });
			}
		} finally {
			if (calculation.current === controller) {
				calculation.current = null;
				if (mounted.current) setIsLoading(false);
			}
		}
	}, [calculate, cancelPending, t]);

	const preview = useCallback(async (path: PatternsDetailPathItem[], anchors: ShapeAnchor[]) => {
		if (!mounted.current || closed.current || !latest.current.editEnabled || calculation.current) return;
		previewRequest.current?.abort();
		const controller = new AbortController();
		previewRequest.current = controller;
		const currentRevision = revision.current;
		try {
			const { response } = await calculate(path, anchors, controller.signal);
			if (!controller.signal.aborted && mounted.current && !closed.current && latest.current.editEnabled && previewRequest.current === controller && currentRevision === revision.current) {
				setRouteData(response);
			}
		} catch {
			// Drag previews are temporary; failure leaves the saved draft unchanged.
			controller.abort();
		} finally {
			if (previewRequest.current === controller) previewRequest.current = null;
		}
	}, [calculate]);

	//
	// C. Return request state

	return useMemo(() => ({
		cancelPending,
		dispose,
		isLoading,
		preview,
		recompute,
		routeData,
	}), [cancelPending, dispose, isLoading, preview, recompute, routeData]);
}
