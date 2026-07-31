/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type Attachment, PermissionCatalog, type Plan, type UpdatePlanDto, UpdatePlanSchema, User } from '@tmlmobilidade/types';
import { type DetailContextStateTemplate, keepUrlParams, useFlagCanDelete, useFlagCanLock, useFlagCanSave, useFlagCustom, useFlagReadOnly, type UseFormReturnType, useHandleUpdate, useMeContext, useTypicalForm } from '@tmlmobilidade/ui';
import { fetchData, uploadFile } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';
import useSWR from 'swr';

/* * */

type PlanWithLegacyPostersFile = Plan & {
	apps: Plan['apps'] & {
		posters: Plan['apps']['posters'] & {
			file?: Attachment | null
		}
	}
};

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
		posters_file: Attachment | null
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

export const PlanDetailContextProvider = ({ children, planId }: PropsWithChildren<{ planId: string }>) => {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const meContext = useMeContext();

	const [apexFileUpload, setApexFileUpload] = useState<File | null>(null);

	//
	// B. Fetch data

	const { mutate: plansListMutate } = useSWR<Plan[]>(API_ROUTES.plans.PLANS_LIST);
	const { data: planData, error: planError, isLoading: planLoading, mutate: planMutate } = useSWR<Plan>(API_ROUTES.plans.PLANS_DETAIL(planId), { refreshInterval: 5000 });
	const planWithLegacyPostersFile = planData as PlanWithLegacyPostersFile | undefined;
	const postersFileId = planData?.apps?.posters?.file_id;
	const legacyPostersFile = planWithLegacyPostersFile?.apps?.posters?.file ?? null;

	const { data: postersFileData, error: postersFileError, mutate: postersFileMutate } = useSWR<Attachment>(
		postersFileId ? API_ROUTES.plans.PLANS_DETAIL_POSTERS_FILE(planId) : null,
		{ shouldRetryOnError: false },
	);
	const { data: operationFileData, error: operationFileError, isLoading: operationFileLoading, mutate: operationFileMutate } = useSWR<Attachment>(API_ROUTES.plans.PLANS_DETAIL_OPERATION_FILE(planId));
	const { data: apexFileData, mutate: apexFileMutate } = useSWR<Attachment>(API_ROUTES.plans.PLANS_DETAIL_APEX_FILE(planId));
	const { data: userData } = useSWR<User>(planId && API_ROUTES.auth.USERS_DETAIL(planData?.created_by));

	//
	// C. Setup form

	const { form } = useTypicalForm<UpdatePlanDto>(UpdatePlanSchema, planData);

	//
	// D. Handle actions

	const { action: handleSave, isLoading: isSaving } = useHandleUpdate({
		fetchFn: async () => {
			if (apexFileUpload) await uploadFile(API_ROUTES.plans.PLANS_DETAIL_APEX_FILE(planId), apexFileUpload);
			return await fetchData<Plan>(API_ROUTES.plans.PLANS_DETAIL(planId), 'PUT', form.getValues());
		},
		onSuccess: (updatedItem) => {
			setApexFileUpload(null);
			form.resetDirty();
			planMutate(updatedItem);
			operationFileMutate();
			postersFileMutate();
			apexFileMutate();
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
			postersFileMutate();
			plansListMutate();
		},
	});

	const { action: handleControllerReprocessPlan, isLoading: isReprocessing } = useHandleUpdate({
		fetchFn: async () => await fetchData<Plan>(API_ROUTES.plans.PLANS_DETAIL_CONTROLLER_REPROCESS(planId)),
		onSuccess: (updatedItem) => {
			form.resetDirty();
			planMutate(updatedItem);
			operationFileMutate();
			postersFileMutate();
			plansListMutate();
		},
	});

	const { action: handleDeleteApexFile, isLoading: isDeletingApexFile } = useHandleUpdate({
		fetchFn: async () => await fetchData<Attachment>(API_ROUTES.plans.PLANS_DETAIL_APEX_FILE(planId), 'DELETE'),
		onSuccess: () => {
			setApexFileUpload(null);
			apexFileMutate(null);
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
			posters_file: postersFileError ? null : postersFileData ?? legacyPostersFile,
			user: userData,
		},
		flags: {
			canChangePlan,
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
		canChangePlan,
		operationFileError,
		postersFileError,
		planError,
		operationFileLoading,
		apexFileData,
		isDeleting,
		operationFileData,
		postersFileData,
		legacyPostersFile,
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
