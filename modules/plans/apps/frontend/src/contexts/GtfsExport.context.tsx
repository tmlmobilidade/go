'use client';

import { usePlansListContext } from '@/components/plans/list/PlansList.context';
import { type CreateFileExportDto, type GtfsExportProperties } from '@tmlmobilidade/types';
import { closeModal, useExportsContext, useForm, type UseFormReturnType, useToast } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { GTFS_EXPORT_MODAL_ID } from '../components/plans/exporter/GtfsExportModal/constants';

/* * */

export interface GtfsExportFormValues {
	agency_ids: string[]
	plan_ids: string[]
}

interface GtfsExportModalContextState {
	actions: {
		exportGtfs: () => Promise<void>
		setAgencyId: (value: null | string) => void
		setPlanId: (value: null | string) => void
	}
	data: {
		form: UseFormReturnType<GtfsExportFormValues>
	}
	flags: {
		canSave: boolean
		loading: boolean
	}
}

/* * */

const GtfsExportModalContext = createContext<GtfsExportModalContextState | undefined>(undefined);

export function useGtfsExportModalContext() {
	const context = useContext(GtfsExportModalContext);
	if (!context) {
		throw new Error('useGtfsExportModalContext must be used within a GtfsExportModalContextProvider');
	}
	return context;
}

/* * */

export const GtfsExportModalContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables

	const plansListContext = usePlansListContext();
	const exports = useExportsContext();
	const [loading, setLoading] = useState(false);
	const form = useForm<GtfsExportFormValues>({
		initialValues: {
			agency_ids: [],
			plan_ids: [],
		},
		mode: 'controlled',
	});

	//
	// B. Derived state

	const { agency_ids, plan_ids } = form.values;
	const canSave = agency_ids.length === 1 && plan_ids.length === 1;

	//
	// C. Handle actions

	const setAgencyId = useCallback((value: null | string) => {
		form.setValues({
			agency_ids: value ? [value] : [],
			plan_ids: [],
		});
	}, [form]);

	const setPlanId = useCallback((value: null | string) => {
		const selectedAgencyId = form.getValues().agency_ids[0];
		const selectedPlan = plansListContext.data.raw.find(plan => plan._id === value && plan.agency_id === selectedAgencyId);

		form.setValues({
			plan_ids: selectedPlan ? [selectedPlan._id] : [],
		});
	}, [form, plansListContext.data.raw]);

	useEffect(() => {
		const agencyOptions = plansListContext.filters.agency.options;
		const selectedAgencyId = form.values.agency_ids[0];
		const selectedAgencyIsAvailable = agencyOptions.some(option => option.value === selectedAgencyId);

		if (agencyOptions.length === 1 && selectedAgencyId !== agencyOptions[0].value) {
			setAgencyId(agencyOptions[0].value);
		} else if (agencyOptions.length > 1 && selectedAgencyId && !selectedAgencyIsAvailable) {
			setAgencyId(null);
		}
	}, [form.values.agency_ids, plansListContext.filters.agency.options, setAgencyId]);

	const exportGtfs = useCallback(async () => {
		if (loading) return;

		const values = form.getValues();
		if (values.agency_ids.length !== 1 || values.plan_ids.length !== 1) return;

		const selectedPlan = plansListContext.data.raw.find(plan => plan._id === values.plan_ids[0] && plan.agency_id === values.agency_ids[0]);
		if (!selectedPlan) return;

		const feedStartDate = selectedPlan.gtfs_feed_info.feed_start_date;
		const feedEndDate = selectedPlan.gtfs_feed_info.feed_end_date;

		const fileName = `gtfs_plan_${selectedPlan._id}_${feedStartDate}_${feedEndDate}.zip`;
		const createFileExportDto: CreateFileExportDto<GtfsExportProperties> = {
			created_by: 'will-be-set-by-api',
			file_id: null,
			file_name: fileName,
			processing_status: 'waiting',
			properties: {
				agency_ids: values.agency_ids,
				calendars_clip_end_date: feedEndDate,
				calendars_clip_start_date: feedStartDate,
				feed_end_date: feedEndDate,
				feed_start_date: feedStartDate,
				lines_exclude: [],
				lines_include: [],
				lines_mode: 'all',
				numeric_calendar_codes: false,
				plan_ids: values.plan_ids,
				stop_sequence_start: 1,
				stops_export_all: true,
			},
			type: 'gtfs',
		};

		try {
			setLoading(true);
			const fileExport = await exports.actions.create(createFileExportDto);
			if (!fileExport) return;
			useToast.success({ message: 'A exportação GTFS foi iniciada', title: 'Sucesso' });
			closeModal(GTFS_EXPORT_MODAL_ID);
		} catch (error) {
			useToast.error({ message: error instanceof Error ? error.message : 'Erro ao iniciar a exportação GTFS', title: 'Erro' });
		} finally {
			setLoading(false);
		}
	}, [exports.actions, form, loading, plansListContext.data.raw]);

	//
	// D. Define context value

	const contextValue: GtfsExportModalContextState = useMemo(() => ({
		actions: {
			exportGtfs,
			setAgencyId,
			setPlanId,
		},
		data: {
			form,
		},
		flags: {
			canSave,
			loading,
		},
	}), [canSave, exportGtfs, form, loading, setAgencyId, setPlanId]);

	//
	// E. Render components

	return (
		<GtfsExportModalContext.Provider value={contextValue}>
			{children}
		</GtfsExportModalContext.Provider>
	);

	//
};
