'use client';

import { closeGtfsImportModal } from '@/components/patterns/detail/PatternDetailSectionGtfs/GtfsImport.modal';
import { closeCreateRuleModal, openCreateRuleModal } from '@/components/patterns/rules/create/RuleCreate.modal';
import { openRulesCalendarPreviewModal } from '@/components/patterns/rules/list/RulesCalendarPreview.modal';
import { closeCreateParameterModal, openCreateParameterModal } from '@/components/patterns/shape/parameters/create/ParameterCreate.modal';
import { useEventsContext } from '@/contexts/Events.context';
import { usePeriodsContext } from '@/contexts/Periods.context';
import { StopsParameterExtended } from '@/utils/stops-parameters';
import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { buildParameterSummary, buildRuleSummary, computeSegmentTravelTimes, getMergedPath } from '@tmlmobilidade/dates';
import { getBaseGeoJsonFeatureCollection } from '@tmlmobilidade/geo';
import { PatternsDetail, PatternsDetailFormDto, PatternsDetailFormSchema, PatternsDetailPathItem, type PopulatedLine } from '@tmlmobilidade/go-offer-pckg-types';
import { type Stop } from '@tmlmobilidade/go-types-infrastructure';
import { EventReplacementRule, EventRestrictionRule, ManualRule, Path, Pattern, ScheduleRule, StopsParameter, UpdatePatternSchema } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { type ApiResponse } from '@tmlmobilidade/go-types-shared';
import { generateRandomString } from '@tmlmobilidade/strings';
import { fetchApiData, keepUrlParams, type MapOverlayPatternShapeLineData, type MapOverlayPatternShapeLineDataProps, type MapOverlayPatternShapeStopsDataProps, type StandardFormContextValue, useHandleAction, useMeData, useStandardForm, useStandardFormCapabilities, useStandardFormWatch } from '@tmlmobilidade/ui';
import { type FeatureCollection, type Point } from 'geojson';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef } from 'react';

