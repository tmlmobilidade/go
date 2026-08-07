'use client';

import { usePlansListContext } from '@/components/plans/list/PlansList.context';
import { PLAN_POSTERS_EXPORT_MODAL_ID } from '@/components/plans/Posters/PlanPostersModal/constants';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type CreateFileExportDto, PermissionCatalog, type PlanPostersExportProperties } from '@tmlmobilidade/types';
import { closeModal, type SelectDataItem, useDataAgencies, useExportsContext, useToast } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';

/* * */

interface PlansExportPdfsContextState {
	actions: {
		exportPosters: () => Promise<void>
		setPlanId: (value: null | string) => void
	}
	data: {
		agencyId: null | string
		agencyOptions: SelectDataItem[]
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
	const { options: agencyOptions } = useDataAgencies(API_ROUTES.auth.AGENCIES_LIST, {
		actions: [PermissionCatalog.all.plans.actions.generate_pdf_posters],
		scope: PermissionCatalog.all.plans.scope,
	});
	const [agencyId, setAgencyId] = useState<null | string>(null);
	const [planId, setPlanId] = useState<null | string>(null);
	const [loading, setLoading] = useState(false);

	//
	// B. Derived state

	const canSave = !!agencyId && !!planId;

	//
	// C. Handle actions

	const selectAgencyId = useCallback((value: null | string) => {
		setAgencyId(value);
		setPlanId(null);
	}, []);

	const selectPlanId = useCallback((value: null | string) => {
		const selectedPlan = plansListContext.data.raw.find(plan => plan._id === value && !!plan.operation_file_id);

		setPlanId(selectedPlan?._id ?? null);
		setAgencyId(selectedPlan?.agency_id ?? null);
	}, [plansListContext.data.raw]);

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

		const selectedPlan = plansListContext.data.raw.find(plan => plan._id === planId && plan.agency_id === agencyId);
		if (!selectedPlan?.operation_file_id) return;

		const createFileExportDto: CreateFileExportDto<PlanPostersExportProperties> = {
			created_by: 'will-be-set-by-api',
			file_id: null,
			file_name: `${selectedPlan._id}-pdf.zip`,
			processing_status: 'waiting',
			properties: {
				agency_id: agencyId,
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
	}, [agencyId, exports.actions, loading, planId, plansListContext.data.raw]);

	//
	// D. Define context value

	const contextValue: PlansExportPdfsContextState = useMemo(() => ({
		actions: {
			exportPosters,
			setPlanId: selectPlanId,
		},
		data: {
			agencyId,
			agencyOptions,
			planId,
		},
		flags: {
			canSave,
			has_error: false,
			loading,
		},
	}), [agencyId, agencyOptions, canSave, exportPosters, loading, planId, selectPlanId]);

	//
	// E. Render components

	return (
		<PlansExportPdfsContext.Provider value={contextValue}>
			{children}
		</PlansExportPdfsContext.Provider>
	);

	//
};
