'use client';

/* * */

import { openCreateRuleModal } from '@/components/patterns/rules/create/RuleCreate.modal';
import { openRulesCalendarPreviewModal } from '@/components/patterns/rules/list/RulesCalendarPreview.modal';
import { openCreateParameterModal } from '@/components/patterns/stops/parameters/create/ParameterCreate.modal';
import { useEventsContext } from '@/contexts/Events.context';
import { usePeriodsContext } from '@/contexts/Periods.context';
import { useTypologiesContext } from '@/contexts/Typologies.context';
import { StopsParameterExtended } from '@/utils/stops-parameters';
import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { buildParameterSummary, buildRuleSummary, computeSegmentTravelTimes, Dates, getMergedPath } from '@tmlmobilidade/dates';
import { getBaseGeoJsonFeatureCollection } from '@tmlmobilidade/geo';
import { generateRandomString } from '@tmlmobilidade/strings';
import { EventReplacementRule, EventRestrictionRule, Line, ManualRule, Pattern, PermissionCatalog, ScheduleRule, StopsParameter, Typology, type UpdatePatternDto, UpdatePatternSchema } from '@tmlmobilidade/types';
import { DetailContextStateTemplate, keepUrlParams, type MapOverlayPatternShapeLineDataProps, type MapOverlayPatternShapeStopsDataProps, useDetailState, type UseFormReturnType, useHandleUpdate, useMeContext, useToast, useTypicalForm } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { type Feature, type FeatureCollection, type LineString, type Point } from 'geojson';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useCallback, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface PatternDetailContextState {
	actions: DetailContextStateTemplate['actions'] & {
		addComment: (comment: string) => void
		addRule: (rule: ManualRule) => void
		deleteRule: (ruleId: string) => void
		editRule: (rule: ManualRule) => void
		mutate: () => Promise<Pattern | undefined>
		openRuleModal: (rule?: ManualRule) => void
		openRulesCalendarPreviewModal: () => void
		openStopsParameterModal: (rule?: StopsParameter) => void
	}
	data: {
		agency_id: string
		form: UseFormReturnType<UpdatePatternDto>
		id: string
		mergedRules: ScheduleRule[]
		pattern: null | Pattern
		stopsParameterRules: StopsParameterExtended[]
		typologyData?: Typology
	}
	flags: DetailContextStateTemplate['flags']
	geojson: {
		pattern_line: Feature<LineString, MapOverlayPatternShapeLineDataProps> | FeatureCollection<LineString, MapOverlayPatternShapeLineDataProps> | null
		pattern_stops: FeatureCollection<Point, MapOverlayPatternShapeStopsDataProps> | null
	}
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

export const PatternDetailContextProvider = ({ children, lineId, patternId }: PropsWithChildren<{ lineId: string, patternId: string }>) => {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const meContext = useMeContext();
	const periodsContext = usePeriodsContext();
	const eventsContext = useEventsContext();

	//
	// B. Fetch data

	const { data: patternData, error: patternError, isLoading: patternLoading, mutate: patternMutate } = useSWR<Pattern>(API_ROUTES.offer.PATTERNS_DETAIL(patternId));
	const { data: lineData, mutate: lineMutate } = useSWR<Line>(API_ROUTES.offer.LINES_DETAIL(lineId));
	const typologiesContext = useTypologiesContext();
	const typologyData = typologiesContext.data.raw.find(t => t._id === lineData?.typology);

	//
	// C. Transform data to GeoJSON

	const patternLineFC: Feature<LineString, MapOverlayPatternShapeLineDataProps> | FeatureCollection<LineString, MapOverlayPatternShapeLineDataProps> | null = useMemo(() => {
		if (!patternData?.shape?.geojson?.geometry?.coordinates) return null;

		// The pattern shape is already a GeoJSON Feature, just add our custom properties
		return {
			geometry: {
				coordinates: patternData.shape.geojson.geometry.coordinates,
				type: 'LineString' as const,
			},
			properties: {
				color: typologiesContext.data.raw.find(t => t._id === lineData?.typology)?.color,
				id: patternData._id,
			},
			type: 'Feature' as const,
		};
	}, [patternData, typologiesContext.data.raw, lineData?.typology]);

	const patternStopsFC: FeatureCollection<Point, MapOverlayPatternShapeStopsDataProps> | null = useMemo(() => {
		const featureCollection = getBaseGeoJsonFeatureCollection<Point, MapOverlayPatternShapeStopsDataProps>();

		if (!patternData?.path) return featureCollection;

		featureCollection.features = patternData.path
			.filter(pathItem => pathItem.stop)
			.map((pathItem, index) => ({
				geometry: {
					coordinates: [pathItem.stop?.longitude, pathItem.stop?.latitude],
					type: 'Point' as const,
				},
				properties: {
					id: pathItem.stop?._id,
					name: pathItem.stop?.name,
					sequence: index + 1,
				},
				type: 'Feature' as const,
			}));

		return featureCollection;
	}, [patternData]);

	//
	// D. Setup form

	const manualRules = useMemo(
		() => (patternData?.rules ?? []).filter((r): r is ManualRule => r.kind === 'manual'),
		[patternData],
	);

	const derivedRules = useMemo(
		() => (patternData?.rules ?? []).filter(r => r.kind === 'event_restriction' || r.kind === 'event_replacement') as (EventReplacementRule | EventRestrictionRule)[],
		[patternData],
	);

	const patternForForm = useMemo(
		() => (patternData ? { ...patternData, rules: manualRules } : patternData),
		[patternData, manualRules],
	);

	const { form } = useTypicalForm<UpdatePatternDto>(UpdatePatternSchema, patternForForm as UpdatePatternDto);

	// rules used for UI + preview
	const rulesForUI = useMemo(
		() => {
			const allRules = [...(form.values.rules ?? []), ...derivedRules] as ScheduleRule[];
			const periods = periodsContext.data.raw || [];

			// Enhance each rule with generated name and short name
			return allRules.map((rule) => {
				const { long, short, tooltip } = buildRuleSummary(rule, { events: eventsContext.data.raw, periods });
				return { ...rule, name: long, shortName: short, tooltip };
			});
		},
		[eventsContext.data.raw, form.values.rules, derivedRules, periodsContext.data.raw],
	);

	// parameters used for UI + preview
	const parametersForUI = useMemo(() => {
		const allParameters = [...(form.values.parameters ?? [])] as StopsParameter[];
		const periods = periodsContext.data.raw || [];
		const basePath = patternData?.path ?? [];

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
	}, [form.values.parameters, periodsContext.data.raw, patternData?.path]);

	//
	// E. Handle Schedule RULES actions

	const handleAddRule = useCallback((rule: ManualRule) => {
		const currentRules = (form.getValues().rules ?? []) as ManualRule[];
		const ruleWithId = { ...rule, _id: generateRandomString({ length: 5 }) };
		const newRules = [...currentRules, ruleWithId];

		form.setFieldValue('rules', newRules);
	}, [form]);

	const handleEditRule = useCallback((rule: ManualRule) => {
		if (!rule._id) {
			console.error('Cannot edit rule without _id');
			return;
		}
		const currentRules = (form.getValues().rules ?? []) as ManualRule[];
		const newRules = currentRules.map(r =>
			r._id === rule._id ? rule : r,
		);

		form.setFieldValue('rules', newRules);
	}, [form]);

	const handleDeleteRule = useCallback((ruleId: string) => {
		const currentRules = (form.getValues().rules ?? []) as ManualRule[];
		const newRules = currentRules.filter(r => r._id !== ruleId);

		form.setFieldValue('rules', newRules);
	}, [form]);

	const handleOpenRuleModal = useCallback((rule?: ManualRule) => {
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

		openCreateRuleModal(lineData?.agency_id || '', onSubmit, rule, onDelete);
	}, [handleAddRule, handleEditRule, handleDeleteRule, lineData?.agency_id]);

	const handleOpenRulesCalendarPreviewModal = useCallback(() => {
		openRulesCalendarPreviewModal(
			lineData?.agency_id || '',
			rulesForUI,
		);
	}, [lineData?.agency_id, rulesForUI]);

	//
	// F. Handle Schedule RULES actions

	const handleAddStopParameter = useCallback((rule: StopsParameter) => {
		const currentRules = (form.getValues().parameters ?? []) as StopsParameter[];
		const ruleWithId = { ...rule, _id: generateRandomString({ length: 5 }) };
		const newRules = [...currentRules, ruleWithId];

		form.setFieldValue('parameters', newRules);
	}, [form]);

	const handleEditStopParameter = useCallback((rule: StopsParameter) => {
		if (!rule._id) {
			console.error('Cannot edit rule without _id');
			return;
		}
		const currentRules = (form.getValues().parameters ?? []) as StopsParameter[];
		const newRules = currentRules.map(r =>
			r._id === rule._id ? rule : r,
		);

		form.setFieldValue('parameters', newRules);
	}, [form]);

	const handleDeleteStopParameter = useCallback((ruleId: string) => {
		const currentRules = (form.getValues().parameters ?? []) as StopsParameter[];
		const newRules = currentRules.filter(r => r._id !== ruleId);

		form.setFieldValue('parameters', newRules);
	}, [form]);

	const handleOpenStopsParameterModal = useCallback((rule?: StopsParameter) => {
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

		openCreateParameterModal(lineData?.agency_id || '', onSubmit, patternData.path, rule, onDelete);
	}, [lineData?.agency_id, patternData, handleEditStopParameter, handleAddStopParameter, handleDeleteStopParameter]);

	const addComment = useCallback(async (comment: string) => {
		try {
			const commentToAdd = {
				created_at: Dates.now('Europe/Lisbon').unix_timestamp,
				created_by: 'will-be-set-by-api',
				message: comment,
				type: 'note',
				updated_at: Dates.now('Europe/Lisbon').unix_timestamp,
			};
			const res = await fetchData(API_ROUTES.offer.PATTERNS_DETAIL_COMMENT(patternId), 'POST', commentToAdd);

			if (res.error) {
				useToast.error({ message: res.error, title: 'Erro ao adicionar comentário' });
				return;
			}

			await patternMutate();
			useToast.success({ message: 'Comentário adicionado com sucesso.', title: 'Sucesso' });
		} catch (error) {
			useToast.error({ message: error.message, title: 'Erro ao adicionar comentário' });
		}
	}, [patternId, patternMutate]);

	const { action: handleSave, isLoading: isSaving } = useHandleUpdate({
		fetchFn: async () => await fetchData<Pattern>(API_ROUTES.offer.PATTERNS_DETAIL(patternId), 'PUT', form.getValues()),
		onSuccess: (updatedItem) => {
			form.resetDirty();
			void patternMutate(updatedItem);
			void lineMutate();
		},
	});

	const { action: handleDelete, isLoading: isDeleting } = useHandleUpdate({
		fetchFn: async () => await fetchData<Pattern>(API_ROUTES.offer.PATTERNS_DETAIL(patternId), 'DELETE', patternData),
		onSuccess: () => {
			form.resetDirty();
			void lineMutate();
			router.push(keepUrlParams(PAGE_ROUTES.offer.LINES_LIST));
		},
	});

	const { action: handleLock, isLoading: isLocking } = useHandleUpdate({
		fetchFn: async () => await fetchData<Pattern>(API_ROUTES.offer.PATTERNS_DETAIL_LOCK(patternId)),
		onSuccess: (updatedItem) => {
			form.resetDirty();
			void patternMutate(updatedItem);
			void lineMutate();
		},
	});

	//
	// F. Setup permissions

	const permissions = meContext.actions.getScopePermissions({
		actions: PermissionCatalog.all.lines.actions,
		resource: {
			key: 'agency_ids',
			requireAll: false,
			value: lineData?.agency_id ? [lineData.agency_id] : [],
		},
		scope: PermissionCatalog.all.lines.scope,
	});

	const { canDelete, canLock, canSave, isReadOnly } = useDetailState({
		hasError: !!patternError,
		isDeleted: null,
		isDeleting,
		isDirty: form.isDirty(),
		isLoading: patternLoading,
		isLocked: patternData?.is_locked,
		isLocking,
		isSaving: isSaving,
		isValid: form.isValid(),
		permissions: {
			delete: permissions.delete,
			lock: permissions.lock,
			read: permissions.read,
			update: permissions.update,
		},
	});

	//
	// G. Define context value

	const contextValue: PatternDetailContextState = useMemo(() => ({
		actions: {
			addComment,
			addRule: handleAddRule,
			delete: handleDelete,
			deleteRule: handleDeleteRule,
			editRule: handleEditRule,
			lock: handleLock,
			mutate: patternMutate,
			openRuleModal: handleOpenRuleModal,
			openRulesCalendarPreviewModal: handleOpenRulesCalendarPreviewModal,
			openStopsParameterModal: handleOpenStopsParameterModal,
			save: handleSave,
		},
		data: {
			agency_id: lineData?.agency_id || '',
			form,
			id: patternId,
			lineId,
			mergedRules: rulesForUI,
			pattern: patternData,
			stopsParameterRules: parametersForUI,
			typologyData,
		},
		flags: {
			canDelete,
			canLock,
			canSave,
			error: patternError,
			isDeleting,
			isLoading: patternLoading,
			isLocking,
			isReadOnly,
			isSaving: isSaving,
		},
		geojson: {
			pattern_line: patternLineFC,
			pattern_stops: patternStopsFC,
		},
	}), [addComment, handleAddRule, handleDelete, handleDeleteRule, handleEditRule, handleLock, patternMutate, handleOpenRuleModal, handleOpenRulesCalendarPreviewModal, handleOpenStopsParameterModal, handleSave, lineData?.agency_id, form, patternId, lineId, rulesForUI, patternData, parametersForUI, typologyData, canDelete, canLock, canSave, patternError, isDeleting, patternLoading, isLocking, isReadOnly, isSaving, patternLineFC, patternStopsFC]);

	//
	// H. Render components

	return (
		<PatternDetailContext.Provider value={contextValue}>
			{children}
		</PatternDetailContext.Provider>
	);

	//
};