import { getPatternsDetailFormValues } from './patterns-detail-form-values';
import { usePatternsDetailData } from './use-patterns-detail-data';
import { usePatternsDetailLineData } from './use-patterns-detail-line-data';
import { usePatternsDetailPatternId } from './use-patterns-detail-pattern-id';
import { usePatternsDetailRouteData } from './use-patterns-detail-route-data';

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
		mutate: () => Promise<ApiResponse<Pattern> | undefined>
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
	const { data: line, error: lineError, isLoading: lineLoading, mutate: lineMutate } = usePatternsDetailLineData(lineId);
	const { data: route, error: routeError, isLoading: routeLoading } = usePatternsDetailRouteData(pattern?.route_id ?? '');

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

	//
	// C. Editable pattern data

	const pathValues = useStandardFormWatch({ control: form.control, name: 'path' });
	const editablePath = useMemo(() => pathValues ?? [], [pathValues]);
	const editableShape = useStandardFormWatch({ control: form.control, name: 'shape' });

	//
	// D. Transform editable data to GeoJSON

	const patternLineFC: MapOverlayPatternShapeLineData | null = useMemo(() => {
		const properties: MapOverlayPatternShapeLineDataProps = {
			color: typologyData?.color,
			id: pattern?._id ?? patternId,
		};

		if (editableShape?.encoded_polyline) {
			return {
				encoded_polyline: editableShape.encoded_polyline,
				properties,
			};
		}

		if (!editableShape?.geojson?.geometry?.coordinates) return null;

		return {
			geometry: {
				coordinates: editableShape.geojson.geometry.coordinates,
				type: 'LineString' as const,
			},
			properties,
			type: 'Feature' as const,
		};
	}, [editableShape, typologyData?.color, pattern?._id, patternId]);

	const patternStopsFC: FeatureCollection<Point, MapOverlayPatternShapeStopsDataProps> | null = useMemo(() => {
		const featureCollection = getBaseGeoJsonFeatureCollection<Point, MapOverlayPatternShapeStopsDataProps>();

		featureCollection.features = editablePath
			.filter(pathItem => pathItem.stop)
			.map((pathItem, index) => ({
				geometry: {
					coordinates: [
						pathItem.stop.longitude,
						pathItem.stop.latitude,
					],
					type: 'Point' as const,
				},
				properties: {
					id: String(pathItem.stop._id),
					name: pathItem.stop.name,
					sequence: index + 1,
				},
				type: 'Feature' as const,
			}));

		return featureCollection;
	}, [editablePath]);

	// rules used for UI + preview
	const rulesForUI = useMemo(
		() => {
			const allRules = [...(values.rules ?? []), ...derivedRules] as ScheduleRule[];
			const periods = periodsContext.data.raw || [];

			// Enhance each rule with generated name and short name
			return allRules.map((rule) => {
				const { long, short, tooltip } = buildRuleSummary(rule, { events: eventsContext.data.raw, periods });
				return { ...rule, name: long, shortName: short, tooltip };
			});
		},
		[eventsContext.data.raw, values.rules, derivedRules, periodsContext.data.raw],
	);

	// parameters used for UI + preview
	const parametersForUI = useMemo(() => {
		const allParameters = [...(values.parameters ?? [])] as StopsParameter[];
		const periods = periodsContext.data.raw || [];
		const basePath = editablePath;

		return allParameters.map((parameter) => {
			const { long, short } = buildParameterSummary(parameter, { periods });

			const mergedPath = getMergedPath(basePath, parameter.path || []);
			const parameterTravelTimes = computeSegmentTravelTimes(mergedPath);

			return {
				...parameter,
				name: long,
				shortName: short,
				travelTimes: parameterTravelTimes,
			};
		});
	}, [values.parameters, periodsContext.data.raw, editablePath]);

	//
	// E. Handle Schedule RULES actions

	const handleAddRule = useCallback((rule: ManualRule) => {
		if (!accessRef.current.editEnabled || accessRef.current.patternId !== patternId) return;
		const currentRules = (form.getValues().rules ?? []) as ManualRule[];
		const ruleWithId = { ...rule, _id: generateRandomString({ length: 5 }) };
		const newRules = [...currentRules, ruleWithId];

		form.setValue('rules', newRules, { shouldDirty: true, shouldValidate: true });
	}, [form, patternId]);

	const handleEditRule = useCallback((rule: ManualRule) => {
		if (!accessRef.current.editEnabled || accessRef.current.patternId !== patternId) return;
		if (!rule._id) {
			return;
		}
		const currentRules = (form.getValues().rules ?? []) as ManualRule[];
		const newRules = currentRules.map(r =>
			r._id === rule._id ? rule : r,
		);

		form.setValue('rules', newRules, { shouldDirty: true, shouldValidate: true });
	}, [form, patternId]);

	const handleDeleteRule = useCallback((ruleId: string) => {
		if (!accessRef.current.editEnabled || accessRef.current.patternId !== patternId) return;
		const currentRules = (form.getValues().rules ?? []) as ManualRule[];
		const newRules = currentRules.filter(r => r._id !== ruleId);

		form.setValue('rules', newRules, { shouldDirty: true, shouldValidate: true });
	}, [form, patternId]);

	const handleDuplicateRule = useCallback((rule: ManualRule) => {
		if (!accessRef.current.editEnabled || accessRef.current.patternId !== patternId) return;
		const currentRules = (form.getValues().rules ?? []) as ManualRule[];
		const manualRule = { ...rule } as ManualRule & { shortName?: string, tooltip?: string };
		delete manualRule.shortName;
		delete manualRule.tooltip;
		const duplicatedRule = { ...manualRule, _id: generateRandomString({ length: 5 }) };
		const newRules = [...currentRules, duplicatedRule];

		form.setValue('rules', newRules, { shouldDirty: true, shouldValidate: true });
	}, [form, patternId]);

	const handleOpenRuleModal = useCallback((rule?: ManualRule) => {
		if (!accessRef.current.editEnabled || accessRef.current.patternId !== patternId) return;
		const onSubmit = (validatedRule: ManualRule) => {
			if (rule?._id) {
				// Editing - preserve the _id
				handleEditRule({ ...validatedRule, _id: rule._id });
			} else {
				// Creating new
				handleAddRule(validatedRule);
			}
		};

		const onDelete = rule?._id ? () => handleDeleteRule(rule._id) : undefined;
		const onDuplicate = rule?._id ? (duplicatedRule: ManualRule) => handleDuplicateRule(duplicatedRule) : undefined;

		openCreateRuleModal(line?.agency_id || '', onSubmit, rule, onDelete, onDuplicate);
	}, [handleAddRule, handleEditRule, handleDeleteRule, handleDuplicateRule, line?.agency_id, patternId]);

	const handleOpenRulesCalendarPreviewModal = useCallback(() => {
		openRulesCalendarPreviewModal(
			line?.agency_id || '',
			rulesForUI,
			pattern?.code,
		);
	}, [line?.agency_id, rulesForUI, pattern?.code]);

	//
	// F. Handle Schedule RULES actions

	const handleAddStopParameter = useCallback((rule: StopsParameter) => {
		if (!accessRef.current.editEnabled || accessRef.current.patternId !== patternId) return;
		const currentRules = (form.getValues().parameters ?? []) as StopsParameter[];
		const ruleWithId = { ...rule, _id: generateRandomString({ length: 5 }) };
		const newRules = [...currentRules, ruleWithId];

		form.setValue('parameters', newRules, { shouldDirty: true, shouldValidate: true });
	}, [form, patternId]);

	const handleEditStopParameter = useCallback((rule: StopsParameter) => {
		if (!accessRef.current.editEnabled || accessRef.current.patternId !== patternId) return;
		if (!rule._id) {
			return;
		}
		const currentRules = (form.getValues().parameters ?? []) as StopsParameter[];
		const newRules = currentRules.map(r =>
			r._id === rule._id ? rule : r,
		);

		form.setValue('parameters', newRules, { shouldDirty: true, shouldValidate: true });
	}, [form, patternId]);

	const handleDeleteStopParameter = useCallback((ruleId: string) => {
		if (!accessRef.current.editEnabled || accessRef.current.patternId !== patternId) return;
		const currentRules = (form.getValues().parameters ?? []) as StopsParameter[];
		const newRules = currentRules.filter(r => r._id !== ruleId);

		form.setValue('parameters', newRules, { shouldDirty: true, shouldValidate: true });
	}, [form, patternId]);

	const handleOpenStopsParameterModal = useCallback((rule?: StopsParameter) => {
		if (!accessRef.current.editEnabled || accessRef.current.patternId !== patternId) return;
		const onSubmit = (validatedRule: StopsParameter) => {
			if (rule?._id) {
				// Editing - preserve the _id
				handleEditStopParameter({ ...validatedRule, _id: rule._id });
			} else {
				// Creating new
				handleAddStopParameter(validatedRule);
			}
		};

		const onDelete = rule?._id ? () => handleDeleteStopParameter(rule._id) : undefined;

		const defaultParameter = (form.getValues().parameters ?? []).find((p): p is StopsParameter => p.kind === 'default');
		openCreateParameterModal(line?.agency_id || '', onSubmit, (form.getValues().path ?? pattern?.path) as PatternsDetailPathItem[], rule, onDelete, defaultParameter);
	}, [line?.agency_id, pattern, handleEditStopParameter, handleAddStopParameter, handleDeleteStopParameter, form, patternId]);

	//
	// G. Handle comments actions

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
		const stopIds = [...new Set(path.map(p => String(p.stop_id)))];
		const results = await Promise.all(
			stopIds.map(id => fetchApiData<Stop>({ url: API_ROUTES.offer.PATTERNS_STOPS_DETAIL(String(id)) })),
		);
		const stopsMap = new Map(
			results.flatMap(r => r.data ? [[String(r.data._id), r.data]] : []),
		);
		return path.map(p => ({ ...p, stop: stopsMap.get(String(p.stop_id)) ?? null }));
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
	// F. Setup permissions

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
	// G. Define context value

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
	// H. Render components

	return (
		<PatternDetailContext.Provider value={contextValue}>
			{children}
		</PatternDetailContext.Provider>
	);

	//
};
