'use client';

/* * */

import { closeAsignPeriodModal } from '@/components/year-periods/calendar/PeriodAssign.modal';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { CalendarKey, convertKeysToOperationalDates, convertRangeToKeysArray, datesFromCalendarKey } from '@tmlmobilidade/dates';
import { type CreateYearPeriodDto, type OperationalDate, type YearPeriod } from '@tmlmobilidade/types';
import { useForm, type UseFormReturnType, useMeContext, useToast } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { mutate } from 'swr';

/* * */

interface PeriodAssignmentForm {
	agency_ids: string[]
	assignmentMode: 'create' | 'existing'
	color?: string
	newPeriodName: string
	yearPeriodId: string
}

/* * */

interface AssignPeriodData {
	agency_ids: string[]
	color?: string
	dateRange: {
		end: CalendarKey
		start: CalendarKey
	}
	mode: 'create' | 'existing'
	newPeriodName?: string
	yearPeriodId?: string
}

/* * */

interface PeriodAssignContextState {
	actions: {
		acknowledgeConflicts: () => void
		assignExistingPeriod: (data: AssignPeriodData) => Promise<void>
		checkConflicts: (params: { agency_ids: string[], assignmentMode: 'create' | 'existing', dateRange: { end: CalendarKey, start: CalendarKey }, yearPeriodId?: string }) => Promise<void>
		createAndAssignPeriod: (data: AssignPeriodData) => Promise<void>
		handleAssign: () => Promise<void>
	}
	data: {
		conflicts: { dates: OperationalDate[], yearPeriod: YearPeriod }[]
		conflictWarning: null | string
		dateRangeInfo: { dayCount: number, endDate: string, startDate: string }
		form: UseFormReturnType<PeriodAssignmentForm>
	}
	flags: {
		canSubmit: boolean
		checkingConflicts: boolean
		conflictAcknowledged: boolean
		isSaving: boolean
	}
}

/* * */

const PeriodAssignContext = createContext<PeriodAssignContextState | undefined>(undefined);

export function usePeriodAssignContext() {
	const context = useContext(PeriodAssignContext);
	if (!context) {
		throw new Error('usePeriodsAssignContext must be used within a PeriodAssignContextProvider');
	}
	return context;
}

/* * */

