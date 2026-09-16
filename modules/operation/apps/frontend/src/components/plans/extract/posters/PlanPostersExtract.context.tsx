'use client';

import { usePlansAgenciesData } from '@/components/plans/shared/use-plans-agencies-data';
import { usePlansExtractListData } from '@/components/plans/shared/use-plans-extract-list-data';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type PlansListItem } from '@tmlmobilidade/go-operation-pckg-types';
import { type Extraction, type OperationPostersV1ExtractionCreate, type OperationPostersV1ExtractionProperties } from '@tmlmobilidade/go-types-extractions';
import { fetchApiData, type SelectDataItem, useForm, type UseFormReturnType, useToast } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { closePlanPostersExtractModal } from './PlanPostersExtract.modal';

/* * */

interface PlanPostersExtractFormContextState {
	actions: {
		exportPosters: () => Promise<void>
		setAgencyId: (value: null | string) => void
		setCanvasProfile: (value: null | string) => void
		setContentMode: (value: OperationPostersV1ExtractionProperties['content_mode']) => void
		setFilterMode: (value: NonNullable<OperationPostersV1ExtractionProperties['lines_mode']>) => void
		setLineIds: (value: string[]) => void
		setPlanId: (value: null | string) => void
		setStopIds: (value: string[]) => void
	}
	data: {
		agencyId: null | string
		agencyOptions: SelectDataItem[]
		canvasProfile: string
		contentMode: OperationPostersV1ExtractionProperties['content_mode']
		filterMode: NonNullable<OperationPostersV1ExtractionProperties['lines_mode']>
		form: UseFormReturnType<OperationPostersV1ExtractionProperties>
		lineIds: string[]
		planId: null | string
		plans: PlansListItem[]
		stopIds: string[]
	}
	flags: {
		canSave: boolean
		has_error: boolean
		loading: boolean
	}
}

/* * */

const PlanPostersExtractFormContext = createContext<PlanPostersExtractFormContextState | undefined>(undefined);

export function usePlanPostersExtractFormContext() {
	const context = useContext(PlanPostersExtractFormContext);
	if (!context) {
		throw new Error('usePlanPostersExtractFormContext must be used within a PlanPostersExtractFormContextProvider');
	}
	return context;
}

/* * */

