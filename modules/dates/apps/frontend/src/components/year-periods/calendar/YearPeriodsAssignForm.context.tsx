'use client';

import { closeYearPeriodsAssignModal } from '@/components/year-periods/calendar/YearPeriodsAssign.modal';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type CalendarKey, convertKeysToOperationalDates, convertRangeToKeysArray, datesFromCalendarKey } from '@tmlmobilidade/dates';
import { type CreateYearPeriodDto, type UpdateYearPeriodDto, type YearPeriod } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { fetchApiData, type StandardFormContextValue, useHandleAction, useMeData, useStandardForm, useStandardFormCapabilities, useStandardFormWatch } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { useYearPeriodsRawData } from '../shared/use-year-periods-raw-data';
import { useYearPeriodsAssignConflictsData, type YearPeriodsAssignConflict } from './use-year-periods-assign-conflicts-data';

/* * */

export interface YearPeriodsAssignDateRange {
	end: CalendarKey
	start: CalendarKey
}

export interface YearPeriodsAssignFormValues {
	agency_ids: string[]
	assignmentMode: 'create' | 'existing'
	color?: string
	newPeriodName: string
	yearPeriodId: string
}

export interface YearPeriodsAssignFormContextValue extends StandardFormContextValue<YearPeriodsAssignFormValues> {
	acknowledgeConflicts: () => void
	conflicts: YearPeriodsAssignConflict[]
	conflictWarning: null | string
	dateRangeInfo: {
		dayCount: number
		endDate: string
		startDate: string
	}
	isCheckingConflicts: boolean
	isConflictAcknowledged: boolean
	isSubmitReady: boolean
	values: YearPeriodsAssignFormValues
}

interface YearPeriodsAssignFormContextProviderProps {
	dateRange: YearPeriodsAssignDateRange
}

/* * */

const YearPeriodsAssignFormContext = createContext<undefined | YearPeriodsAssignFormContextValue>(undefined);

export function useYearPeriodsAssignFormContext() {
	const context = useContext(YearPeriodsAssignFormContext);
	if (!context) throw new Error('useYearPeriodsAssignFormContext must be used within a YearPeriodsAssignFormContextProvider');
	return context;
}

/* * */

