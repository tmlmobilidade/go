'use client';

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type Alert, type UpdateAlertDto, UpdateAlertSchema } from '@tmlmobilidade/go-types-operation';
import { hasPermissionResource } from '@tmlmobilidade/go-types-permissions';
import { fetchApiMultipart, type StandardFormContextValue, useMeData, useStandardForm, useStandardFormCapabilities } from '@tmlmobilidade/ui';
import { fetchApiData, useHandleAction } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';

import { useAlertsListData } from '../list/use-alerts-list-data';
import { useAlertsDetailAlertId } from './use-alerts-detail-alert-id';
import { useAlertsDetailData } from './use-alerts-detail-data';
import { useAlertsDetailImageData } from './use-alerts-detail-image-data';

/* * */

interface AlertsDetailFormContextValue extends StandardFormContextValue<UpdateAlertDto> {
	actions: StandardFormContextValue<UpdateAlertDto>['actions'] & {
		deleteImage: () => void
		updateImage: (imageFile: File) => void
	}
	status: StandardFormContextValue<UpdateAlertDto>['status'] & {
		isDeletingImage: boolean
		isUpdatingImage: boolean
	}
}

/* * */

const AlertsDetailFormContext = createContext<AlertsDetailFormContextValue | undefined>(undefined);

export function useAlertsDetailFormContext() {
	const context = useContext(AlertsDetailFormContext);
	if (!context) throw new Error('useAlertsDetailFormContext must be used within a AlertsDetailFormContextProvider');
	return context;
}

/* * */

