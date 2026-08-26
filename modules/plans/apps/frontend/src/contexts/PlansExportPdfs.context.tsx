'use client';

import { PLAN_POSTERS_EXPORT_MODAL_ID } from '@/components/plans/Posters/PlanPostersModal/constants';
import { usePlansAgencies } from '@/components/plans/shared/use-plans-agencies';
import { usePlansExportListData } from '@/components/plans/shared/use-plans-export-list-data';
import { usePlansLines } from '@/components/plans/shared/use-plans-lines';
import { type PlanListItem } from '@tmlmobilidade/go-plans-pckg-types';
import { type CreateFileExportDto, type PlanPostersExportProperties } from '@tmlmobilidade/go-types-downloads';
import { type LinesMode } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { closeModal, type SelectDataItem, useExportsContext, useToast } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';

/* * */

interface PlansExportPdfsContextState {
	actions: {
		exportPosters: () => Promise<void>
		setAgencyId: (value: null | string) => void
		setCanvasProfile: (value: CanvasProfile | null) => void
		setLineIds: (value: string[]) => void
		setLinesMode: (value: LinesMode) => void
		setPlanId: (value: null | string) => void
	}
	data: {
		agencyId: null | string
		agencyOptions: SelectDataItem[]
		canvasProfile: CanvasProfile | null
		lineIds: string[]
		lineOptions: SelectDataItem[]
		linesMode: LinesMode
		planId: null | string
		plans: PlanListItem[]
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

	const exports = useExportsContext();
	const [agencyId, setAgencyId] = useState<null | string>(null);
	const [canvasProfile, setCanvasProfile] = useState<CanvasProfile | null>('0Master.C');
	const [lineIds, setLineIds] = useState<string[]>([]);
	const [linesMode, setLinesMode] = useState<LinesMode>('all');
	const [planId, setPlanId] = useState<null | string>(null);
	const [loading, setLoading] = useState(false);

	const { options: agencyOptions } = usePlansAgencies({
		permissions: {
			actions: [PermissionCatalog.all.plans.actions.read],
			scope: PermissionCatalog.all.plans.scope,
		},
	});

	const plansLines = usePlansLines(agencyId ? {
		agency_id: agencyId,
		permissions: {
			actions: [PermissionCatalog.all.plans.actions.generate_pdf_posters],
			scope: PermissionCatalog.all.plans.scope,
		},
	} : null);

	const plansData = usePlansExportListData(agencyId);

	//
	// B. Derived state

	const canSave = !!agencyId && !!planId && (linesMode === 'all' || (!!canvasProfile && lineIds.length > 0));

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
		const selectedPlan = plansData.data.find(plan => plan._id === value && plan.agency_id === agencyId && !!plan.operation_file_id);

		setPlanId(selectedPlan?._id ?? null);
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
		if (linesMode !== 'all' && (!canvasProfile || !lineIds.length)) return;

		const selectedPlan = plansData.data.find(plan => plan._id === planId && plan.agency_id === agencyId);
		if (!selectedPlan?.operation_file_id) return;

		const createFileExportDto: CreateFileExportDto<PlanPostersExportProperties> = {
			created_by: 'will-be-set-by-api',
			file_id: null,
			file_name: `${selectedPlan._id}-pdf.zip`,
			processing_status: 'waiting',
			properties: {
				agency_id: agencyId,
				canvas_profile: linesMode === 'all' ? '0Master.C' : canvasProfile,
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
	}, [agencyId, canvasProfile, exports.actions, lineIds, linesMode, loading, planId, plansData.data]);

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
			lineOptions: plansLines.options,
			linesMode,
			planId,
			plans: plansData.data,
		},
		flags: {
			canSave,
			has_error: !!plansData.error || !!plansLines.error,
			loading,
		},
	}), [agencyId, agencyOptions, canSave, canvasProfile, exportPosters, lineIds, linesMode, loading, planId, plansData.data, plansData.error, plansLines.error, plansLines.options, selectAgencyId, selectLinesMode, selectPlanId]);

	//
	// E. Render components

	return (
		<PlansExportPdfsContext.Provider value={contextValue}>
			{children}
		</PlansExportPdfsContext.Provider>
	);

	//
};
