'use client';

/* * */

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type Alert, type File as FileType, PermissionCatalog, type UpdateAlertDto, UpdateAlertSchema } from '@tmlmobilidade/types';
import { type DetailContextStateTemplate, keepUrlParams, useFlagCanDelete, useFlagCanDuplicate, useFlagCanLock, useFlagCanSave, useFlagReadOnly, UseFormReturnType, useHandleUpdate, useMeContext, useTypicalForm } from '@tmlmobilidade/ui';
import { fetchData, uploadFile } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import useSWR from 'swr';

/* * */

interface AlertDetailContextState extends DetailContextStateTemplate {
	actions: DetailContextStateTemplate['actions'] & {
		deleteImage: () => void
		setImageFile: (file: File) => void
	}
	data: {
		alert: Alert | undefined
		form: UseFormReturnType<UpdateAlertDto>
		id: string | undefined
		image: FileType | undefined
	}
	flags: DetailContextStateTemplate['flags'] & {
		isDeletingImage: boolean
		isDirty: boolean
		isUploadingImage: boolean
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

	const [imageFile, setImageFile] = useState<File>();

	//
	// B. Fetch Data

	const { mutate: alertsListMutate } = useSWR<Alert[]>(API_ROUTES.alerts.ALERTS_LIST);
	const { data: alertData, error: alertError, isLoading: alertLoading, isValidating: alertValidating, mutate: alertMutate } = useSWR<Alert>(API_ROUTES.alerts.ALERTS_DETAIL(alertId));
	const { data: alertImage, mutate: alertImageMutate } = useSWR<FileType>(API_ROUTES.alerts.ALERTS_DETAIL_IMAGE(alertId));

	//
	// C. Define form

	const { formRef } = useTypicalForm<UpdateAlertDto>(UpdateAlertSchema, alertData);

	//
	// D. Handle actions

	const { action: handleSave, isLoading: isSaving } = useHandleUpdate({
		fetchFn: async () => await fetchData<Alert>(API_ROUTES.alerts.ALERTS_DETAIL(alertId), 'PUT', formRef.current.getValues()),
		onSuccess: (updatedItem) => {
			formRef.current.resetDirty();
			alertMutate(updatedItem);
			alertImageMutate();
			alertsListMutate();
			handleUploadImage();
		},
	});

	const { action: handleDelete, isLoading: isDeleting } = useHandleUpdate({
		fetchFn: async () => await fetchData<Alert>(API_ROUTES.alerts.ALERTS_DETAIL(alertId), 'DELETE'),
		onSuccess: () => {
			alertsListMutate();
			router.push(keepUrlParams(PAGE_ROUTES.alerts.ALERTS_LIST));
		},
	});

	const { action: handleLock, isLoading: isLocking } = useHandleUpdate({
		fetchFn: async () => await fetchData<Alert>(API_ROUTES.alerts.ALERTS_DETAIL_LOCK(alertId)),
		onSuccess: (updatedItem) => {
			formRef.current.resetDirty();
			alertMutate(updatedItem);
			alertImageMutate();
			alertsListMutate();
		},
	});

	const { action: handleDuplicate, isLoading: isDuplicating } = useHandleUpdate({
		fetchFn: async () => await fetchData<Alert>(API_ROUTES.alerts.ALERTS_DETAIL_DUPLICATE(alertId)),
		onSuccess: (duplicatedItem) => {
			alertsListMutate();
			const destUrl = keepUrlParams(PAGE_ROUTES.alerts.ALERTS_DETAIL(duplicatedItem._id));
			router.push(destUrl);
		},
	});

	const { action: handleUploadImage, isLoading: isUploadingImage } = useHandleUpdate({
		fetchFn: async () => imageFile && await uploadFile(API_ROUTES.alerts.ALERTS_DETAIL_IMAGE(alertId), imageFile),
		onSuccess: () => {
			formRef.current.resetDirty();
			alertMutate();
			alertImageMutate();
			alertsListMutate();
		},
	});

	const { action: handleDeleteImage, isLoading: isDeletingImage } = useHandleUpdate({
		fetchFn: async () => await fetchData<Alert>(API_ROUTES.alerts.ALERTS_DETAIL_IMAGE(alertId), 'DELETE'),
		onSuccess: () => {
			formRef.current.resetDirty();
			alertMutate();
			alertImageMutate();
			alertsListMutate();
		},
	});

	useEffect(() => {
		if (!imageFile) return;
		handleSave();
	}, [handleSave, imageFile]);

	//
	// F. Setup flags

	const { isReadOnly } = useFlagReadOnly({
		hasPermission: meContext.actions.hasPermissionResource([
			{
				action: PermissionCatalog.all.alerts.actions.update,
				resource_key: 'agency_ids',
				scope: PermissionCatalog.all.alerts.scope,
				value: alertData?.agency_id,
			},
			{
				action: PermissionCatalog.all.alerts.actions.update,
				resource_key: 'reference_types',
				scope: PermissionCatalog.all.alerts.scope,
				value: alertData?.reference_type,
			},
		]),
		isDeleting: isDeleting,
		isLoading: alertLoading,
		isLocked: alertData?.is_locked,
		isLocking: isLocking,
		isSaving: isSaving,
	});

	const { canSave } = useFlagCanSave({
		hasPermission: meContext.actions.hasPermissionResource([
			{
				action: PermissionCatalog.all.alerts.actions.update,
				resource_key: 'agency_ids',
				scope: PermissionCatalog.all.alerts.scope,
				value: alertData?.agency_id,
			},
			{
				action: PermissionCatalog.all.alerts.actions.update,
				resource_key: 'reference_types',
				scope: PermissionCatalog.all.alerts.scope,
				value: alertData?.reference_type,
			},
		]),
		isDeleting: isDeleting,
		isDirty: formRef.current.isDirty(),
		isLoading: alertLoading,
		isLocked: alertData?.is_locked,
		isLocking: isLocking,
		isValid: formRef.current.isValid(),
	});

	const { canLock } = useFlagCanLock({
		hasPermission: meContext.actions.hasPermissionResource([
			{
				action: PermissionCatalog.all.alerts.actions.lock,
				resource_key: 'agency_ids',
				scope: PermissionCatalog.all.alerts.scope,
				value: alertData?.agency_id,
			},
			{
				action: PermissionCatalog.all.alerts.actions.lock,
				resource_key: 'reference_types',
				scope: PermissionCatalog.all.alerts.scope,
				value: alertData?.reference_type,
			},
		]),
		isDeleting: isDeleting,
		isDirty: formRef.current.isDirty(),
		isLoading: alertLoading,
		isLocking: isLocking,
		isValid: formRef.current.isValid(),
	});

	const { canDelete } = useFlagCanDelete({
		hasPermission: meContext.actions.hasPermissionResource([
			{
				action: PermissionCatalog.all.alerts.actions.delete,
				resource_key: 'agency_ids',
				scope: PermissionCatalog.all.alerts.scope,
				value: alertData?.agency_id,
			},
			{
				action: PermissionCatalog.all.alerts.actions.delete,
				resource_key: 'reference_types',
				scope: PermissionCatalog.all.alerts.scope,
				value: alertData?.reference_type,
			},
		]),
		isDeleting: isDeleting,
		isDirty: formRef.current.isDirty(),
		isLoading: alertLoading,
		isLocked: alertData?.is_locked,
		isLocking: isLocking,
		isValid: formRef.current.isValid(),
	});

	const { canDuplicate } = useFlagCanDuplicate({
		hasPermission: meContext.actions.hasPermissionResource([
			{
				action: PermissionCatalog.all.alerts.actions.create,
				resource_key: 'agency_ids',
				scope: PermissionCatalog.all.alerts.scope,
				value: alertData?.agency_id,
			},
			{
				action: PermissionCatalog.all.alerts.actions.create,
				resource_key: 'reference_types',
				scope: PermissionCatalog.all.alerts.scope,
				value: alertData?.reference_type,
			},
		]),
		isDeleting: isDeleting,
		isDirty: formRef.current.isDirty(),
		isLoading: alertLoading,
		isLocking: isLocking,
		isValid: formRef.current.isValid(),
	});

	//
	// E. Define context value

	const contextValue: AlertDetailContextState = {
		actions: {
			delete: handleDelete,
			deleteImage: handleDeleteImage,
			duplicate: handleDuplicate,
			lock: handleLock,
			save: handleSave,
			setImageFile: setImageFile,
		},
		data: {
			alert: alertData,
			form: formRef.current,
			id: alertId,
			image: alertImage,
		},
		flags: {
			canDelete,
			canDuplicate,
			canLock,
			canSave,
			error: alertError,
			isDeleting,
			isDeletingImage,
			isDirty: formRef.current.isDirty(),
			isDuplicating,
			isLoading: alertLoading,
			isLocking,
			isReadOnly,
			isSaving,
			isUploadingImage,
			isValidating: alertValidating,
		},
	};

	//
	// F. Render components

	return (
		<AlertDetailContext.Provider value={contextValue}>
			{children}
		</AlertDetailContext.Provider>
	);

	//
};