export function AlertsDetailFormContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const { alertId } = useAlertsDetailAlertId();

	const { data: meData } = useMeData();

	const { mutate: alertsListMutate } = useAlertsListData();

	const { data: alertData, isLoading: alertDataLoading, mutate: alertsDetailMutate } = useAlertsDetailData();
	const { mutate: alertImageMutate } = useAlertsDetailImageData();

	const router = useRouter();

	//
	// B. Setup form

	const { form, isDirty, isValid, unblock } = useStandardForm<UpdateAlertDto, typeof UpdateAlertSchema>({
		apiData: alertData,
		schema: UpdateAlertSchema,
	});

	//
	// C. Handle actions

	const { action: handleUpdate, isLoading: isUpdating } = useHandleAction({
		fetchFn: async () => await fetchApiData<Alert>({ body: form.getValues(), method: 'PUT', url: API_ROUTES.operation.ALERTS_DETAIL_UPDATE(alertId) }),
		onSuccess: (response) => {
			form.reset(response.data);
			alertsDetailMutate(response);
			alertsListMutate();
		},
	});

	const { action: handleDuplicate, isLoading: isDuplicating } = useHandleAction({
		fetchFn: async () => await fetchApiData<Alert>({ body: form.getValues(), method: 'POST', url: API_ROUTES.operation.ALERTS_DETAIL_DUPLICATE(alertId) }),
		onSuccess: (response) => {
			form.reset(response.data);
			unblock();
			alertsDetailMutate(response);
			alertsListMutate();
			router.push(PAGE_ROUTES.operation.ALERTS_DETAIL(response.data._id));
		},
	});

	const { action: handleDelete, isLoading: isDeleting } = useHandleAction({
		fetchFn: async () => await fetchApiData<Alert>({ body: form.getValues(), method: 'DELETE', url: API_ROUTES.operation.ALERTS_DETAIL_DELETE(alertId) }),
		onSuccess: () => {
			unblock();
			alertsListMutate();
			router.push(PAGE_ROUTES.operation.ALERTS_LIST);
		},
	});

	const { action: handleUpdateImage, isLoading: isUpdatingImage } = useHandleAction({
		fetchFn: async (imageFile: File) => {
			const formData = new FormData();
			formData.append('file', imageFile);
			return await fetchApiMultipart<Alert>(API_ROUTES.operation.ALERTS_DETAIL_UPDATE_IMAGE(alertId), formData);
		},
		onSuccess: () => {
			alertImageMutate();
		},
	});

	const { action: handleDeleteImage, isLoading: isDeletingImage } = useHandleAction({
		fetchFn: async () => await fetchApiData<Alert>({ method: 'DELETE', url: API_ROUTES.operation.ALERTS_DETAIL_DELETE_IMAGE(alertId) }),
		onSuccess: () => {
			alertImageMutate();
		},
	});

	//
	// D. Setup flags

	const hasUpdatePermission = useMemo(() => {
		const hasPermissionAgencyId = hasPermissionResource(meData?.permissions, {
			requiredPermission: { action: 'update', scope: 'alerts' },
			requiredValue: alertData?.agency_id,
			resourceKey: 'agency_ids',
		});
		const hasPermissionReferenceType = hasPermissionResource(meData?.permissions, {
			requiredPermission: { action: 'update', scope: 'alerts' },
			requiredValue: alertData?.reference_type,
			resourceKey: 'reference_types',
		});
		return hasPermissionAgencyId && hasPermissionReferenceType;
	}, [alertData?.agency_id, alertData?.reference_type, meData?.permissions]);

	const hasDuplicatePermission = useMemo(() => {
		const hasPermissionAgencyId = hasPermissionResource(meData?.permissions, {
			requiredPermission: { action: 'create', scope: 'alerts' },
			requiredValue: alertData?.agency_id,
			resourceKey: 'agency_ids',
		});
		const hasPermissionReferenceType = hasPermissionResource(meData?.permissions, {
			requiredPermission: { action: 'create', scope: 'alerts' },
			requiredValue: alertData?.reference_type,
			resourceKey: 'reference_types',
		});
		return hasPermissionAgencyId && hasPermissionReferenceType;
	}, [alertData?.agency_id, alertData?.reference_type, meData?.permissions]);

	const hasDeletePermission = useMemo(() => {
		const hasPermissionAgencyId = hasPermissionResource(meData?.permissions, {
			requiredPermission: { action: 'delete', scope: 'alerts' },
			requiredValue: alertData?.agency_id,
			resourceKey: 'agency_ids',
		});
		const hasPermissionReferenceType = hasPermissionResource(meData?.permissions, {
			requiredPermission: { action: 'delete', scope: 'alerts' },
			requiredValue: alertData?.reference_type,
			resourceKey: 'reference_types',
		});
		return hasPermissionAgencyId && hasPermissionReferenceType;
	}, [alertData?.agency_id, alertData?.reference_type, meData?.permissions]);

	const { deleteEnabled, duplicateEnabled, editEnabled, updateEnabled } = useStandardFormCapabilities({
		delete: {
			hasPermission: hasDeletePermission,
			isDeleting: isDeleting,
		},
		duplicate: {
			hasPermission: hasDuplicatePermission,
			isDuplicating: isDuplicating,
		},
		form: {
			isDirty,
			isValid,
		},
		loading: {
			isLoading: alertDataLoading,
		},
		locked: {
			isLocked: alertData?.is_locked,
		},
		update: {
			hasPermission: hasUpdatePermission,
			isUpdating: isUpdating || isUpdatingImage,
		},
	});

	//
	// E. Return state

	const stateValue: AlertsDetailFormContextValue = useMemo(() => ({
		actions: {
			delete: handleDelete,
			deleteImage: handleDeleteImage,
			duplicate: handleDuplicate,
			update: handleUpdate,
			updateImage: handleUpdateImage,
		},
		capabilities: {
			deleteEnabled,
			duplicateEnabled,
			editEnabled,
			updateEnabled,
		},
		form,
		isDirty,
		isValid,
		status: {
			isDeletingImage,
			isLoading: alertDataLoading,
			isUpdating,
			isUpdatingImage,
		},
		unblock,
	}), [handleDelete, handleDeleteImage, handleDuplicate, handleUpdate, handleUpdateImage, deleteEnabled, duplicateEnabled, editEnabled, updateEnabled, form, isDirty, isValid, isDeletingImage, alertDataLoading, isUpdating, isUpdatingImage, unblock]);

	return (
		<AlertsDetailFormContext.Provider value={stateValue}>
			{children}
		</AlertsDetailFormContext.Provider>
	);
}
