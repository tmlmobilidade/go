'use client';

import { usePlansListFilterAgency } from '@/components/plans/list/filters/PlansListFilterAgency/use-plans-list-filter-agency';
import { usePlansListData } from '@/components/plans/list/use-plans-list-data';
import { type CreateFileExportDto, type PlanExportProperties } from '@tmlmobilidade/go-types-downloads';
import { closeModal, useExportsContext, useToast } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { PLAN_EXPORT_MODAL_ID } from '../components/plans/exporter/PlanExportModal/constants';

/* * */

interface PlanExportModalContextState {
	actions: {
		exportPlan: () => Promise<void>
		setAgencyId: (value: null | string) => void
		setPlanId: (value: null | string) => void
	}
	data: {
		agencyId: null | string
		planId: null | string
	}
	flags: {
		canSave: boolean
		loading: boolean
	}
}

/* * */

const PlanExportModalContext = createContext<PlanExportModalContextState | undefined>(undefined);

export function usePlanExportModalContext() {
	const context = useContext(PlanExportModalContext);
	if (!context) {
		throw new Error('usePlanExportModalContext must be used within a PlanExportModalContextProvider');
	}
	return context;
}

/* * */

export const PlanExportModalContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables

	const plansData = usePlansListData();
	const filterAgency = usePlansListFilterAgency();
	const exports = useExportsContext();
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
		const selectedPlan = plansData.raw.find(plan => plan._id === value && plan.agency_id === agencyId);

		setPlanId(selectedPlan?._id ?? null);
	}, [agencyId, plansData.raw]);

	useEffect(() => {
		const agencyOptions = filterAgency.options;
		const selectedAgencyIsAvailable = agencyOptions.some(option => option.value === agencyId);

		if (agencyOptions.length === 1 && agencyId !== agencyOptions[0].value) {
			selectAgencyId(agencyOptions[0].value);
		} else if (agencyOptions.length > 1 && agencyId && !selectedAgencyIsAvailable) {
			selectAgencyId(null);
		}
	}, [agencyId, filterAgency.options, selectAgencyId]);

	const exportPlan = useCallback(async () => {
		if (loading) return;

		if (!agencyId || !planId) return;

		const selectedPlan = plansData.raw.find(plan => plan._id === planId && plan.agency_id === agencyId);
		if (!selectedPlan) return;

		const createFileExportDto: CreateFileExportDto<PlanExportProperties> = {
			created_by: 'will-be-set-by-api',
			file_id: null,
			file_name: `gtfs-${selectedPlan._id}.zip`,
			processing_status: 'waiting',
			properties: {
				agency_id: agencyId,
				plan_id: planId,
			},
			type: 'plan',
		};

		try {
			setLoading(true);
			const fileExport = await exports.actions.create(createFileExportDto);
			if (!fileExport) return;
			useToast.success({ message: 'A exportação do plano foi iniciada', title: 'Sucesso' });
			closeModal(PLAN_EXPORT_MODAL_ID);
		} catch (error) {
			useToast.error({ message: error instanceof Error ? error.message : 'Erro ao iniciar a exportação do plano', title: 'Erro' });
		} finally {
			setLoading(false);
		}
	}, [agencyId, exports.actions, loading, planId, plansData.raw]);

	//
	// D. Define context value

	const contextValue: PlanExportModalContextState = useMemo(() => ({
		actions: {
			exportPlan,
			setAgencyId: selectAgencyId,
			setPlanId: selectPlanId,
		},
		data: {
			agencyId,
			planId,
		},
		flags: {
			canSave,
			loading,
		},
	}), [agencyId, canSave, exportPlan, loading, planId, selectAgencyId, selectPlanId]);

	//
	// E. Render components

	return (
		<PlanExportModalContext.Provider value={contextValue}>
			{children}
		</PlanExportModalContext.Provider>
	);

	//
};
