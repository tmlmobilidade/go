'use client';

/* * */

import { openCreateRuleModal } from '@/components/patterns/rules/create/RuleCreate.modal';
import { openRulesCalendarPreviewModal } from '@/components/patterns/rules/list/RulesCalendarPreview.modal';
import { usePeriodsContext } from '@/contexts/Periods.context';
import { useTypologiesContext } from '@/contexts/Typologies.context';
import { computeFinalAffectedDatesAndTimepoints, RulesPreview } from '@/utils/rules/ruleAppliesToDate';
import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { getBaseGeoJsonFeatureCollection } from '@tmlmobilidade/geo';
import { Line, ManualScheduleRule, Pattern, PermissionCatalog, ScheduleRule, Typology, type UpdatePatternDto, UpdatePatternSchema } from '@tmlmobilidade/types';
import { DetailContextStateTemplate, keepUrlParams, type MapOverlayPatternShapeLineDataProps, type MapOverlayPatternShapeStopsDataProps, useDetailState, type UseFormReturnType, useHandleUpdate, useMeContext, useTypicalForm } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { type Feature, type FeatureCollection, type LineString, type Point } from 'geojson';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';

/* * */

interface PatternDetailContextState {
	actions: DetailContextStateTemplate['actions'] & {
		addRule: (rule: ManualScheduleRule) => void
		deleteRule: (ruleId: string) => void
		editRule: (rule: ManualScheduleRule) => void
		mutate: () => Promise<Pattern | undefined>
		openRuleModal: (rule?: ManualScheduleRule) => void
		openRulesCalendarPreviewModal: () => void
	}
	data: {
		agency_id: string
		form: UseFormReturnType<UpdatePatternDto>
		id: string
		mergedRules: ScheduleRule[]
		pattern: null | Pattern
		rulesPreview?: RulesPreview
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

	const [rulesPreview, setRulesPreview] = useState<RulesPreview | undefined>(undefined);

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
		() => (patternData?.rules ?? []).filter((r): r is ManualScheduleRule => r.kind === 'manual'),
		[patternData],
	);

	const derivedRules = useMemo(
		() => (patternData?.rules ?? []).filter(r => r.kind === 'event'),
		[patternData],
	);

	const patternForForm = useMemo(
		() => (patternData ? { ...patternData, rules: manualRules } : patternData),
		[patternData, manualRules],
	);

	const { form } = useTypicalForm<UpdatePatternDto>(UpdatePatternSchema, patternForForm as UpdatePatternDto);

	// rules used for UI + preview
	const rulesForUI = useMemo(
		() => [...(form.values.rules ?? []), ...derivedRules] as ScheduleRule[],
		[form.values.rules, derivedRules],
	);

	//
	// E. Handle actions

	useEffect(() => {
		if (!patternData) return;
		if (form.isDirty()) return;

		recomputePreview(rulesForUI);
	}, [patternData, periodsContext.data.raw, rulesForUI]);

	const recomputePreview = (rules: ScheduleRule[]) => {
		setRulesPreview(
			computeFinalAffectedDatesAndTimepoints(rules, {
				endDate: Dates.now('Europe/Lisbon').plus({ years: 1 }).js_date,
				periods: periodsContext.data.raw,
				startDate: new Date(),
			}),
		);
	};

	const handleAddRule = (rule: ManualScheduleRule) => {
		const currentRules = (form.getValues().rules ?? []) as ManualScheduleRule[];
		const ruleWithId = { ...rule, _id: crypto.randomUUID() };
		const newRules = [...currentRules, ruleWithId];

		form.setFieldValue('rules', newRules);
		recomputePreview([...newRules, ...derivedRules] as ScheduleRule[]);
	};

	const handleEditRule = (rule: ManualScheduleRule) => {
		if (!rule._id) {
			console.error('Cannot edit rule without _id');
			return;
		}
		const currentRules = (form.getValues().rules ?? []) as ManualScheduleRule[];
		const newRules = currentRules.map(r =>
			r._id === rule._id ? rule : r,
		);

		form.setFieldValue('rules', newRules);
		recomputePreview([...newRules, ...derivedRules] as ScheduleRule[]);
	};

	const handleDeleteRule = (ruleId: string) => {
		const currentRules = (form.getValues().rules ?? []) as ManualScheduleRule[];
		const newRules = currentRules.filter(r => r._id !== ruleId);

		form.setFieldValue('rules', newRules);
		recomputePreview([...newRules, ...derivedRules] as ScheduleRule[]);
	};

	const handleOpenRuleModal = (rule?: ManualScheduleRule) => {
		const onSubmit = (validatedRule: ManualScheduleRule) => {
			if (rule?._id) {
				// Editing - preserve the _id
				handleEditRule({ ...validatedRule, _id: rule._id });
			}
			else {
				// Creating new
				handleAddRule(validatedRule);
			}
		};

		const onDelete = rule?._id ? () => handleDeleteRule(rule._id) : undefined;

		openCreateRuleModal(lineData?.agency_id || '', onSubmit, rule, onDelete);
	};

	const handleOpenRulesCalendarPreviewModal = () => {
		openRulesCalendarPreviewModal(
			lineData?.agency_id || '',
			rulesPreview,
		);
	};

	const { action: handleSave, isLoading: isSaving } = useHandleUpdate({
		fetchFn: async () => await fetchData<Pattern>(API_ROUTES.offer.PATTERNS_DETAIL(patternId), 'PUT', form.getValues()),
		onSuccess: (updatedItem) => {
			form.resetDirty();
			patternMutate(updatedItem);
			lineMutate();
		},
	});

	const { action: handleDelete, isLoading: isDeleting } = useHandleUpdate({
		fetchFn: async () => await fetchData<Pattern>(API_ROUTES.offer.PATTERNS_DETAIL(patternId), 'DELETE', patternData),
		onSuccess: () => {
			form.resetDirty();
			lineMutate();
			router.push(keepUrlParams(PAGE_ROUTES.offer.LINES_LIST));
		},
	});

	const { action: handleLock, isLoading: isLocking } = useHandleUpdate({
		fetchFn: async () => await fetchData<Pattern>(API_ROUTES.offer.PATTERNS_DETAIL_LOCK(patternId)),
		onSuccess: (updatedItem) => {
			form.resetDirty();
			patternMutate(updatedItem);
			lineMutate();
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
			addRule: handleAddRule,
			delete: handleDelete,
			deleteRule: handleDeleteRule,
			editRule: handleEditRule,
			lock: handleLock,
			mutate: patternMutate,
			openRuleModal: handleOpenRuleModal,
			openRulesCalendarPreviewModal: handleOpenRulesCalendarPreviewModal,
			save: handleSave,
		},
		data: {
			agency_id: lineData?.agency_id || '',
			form,
			id: patternId,
			lineId,
			mergedRules: rulesForUI,
			pattern: patternData,
			rulesPreview,
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
	}), [
		patternData,
		patternError,
		patternLoading,
		patternId,
		form,
		isSaving,
		patternLineFC,
		patternStopsFC,
		lineData,
		rulesPreview,
		canDelete,
		canLock,
		canSave,
		isReadOnly,
		isDeleting,
		isLocking,
	]);

	//
	// H. Render components

	return (
		<PatternDetailContext.Provider value={contextValue}>
			{children}
		</PatternDetailContext.Provider>
	);

	//
};