export const PlanPostersExtractFormContextProvider = ({ children }: PropsWithChildren) => {
	//
	// A. Setup variables

	const [loading, setLoading] = useState(false);

	const form = useForm<OperationPostersV1ExtractionProperties>({
		initialValues: {
			agency_ids: [],
			canvas_profile: '0Master.C',
			content_mode: 'all',
			plan_ids: [],
		},
		mode: 'controlled',
	});
	const { setFieldValue, setValues } = form;
	const { agency_ids: agencyIds, canvas_profile: canvasProfile, content_mode: contentMode, line_ids: lineIds = [], lines_mode: filterMode = 'include', plan_ids: planIds, stop_ids: stopIds = [] } = form.values;
	const agencyId = agencyIds[0] ?? null;
	const planId = planIds[0] ?? null;

	//
	// B. Fetch data

	const { options: agencyOptions } = usePlansAgenciesData();
	const plansData = usePlansExtractListData(agencyId);

	//
	// C. Handle selections

	const setAgencyId = useCallback((value: null | string) => {
		setValues({ agency_ids: value ? [value] : [], line_ids: [], plan_ids: [], stop_ids: [] });
	}, [setValues]);

	const setPlanId = useCallback((value: null | string) => {
		const selectedPlan = plansData.data.find(plan => plan._id === value && plan.agency_id === agencyId);
		setValues({ line_ids: [], plan_ids: selectedPlan ? [selectedPlan._id] : [], stop_ids: [] });
	}, [agencyId, plansData.data, setValues]);

	const setContentMode = useCallback((value: OperationPostersV1ExtractionProperties['content_mode']) => {
		setValues({ content_mode: value, line_ids: [], lines_mode: 'include', stop_ids: [], stops_mode: 'include' });
	}, [setValues]);

	const setFilterMode = useCallback((value: NonNullable<OperationPostersV1ExtractionProperties['lines_mode']>) => {
		setValues({ line_ids: [], lines_mode: value, stop_ids: [], stops_mode: value });
	}, [setValues]);

	const setCanvasProfile = useCallback((value: null | string) => setFieldValue('canvas_profile', value ?? ''), [setFieldValue]);
	const setLineIds = useCallback((value: string[]) => setFieldValue('line_ids', value), [setFieldValue]);
	const setStopIds = useCallback((value: string[]) => setFieldValue('stop_ids', value), [setFieldValue]);

	useEffect(() => {
		const selectedAgencyIsAvailable = agencyOptions.some(option => option.value === agencyId);
		if (agencyOptions.length === 1 && agencyId !== agencyOptions[0].value) {
			setAgencyId(agencyOptions[0].value);
		} else if (agencyOptions.length > 1 && agencyId && !selectedAgencyIsAvailable) {
			setAgencyId(null);
		}
	}, [agencyId, agencyOptions, setAgencyId]);

	//
	// D. Setup flags

	const selectedPlan = plansData.data.find(plan => plan._id === planId && plan.agency_id === agencyId);
	const hasSelectedLines = (contentMode === 'lines' || contentMode === 'lines_stops') && lineIds.length > 0;
	const hasSelectedStops = (contentMode === 'stops' || contentMode === 'lines_stops') && stopIds.length > 0;
	const hasSelectedContent = contentMode === 'all' || (contentMode === 'lines_stops' ? hasSelectedLines && hasSelectedStops : hasSelectedLines || hasSelectedStops);
	const canSave = !!selectedPlan?.attachments.operation_gtfs_normalized && hasSelectedContent && (contentMode === 'all' || !!canvasProfile);

	//
	// E. Handle extraction

	const exportPosters = useCallback(async () => {
		//

		//
		// A. Setup variables

		if (loading || !canSave) return;

		const values = form.getValues();
		const includesLines = values.content_mode === 'lines' || values.content_mode === 'lines_stops';
		const includesStops = values.content_mode === 'stops' || values.content_mode === 'lines_stops';
		const extractionDto: OperationPostersV1ExtractionCreate = {
			properties: {
				...values,
				canvas_profile: values.content_mode === 'all' ? '0Master.C' : values.canvas_profile,
				line_ids: includesLines ? values.line_ids : undefined,
				lines_mode: includesLines ? values.lines_mode : undefined,
				stop_ids: includesStops ? values.stop_ids : undefined,
				stops_mode: includesStops ? values.stops_mode : undefined,
			},
			send_email_notification: false,
			version: 'operation-posters-v1',
		};

		//
		// B. Handle extraction

		try {
			setLoading(true);
			const extraction = await fetchApiData<Extraction[], OperationPostersV1ExtractionCreate>({
				body: extractionDto,
				method: 'POST',
				url: API_ROUTES.core.EXTRACTIONS_CREATE,
			});
			if (extraction.error || !extraction.data) {
				throw new Error(extraction.error ?? 'Erro ao iniciar a exportação dos PDFs');
			}
			useToast.success({ message: 'A exportação dos PDFs foi iniciada', title: 'Sucesso' });
			closePlanPostersExtractModal();
		} catch (error) {
			useToast.error({ message: error instanceof Error ? error.message : 'Erro ao iniciar a exportação dos PDFs', title: 'Erro' });
		} finally {
			setLoading(false);
		}
	}, [canSave, form, loading]);

	//
	// F. Define context value

	const contextValue: PlanPostersExtractFormContextState = useMemo(() => ({
		actions: { exportPosters, setAgencyId, setCanvasProfile, setContentMode, setFilterMode, setLineIds, setPlanId, setStopIds },
		data: {
			agencyId,
			agencyOptions,
			canvasProfile,
			contentMode,
			filterMode,
			form,
			lineIds,
			planId,
			plans: plansData.data,
			stopIds,
		},
		flags: { canSave, has_error: !!plansData.error, loading },
	}), [agencyId, agencyOptions, canSave, canvasProfile, contentMode, exportPosters, filterMode, form, lineIds, loading, planId, plansData.data, plansData.error, setAgencyId, setCanvasProfile, setContentMode, setFilterMode, setLineIds, setPlanId, setStopIds, stopIds]);

	//
	// G. Render components

	return (
		<PlanPostersExtractFormContext.Provider value={contextValue}>
			{children}
		</PlanPostersExtractFormContext.Provider>
	);
};
