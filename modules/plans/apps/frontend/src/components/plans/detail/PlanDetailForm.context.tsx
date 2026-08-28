/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type Attachment, type User } from '@tmlmobilidade/go-types-core';
import { type Plan } from '@tmlmobilidade/go-types-operation';
import { type UpdatePlanDto, UpdatePlanSchema } from '@tmlmobilidade/go-types-operation';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { type ApiResponse } from '@tmlmobilidade/go-types-shared';
import { type DetailContextStateTemplate, fetchApiData, keepUrlParams, useFlagCanDelete, useFlagCanLock, useFlagCanSave, useFlagCustom, useFlagReadOnly, type UseFormReturnType, useHandleUpdate, useMeContext, useTypicalForm } from '@tmlmobilidade/ui';
import { uploadFile } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useContext, useMemo, useState } from 'react';
import useSWR from 'swr';

import { usePlansListData } from '../list/use-plans-list-data';
import { usePlansDetailData } from './use-plans-detail-data';
import { usePlansDetailPlanId } from './use-plans-detail-plan-id';

/* * */

interface PlanDetailContextState extends DetailContextStateTemplate {
	actions: DetailContextStateTemplate['actions'] & {
		controllerReprocessPlan: () => void
		deleteApexFile: () => void
		setApexFileUpload: (file: File | null) => void
	}
	data: {
		apex_file: Attachment | null
		form: UseFormReturnType<UpdatePlanDto>
		id: string
		operation_file: Attachment | null
		plan: null | Plan
		user: null | User
	}
	flags: DetailContextStateTemplate['flags'] & {
		canChangePlan: boolean
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

export const PlanDetailContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const meContext = useMeContext();

	const { planId } = usePlansDetailPlanId();

	const [apexFileUpload, setApexFileUpload] = useState<File | null>(null);

	const { mutate: plansListMutate } = usePlansListData();

	const { data: planData, error: planError, isLoading: planLoading, mutate: planMutate } = usePlansDetailData();

	//
	// B. Fetch data

	const { data: operationFileResponse, error: operationFileSwrError, isLoading: operationFileLoading, mutate: operationFileMutate } = useSWR<ApiResponse<Attachment>>(API_ROUTES.plans.PLANS_DETAIL_OPERATION_FILE(planId), {
		fetcher: async (url: string) => await fetchApiData<Attachment>({ url }),
	});

	const { data: apexFileResponse, mutate: apexFileMutate } = useSWR<ApiResponse<Attachment>>(API_ROUTES.plans.PLANS_DETAIL_APEX_FILE(planId), {
		fetcher: async (url: string) => await fetchApiData<Attachment>({ url }),
	});

	const { data: userResponse } = useSWR<ApiResponse<User>>(planData?.created_by ? API_ROUTES.core.USERS_DETAIL(planData.created_by) : null, {
		fetcher: async (url: string) => await fetchApiData<User>({ url }),
	});

	const operationFileData = operationFileResponse?.data ?? null;

	const operationFileError = operationFileResponse?.error ?? (operationFileSwrError instanceof Error ? operationFileSwrError.message : null);

	const apexFileData = apexFileResponse?.data ?? null;

	const userData = userResponse?.data ?? null;

	//
	// C. Setup form

	const { form } = useTypicalForm<UpdatePlanDto>(UpdatePlanSchema, planData);

	//
	// D. Handle actions

	const { action: handleSave, isLoading: isSaving } = useHandleUpdate({
		fetchFn: async () => {
			if (apexFileUpload) await uploadFile(API_ROUTES.plans.PLANS_DETAIL_APEX_FILE(planId), apexFileUpload);
			return await fetchApiData<Plan>({ body: form.getValues(), method: 'PUT', url: API_ROUTES.plans.PLANS_DETAIL(planId) });
		},
		onSuccess: () => {
			setApexFileUpload(null);
			form.resetDirty();
			planMutate();
			operationFileMutate();
			apexFileMutate();
			plansListMutate();
		},
	});

	const { action: handleDelete, isLoading: isDeleting } = useHandleUpdate({
		fetchFn: async () => await fetchApiData<Plan>({ method: 'DELETE', url: API_ROUTES.plans.PLANS_DETAIL(planId) }),
		onSuccess: () => {
			form.resetDirty();
			plansListMutate();
			router.push(keepUrlParams(PAGE_ROUTES.plans.APPROVED_LIST));
		},
	});

	const { action: handleLock, isLoading: isLocking } = useHandleUpdate({
		fetchFn: async () => await fetchApiData<Plan>({ url: API_ROUTES.plans.PLANS_DETAIL_LOCK(planId) }),
		onSuccess: () => {
			form.resetDirty();
			planMutate();
			operationFileMutate();
			plansListMutate();
		},
	});

	const { action: handleControllerReprocessPlan, isLoading: isReprocessing } = useHandleUpdate({
		fetchFn: async () => await fetchApiData<Plan>({ url: API_ROUTES.plans.PLANS_DETAIL_CONTROLLER_REPROCESS(planId) }),
		onSuccess: () => {
			form.resetDirty();
			planMutate();
			operationFileMutate();
			plansListMutate();
		},
	});

	const { action: handleDeleteApexFile, isLoading: isDeletingApexFile } = useHandleUpdate({
		fetchFn: async () => await fetchApiData<Attachment>({ method: 'DELETE', url: API_ROUTES.plans.PLANS_DETAIL_APEX_FILE(planId) }),
		onSuccess: () => {
			setApexFileUpload(null);
			apexFileMutate();
			planMutate();
		},
	});

	//
	// E. Setup flags

	const { isReadOnly } = useFlagReadOnly({
		hasPermission: meContext.actions.hasPermissionResource({
			action: PermissionCatalog.all.plans.actions.update,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.plans.scope,
			value: planData?.agency_id ?? '',
		}),
		isDeleting: isDeleting || isDeletingApexFile,
		isLoading: planLoading || isReprocessing,
		isLocked: planData?.is_locked,
		isLocking: isLocking,
		isSaving: isSaving,
	});

	const { canSave } = useFlagCanSave({
		hasPermission: meContext.actions.hasPermissionResource({
			action: PermissionCatalog.all.plans.actions.update,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.plans.scope,
			value: planData?.agency_id ?? '',
		}),
		isDeleting: isDeleting || isDeletingApexFile,
		isDirty: form.isDirty() || !!apexFileUpload,
		isLoading: planLoading || isReprocessing,
		isLocked: planData?.is_locked,
		isLocking: isLocking,
		isValid: form.isValid(),
	});

	const { canLock } = useFlagCanLock({
		hasPermission: meContext.actions.hasPermissionResource({
			action: PermissionCatalog.all.plans.actions.lock,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.plans.scope,
			value: planData?.agency_id ?? '',
		}),
		isDeleting: isDeleting || isDeletingApexFile,
		isDirty: form.isDirty() || !!apexFileUpload,
		isLoading: planLoading || isReprocessing,
		isLocking: isLocking,
		isValid: form.isValid(),
	});

	const { canDelete } = useFlagCanDelete({
		hasPermission: meContext.actions.hasPermissionResource({
			action: PermissionCatalog.all.plans.actions.delete,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.plans.scope,
			value: planData?.agency_id ?? '',
		}),
		isDeleting: isDeleting || isDeletingApexFile,
		isDirty: form.isDirty() || !!apexFileUpload,
		isLoading: planLoading || isReprocessing,
		isLocked: planData?.is_locked,
		isLocking: isLocking,
		isValid: form.isValid(),
	});

	const { flag: canChangePlan } = useFlagCustom('all', [
		!isReadOnly,
		!planData?.is_locked,
		!isLocking,
		!isDeleting,
		!isDeletingApexFile,
		!isReprocessing,
		!planLoading,
		!isSaving,
		meContext.actions.hasPermissionResource({
			action: PermissionCatalog.all.plans.actions.update_gtfs_plan,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.plans.scope,
			value: planData?.agency_id ?? '',
		}),
	]);

	//
	// F. Define context value

	const contextValue: PlanDetailContextState = useMemo(() => ({
		actions: {
			controllerReprocessPlan: handleControllerReprocessPlan,
			delete: handleDelete,
			deleteApexFile: handleDeleteApexFile,
			lock: handleLock,
			save: handleSave,
			setApexFileUpload,
		},
		data: {
			apex_file: apexFileData,
			form,
			id: planId,
			operation_file: operationFileData,
			plan: planData,
			user: userData,
		},
		flags: {
			canChangePlan,
			canDelete,
			canLock,
			canSave,
			error: planError || operationFileError ? new Error(planError || operationFileError || 'Failed to load plan') : undefined,
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
		canChangePlan,
		operationFileError,
		planError,
		operationFileLoading,
		apexFileData,
		isDeleting,
		operationFileData,
		isReprocessing,
		planLoading,
		isLocking,
		isReadOnly,
		isSaving,
		userData,
	]);

	//
	// G. Render components

	return (
		<PlanDetailContext.Provider value={contextValue}>
			{children}
		</PlanDetailContext.Provider>
	);

	//
};
