'use client';

import { usePlansAgenciesData } from '@/components/plans/shared/use-plans-agencies-data';
import { usePlansExtractListData } from '@/components/plans/shared/use-plans-extract-list-data';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type PlansListItem } from '@tmlmobilidade/go-operation-pckg-types';
import { type Extraction, type OperationPostersV1ExtractionCreate, type OperationPostersV1ExtractionProperties } from '@tmlmobilidade/go-types-extractions';
import { type OperationalDateInt } from '@tmlmobilidade/go-types-shared';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { fetchApiData, openExtractionsListModal, type SelectDataItem, useForm, type UseFormReturnType, useToast } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { closePlanPostersExtractModal } from './PlanPostersExtract.modal';

/* * */

interface PlanPostersExtractFormContextState {
	actions: {
		exportPosters: () => Promise<void>
		setActiveDates: (value: null | OperationalDateInt) => void
		setAgencyIds: (value: string[]) => void
		setCanvasProfile: (value: null | OperationPostersV1ExtractionProperties['canvas_profile']) => void
		setContent: (value: OperationPostersV1ExtractionProperties['content']) => void
		setFilterMode: (value: NonNullable<OperationPostersV1ExtractionProperties['filter_mode']>) => void
		setPlanId: (agencyId: string, value: null | string) => void
		setStopIds: (value: string[]) => void
	}
	data: {
		activeDates: string
		agencyIds: string[]
		agencyOptions: SelectDataItem[]
		canvasProfile: OperationPostersV1ExtractionProperties['canvas_profile']
		contentMode: OperationPostersV1ExtractionProperties['content']
		filterMode: NonNullable<OperationPostersV1ExtractionProperties['filter_mode']>
		form: UseFormReturnType<OperationPostersV1ExtractionProperties>
		planIds: string[]
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

	//
	// A. Setup variables

	const [loading, setLoading] = useState(false);

	const form = useForm<OperationPostersV1ExtractionProperties>({
		initialValues: {
			active_dates: '',
			agency_ids: [],
			canvas_profile: 'auto',
			content: 'all',
			plan_ids: [],
		},
		mode: 'controlled',
	});
	const { setFieldValue, setValues } = form;
	const {
		active_dates: activeDates,
		agency_ids: agencyIds,
		canvas_profile: canvasProfile,
		content: contentMode,
		filter_mode: filterMode = 'include',
		plan_ids: planIds, stop_ids: stopIds = [],
	} = form.values;

	//
	// B. Fetch data

	const { options: agencyOptions } = usePlansAgenciesData();
	const plansData = usePlansExtractListData(agencyIds);

	//
	// C. Handle selections

	const setActiveDates = useCallback((value: null | OperationalDateInt) => {
		const date = value === null ? '' : Dates.fromOperationalDateInt(value, 'Europe/Lisbon').toFormat('dd.MM.yyyy');
		setFieldValue('active_dates', date);
	}, [setFieldValue]);

	const setAgencyIds = useCallback((value: string[]) => {
		setValues(current => ({
			agency_ids: value,
			plan_ids: current.plan_ids.filter(id => plansData.data.some(plan => plan._id === id && value.includes(plan.agency_id))),
			stop_ids: [],
		}));
	}, [plansData.data, setValues]);

	//

	const setPlanId = useCallback((agencyId: string, value: null | string) => {
		if (!agencyIds.includes(agencyId)) return;
		const selectedPlan = plansData.data.find(plan => plan._id === value && plan.agency_id === agencyId);
		setValues(current => ({
			plan_ids: [
				...current.plan_ids.filter(id => plansData.data.some(plan => plan._id === id && plan.agency_id !== agencyId && agencyIds.includes(plan.agency_id))),
				...(selectedPlan ? [selectedPlan._id] : []),
			],
			stop_ids: [],
		}));
	}, [agencyIds, plansData.data, setValues]);

	//

	const setContent = useCallback((value: OperationPostersV1ExtractionProperties['content']) => {
		setValues({ content: value, filter_mode: value === 'all' ? undefined : 'include', stop_ids: [] });
	}, [setValues]);

	//

	const setFilterMode = useCallback((value: NonNullable<OperationPostersV1ExtractionProperties['filter_mode']>) => {
		setValues({ filter_mode: value, stop_ids: [] });
	}, [setValues]);

	//

	const setCanvasProfile = useCallback((value: null | OperationPostersV1ExtractionProperties['canvas_profile']) => setFieldValue('canvas_profile', value ?? 'auto'), [setFieldValue]);
	const setStopIds = useCallback((value: string[]) => setFieldValue('stop_ids', value), [setFieldValue]);

	//

	useEffect(() => {
		const availableAgencyIds = agencyIds.filter(id => agencyOptions.some(option => option.value === id));
		if (agencyOptions.length === 1 && (agencyIds.length !== 1 || agencyIds[0] !== agencyOptions[0].value)) {
			setAgencyIds([agencyOptions[0].value]);
		} else if (agencyOptions.length > 1 && availableAgencyIds.length !== agencyIds.length) {
			setAgencyIds(availableAgencyIds);
		}
	}, [agencyIds, agencyOptions, setAgencyIds]);

	//
	// D. Setup flags

	const selectedPlans = plansData.data.filter(plan => planIds.includes(plan._id) && agencyIds.includes(plan.agency_id));
	const hasOnePlanPerAgency = new Set(selectedPlans.map(plan => plan.agency_id)).size === agencyIds.length && planIds.length === agencyIds.length;
	const hasSelectedPlans = agencyIds.length > 0 && selectedPlans.length === planIds.length && hasOnePlanPerAgency && selectedPlans.every(plan => !!plan.attachments.operation_gtfs_normalized);
	const hasSelectedStops = contentMode === 'stops' && stopIds.length > 0;
	const hasSelectedContent = contentMode === 'all' || hasSelectedStops;
	const canSave = !plansData.isLoading && !plansData.error && hasSelectedPlans && hasSelectedContent && (contentMode === 'all' || !!canvasProfile);

	//
	// E. Handle extraction

	const exportPosters = useCallback(async () => {
		//

		//
		// A. Setup variables

		if (loading || !canSave) return;

		const values = form.getValues();
		const hasFilter = values.content !== 'all';
		const extractionDto: OperationPostersV1ExtractionCreate = {
			properties: {
				...values,
				canvas_profile: hasFilter ? values.canvas_profile : 'auto',
				filter_mode: hasFilter ? values.filter_mode ?? 'include' : undefined,
				stop_ids: hasFilter ? values.stop_ids : undefined,
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
			openExtractionsListModal();
		} catch (error) {
			useToast.error({ message: error instanceof Error ? error.message : 'Erro ao iniciar a exportação dos PDFs', title: 'Erro' });
		} finally {
			setLoading(false);
		}
	}, [canSave, form, loading]);

	//
	// F. Define context value

	const contextValue: PlanPostersExtractFormContextState = useMemo(() => ({
		actions: {
			exportPosters,
			setActiveDates,
			setAgencyIds,
			setCanvasProfile,
			setContent,
			setFilterMode,
			setPlanId,
			setStopIds,
		},
		data: {
			activeDates,
			agencyIds,
			agencyOptions,
			canvasProfile,
			contentMode,
			filterMode,
			form,
			planIds,
			plans: plansData.data,
			stopIds,
		},
		flags: { canSave, has_error: !!plansData.error, loading },
	}), [activeDates, agencyIds, agencyOptions, canSave, canvasProfile, contentMode, exportPosters, filterMode, form, loading, planIds, plansData.data, plansData.error, setAgencyIds, setCanvasProfile, setContent, setFilterMode, setPlanId, setActiveDates, setStopIds, stopIds]);

	//
	// G. Render components

	return (
		<PlanPostersExtractFormContext.Provider value={contextValue}>
			{children}
		</PlanPostersExtractFormContext.Provider>
	);
};
