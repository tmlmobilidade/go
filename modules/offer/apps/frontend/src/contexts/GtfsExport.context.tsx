'use client';

import { GTFS_EXPORT_MODAL_ID } from '@/components/lines/export/GtfsExportModal';
import { useLinesListContext } from '@/components/lines/list/LinesList.context';
import { API_ROUTES, HttpException } from '@tmlmobilidade/consts';
import { type CreateFileExportDto, FileExport, FileExportType, type GtfsExportProperties, type LinesMode, type OperationalDate } from '@tmlmobilidade/types';
import { useForm } from '@tmlmobilidade/ui';
import { closeModal, type UseFormReturnType, useToast } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { createContext, type PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';

/* * */

export interface GtfsExportFormValues {
	agency_ids: string[]
	clip_end_date: null | OperationalDate
	clip_start_date: null | OperationalDate
	feed_end_date: null | OperationalDate
	feed_start_date: null | OperationalDate
	lines_exclude: string[]
	lines_include: string[]
	lines_mode: LinesMode
	numeric_calendar_codes: boolean
	stop_sequence_start: number
	stops_export_all: boolean
}

interface GtfsExportModalContextState {
	actions: {
		exportGtfs: () => void
		setAgencyIds: (value: string[]) => void
		setLinesMode: (value: LinesMode) => void
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

export const useGtfsExportModalContext = () => {
	const context = useContext(GtfsExportModalContext);
	if (!context) {
		throw new Error('useGtfsExportModalContext must be used within a GtfsExportModalContextProvider');
	}
	return context;
};

/* * */

const AGENCY_DEFAULT_VALUES: Record<string, { clip_end: OperationalDate, clip_start: OperationalDate, feed_end: OperationalDate, feed_start: OperationalDate, numeric_calendar_codes?: boolean }> = {
	41: { clip_end: '20261231' as OperationalDate, clip_start: '20260101' as OperationalDate, feed_end: '20261231' as OperationalDate, feed_start: '20260501' as OperationalDate },
	42: { clip_end: '20261231' as OperationalDate, clip_start: '20260101' as OperationalDate, feed_end: '20261231' as OperationalDate, feed_start: '20260501' as OperationalDate },
	43: { clip_end: '20260630' as OperationalDate, clip_start: '20250701' as OperationalDate, feed_end: '20260630' as OperationalDate, feed_start: '20260501' as OperationalDate },
	44: { clip_end: '20270430' as OperationalDate, clip_start: '20260501' as OperationalDate, feed_end: '20270430' as OperationalDate, feed_start: '20260501' as OperationalDate, numeric_calendar_codes: true },
};

export const GtfsExportModalContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables

	const linesListContext = useLinesListContext();
	const form = useForm<GtfsExportFormValues>({
		initialValues: {
			agency_ids: [],
			clip_end_date: null,
			clip_start_date: null,
			feed_end_date: null,
			feed_start_date: null,
			lines_exclude: [],
			lines_include: [],
			lines_mode: 'all',
			numeric_calendar_codes: false,
			stop_sequence_start: 1,
			stops_export_all: true,
		},
		mode: 'controlled',
	});

	const [loading, setLoading] = useState(false);

	const setAgencyIds = useCallback((value: string[]) => {
		if (value.length === 1) {
			const selectedAgency = linesListContext?.data.agencyOptions?.find(agency => agency.value === value[0]);
			const defaults = selectedAgency ? AGENCY_DEFAULT_VALUES[selectedAgency.value] : undefined;
			if (defaults) {
				form.setValues({
					agency_ids: value,
					clip_end_date: defaults.clip_end,
					clip_start_date: defaults.clip_start,
					feed_end_date: defaults.feed_end,
					feed_start_date: defaults.feed_start,
					numeric_calendar_codes: defaults?.numeric_calendar_codes || false,
				});
				return;
			}
		}
		form.setValues({
			agency_ids: value,
			clip_end_date: null,
			clip_start_date: null,
			feed_end_date: null,
			feed_start_date: null,
		});
	}, [linesListContext?.data.agencyOptions, form]);

	const setLinesMode = useCallback((value: LinesMode) => {
		form.setValues({
			lines_mode: value,
			...(value !== 'exclude' ? { lines_exclude: [] } : {}),
			...(value !== 'include' ? { lines_include: [] } : {}),
		});
	}, [form]);

	//
	// B. Derived state

	const { agency_ids, clip_end_date, clip_start_date, feed_end_date, feed_start_date } = form.values;
	const canSave = agency_ids.length > 0 && !!clip_start_date && !!clip_end_date && !!feed_start_date && !!feed_end_date;

	//
	// C. Handle actions

	const createExport = useCallback(async <T extends { properties: Record<string, unknown>, type: FileExportType }>(dto: CreateFileExportDto<T>): Promise<FileExport> => {
		const response = await fetchData<FileExport>(API_ROUTES.offer.GTFS_CREATE_EXPORT, 'POST', dto);

		if (response.error || !response.data) {
			throw new HttpException(response.statusCode, response.error ?? 'Failed to create file export');
		}

		return response.data;
	}, []);

	const exportGtfs = useCallback(async () => {
		const values = form.getValues();
		if (!values.clip_start_date || !values.clip_end_date || !values.feed_start_date || !values.feed_end_date) return;

		const fileName = `gtfs_export_${values.agency_ids.join('_')}_${values.clip_start_date}_${values.clip_end_date}.zip`;
		const createFileExportDto: CreateFileExportDto<GtfsExportProperties> = {
			created_by: 'will-be-set-by-api',
			file_id: null,
			file_name: fileName,
			processing_status: 'waiting',
			properties: {
				agency_ids: values.agency_ids,
				calendars_clip_end_date: values.clip_end_date,
				calendars_clip_start_date: values.clip_start_date,
				feed_end_date: values.feed_end_date,
				feed_start_date: values.feed_start_date,
				lines_exclude: values.lines_exclude,
				lines_include: values.lines_include,
				lines_mode: values.lines_mode,
				numeric_calendar_codes: values.numeric_calendar_codes,
				stop_sequence_start: values.stop_sequence_start,
				stops_export_all: values.stops_export_all,
			},
			type: 'gtfs',
		};

		try {
			setLoading(true);
			const fileExport = await createExport(createFileExportDto);
			if (!fileExport) return;
			useToast.success({ message: 'A exportação GTFS foi iniciada', title: 'Sucesso' });
			closeModal(GTFS_EXPORT_MODAL_ID);
		} catch (error) {
			useToast.error({ message: error instanceof Error ? error.message : 'Erro ao iniciar a exportação GTFS', title: 'Erro' });
		} finally {
			setLoading(false);
		}
	}, [form, createExport]);

	//
	// D. Define context value

	const contextValue: GtfsExportModalContextState = useMemo(() => ({
		actions: {
			exportGtfs,
			setAgencyIds,
			setLinesMode,
		},
		data: {
			form,
		},
		flags: {
			canSave,
			loading,
		},
	}), [exportGtfs, setAgencyIds, setLinesMode, canSave, loading, form]);

	//
	// E. Render components

	return (
		<GtfsExportModalContext.Provider value={contextValue}>
			{children}
		</GtfsExportModalContext.Provider>
	);

	//
};