export function YearPeriodsAssignFormContextProvider({ children, dateRange }: PropsWithChildren<YearPeriodsAssignFormContextProviderProps>) {
	//

	//
	// A. Setup variables

	const [isConflictAcknowledged, setIsConflictAcknowledged] = useState(false);

	const { data: meData } = useMeData();

	const { mutate: yearPeriodsMutate } = useYearPeriodsRawData();

	const dates = useMemo(() => convertKeysToOperationalDates(convertRangeToKeysArray(dateRange.start, dateRange.end)), [dateRange.end, dateRange.start]);

	//
	// B. Setup form

	const { form, isDirty, isValid, unblock } = useStandardForm<YearPeriodsAssignFormValues, never>({
		defaultValues: {
			agency_ids: [],
			assignmentMode: 'existing',
			color: '',
			newPeriodName: '',
			yearPeriodId: '',
		},
	});

	const values = useStandardFormWatch({ control: form.control }) as YearPeriodsAssignFormValues;

	//
	// C. Fetch data

	const { data: conflicts, isLoading: isCheckingConflicts } = useYearPeriodsAssignConflictsData({
		agencyIds: values.agency_ids ?? [],
		assignmentMode: values.assignmentMode,
		dates,
		yearPeriodId: values.yearPeriodId,
	});

	// The acknowledgement only applies to the conflicts of the current selection
	useEffect(() => {
		setIsConflictAcknowledged(false);
	}, [values.agency_ids, values.assignmentMode, values.yearPeriodId, dates]);

	//
	// D. Handle actions

	const { action: handleCreateAndAssign, isLoading: isCreatingYearPeriod } = useHandleAction({
		fetchFn: async () => await fetchApiData<YearPeriod, CreateYearPeriodDto>({
			body: {
				agency_ids: form.getValues('agency_ids'),
				color: form.getValues('color'),
				created_by: meData?._id ?? '',
				dates,
				is_locked: false,
				name: form.getValues('newPeriodName') || '',
			},
			method: 'POST',
			url: API_ROUTES.dates.YEAR_PERIODS_LIST,
		}),
		labels: {
			error_title: 'Erro',
			success_message: `Período "${values.newPeriodName}" criado e atribuído com sucesso`,
			success_title: 'Sucesso',
		},
		onSuccess: () => {
			unblock();
			yearPeriodsMutate();
			closeYearPeriodsAssignModal();
		},
	});

	const { action: handleAssignExisting, isLoading: isAssigningYearPeriod } = useHandleAction({
		fetchFn: async () => await fetchApiData<YearPeriod, UpdateYearPeriodDto>({
			body: { dates },
			method: 'PUT',
			url: API_ROUTES.dates.YEAR_PERIODS_DETAIL(form.getValues('yearPeriodId')),
		}),
		labels: {
			error_title: 'Erro',
			success_message: 'Período atribuído com sucesso',
			success_title: 'Sucesso',
		},
		onSuccess: () => {
			unblock();
			yearPeriodsMutate();
			closeYearPeriodsAssignModal();
		},
	});

	const handleCreate = useCallback(async () => {
		if (form.getValues('assignmentMode') === 'create') await handleCreateAndAssign();
		else await handleAssignExisting();
	}, [form, handleAssignExisting, handleCreateAndAssign]);

	const acknowledgeConflicts = useCallback(() => {
		setIsConflictAcknowledged(true);
	}, []);

	//
	// E. Transform data

	const conflictWarning = useMemo(() => {
		if (conflicts.length === 0) return null;
		const totalConflictingDates = conflicts.reduce((sum, conflict) => sum + conflict.dates.length, 0);
		const yearPeriodNames = conflicts.map(conflict => conflict.yearPeriod.name).join(', ');
		return `${totalConflictingDates} ${totalConflictingDates === 1 ? 'dia' : 'dias'} ${totalConflictingDates === 1 ? 'será removido' : 'serão removidos'} ${conflicts.length === 1 ? 'do período' : 'dos períodos'}: ${yearPeriodNames}`;
	}, [conflicts]);

	const dateRangeInfo = useMemo(() => {
		const startDate = datesFromCalendarKey(dateRange.start);
		const endDate = datesFromCalendarKey(dateRange.end);
		const diffMs = endDate.unix_milliseconds - startDate.unix_milliseconds;
		return {
			dayCount: Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1,
			endDate: endDate.toFormat('d \'de\' MMMM \'de\' yyyy'),
			startDate: startDate.toFormat('d \'de\' MMMM \'de\' yyyy'),
		};
	}, [dateRange.end, dateRange.start]);

	//
	// F. Setup flags

	const hasCreatePermission = useMemo(() => {
		const requiredAction = values.assignmentMode === 'create' ? PermissionCatalog.all.year_periods.actions.create : PermissionCatalog.all.year_periods.actions.update;
		return PermissionCatalog.hasPermission(meData?.permissions ?? [], PermissionCatalog.all.year_periods.scope, requiredAction);
	}, [meData?.permissions, values.assignmentMode]);

	const isSubmitReady = useMemo(() => {
		if (!values.agency_ids?.length) return false;
		if (values.assignmentMode === 'existing' && !values.yearPeriodId) return false;
		if (values.assignmentMode === 'create' && (!values.newPeriodName?.trim() || !values.color)) return false;
		if (isCheckingConflicts) return false;
		if (conflicts.length > 0 && !isConflictAcknowledged) return false;
		return true;
	}, [conflicts.length, isCheckingConflicts, isConflictAcknowledged, values.agency_ids, values.assignmentMode, values.color, values.newPeriodName, values.yearPeriodId]);

	const { createEnabled, editEnabled } = useStandardFormCapabilities({
		create: {
			hasPermission: hasCreatePermission,
			isCreating: isCreatingYearPeriod || isAssigningYearPeriod,
		},
		form: {
			isDirty,
			isValid,
		},
	});

	//
	// G. Return state

	const stateValue: YearPeriodsAssignFormContextValue = useMemo(() => ({
		acknowledgeConflicts,
		actions: {
			create: handleCreate,
		},
		capabilities: {
			createEnabled,
			editEnabled,
		},
		conflicts,
		conflictWarning,
		dateRangeInfo,
		form,
		isCheckingConflicts,
		isConflictAcknowledged,
		isDirty,
		isSubmitReady,
		isValid,
		status: {
			isCreating: isCreatingYearPeriod || isAssigningYearPeriod,
		},
		unblock,
		values,
	}), [acknowledgeConflicts, conflictWarning, conflicts, createEnabled, dateRangeInfo, editEnabled, form, handleCreate, isAssigningYearPeriod, isCheckingConflicts, isConflictAcknowledged, isCreatingYearPeriod, isDirty, isSubmitReady, isValid, unblock, values]);

	return (
		<YearPeriodsAssignFormContext.Provider value={stateValue}>
			{children}
		</YearPeriodsAssignFormContext.Provider>
	);
}
