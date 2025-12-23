'use client';

/* * */

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type Alert, type File as FileType, PermissionCatalog, type UpdateAlertDto, UpdateAlertSchema } from '@tmlmobilidade/types';
import { DetailContextStateTemplate, keepUrlParams, useFlagCanDelete, useFlagCanLock, useFlagCanSave, useFlagReadOnly, UseFormReturnType, useHandleUpdate, useMeContext, useTypicalForm } from '@tmlmobilidade/ui';
import { fetchData, uploadFile } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';
import useSWR from 'swr';

/* * */

interface AlertDetailContextState extends DetailContextStateTemplate {
	actions: DetailContextStateTemplate['actions'] & {
		deleteImage: () => void
		fileChanged: (file: File) => void
		publish: () => void
	}
	data: {
		alert: Alert | undefined
		form: UseFormReturnType<UpdateAlertDto>
		id: string | undefined
		image: FileType | undefined
	}
}

/* * */

const AlertDetailContext = createContext<AlertDetailContextState | undefined>(undefined);

export function useAlertDetailContext() {
	const context = useContext(AlertDetailContext);
	if (!context) {
		throw new Error('useAlertDetailContext must be used within a AlertDetailContextProvider');
	}
	return context;
}

/* * */

export const AlertDetailContextProvider = ({ alertId, children }: PropsWithChildren<{ alertId: string }>) => {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const meContext = useMeContext();

	const [image, setImage] = useState<File | null>(null);

	//
	// B. Fetch Data

	const { mutate: scheduledListMutate } = useSWR<Alert[]>(API_ROUTES.alerts.SCHEDULED_LIST);
	const { data: alertData, error: alertError, isLoading: alertLoading, mutate: alertMutate } = useSWR<Alert>(API_ROUTES.alerts.SCHEDULED_DETAIL(alertId));
	const { data: alertImage, isLoading: alertImageLoading, mutate: alertImageMutate } = useSWR<FileType | undefined>(API_ROUTES.alerts.SCHEDULED_DETAIL_IMAGE(alertId));

	//
	// C. Define form

	const { form } = useTypicalForm<UpdateAlertDto>(UpdateAlertSchema, alertData);

	//
	// D. Handle actions

	const { action: handleSave, isLoading: isSaving } = useHandleUpdate({
		fetchFn: async () => await fetchData<Alert>(API_ROUTES.alerts.SCHEDULED_DETAIL(alertId), 'PUT', form.getValues()),
		onSuccess: (updatedItem) => {
			form.resetDirty();
			alertMutate(updatedItem);
			alertImageMutate();
			scheduledListMutate();
		},
	});

	const { action: handlePublish, isLoading: isPublishing } = useHandleUpdate({
		fetchFn: async () => await fetchData<Alert>(API_ROUTES.alerts.SCHEDULED_DETAIL(alertId), 'PUT', form.getValues()),
		onSuccess: (updatedItem) => {
			form.resetDirty();
			alertMutate(updatedItem);
			alertImageMutate();
			scheduledListMutate();
		},
	});

	const { action: handleDelete, isLoading: isDeleting } = useHandleUpdate({
		fetchFn: async () => await fetchData<Alert>(API_ROUTES.alerts.SCHEDULED_DETAIL(alertId), 'DELETE'),
		onSuccess: () => {
			form.resetDirty();
			scheduledListMutate();
			router.push(keepUrlParams(PAGE_ROUTES.alerts.SCHEDULED_LIST));
		},
	});

	const { action: handleDeleteImage, isLoading: isDeletingImage } = useHandleUpdate({
		fetchFn: async () => await fetchData<Alert>(API_ROUTES.alerts.SCHEDULED_DETAIL_IMAGE(alertId), 'DELETE'),
		onSuccess: () => {
			form.resetDirty();
			alertMutate();
			alertImageMutate();
			scheduledListMutate();
		},
	});

	const { action: handleLock, isLoading: isLocking } = useHandleUpdate({
		fetchFn: async () => await fetchData<Alert>(API_ROUTES.alerts.SCHEDULED_DETAIL_LOCK(alertId)),
		onSuccess: (updatedItem) => {
			form.resetDirty();
			alertMutate(updatedItem);
			alertImageMutate();
			scheduledListMutate();
		},
	});

	const { action: handleUploadImage, isLoading: isUploadingImage } = useHandleUpdate({
		fetchFn: async () => await uploadFile(API_ROUTES.alerts.SCHEDULED_DETAIL_IMAGE(alertId), image),
		onSuccess: () => {
			form.resetDirty();
			alertMutate();
			alertImageMutate();
			scheduledListMutate();
		},
	});

	//
	// F. Setup flags

	const { isReadOnly } = useFlagReadOnly({
		hasPermission: meContext.actions.hasPermission(PermissionCatalog.all.alerts_scheduled.scope, PermissionCatalog.all.alerts_scheduled.actions.update),
		isDeleting: isDeleting,
		isLoading: alertLoading,
		isLocked: alertData?.is_locked,
		isLocking: isLocking,
		isSaving: isSaving,
	});

	const { canSave } = useFlagCanSave({
		hasPermission: meContext.actions.hasPermission(PermissionCatalog.all.alerts_scheduled.scope, PermissionCatalog.all.alerts_scheduled.actions.update),
		isDeleting: isDeleting,
		isDirty: form.isDirty(),
		isLoading: alertLoading,
		isLocked: alertData?.is_locked,
		isLocking: isLocking,
		isValid: form.isValid(),
	});

	const { canLock } = useFlagCanLock({
		hasPermission: meContext.actions.hasPermission(PermissionCatalog.all.alerts_scheduled.scope, PermissionCatalog.all.alerts_scheduled.actions.update),
		isDeleting: isDeleting,
		isDirty: form.isDirty(),
		isLoading: alertLoading,
		isLocking: isLocking,
		isValid: form.isValid(),
	});

	const { canDelete } = useFlagCanDelete({
		hasPermission: meContext.actions.hasPermission(PermissionCatalog.all.alerts_scheduled.scope, PermissionCatalog.all.alerts_scheduled.actions.update),
		isDeleting: isDeleting,
		isDirty: form.isDirty(),
		isLoading: alertLoading,
		isLocked: alertData?.is_locked,
		isLocking: isLocking,
		isValid: form.isValid(),
	});

	//
	// E. Define context value

	const contextValue: AlertDetailContextState = useMemo(() => ({
		actions: {
			delete: handleDelete,
			deleteImage: handleDeleteImage,
			fileChanged: setImage,
			lock: handleLock,
			publish: handlePublish,
			save: handleSave,
			uploadImage: handleUploadImage,
		},
		data: {
			alert: alertData,
			form,
			id: alertId,
			image: alertImage,
		},
		flags: {
			canDelete,
			canLock,
			canSave,
			error: alertError,
			isDeleting,
			isDeletingImage: isDeletingImage,
			isDirty: form.isDirty(),
			isLoading: alertLoading || alertImageLoading,
			isLocking: isLocking,
			isReadOnly,
			isSaving,
			isUploadingImage: isUploadingImage,
		},
	}), [
		alertId,
		alertData,
		alertImage,
		alertImageLoading,
		alertLoading,
		isDeleting,
		isDeletingImage,
		isPublishing,
		isSaving,
		isUploadingImage,
		form,
	]);

	//
	// F. Render components

	return (
		<AlertDetailContext.Provider value={contextValue}>
			{children}
		</AlertDetailContext.Provider>
	);

	//
};
