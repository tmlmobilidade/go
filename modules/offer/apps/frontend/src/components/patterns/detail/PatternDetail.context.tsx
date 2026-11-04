'use client';

import { useLinesDetailData } from '@/components/lines/detail/use-lines-detail-data';
import { closeGtfsImportModal } from '@/components/patterns/detail/PatternDetailSectionGtfs/GtfsImport.modal';
import { closeCreateRuleModal } from '@/components/patterns/rules/create/RuleCreate.modal';
import { closeCreateParameterModal } from '@/components/patterns/shape/parameters/create/ParameterCreate.modal';
import { useRoutesDetailData } from '@/components/routes/detail/use-routes-detail-data';
import { useEventsContext } from '@/contexts/Events.context';
import { usePeriodsContext } from '@/contexts/Periods.context';
import { StopsParameterExtended } from '@/utils/stops-parameters';
import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { PatternsDetail, PatternsDetailFormDto, PatternsDetailFormSchema, PatternsDetailPathItem, type PopulatedLine } from '@tmlmobilidade/go-offer-pckg-types';
import { type Stop } from '@tmlmobilidade/go-types-infrastructure';
import { EventReplacementRule, EventRestrictionRule, ManualRule, Path, Pattern, ScheduleRule, StopsParameter, UpdatePatternSchema } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { type ApiResponse } from '@tmlmobilidade/go-types-shared';
import { fetchApiData, keepUrlParams, type MapOverlayPatternShapeLineData, type MapOverlayPatternShapeStopsDataProps, type StandardFormContextValue, useHandleAction, useMeData, useStandardForm, useStandardFormCapabilities, useStandardFormWatch } from '@tmlmobilidade/ui';
import { type FeatureCollection, type Point } from 'geojson';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef } from 'react';

import { getPatternsDetailFormValues } from './patterns-detail-form-values';
import { usePatternsDetailData } from './use-patterns-detail-data';
import { usePatternsDetailMapData } from './use-patterns-detail-map-data';
import { usePatternsDetailPatternId } from './use-patterns-detail-pattern-id';
import { usePatternsDetailSchedulingActions } from './use-patterns-detail-scheduling-actions';
import { usePatternsDetailSchedulingData } from './use-patterns-detail-scheduling-data';

/* * */

interface PatternDetailContextState extends StandardFormContextValue<PatternsDetailFormDto> {
	actions: StandardFormContextValue<PatternsDetailFormDto>['actions'] & {
		addComment: (comment: string) => void
		addRule: (rule: ManualRule) => void
		applyChanges: (changes: Partial<PatternsDetailFormDto>) => void
		deleteRule: (ruleId: string) => void
		duplicateRule: (rule: ManualRule) => void
		editRule: (rule: ManualRule) => void
		enrichPath: (path: Path[]) => Promise<PatternsDetailPathItem[]>
		mutate: () => Promise<ApiResponse<PatternsDetail> | undefined>
		openRuleModal: (rule?: ManualRule) => void
		openRulesCalendarPreviewModal: () => void
		openStopsParameterModal: (rule?: StopsParameter) => void
	}
	data: {
		agency_id: string
		id: string
		lineId: string
		mergedRules: ScheduleRule[]
		path: PatternsDetailPathItem[]
		pattern: null | PatternsDetail
		shape?: Pattern['shape']
		stopsParameterRules: StopsParameterExtended[]
		typologyData?: PopulatedLine['typology_data']
	}
	error: Error | null
	geojson: {
		pattern_line: MapOverlayPatternShapeLineData | null
		pattern_stops: FeatureCollection<Point, MapOverlayPatternShapeStopsDataProps> | null
	}
	inheritedLock: 'line' | 'route' | null
}

/* * */

const PatternDetailContext = createContext<PatternDetailContextState | undefined>(undefined);

export function usePatternDetailContext() {
	const context = useContext(PatternDetailContext);
	if (!context) {
		throw new Error('usePatternDetailContext must be used within a PatternDetailContextProvider');
	}
	return context;
}

/* * */