export const PeriodAssignContextProvider = ({ children, dateRange }: PropsWithChildren<{ dateRange: { end: CalendarKey, start: CalendarKey } }>) => {
	//

	//
	// A. Setup variables

	const meContext = useMeContext();

	const [isSaving, setIsSaving] = useState(false);
	const [conflicts, setConflicts] = useState<{ dates: OperationalDate[], yearPeriod: YearPeriod }[]>([]);
	const [conflictAcknowledged, setConflictAcknowledged] = useState(false);
	const [checkingConflicts, setCheckingConflicts] = useState(false);

	// Form state
	const form = useForm<PeriodAssignmentForm>({
		initialValues: {
			agency_ids: [],
			assignmentMode: 'existing',
			color: '',
			newPeriodName: '',
			yearPeriodId: '',
		},
		validateInputOnBlur: true,
		validateInputOnChange: true,
	});

	//
	// B. Check for conflicts function

	const checkConflicts = useCallback(async (params: {
		agency_ids: string[]
		assignmentMode: 'create' | 'existing'
		dateRange: { end: CalendarKey, start: CalendarKey }
		yearPeriodId?: string
	}) => {
		// Reset conflicts and acknowledgment when checking
		setConflicts([]);
		setConflictAcknowledged(false);

		// Only check conflicts when we have agencies and either period or new period name
		if (!params.agency_ids || params.agency_ids.length === 0) return;
		if (params.assignmentMode === 'existing' && !params.yearPeriodId) return;

		setCheckingConflicts(true);
		try {
			const keys = convertRangeToKeysArray(params.dateRange.start, params.dateRange.end);
			const dates = convertKeysToOperationalDates(keys);

			const response = await fetchData<{ conflicts: { dates: OperationalDate[], year_period: YearPeriod }[] }>(
				API_ROUTES.dates.YEAR_PERIODS_CHECK_CONFLICTS,
				'POST',
				{
					agency_ids: params.agency_ids,
					dates,
					period_id: params.assignmentMode === 'existing' && params.yearPeriodId ? params.yearPeriodId : undefined,
				},
			);

			if (response?.data?.conflicts) {
				setConflicts(response.data.conflicts.map(conflict => ({
					dates: conflict.dates,
					yearPeriod: conflict.year_period,
				})));
				return;
			}

			setConflicts([]);
		} catch (error) {
			console.error('Error checking conflicts:', error);
			setConflicts([]);
		} finally {
			setCheckingConflicts(false);
		}
	}, []);

	//
	// C. Check for conflicts automatically when form values change

	useEffect(() => {
		void checkConflicts({
			agency_ids: form.values.agency_ids,
			assignmentMode: form.values.assignmentMode,
			dateRange,
			yearPeriodId: form.values.yearPeriodId,
		});
	}, [form.values.agency_ids, form.values.assignmentMode, form.values.yearPeriodId, dateRange, checkConflicts]);

	//
	// D. Acknowledge conflicts

	const acknowledgeConflicts = useCallback(() => {
		setConflictAcknowledged(true);
	}, []);

	//
	// E. Create new period and assign to date range

	const createAndAssignPeriod = useCallback(async (data: AssignPeriodData) => {
		setIsSaving(true);

		const toastId = useToast.loading({
			message: 'Por favor aguarde...',
			title: 'A criar período',
		});

		try {
			// Convert the date range to an array of operational_date strings
			const datesArray = convertKeysToOperationalDates(convertRangeToKeysArray(data.dateRange.start, data.dateRange.end));

			const createPeriodPayload: CreateYearPeriodDto = {
				agency_ids: data.agency_ids,
				color: data.color,
				created_by: meContext.data.user._id,
				dates: datesArray,
				is_locked: false,
				name: data.newPeriodName || '',
			};

			const periodResponse = await fetchData<YearPeriod>(
				API_ROUTES.dates.YEAR_PERIODS_LIST,
				'POST',
				createPeriodPayload,
			);

			if (periodResponse.error || !periodResponse.data) {
				useToast.update(toastId, {
					loading: false,
					message: periodResponse.error || 'Erro ao criar período',
					title: 'Erro',
					type: 'error',
				});
				setIsSaving(false);
				return;
			}

			useToast.update(toastId, {
				loading: false,
				message: `Período "${periodResponse.data.name}" criado e atribuído com sucesso`,
				title: 'Sucesso',
				type: 'success',
			});

			// Refresh periods list
			void mutate(API_ROUTES.dates.YEAR_PERIODS_LIST);

			setIsSaving(false);

			// Close modal
			closeAsignPeriodModal();
		} catch (error) {
			console.error('Error creating and assigning period:', error);
			useToast.update(toastId, {
				loading: false,
				message: 'Ocorreu um erro inesperado',
				title: 'Erro',
				type: 'error',
			});
			setIsSaving(false);
		}
	}, [meContext.data.user._id]);

	//
	// F. Assign existing period to date range

	const assignExistingPeriod = useCallback(async (data: AssignPeriodData) => {
		setIsSaving(true);

		const toastId = useToast.loading({
			message: 'Por favor aguarde...',
			title: 'A atribuir período',
		});

		try {
			if (!data.yearPeriodId) {
				useToast.update(toastId, {
					loading: false,
					message: 'Nenhum período selecionado',
					title: 'Erro',
					type: 'error',
				});
				setIsSaving(false);
				return;
			}

			// Convert the date range to an array of operational_date strings
			const datesArray = convertKeysToOperationalDates(convertRangeToKeysArray(data.dateRange.start, data.dateRange.end));

			const assignResponse = await fetchData<YearPeriod>(
				API_ROUTES.dates.YEAR_PERIODS_DETAIL(data.yearPeriodId),
				'PUT',
				{ dates: datesArray },
			);

			if (assignResponse.error) {
				useToast.update(toastId, {
					loading: false,
					message: assignResponse.error || 'Erro ao atribuir período',
					title: 'Erro',
					type: 'error',
				});
				setIsSaving(false);
				return;
			}

			useToast.update(toastId, {
				loading: false,
				message: 'Período atribuído com sucesso',
				title: 'Sucesso',
				type: 'success',
			});

			// Refresh periods list
			void mutate(API_ROUTES.dates.YEAR_PERIODS_LIST);

			setIsSaving(false);

			// Close modal
			closeAsignPeriodModal();
		} catch (error) {
			console.error('Error assigning period:', error);
			useToast.update(toastId, {
				loading: false,
				message: 'Ocorreu um erro inesperado',
				title: 'Erro',
				type: 'error',
			});
			setIsSaving(false);
		}
	}, []);

	//
	// G. Compute conflict warning message

	const conflictWarning = useMemo(() => {
		if (conflicts.length === 0) return null;

		const totalConflictingDates = conflicts.reduce((sum, c) => sum + c.dates.length, 0);
		const periodNames = conflicts.map(c => c.yearPeriod.name).join(', ');

		return `${totalConflictingDates} ${totalConflictingDates === 1 ? 'dia' : 'dias'} ${totalConflictingDates === 1 ? 'será removido' : 'serão removidos'} ${conflicts.length === 1 ? 'do período' : 'dos períodos'}: ${periodNames}`;
	}, [conflicts]);

	//
	// H. Compute date range info

	const dateRangeInfo = useMemo(() => {
		const startD = datesFromCalendarKey(dateRange.start);
		const endD = datesFromCalendarKey(dateRange.end);

		const startDate = startD.toFormat('d \'de\' MMMM \'de\' yyyy');
		const endDate = endD.toFormat('d \'de\' MMMM \'de\' yyyy');

		const diffMs = endD.unix_timestamp - startD.unix_timestamp;
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;

		return {
			dayCount: diffDays,
			endDate,
			startDate,
		};
	}, [dateRange.start, dateRange.end]);

	//
	// I. Compute canSubmit

	const canSubmit = useMemo(() => {
		if (!form.values.agency_ids || form.values.agency_ids.length === 0) return false;
		if (form.values.assignmentMode === 'existing' && !form.values.yearPeriodId) return false;
		if (form.values.assignmentMode === 'create' && (!form.values.newPeriodName.trim() || !form.values.color)) return false;
		if (checkingConflicts) return false;
		if (conflicts.length > 0 && !conflictAcknowledged) return false;
		return true;
	}, [form.values.agency_ids, form.values.assignmentMode, form.values.newPeriodName, form.values.yearPeriodId, form.values.color, checkingConflicts, conflicts, conflictAcknowledged]);

	//
	// J. Handle assign - routes to appropriate action based on mode

	const handleAssign = useCallback(async () => {
		const assignmentData: AssignPeriodData = {
			agency_ids: form.values.agency_ids,
			color: form.values.assignmentMode === 'create' ? form.values.color : undefined,
			dateRange,
			mode: form.values.assignmentMode,
			newPeriodName: form.values.assignmentMode === 'create' ? form.values.newPeriodName : undefined,
			yearPeriodId: form.values.assignmentMode === 'existing' ? form.values.yearPeriodId : undefined,
		};

		if (form.values.assignmentMode === 'create') {
			await createAndAssignPeriod(assignmentData);
		} else {
			await assignExistingPeriod(assignmentData);
		}
	}, [form.values.agency_ids, form.values.assignmentMode, form.values.color, form.values.newPeriodName, form.values.yearPeriodId, dateRange, createAndAssignPeriod, assignExistingPeriod]);

	//
	// K. Define context value

	const contextValue: PeriodAssignContextState = useMemo(() => ({
		actions: {
			acknowledgeConflicts,
			assignExistingPeriod,
			checkConflicts,
			createAndAssignPeriod,
			handleAssign,
		},
		data: {
			conflicts,
			conflictWarning,
			dateRangeInfo,
			form,
		},
		flags: {
			canSubmit,
			checkingConflicts,
			conflictAcknowledged,
			isSaving,
		},
	}), [isSaving, conflicts, conflictWarning, checkingConflicts, conflictAcknowledged, acknowledgeConflicts, assignExistingPeriod, checkConflicts, createAndAssignPeriod, handleAssign, dateRangeInfo, canSubmit, form]);

	//
	// K. Render components

	return (
		<PeriodAssignContext.Provider value={contextValue}>
			{children}
		</PeriodAssignContext.Provider>
	);

	//
};
