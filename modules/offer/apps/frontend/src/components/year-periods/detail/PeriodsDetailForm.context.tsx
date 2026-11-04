'use client';

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type UpdateYearPeriodDto, UpdateYearPeriodSchema, type YearPeriod } from '@tmlmobilidade/go-types-offer';
import { fetchApiData, keepUrlParams, type StandardFormContextValue, useHandleAction, useMeData, useStandardForm, useStandardFormCapabilities, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useCallback, useContext, useMemo } from 'react';

import { getPeriodsPermissions } from '../shared/periods-permissions';
import { usePeriodsAssignmentReview, type UsePeriodsAssignmentReviewReturnType } from '../shared/use-periods-assignment-review';
import { usePeriodsData } from '../shared/use-periods-data';
import { usePeriodsDetailData } from './use-periods-detail-data';
import { usePeriodsDetailYearPeriodId } from './use-periods-detail-year-period-id';

/* * */

interface PeriodsDetailFormContextValue extends StandardFormContextValue<UpdateYearPeriodDto> {
	assignmentReview: UsePeriodsAssignmentReviewReturnType
}

/* * */

const PeriodsDetailFormContext = createContext<PeriodsDetailFormContextValue | undefined>(undefined);

/* * */

export function usePeriodsDetailFormContext() {
	const context = useContext(PeriodsDetailFormContext);
	if (!context) throw new Error('usePeriodsDetailFormContext must be used within PeriodsDetailFormContextProvider');
	return context;
}

/* * */

export function PeriodsDetailFormContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const { data: me, error: meError, isLoading: meLoading } = useMeData();

	const { mutate: listMutate } = usePeriodsData();
	const { yearPeriodId } = usePeriodsDetailYearPeriodId();
	const { data: period, error, isLoading, mutate: detailMutate } = usePeriodsDetailData();

	//
	// B. Setup form

	const { form, isDirty, unblock } = useStandardForm<UpdateYearPeriodDto, typeof UpdateYearPeriodSchema>({
		apiData: period,
		schema: UpdateYearPeriodSchema,
	});
	const values = useStandardFormWatch({ control: form.control });
	// Check current values: the shared form hook only counts recorded errors.
	const isValid = UpdateYearPeriodSchema.safeParse(values).success;

	//
	// C. Handle actions

	// Date assignment is a separate workflow; metadata saves must not reassign dates.
	const { action: handleUpdateRequest, isLoading: isUpdating } = useHandleAction({
		fetchFn: async (data: UpdateYearPeriodDto) => await fetchApiData<YearPeriod>({ body: UpdateYearPeriodSchema.omit({ dates: true }).parse(data), method: 'PUT', url: API_ROUTES.offer.YEAR_PERIODS_DETAIL(yearPeriodId) }),
		onSuccess: (response) => {
			form.reset(response.data);
			detailMutate(response, { revalidate: false });
			listMutate();
		},
	});
	const { action: handleLockRequest, isLoading: isLocking } = useHandleAction({
		fetchFn: async () => await fetchApiData<YearPeriod>({ url: API_ROUTES.offer.YEAR_PERIODS_DETAIL_LOCK(yearPeriodId) }),
		onSuccess: (response) => {
			form.reset(response.data);
			detailMutate(response, { revalidate: false });
			listMutate();
		},
	});
	const { action: handleDeleteRequest, isLoading: isDeleting } = useHandleAction({
		fetchFn: async () => await fetchApiData<undefined>({ method: 'DELETE', url: API_ROUTES.offer.YEAR_PERIODS_DETAIL(yearPeriodId) }),
		onSuccess: () => {
			form.reset();
			unblock();
			listMutate();
			router.push(keepUrlParams(PAGE_ROUTES.offer.YEAR_PERIODS_LIST));
		},
	});

	//
	// D. Setup permissions

	const permissions = getPeriodsPermissions({
		currentAgencyIds: period?.agency_ids ?? [],
		selectedAgencyIds: values.agency_ids ?? [],
		userPermissions: me?.permissions,
	});

	const agenciesChanged = !!period && (period.agency_ids.length !== values.agency_ids?.length || !period.agency_ids.every(id => values.agency_ids?.includes(id)));
	const needsReview = agenciesChanged && !!period?.dates?.length;
	const reviewRequest = useMemo(() => needsReview && permissions.update ? {
		agency_ids: [...(values.agency_ids ?? [])].sort(),
		dates: period?.dates ?? [],
		year_period_id: yearPeriodId,
	} : null, [needsReview, permissions.update, values.agency_ids, period?.dates, yearPeriodId]);
	const assignmentReview = usePeriodsAssignmentReview({ request: reviewRequest, userPermissions: me?.permissions });

	//
	// E. Setup capabilities and handlers

	const busy = isUpdating || isLocking || isDeleting;
	const loading = isLoading || meLoading || !period || !!error || !!meError;

	const standardCapabilities = useStandardFormCapabilities({
		delete: {
			hasPermission: permissions.delete,
			isDeleting,
		},
		form: {
			isDirty,
			isValid,
		},
		loading: {
			isLoading: loading,
		},
		locked: {
			hasPermission: permissions.lock,
			isLocked: period?.is_locked,
			isLocking,
		},
		update: {
			hasPermission: permissions.update,
			isUpdating,
		},
	});

	const deleteEnabled = standardCapabilities.deleteEnabled && !busy;
	const editEnabled = standardCapabilities.editEnabled && permissions.edit && !loading;
	const lockEnabled = standardCapabilities.lockEnabled && !busy;
	const updateEnabled = standardCapabilities.updateEnabled && !busy && (!needsReview || assignmentReview.isReady);

	const handleDelete = useCallback(() => {
		if (!deleteEnabled) return;
		void handleDeleteRequest();
	}, [deleteEnabled, handleDeleteRequest]);

	const handleLock = useCallback(() => {
		if (!lockEnabled) return;
		void handleLockRequest();
	}, [lockEnabled, handleLockRequest]);

	const handleUpdate = useCallback(async () => {
		if (!updateEnabled) return;
		await form.handleSubmit(handleUpdateRequest)();
	}, [updateEnabled, form, handleUpdateRequest]);

	//
	// F. Return context value

	const stateValue: PeriodsDetailFormContextValue = useMemo(() => ({
		actions: {
			delete: handleDelete,
			lock: handleLock,
			update: handleUpdate,
		},
		assignmentReview,
		capabilities: {
			deleteEnabled,
			editEnabled,
			lockEnabled,
			updateEnabled,
		},
		form,
		isDirty,
		isValid,
		status: {
			isDeleting,
			isLoading,
			isLocked: period?.is_locked,
			isLocking,
			isUpdating,
		},
		unblock,
	}), [assignmentReview, handleDelete, handleLock, handleUpdate, deleteEnabled, editEnabled, lockEnabled, updateEnabled, form, isDirty, isValid, isDeleting, isLoading, period?.is_locked, isLocking, isUpdating, unblock]);

	return (
		<PeriodsDetailFormContext.Provider value={stateValue}>
			{children}
		</PeriodsDetailFormContext.Provider>
	);
}
