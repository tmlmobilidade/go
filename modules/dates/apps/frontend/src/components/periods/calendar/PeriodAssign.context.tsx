'use client';

/* * */

import { closeAsignPeriodModal } from '@/components/periods/calendar/PeriodAssign.modal';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { convertRangeToDatesArray, Dates } from '@tmlmobilidade/dates';
import { type CreatePeriodDto, type OperationalDate, type Period } from '@tmlmobilidade/types';
import { useForm, type UseFormReturnType, useMeContext, useToast } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { mutate } from 'swr';

/* * */

interface PeriodAssignmentForm {
	agency_id: string
	assignmentMode: 'create' | 'existing'
	color?: string
	newPeriodName: string
	periodId: string
}

/* * */

interface AssignPeriodData {
	agency_id: string
	color?: string
	dateRange: {
		end: Dates
		start: Dates
	}
	mode: 'create' | 'existing'
	newPeriodName?: string
	periodId?: string
}

/* * */

interface PeriodAssignContextState {
	actions: {
		acknowledgeConflicts: () => void
		assignExistingPeriod: (data: AssignPeriodData) => Promise<void>
		checkConflicts: (params: { agency_id: string, assignmentMode: 'create' | 'existing', dateRange: { end: Dates, start: Dates }, periodId?: string }) => Promise<void>
		createAndAssignPeriod: (data: AssignPeriodData) => Promise<void>
		handleAssign: () => Promise<void>
	}
	data: {
		conflicts: { dates: OperationalDate[], period: Period }[]
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

export const PeriodAssignContextProvider = ({ children, dateRange }: PropsWithChildren<{ dateRange: { end: Dates, start: Dates } }>) => {
	//

	//
	// A. Setup variables

	const meContext = useMeContext();

	const [isSaving, setIsSaving] = useState(false);
	const [conflicts, setConflicts] = useState<{ dates: OperationalDate[], period: Period }[]>([]);
	const [conflictAcknowledged, setConflictAcknowledged] = useState(false);
	const [checkingConflicts, setCheckingConflicts] = useState(false);

	// Form state
	const form = useForm<PeriodAssignmentForm>({
		initialValues: {
			agency_id: '',
			assignmentMode: 'existing',
			color: '',
			newPeriodName: '',
			periodId: '',
		},
		validateInputOnBlur: true,
		validateInputOnChange: true,
	});

	//
	// B. Check for conflicts automatically when form values change

	useEffect(() => {
		checkConflicts({
			agency_id: form.values.agency_id,
			assignmentMode: form.values.assignmentMode,
			dateRange,
			periodId: form.values.periodId,
		});
	}, [form.values.agency_id, form.values.assignmentMode, form.values.periodId, dateRange.start.operational_date, dateRange.end.operational_date]);

	//
	// C. Check for conflicts function

	const checkConflicts = useCallback(async (params: {
		agency_id: string
		assignmentMode: 'create' | 'existing'
		dateRange: { end: Dates, start: Dates }
		periodId?: string
	}) => {
		// Reset conflicts and acknowledgment when checking
		setConflicts([]);
		setConflictAcknowledged(false);

		// Only check conflicts when we have agency and either period or new period name
		if (!params.agency_id) return;
		if (params.assignmentMode === 'existing' && !params.periodId) return;

		setCheckingConflicts(true);
		try {
			const dates = convertRangeToDatesArray(params.dateRange.start, params.dateRange.end);
			const response = await fetchData<{ conflicts: { dates: OperationalDate[], period: Period }[] }>(
				API_ROUTES.dates.PERIODS_CHECK_CONFLICTS,
				'POST',
				{
					agency_id: params.agency_id,
					dates,
					period_id: params.assignmentMode === 'existing' && params.periodId ? params.periodId : undefined,
				},
			);

			if (response?.data?.conflicts) {
				setConflicts(response.data.conflicts);
			}
		}
		catch (error) {
			console.error('Error checking conflicts:', error);
			setConflicts([]);
		}
		finally {
			setCheckingConflicts(false);
		}
	}, []);

	//
	// D. Acknowledge conflicts

	const acknowledgeConflicts = useCallback(() => {
		setConflictAcknowledged(true);
	}, []);

	//
	// E. Create new period and assign to date range

	const createAndAssignPeriod = async (data: AssignPeriodData) => {
		setIsSaving(true);

		const toastId = useToast.loading({
			message: 'Por favor aguarde...',
			title: 'A criar período',
		});

		try {
			// Convert the date range to an array of operational_date strings
			const datesArray = convertRangeToDatesArray(data.dateRange.start, data.dateRange.end);

			const createPeriodPayload: CreatePeriodDto = {
				agency_id: data.agency_id,
				color: data.color,
				created_by: meContext.data.user._id,
				dates: datesArray,
				is_locked: false,
				name: data.newPeriodName || '',
			};

			const periodResponse = await fetchData<Period>(
				API_ROUTES.dates.PERIODS_LIST,
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
			mutate(API_ROUTES.dates.PERIODS_LIST);

			setIsSaving(false);

			// Close modal
			closeAsignPeriodModal();
		}
		catch (error) {
			console.error('Error creating and assigning period:', error);
			useToast.update(toastId, {
				loading: false,
				message: 'Ocorreu um erro inesperado',
				title: 'Erro',
				type: 'error',
			});
			setIsSaving(false);
		}
	};

	//
	// F. Assign existing period to date range

	const assignExistingPeriod = async (data: AssignPeriodData) => {
		setIsSaving(true);

		const toastId = useToast.loading({
			message: 'Por favor aguarde...',
			title: 'A atribuir período',
		});

		try {
			if (!data.periodId) {
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
			const datesArray = convertRangeToDatesArray(data.dateRange.start, data.dateRange.end);

			const assignResponse = await fetchData<Period>(
				API_ROUTES.dates.PERIODS_DETAIL(data.periodId),
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
			mutate(API_ROUTES.dates.PERIODS_LIST);

			setIsSaving(false);

			// Close modal
			closeAsignPeriodModal();
		}
		catch (error) {
			console.error('Error assigning period:', error);
			useToast.update(toastId, {
				loading: false,
				message: 'Ocorreu um erro inesperado',
				title: 'Erro',
				type: 'error',
			});
			setIsSaving(false);
		}
	};

	//
	// G. Compute conflict warning message

	const conflictWarning = useMemo(() => {
		if (conflicts.length === 0) return null;

		const totalConflictingDates = conflicts.reduce((sum, c) => sum + c.dates.length, 0);
		const periodNames = conflicts.map(c => c.period.name).join(', ');

		return `${totalConflictingDates} ${totalConflictingDates === 1 ? 'dia' : 'dias'} ${totalConflictingDates === 1 ? 'será removido' : 'serão removidos'} ${conflicts.length === 1 ? 'do período' : 'dos períodos'}: ${periodNames}`;
	}, [conflicts]);

	//
	// H. Compute date range info

	const dateRangeInfo = useMemo(() => {
		const startDate = dateRange.start.toFormat('d \'de\' MMMM \'de\' yyyy');
		const endDate = dateRange.end.toFormat('d \'de\' MMMM \'de\' yyyy');
		const diffMs = dateRange.end.unix_timestamp - dateRange.start.unix_timestamp;
		const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24)) + 1;

		return {
			dayCount: diffDays,
			endDate,
			startDate,
		};
	}, [dateRange]);

	//
	// I. Compute canSubmit

	const canSubmit = useMemo(() => {
		if (!form.values.agency_id) return false;
		if (form.values.assignmentMode === 'existing' && !form.values.periodId) return false;
		if (form.values.assignmentMode === 'create' && !form.values.newPeriodName.trim() && !form.values.color) return false;
		if (checkingConflicts) return false;
		if (conflicts.length > 0 && !conflictAcknowledged) return false;
		return true;
	}, [form.values.agency_id, form.values.assignmentMode, form.values.newPeriodName, form.values.periodId, form.values.color, checkingConflicts, conflicts, conflictAcknowledged]);

	//
	// J. Handle assign - routes to appropriate action based on mode

	const handleAssign = useCallback(async () => {
		const assignmentData: AssignPeriodData = {
			agency_id: form.values.agency_id,
			color: form.values.assignmentMode === 'create' ? form.values.color : undefined,
			dateRange,
			mode: form.values.assignmentMode,
			newPeriodName: form.values.assignmentMode === 'create' ? form.values.newPeriodName : undefined,
			periodId: form.values.assignmentMode === 'existing' ? form.values.periodId : undefined,
		};

		if (form.values.assignmentMode === 'create') {
			await createAndAssignPeriod(assignmentData);
		}
		else {
			await assignExistingPeriod(assignmentData);
		}
	}, [form.values.agency_id, form.values.assignmentMode, form.values.color, form.values.newPeriodName, form.values.periodId, dateRange, createAndAssignPeriod, assignExistingPeriod]);

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
