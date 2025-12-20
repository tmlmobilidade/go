'use client';

/* * */

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type Alert, type File as FileType, type UpdateAlertDto, UpdateAlertSchema } from '@tmlmobilidade/types';
import { DetailContextStateTemplate, keepUrlParams, UseFormReturnType, useHandleUpdate, useMeContext, useTypicalForm } from '@tmlmobilidade/ui';
import { fetchData, uploadFile } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';
import useSWR from 'swr';

/* * */

interface ScheduledDetailContextState extends DetailContextStateTemplate {
	actions: DetailContextStateTemplate['actions'] & {
		deleteImage: () => void
		fileChanged: (file: File) => void
		publish: () => void
	}
	data: {
		form: UseFormReturnType<UpdateAlertDto>
		id: string | undefined
		image_url: FileType | undefined
	}
}

/* * */

const ScheduledDetailContext = createContext<ScheduledDetailContextState | undefined>(undefined);

export function useScheduledDetailContext() {
	const context = useContext(ScheduledDetailContext);
	if (!context) {
		throw new Error('useScheduledDetailContext must be used within a ScheduledDetailContextProvider');
	}
	return context;
}

/* * */

export const ScheduledDetailContextProvider = ({ alertId, children }: PropsWithChildren<{ alertId: string }>) => {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const meContext = useMeContext();

	const [image, setImage] = useState<File | null>(null);

	//
	// B. Fetch Data

	const { mutate: alertsListMutate } = useSWR<Alert[]>(API_ROUTES.alerts.SCHEDULED_LIST);
	const { data: alertData, error: alertError, isLoading: alertLoading, mutate: alertMutate } = useSWR<Alert>(API_ROUTES.alerts.SCHEDULED_DETAIL(alertId));
	const { data: alertImage, error: alertImageError, isLoading: alertImageLoading, mutate: alertImageMutate } = useSWR<FileType | undefined>(API_ROUTES.alerts.SCHEDULED_DETAIL_IMAGE(alertId));

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
			alertsListMutate();
		},
	});

	const { action: handlePublish, isLoading: isPublishing } = useHandleUpdate({
		fetchFn: async () => await fetchData<Alert>(API_ROUTES.alerts.SCHEDULED_DETAIL(alertId), 'PUT', form.getValues()),
		onSuccess: (updatedItem) => {
			form.resetDirty();
			alertMutate(updatedItem);
			alertImageMutate();
			alertsListMutate();
		},
	});

	const { action: handleDelete, isLoading: isDeleting } = useHandleUpdate({
		fetchFn: async () => await fetchData<Alert>(API_ROUTES.alerts.SCHEDULED_DETAIL(alertId), 'DELETE'),
		onSuccess: () => {
			form.resetDirty();
			alertsListMutate();
			router.push(keepUrlParams(PAGE_ROUTES.alerts.SCHEDULED_LIST));
		},
	});

	const { action: handleDeleteImage, isLoading: isDeletingImage } = useHandleUpdate({
		fetchFn: async () => await fetchData<Alert>(API_ROUTES.alerts.SCHEDULED_DETAIL_IMAGE(alertId), 'DELETE'),
		onSuccess: () => {
			form.resetDirty();
			alertMutate();
			alertImageMutate();
			alertsListMutate();
		},
	});

	const { action: handleLock, isLoading: isLocking } = useHandleUpdate({
		fetchFn: async () => await fetchData<Alert>(API_ROUTES.alerts.SCHEDULED_DETAIL_LOCK(alertId)),
		onSuccess: (updatedItem) => {
			form.resetDirty();
			alertMutate(updatedItem);
			alertImageMutate();
			alertsListMutate();
		},
	});

	const { action: handleUploadImage, isLoading: isUploadingImage } = useHandleUpdate({
		fetchFn: async () => await uploadFile(API_ROUTES.alerts.SCHEDULED_DETAIL_IMAGE(alertId), image),
		onSuccess: () => {
			form.resetDirty();
			alertMutate();
			alertImageMutate();
			alertsListMutate();
		},
	});

	//
	// E. Define context value

	const contextValue: ScheduledDetailContextState = useMemo(() => ({
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
			form,
			id: alertId,
			image_url: alertImage,
		},
		flags: {
			error: alertError,
			isDeleting: isDeleting,
			isDeletingImage: isDeletingImage,
			isDirty: form.isDirty(),
			isLoading: alertLoading || alertImageLoading,
			isLocked: alertData?.is_locked,
			isPublishing: isPublishing,
			isSaving: isSaving,
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
		<ScheduledDetailContext.Provider value={contextValue}>
			{children}
		</ScheduledDetailContext.Provider>
	);

	//
};
