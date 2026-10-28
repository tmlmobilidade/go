'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type CalendarKey, convertKeysToOperationalDates, convertRangeToKeysArray, datesFromCalendarKey, mergeDateArrays } from '@tmlmobilidade/dates';
import { type PeriodsAssignmentForm, PeriodsAssignmentFormSchema } from '@tmlmobilidade/go-offer-pckg-types';
import { CreateYearPeriodSchema, UpdateYearPeriodSchema, type YearPeriod } from '@tmlmobilidade/go-types-offer';
import { fetchApiData, type StandardFormContextValue, useHandleAction, useMeData, useStandardForm, useStandardFormWatch } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useCallback, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { mutate } from 'swr';

import { getAssignablePeriods } from '../shared/periods-assignment';
import { getPeriodsPermissions } from '../shared/periods-permissions';
import { usePeriodsAssignmentReview, type UsePeriodsAssignmentReviewReturnType } from '../shared/use-periods-assignment-review';
import { usePeriodsData } from '../shared/use-periods-data';
import { closeAsignPeriodModal } from './PeriodAssign.modal';

/* * */

interface PeriodAssignContextState extends StandardFormContextValue<PeriodsAssignmentForm> {
	assignmentReview: UsePeriodsAssignmentReviewReturnType
	availablePeriods: YearPeriod[]
	conflictError: null | string
	dateRangeInfo: { dayCount: number, endDate: string, startDate: string }
	values: PeriodsAssignmentForm
}

/* * */

const PeriodAssignContext = createContext<PeriodAssignContextState | undefined>(undefined);

export function usePeriodAssignContext() {
	const context = useContext(PeriodAssignContext);
	if (!context) throw new Error('usePeriodAssignContext must be used within PeriodAssignContextProvider');
	return context;
}

/* * */

export function PeriodAssignContextProvider({ children, dateRange }: PropsWithChildren<{ dateRange: { end: CalendarKey, start: CalendarKey } }>) {
	//

	//
	// A. Setup form and data

	const { i18n } = useTranslation();
	const { data: me, error: meError, isLoading: meLoading } = useMeData();
	const { data: periods, error: periodsError, isLoading: periodsLoading, mutate: listMutate } = usePeriodsData();
	const { form, isDirty, unblock } = useStandardForm<PeriodsAssignmentForm, typeof PeriodsAssignmentFormSchema>({
		defaultValues: { agency_ids: [], assignmentMode: 'existing', color: '', newPeriodName: '', yearPeriodId: '' },
		schema: PeriodsAssignmentFormSchema,
	});
	useStandardFormWatch({ control: form.control });
	const values = form.getValues();
	const isValid = PeriodsAssignmentFormSchema.safeParse(values).success;
	const availablePeriods = getAssignablePeriods({ agencyIds: values.agency_ids, periods, userPermissions: me?.permissions });
	const selectedPeriod = availablePeriods.find(period => period._id === values.yearPeriodId);
	const permissions = getPeriodsPermissions({ selectedAgencyIds: values.agency_ids, userPermissions: me?.permissions });
	const hasPermission = values.assignmentMode === 'create' ? permissions.create : !!selectedPeriod;
	const dates = useMemo(() => convertKeysToOperationalDates(convertRangeToKeysArray(dateRange.start, dateRange.end)), [dateRange.start, dateRange.end]);

	//
	// B. Check conflicts for the current selection, failing closed on errors

	const request = useMemo(() => isValid && hasPermission ? {
		agency_ids: [...values.agency_ids].sort(),
		dates: selectedPeriod ? mergeDateArrays(selectedPeriod.dates ?? [], dates) : dates,
		year_period_id: values.assignmentMode === 'existing' ? values.yearPeriodId : undefined,
	} : null, [isValid, hasPermission, values.agency_ids, values.assignmentMode, values.yearPeriodId, dates, selectedPeriod]);
	const assignmentReview = usePeriodsAssignmentReview({ request, userPermissions: me?.permissions });
	const conflictError = periodsError ?? meError;

	//
	// C. Handle assignment through the validated domain contracts

	const { action: handleAssignRequest, isLoading: isAssigning } = useHandleAction({
		fetchFn: async (data: PeriodsAssignmentForm) => {
			if (data.assignmentMode === 'create') {
				const body = CreateYearPeriodSchema.parse({ agency_ids: data.agency_ids, color: data.color || undefined, dates, name: data.newPeriodName });
				return await fetchApiData<YearPeriod>({ body, method: 'POST', url: API_ROUTES.offer.YEAR_PERIODS_CREATE });
			}
			const body = UpdateYearPeriodSchema.parse({ dates });
			return await fetchApiData<YearPeriod>({ body, method: 'PUT', url: API_ROUTES.offer.YEAR_PERIODS_DETAIL(data.yearPeriodId) });
		},
		onSuccess: (response) => {
			form.reset();
			unblock();
			listMutate();
			if (response.data) void mutate(API_ROUTES.offer.YEAR_PERIODS_DETAIL(response.data._id));
			closeAsignPeriodModal();
		},
	});
	const conflictsReady = assignmentReview.isReady;
	const canSubmit = isValid && hasPermission && !meLoading && !periodsLoading && !conflictError && conflictsReady && !isAssigning;
	const handleAssign = useCallback(async () => {
		if (!canSubmit) return;
		await form.handleSubmit(handleAssignRequest)();
	}, [canSubmit, form, handleAssignRequest]);

	//
	// D. Return context value

	const dateRangeInfo = useMemo(() => ({
		dayCount: dates.length,
		endDate: datesFromCalendarKey(dateRange.end).js_date.toLocaleDateString(i18n.language, { dateStyle: 'long' }),
		startDate: datesFromCalendarKey(dateRange.start).js_date.toLocaleDateString(i18n.language, { dateStyle: 'long' }),
	}), [dates.length, dateRange.start, dateRange.end, i18n.language]);
	const stateValue: PeriodAssignContextState = useMemo(() => ({
		actions: {
			create: handleAssign,
			update: handleAssign,
		},
		assignmentReview,
		availablePeriods,
		capabilities: {
			createEnabled: canSubmit && values.assignmentMode === 'create',
			editEnabled: !isAssigning && !meLoading && !meError,
			updateEnabled: canSubmit && values.assignmentMode === 'existing',
		},
		conflictError,
		dateRangeInfo,
		form,
		isDirty,
		isValid,
		status: {
			isCreating: isAssigning && values.assignmentMode === 'create',
			isUpdating: isAssigning && values.assignmentMode === 'existing',
		},
		unblock,
		values,
	}), [assignmentReview, handleAssign, availablePeriods, canSubmit, values, isAssigning, meLoading, meError, conflictError, dateRangeInfo, form, isDirty, isValid, unblock]);

	return (
		<PeriodAssignContext.Provider value={stateValue}>
			{children}
		</PeriodAssignContext.Provider>
	);
}