export const PatternDetailContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const { lineId, patternId } = usePatternsDetailPatternId();
	const { data: me, error: meError, isLoading: meLoading } = useMeData();
	// Dialogs and asynchronous callbacks must check the latest access, not the opening render.
	const accessRef = useRef({ deleteEnabled: false, editEnabled: false, lockEnabled: false, patternId, updateEnabled: false });
	const periodsContext = usePeriodsContext();
	const eventsContext = useEventsContext();

	//
	// B. Fetch data

	const { data: pattern, error: patternError, isLoading: patternLoading, mutate: patternMutate } = usePatternsDetailData(patternId);
	const { data: line, error: lineError, isLoading: lineLoading, mutate: lineMutate } = useLinesDetailData(lineId);
	const { data: route, error: routeError, isLoading: routeLoading } = useRoutesDetailData(pattern?.route_id ?? '');

	const inheritedLock = line?.is_locked ? 'line' : route?.is_locked ? 'route' : null;

	const typologyData = line?.typology_data;

	//
	// C. Setup form

	const derivedRules = useMemo(
		() => (pattern?.rules ?? []).filter((rule): rule is EventReplacementRule | EventRestrictionRule => rule.kind === 'event_restriction' || rule.kind === 'event_replacement'),
		[pattern?.rules],
	);
	const patternForForm = useMemo(() => pattern ? getPatternsDetailFormValues(pattern) : null, [pattern]);
	const { form, isDirty, unblock } = useStandardForm<PatternsDetailFormDto, typeof PatternsDetailFormSchema>({
		apiData: patternForForm,
		schema: PatternsDetailFormSchema,
	});
	const values = useStandardFormWatch({ control: form.control });
	const isValid = PatternsDetailFormSchema.safeParse(values).success;

	useEffect(() => {
		// These collections are edited through dialogs instead of Controllers.
		// Register their roots so API refreshes preserve complete dirty arrays,
		// including deleted items, rather than merging old array indices back in.
		form.register('rules');
		form.register('parameters');
		form.register('path');
	}, [form]);

	//
	// D. Watch editable geometry

	const pathValues = useStandardFormWatch({ control: form.control, name: 'path' });
	const editablePath = useMemo(() => pathValues ?? [], [pathValues]);
	const editableShape = useStandardFormWatch({ control: form.control, name: 'shape' });

	//
	// E. Project editable geometry onto the map

	const { patternLineFC, patternStopsFC } = usePatternsDetailMapData({
		color: typologyData?.color,
		path: editablePath,
		patternId: pattern?._id ?? patternId,
		shape: editableShape,
	});

	//
	// F. Derive scheduling display data and dialog actions

	const { parametersForUI, rulesForUI } = usePatternsDetailSchedulingData({ derivedRules, editablePath, events: eventsContext.data.raw, periods: periodsContext.data.raw, values });
	const { handleAddRule, handleDeleteRule, handleDuplicateRule, handleEditRule, handleOpenRuleModal, handleOpenRulesCalendarPreviewModal, handleOpenStopsParameterModal } = usePatternsDetailSchedulingActions({
		accessRef,
		agencyId: line?.agency_id,
		form,
		patternId,
		persistedPath: pattern?.path,
		rulesForUI,
	});

	//
	// G. Handle comments and API actions

	const { action: addCommentRequest } = useHandleAction({
		fetchFn: async (message: string) => await fetchApiData<Pattern>({
			body: { message },
			method: 'POST',
			url: API_ROUTES.offer.PATTERNS_DETAIL_COMMENT(patternId),
		}),
		onSuccess: () => {
			void patternMutate();
		},
	});

	const addComment = useCallback(async (comment: string) => {
		if (!accessRef.current.editEnabled || accessRef.current.patternId !== patternId) return;
		await addCommentRequest(comment);
	}, [addCommentRequest, patternId]);

	// Used to fetch stops when we revert a path change from the history
	const enrichPath = useCallback(async (path: Path[]): Promise<PatternsDetailPathItem[]> => {
		const stopIds = [...new Set(path.map(item => item.stop_id))];
		const results = await Promise.all(stopIds.map(id => fetchApiData<Stop>({ url: API_ROUTES.offer.PATTERNS_STOPS_DETAIL(id) })));
		const stops = new Map(results.flatMap(result => result.data ? [[result.data._id, result.data] as const] : []));
		return path.map(item => ({ ...item, stop: stops.get(item.stop_id) ?? null }));
	}, []);

	const { action: saveRequest, isLoading: isSaving } = useHandleAction({
		fetchFn: async () => await fetchApiData<Pattern>({ body: UpdatePatternSchema.parse(form.getValues()), method: 'PUT', url: API_ROUTES.offer.PATTERNS_DETAIL(patternId) }),
		onSuccess: () => {
			form.reset(form.getValues());
			void patternMutate();
			void lineMutate();
		},
	});

	const { action: deleteRequest, isLoading: isDeleting } = useHandleAction({
		fetchFn: async () => await fetchApiData<Pattern>({ method: 'DELETE', url: API_ROUTES.offer.PATTERNS_DETAIL(patternId) }),
		onSuccess: () => {
			unblock();
			form.reset(form.getValues());
			void lineMutate();
			router.push(keepUrlParams(PAGE_ROUTES.offer.LINES_LIST));
		},
	});

	const { action: lockRequest, isLoading: isLocking } = useHandleAction({
		fetchFn: async () => await fetchApiData<Pattern>({ url: API_ROUTES.offer.PATTERNS_DETAIL_LOCK(patternId) }),
		onSuccess: () => {
			form.reset(form.getValues());
			void patternMutate();
			void lineMutate();
		},
	});

	//
	// H. Setup permissions and guarded mutations

	const permissions = PermissionCatalog.getScopePermissions({
		actions: PermissionCatalog.all.lines.actions,
		permissions: me?.permissions,
		resource: {
			key: 'agency_ids',
			requireAll: true,
			value: line?.agency_id ? [line.agency_id] : [],
		},
		scope: PermissionCatalog.all.lines.scope,
	});
	const hasError = !!meError || !!patternError || !!lineError || !!routeError;
	const hasParents = Boolean(pattern && line && route && pattern.line_id === line._id && route.line_id === line._id);
	const isLoading = meLoading || patternLoading || lineLoading || routeLoading || !hasParents;
	const isOperating = isSaving || isDeleting || isLocking;
	const standardCapabilities = useStandardFormCapabilities({
		delete: { hasPermission: permissions.delete, isDeleting },
		form: { isDirty, isValid },
		loading: { isLoading: isLoading || hasError || isOperating },
		locked: { hasPermission: permissions.lock && !inheritedLock, isLocked: !!pattern?.is_locked || !!inheritedLock, isLocking },
		update: { hasPermission: permissions.update && permissions.read, isUpdating: isSaving },
	});
	const canDelete = standardCapabilities.deleteEnabled;
	const canLock = standardCapabilities.lockEnabled;
	const canSave = standardCapabilities.updateEnabled;
	const isReadOnly = !standardCapabilities.editEnabled || !permissions.update || !permissions.read;
	accessRef.current = { deleteEnabled: canDelete, editEnabled: !isReadOnly, lockEnabled: canLock, patternId, updateEnabled: canSave };

	const applyChanges = useCallback((changes: Partial<PatternsDetailFormDto>) => {
		if (!accessRef.current.editEnabled || accessRef.current.patternId !== patternId) return;
		form.reset({ ...form.getValues(), ...changes }, { keepDefaultValues: true });
	}, [form, patternId]);

	const handleSave = useCallback(async () => {
		if (!accessRef.current.updateEnabled || accessRef.current.patternId !== patternId) return;
		await form.handleSubmit(async () => {
			if (accessRef.current.editEnabled && accessRef.current.patternId === patternId) await saveRequest();
		})();
	}, [saveRequest, patternId, form]);

	const handleDelete = useCallback(async () => {
		if (!accessRef.current.deleteEnabled || accessRef.current.patternId !== patternId) return;
		await deleteRequest();
	}, [deleteRequest, patternId]);

	const handleLock = useCallback(async () => {
		if (!accessRef.current.lockEnabled || accessRef.current.patternId !== patternId) return;
		await lockRequest();
	}, [lockRequest, patternId]);

	useEffect(() => {
		if (!isReadOnly) return;
		closeCreateRuleModal();
		closeCreateParameterModal();
		closeGtfsImportModal();
	}, [isReadOnly]);

	useEffect(() => () => {
		accessRef.current = { ...accessRef.current, deleteEnabled: false, editEnabled: false, lockEnabled: false, updateEnabled: false };
		closeCreateRuleModal();
		closeCreateParameterModal();
		closeGtfsImportModal();
	}, [patternId]);

	//
	// I. Define context value

	const contextValue: PatternDetailContextState = useMemo(() => ({
		actions: {
			addComment,
			addRule: handleAddRule,
			applyChanges,
			delete: handleDelete,
			deleteRule: handleDeleteRule,
			duplicateRule: handleDuplicateRule,
			editRule: handleEditRule,
			enrichPath,
			lock: handleLock,
			mutate: patternMutate,
			openRuleModal: handleOpenRuleModal,
			openRulesCalendarPreviewModal: handleOpenRulesCalendarPreviewModal,
			openStopsParameterModal: handleOpenStopsParameterModal,
			update: handleSave,
		},
		capabilities: {
			deleteEnabled: canDelete,
			editEnabled: !isReadOnly,
			lockEnabled: canLock,
			updateEnabled: canSave,
		},
		data: {
			agency_id: line?.agency_id || '',
			id: patternId,
			lineId,
			mergedRules: rulesForUI,
			path: editablePath,
			pattern: pattern,
			shape: editableShape,
			stopsParameterRules: parametersForUI,
			typologyData,
		},
		error: hasError ? new Error(patternError ?? lineError ?? routeError ?? meError ?? '') : null,
		form,
		geojson: {
			pattern_line: patternLineFC,
			pattern_stops: patternStopsFC,
		},
		inheritedLock,
		isDirty,
		isValid,
		status: {
			isDeleting,
			isLoading,
			isLocked: !!pattern?.is_locked || !!inheritedLock,
			isLocking,
			isUpdating: isSaving,
		},
		unblock,
	}), [editableShape, editablePath, isDirty, isValid, unblock, hasError, meError, lineError, routeError, applyChanges, isLoading, addComment, handleAddRule, handleDelete, handleDeleteRule, handleEditRule, handleDuplicateRule, handleLock, patternMutate, handleOpenRuleModal, handleOpenRulesCalendarPreviewModal, handleOpenStopsParameterModal, handleSave, enrichPath, form, patternId, lineId, rulesForUI, pattern, parametersForUI, typologyData, canDelete, canLock, canSave, patternError, isDeleting, isLocking, isReadOnly, isSaving, patternLineFC, patternStopsFC, inheritedLock, line]);

	//
	// J. Render components

	return (
		<PatternDetailContext.Provider value={contextValue}>
			{children}
		</PatternDetailContext.Provider>
	);

	//
};
