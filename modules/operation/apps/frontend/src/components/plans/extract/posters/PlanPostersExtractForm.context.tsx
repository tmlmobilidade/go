'use client';

import { usePlansAgenciesData } from '@/components/plans/shared/use-plans-agencies-data';
import { usePlansExportListData } from '@/components/plans/shared/use-plans-export-list-data';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type PlansListItem } from '@tmlmobilidade/go-operation-pckg-types';
import { type CreateFileExportDto, FileExport, type PlanPostersContentMode, type PlanPostersExportProperties, type PlanPostersFilterMode } from '@tmlmobilidade/go-types-downloads';
import { closeModal, type SelectDataItem, useToast } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';

/* * */

interface PlanPostersExtractFormContextState {
	actions: {
		exportPosters: () => Promise<void>
		setAgencyId: (value: null | string) => void
		setCanvasProfile: (value: CanvasProfile | null) => void
		setContentMode: (value: PlanPostersContentMode) => void
		setFilterMode: (value: PlanPostersFilterMode) => void
		setLineIds: (value: string[]) => void
		setPlanId: (value: null | string) => void
		setStopIds: (value: string[]) => void
	}
	data: {
		agencyId: null | string
		agencyOptions: SelectDataItem[]
		canvasProfile: CanvasProfile | null
		contentMode: PlanPostersContentMode
		filterMode: PlanPostersFilterMode
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

type CanvasProfile = NonNullable<PlanPostersExportProperties['properties']['canvas_profile']>;

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

	const [agencyId, setAgencyId] = useState<null | string>(null);
	const [canvasProfile, setCanvasProfile] = useState<CanvasProfile | null>('0Master.C');
	const [contentMode, setContentMode] = useState<PlanPostersContentMode>('all');
	const [filterMode, setFilterMode] = useState<PlanPostersFilterMode>('include');
	const [lineIds, setLineIds] = useState<string[]>([]);
	const [planId, setPlanId] = useState<null | string>(null);
	const [stopIds, setStopIds] = useState<string[]>([]);
	const [loading, setLoading] = useState(false);

	const { options: agencyOptions } = usePlansAgenciesData();

	const plansData = usePlansExportListData(agencyId);

	//
	// B. Derived state

	const hasSelectedLines = (contentMode === 'lines' || contentMode === 'lines_stops') && lineIds.length > 0;
	const hasSelectedStops = (contentMode === 'stops' || contentMode === 'lines_stops') && stopIds.length > 0;
	const hasSelectedContent = contentMode === 'all' || (contentMode === 'lines_stops' ? hasSelectedLines && hasSelectedStops : hasSelectedLines || hasSelectedStops);
	const canSave = !!agencyId && !!planId && hasSelectedContent && (contentMode === 'all' || !!canvasProfile);

	//
	// C. Handle actions

	const selectAgencyId = useCallback((value: null | string) => {
		setAgencyId(value);
		setContentMode('all');
		setFilterMode('include');
		setLineIds([]);
		setPlanId(null);
		setStopIds([]);
	}, []);

	const selectContentMode = useCallback((value: PlanPostersContentMode) => {
		setContentMode(value);
		setFilterMode('include');
		setLineIds([]);
		setStopIds([]);
	}, []);

	const selectFilterMode = useCallback((value: PlanPostersFilterMode) => {
		setFilterMode(value);
		setLineIds([]);
		setStopIds([]);
	}, []);

	const selectPlanId = useCallback((value: null | string) => {
		const selectedPlan = plansData.data.find(plan => plan._id === value && plan.agency_id === agencyId);

		setPlanId(selectedPlan?._id ?? null);
		setLineIds([]);
		setStopIds([]);
	}, [agencyId, plansData.data]);

	useEffect(() => {
		const selectedAgencyIsAvailable = agencyOptions.some(option => option.value === agencyId);

		if (agencyOptions.length === 1 && agencyId !== agencyOptions[0].value) {
			selectAgencyId(agencyOptions[0].value);
		} else if (agencyOptions.length > 1 && agencyId && !selectedAgencyIsAvailable) {
			selectAgencyId(null);
		}
	}, [agencyId, agencyOptions, selectAgencyId]);

	const exportPosters = useCallback(async () => {
		if (loading) return;
		if (!agencyId || !planId) return;
		if ((contentMode === 'lines' || contentMode === 'lines_stops') && (!canvasProfile || !lineIds.length)) return;
		if ((contentMode === 'stops' || contentMode === 'lines_stops') && (!canvasProfile || !stopIds.length)) return;

		const selectedPlan = plansData.data.find(plan => plan._id === planId && plan.agency_id === agencyId);
		if (!selectedPlan?.attachments.operation_gtfs) return;

		const createFileExportDto: CreateFileExportDto<PlanPostersExportProperties> = {
			created_by: 'will-be-set-by-api',
			file_id: null,
			file_name: `${selectedPlan._id}-pdf.zip`,
			processing_status: 'waiting',
			properties: {
				agency_id: agencyId,
				canvas_profile: contentMode === 'all' ? '0Master.C' : canvasProfile,
				content_mode: contentMode,
				line_ids: (contentMode === 'lines' || contentMode === 'lines_stops') ? lineIds : undefined,
				lines_mode: (contentMode === 'lines' || contentMode === 'lines_stops') ? filterMode : undefined,
				plan_id: planId,
				stop_ids: (contentMode === 'stops' || contentMode === 'lines_stops') ? stopIds : undefined,
				stops_mode: (contentMode === 'stops' || contentMode === 'lines_stops') ? filterMode : undefined,
			},
			type: 'plan_posters',
		};

		try {
			setLoading(true);
			// const fileExport = await goDb.core.extractions.insertOne(createFileExportDto as InsertableDocument<FileExport>);
			// if (!fileExport) return;
			useToast.success({ message: 'A exportação dos PDFs foi iniciada', title: 'Sucesso' });
			// closeModal(PLAN_POSTERS_EXTRACT_MODAL_ID);
		} catch (error) {
			useToast.error({ message: error instanceof Error ? error.message : 'Erro ao iniciar a exportação dos PDFs', title: 'Erro' });
		} finally {
			setLoading(false);
		}
	}, [agencyId, canvasProfile, contentMode, exports.actions, filterMode, lineIds, loading, planId, plansData.data, stopIds]);

	//
	// D. Define context value

	const contextValue: PlanPostersExtractFormContextState = useMemo(() => ({
		actions: {
			exportPosters,
			setAgencyId: selectAgencyId,
			setCanvasProfile,
			setContentMode: selectContentMode,
			setFilterMode: selectFilterMode,
			setLineIds,
			setPlanId: selectPlanId,
			setStopIds,
		},
		data: {
			agencyId,
			agencyOptions,
			canvasProfile,
			contentMode,
			filterMode,
			lineIds,
			planId,
			plans: plansData.data,
			stopIds,
		},
		flags: {
			canSave,
			has_error: !!plansData.error,
			loading,
		},
	}), [agencyId, agencyOptions, canSave, canvasProfile, contentMode, exportPosters, filterMode, lineIds, loading, planId, plansData.data, plansData.error, selectAgencyId, selectContentMode, selectFilterMode, selectPlanId, stopIds]);

	//
	// E. Render components

	return (
		<PlanPostersExtractFormContext.Provider value={contextValue}>
			{children}
		</PlanPostersExtractFormContext.Provider>
	);

	//
};
