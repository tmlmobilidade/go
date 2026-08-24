'use client';

import { usePlansListContext } from '@/components/plans/list/PlansList.context';
import { PLAN_POSTERS_EXPORT_MODAL_ID } from '@/components/plans/Posters/PlanPostersModal/constants';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type CreateFileExportDto, type PlanPostersExportProperties } from '@tmlmobilidade/go-types-downloads';
import { type Line, type LinesMode } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { closeModal, type SelectDataItem, useAgenciesData, useExportsContext, useToast } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';

/* * */

interface PlansExportPdfsContextState {
	actions: {
		exportPosters: () => Promise<void>
		setAgencyId: (value: null | string) => void
		setCanvasProfile: (value: null | string) => void
		setLineIds: (value: string[]) => void
		setLinesMode: (value: LinesMode) => void
		setPlanId: (value: null | string) => void
	}
	data: {
		agencyId: null | string
		agencyOptions: SelectDataItem[]
		canvasProfile: null | string
		lineIds: string[]
		lines: Line[]
		linesMode: LinesMode
		planId: null | string
	}
	flags: {
		canSave: boolean
		has_error: boolean
		loading: boolean
	}
}

/* * */

const PlansExportPdfsContext = createContext<PlansExportPdfsContextState | undefined>(undefined);

export function usePlansExportPdfsContext() {
	const context = useContext(PlansExportPdfsContext);
	if (!context) {
		throw new Error('usePlansExportPdfsContext must be used within a PlansExportPdfsModalContextProvider');
	}
	return context;
}

/* * */

export const PlansExportPdfsModalContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables

	const plansListContext = usePlansListContext();
	const exports = useExportsContext();
	const { data: linesData } = useSWR<Line[], Error>(API_ROUTES.plans.PLANS_POSTER_LINES);
	const [agencyId, setAgencyId] = useState<null | string>(null);
	const [canvasProfile, setCanvasProfile] = useState<null | string>('0Master.C');
	const [lineIds, setLineIds] = useState<string[]>([]);
	const [linesMode, setLinesMode] = useState<LinesMode>('all');
	const [planId, setPlanId] = useState<null | string>(null);
	const [loading, setLoading] = useState(false);

	const { options: agencyOptions } = useAgenciesData({
		permissions: {
			actions: [PermissionCatalog.all.plans.actions.read],
			scope: PermissionCatalog.all.plans.scope,
		},
	});

	//
	// B. Derived state

	const canSave = !!agencyId && !!planId && !!canvasProfile && (linesMode === 'all' || lineIds.length > 0);

	//
	// C. Handle actions

	const selectAgencyId = useCallback((value: null | string) => {
		setAgencyId(value);
		setLineIds([]);
		setLinesMode('all');
		setPlanId(null);
	}, []);

	const selectLinesMode = useCallback((value: LinesMode) => {
		setLinesMode(value);
		setLineIds([]);
	}, []);

	const selectPlanId = useCallback((value: null | string) => {
		const selectedPlan = plansListContext.data.raw.find(plan => plan._id === value && plan.agency_id === agencyId && !!plan.operation_file_id);

		setPlanId(selectedPlan?._id ?? null);
	}, [agencyId, plansListContext.data.raw]);

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
		if (!agencyId || !canvasProfile || !planId) return;
		if (linesMode !== 'all' && !lineIds.length) return;

		const selectedPlan = plansListContext.data.raw.find(plan => plan._id === planId && plan.agency_id === agencyId);
		if (!selectedPlan?.operation_file_id) return;

		const createFileExportDto: CreateFileExportDto<PlanPostersExportProperties> = {
			created_by: 'will-be-set-by-api',
			file_id: null,
			file_name: `${selectedPlan._id}-pdf.zip`,
			processing_status: 'waiting',
			properties: {
				agency_id: agencyId,
				canvas_profile: canvasProfile as '0Master.A' | '0Master.B' | '0Master.C' | '0Master.F',
				line_ids: linesMode === 'all' ? undefined : lineIds,
				lines_mode: linesMode,
				plan_id: planId,
			},
			type: 'plan_posters',
		};

		try {
			setLoading(true);
			const fileExport = await exports.actions.create(createFileExportDto);
			if (!fileExport) return;
			useToast.success({ message: 'A exportação dos PDFs foi iniciada', title: 'Sucesso' });
			closeModal(PLAN_POSTERS_EXPORT_MODAL_ID);
		} catch (error) {
			useToast.error({ message: error instanceof Error ? error.message : 'Erro ao iniciar a exportação dos PDFs', title: 'Erro' });
		} finally {
			setLoading(false);
		}
	}, [agencyId, canvasProfile, exports.actions, lineIds, linesMode, loading, planId, plansListContext.data.raw]);

	//
	// D. Define context value

	const contextValue: PlansExportPdfsContextState = useMemo(() => ({
		actions: {
			exportPosters,
			setAgencyId: selectAgencyId,
			setCanvasProfile,
			setLineIds,
			setLinesMode: selectLinesMode,
			setPlanId: selectPlanId,
		},
		data: {
			agencyId,
			agencyOptions,
			canvasProfile,
			lineIds,
			lines: linesData ?? [],
			linesMode,
			planId,
		},
		flags: {
			canSave,
			has_error: false,
			loading,
		},
	}), [agencyId, agencyOptions, canSave, canvasProfile, exportPosters, lineIds, linesData, linesMode, loading, planId, selectAgencyId, selectLinesMode, selectPlanId]);

	//
	// E. Render components

	return (
		<PlansExportPdfsContext.Provider value={contextValue}>
			{children}
		</PlansExportPdfsContext.Provider>
	);

	//
};
