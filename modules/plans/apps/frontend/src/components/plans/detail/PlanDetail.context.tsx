'use client';

/* * */

import { validatePlanUpdateValues } from '@/utils/validate-plan-update-values';
import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { type File, type OperationalDate, PermissionCatalog, type Plan, type UpdatePlanDto, UpdatePlanSchema } from '@tmlmobilidade/types';
import { type DetailContextStateTemplate, keepUrlParams, useFlagCanDelete, useFlagCanLock, useFlagCanSave, useFlagReadOnly, type UseFormReturnType, useHandleUpdate, useMeContext, useTypicalForm } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, PropsWithChildren, useContext, useEffect, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface PlanDetailContextState extends DetailContextStateTemplate {
	actions: DetailContextStateTemplate['actions'] & {
		controllerReprocessPlan: () => void
	}
	data: {
		form: UseFormReturnType<UpdatePlanDto>
		id: string
		operation_file: File | null
		plan: null | Plan
	}
}

/* * */

const PlanDetailContext = createContext<PlanDetailContextState | undefined>(undefined);

export function usePlanDetailContext() {
	const context = useContext(PlanDetailContext);
	if (!context) {
		throw new Error('usePlanDetailContext must be used within a PlanDetailContextProvider');
	}
	return context;
}

/* * */

export const PlanDetailContextProvider = ({ children, planId }: PropsWithChildren<{ planId: string }>) => {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const meContext = useMeContext();

	//
	// B. Fetch data

	const { mutate: plansListMutate } = useSWR<Plan[]>(API_ROUTES.plans.PLANS_LIST);
	const { data: planData, error: planError, isLoading: planLoading, mutate: planMutate } = useSWR<Plan>(API_ROUTES.plans.PLANS_DETAIL(planId), { refreshInterval: 5000 });
	const { data: operationFileData, error: operationFileError, isLoading: operationFileLoading, mutate: operationFileMutate } = useSWR<File>(API_ROUTES.plans.PLANS_DETAIL_OPERATION_FILE(planId));

	//
	// C. Setup form

	const { form } = useTypicalForm<UpdatePlanDto>(UpdatePlanSchema, planData);

	//
	// D. Transform data

	useEffect(() => {
		if (!planData) return;
		form.initialize({
			...planData,
			gtfs_feed_info: {
				...planData.gtfs_feed_info,
				feed_end_date: Dates
					.fromOperationalDate(planData.gtfs_feed_info.feed_end_date, 'Europe/Lisbon')
					.toFormat('yyyy-MM-dd') as OperationalDate,
				feed_start_date: Dates
					.fromOperationalDate(planData.gtfs_feed_info.feed_start_date, 'Europe/Lisbon')
					.toFormat('yyyy-MM-dd') as OperationalDate,
			},
		});
	}, [planData]);

	//
	// E. Handle actions

	const { action: handleSave, isLoading: isSaving } = useHandleUpdate({
		fetchFn: async () => await fetchData<Plan>(API_ROUTES.plans.PLANS_DETAIL(planId), 'PUT', validatePlanUpdateValues(form.getValues())),
		onSuccess: (updatedItem) => {
			form.resetDirty();
			planMutate(updatedItem);
			operationFileMutate();
			plansListMutate();
		},
	});

	const { action: handleDelete, isLoading: isDeleting } = useHandleUpdate({
		fetchFn: async () => await fetchData<Plan>(API_ROUTES.plans.PLANS_DETAIL(planId), 'DELETE'),
		onSuccess: () => {
			form.resetDirty();
			plansListMutate();
			router.push(keepUrlParams(PAGE_ROUTES.plans.APPROVED_LIST));
		},
	});

	const { action: handleLock, isLoading: isLocking } = useHandleUpdate({
		fetchFn: async () => await fetchData<Plan>(API_ROUTES.plans.PLANS_DETAIL_LOCK(planId)),
		onSuccess: (updatedItem) => {
			form.resetDirty();
			planMutate(updatedItem);
			operationFileMutate();
			plansListMutate();
		},
	});

	const { action: handleControllerReprocessPlan, isLoading: isReprocessing } = useHandleUpdate({
		fetchFn: async () => await fetchData<Plan>(API_ROUTES.plans.PLANS_DETAIL_CONTROLLER_REPROCESS(planId)),
		onSuccess: (updatedItem) => {
			form.resetDirty();
			planMutate(updatedItem);
			operationFileMutate();
			plansListMutate();
		},
	});

	//
	// F. Setup flags

	const { isReadOnly } = useFlagReadOnly({
		hasPermission: meContext.actions.hasPermission(PermissionCatalog.all.plans.scope, PermissionCatalog.all.plans.actions.update),
		isDeleting: isDeleting,
		isLoading: planLoading || isReprocessing,
		isLocked: planData?.is_locked,
		isLocking: isLocking,
		isSaving: isSaving,
	});

	const { canSave } = useFlagCanSave({
		hasPermission: meContext.actions.hasPermission(PermissionCatalog.all.plans.scope, PermissionCatalog.all.plans.actions.update),
		isDeleting: isDeleting,
		isDirty: form.isDirty(),
		isLoading: planLoading || isReprocessing,
		isLocked: planData?.is_locked,
		isLocking: isLocking,
		isValid: form.isValid(),
	});

	const { canLock } = useFlagCanLock({
		hasPermission: meContext.actions.hasPermission(PermissionCatalog.all.plans.scope, PermissionCatalog.all.plans.actions.update),
		isDeleting: isDeleting,
		isDirty: form.isDirty(),
		isLoading: planLoading || isReprocessing,
		isLocking: isLocking,
		isValid: form.isValid(),
	});

	const { canDelete } = useFlagCanDelete({
		hasPermission: meContext.actions.hasPermission(PermissionCatalog.all.plans.scope, PermissionCatalog.all.plans.actions.update),
		isDeleting: isDeleting,
		isDirty: form.isDirty(),
		isLoading: planLoading || isReprocessing,
		isLocked: planData?.is_locked,
		isLocking: isLocking,
		isValid: form.isValid(),
	});

	//
	// G. Define context value

	const contextValue: PlanDetailContextState = useMemo(() => ({
		actions: {
			controllerReprocessPlan: handleControllerReprocessPlan,
			delete: handleDelete,
			lock: handleLock,
			save: handleSave,
		},
		data: {
			form,
			id: planId,
			operation_file: operationFileData,
			plan: planData,
		},
		flags: {
			canDelete,
			canLock,
			canSave,
			error: planError || operationFileError,
			isDeleting,
			isLoading: planLoading || operationFileLoading,
			isLocking,
			isReadOnly,
			isSaving: isSaving || isReprocessing,
		},
	}), [
		form,
		planId,
		planData,
		canDelete,
		canLock,
		canSave,
		operationFileError,
		planError,
		operationFileLoading,
		isDeleting,
		operationFileData,
		isReprocessing,
		planLoading,
		isLocking,
		isReadOnly,
		isSaving,
	]);

	//
	// H. Render components

	return (
		<PlanDetailContext.Provider value={contextValue}>
			{children}
		</PlanDetailContext.Provider>
	);

	//
};
