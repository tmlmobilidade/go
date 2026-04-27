'use client';

/* * */

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { describeAlert, DescribeAlertReturnType } from '@tmlmobilidade/go-alerts-pckg-describe';
import { type Alert, type File as FileType, PermissionCatalog, type UpdateAlertDto, UpdateAlertSchema } from '@tmlmobilidade/types';
import { type DetailContextStateTemplate, keepUrlParams, useDataAgencies, useDataOperationalLines, useDataRides, useFlagCanDelete, useFlagCanDuplicate, useFlagCanLock, useFlagCanSave, useFlagReadOnly, UseFormReturnType, useHandleUpdate, useMeContext, useTypicalForm, useTypicalFormWatch } from '@tmlmobilidade/ui';
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
	// C. Setup form

	const { formRef } = useTypicalForm<UpdateAlertDto>(UpdateAlertSchema, alertData);

	const watchedFormValues = useTypicalFormWatch(formRef.current, [
		'cause',
		'effect',
		'agency_id',
		'auto_texts',
		'active_period_start_date',
		'active_period_end_date',
		'reference_type',
		'references',
		'publish_status',
	]);

	//
	// C. Transform data

	const { isLoading: agenciesLoading, raw: agenciesData } = useDataAgencies(API_ROUTES.auth.AGENCIES_LIST, {
		actions: [PermissionCatalog.all.alerts.actions.create],
		scope: PermissionCatalog.all.alerts.scope,
	});

	const { isLoading: operationalLinesLoading, raw: operationalLinesData } = useDataOperationalLines(API_ROUTES.alerts.OPERATION_LINES, {
		filters: {
			agency_ids: watchedFormValues.agency_id ? [watchedFormValues.agency_id] : [],
			date_end: watchedFormValues.active_period_end_date,
			date_start: watchedFormValues.active_period_start_date,
		},
	});

	const { isLoading: ridesLoading, raw: ridesData } = useDataRides(API_ROUTES.alerts.RIDES_LIST, {
		filters: {
			agency_ids: watchedFormValues.agency_id ? [watchedFormValues.agency_id] : [],
			date_end: watchedFormValues.active_period_end_date,
			date_start: watchedFormValues.active_period_start_date,
			operational_statuses: ['running', 'missed', 'scheduled'],
		},
	});

	useEffect(() => {
		// Skip if auto texts is not enabled
		if (!watchedFormValues.auto_texts) return;
		// Skip if required fields for templating are not filled
		if (!watchedFormValues.cause) return;
		if (!watchedFormValues.effect) return;
		if (!watchedFormValues.reference_type) return;
		if (!watchedFormValues.references?.length) return;
		// Generate alert templating and set title and description based on it
		let alertTemplating: DescribeAlertReturnType;
		if (watchedFormValues.reference_type === 'agency') {
			// Filter agenciesData to find the selected agency based on parent_id in references
			const selectedAgencyData = agenciesData.find(agency => String(agency._id) === String(watchedFormValues.references[0].parent_id));
			if (!selectedAgencyData) return;
			// Generate alert templating
			alertTemplating = describeAlert({
				cause: watchedFormValues.cause,
				data: selectedAgencyData,
				effect: watchedFormValues.effect,
				reference_type: 'agency',
				references: watchedFormValues.references,
			});
		} else if (watchedFormValues.reference_type === 'lines') {
			// Filter operationalLinesData to find the selected lines based on parent_id in references
			const selectedOperationalLinesData = operationalLinesData.filter(line => watchedFormValues.references.some(ref => String(ref.parent_id) === String(line.line_id)));
			if (!selectedOperationalLinesData.length) return;
			// Generate alert templating
			alertTemplating = describeAlert({
				cause: watchedFormValues.cause,
				data: selectedOperationalLinesData,
				effect: watchedFormValues.effect,
				reference_type: 'lines',
				references: watchedFormValues.references,
			});
		} else if (watchedFormValues.reference_type === 'rides') {
			// Filter ridesData to find the selected rides based on parent_id in references
			const selectedRidesData = ridesData.filter(ride => watchedFormValues.references.some(ref => String(ref.parent_id) === String(ride._id)));
			if (!selectedRidesData.length) return;
			// Generate alert templating
			alertTemplating = describeAlert({
				cause: watchedFormValues.cause,
				data: selectedRidesData,
				effect: watchedFormValues.effect,
				reference_type: 'rides',
				references: watchedFormValues.references,
			});
			// } else if (watchedFormValues.reference_type === 'stops') {
			// 	// Filter stopsData to find the selected stops based on parent_id in references
			// 	const selectedStopsData = stopsData.filter(stop => watchedFormValues.references.some(ref => String(ref.parent_id) === String(stop._id)));
			// 	if (!selectedStopsData.length) return;
			// 	// Generate alert templating
			// 	alertTemplating = describeAlert({
			// 		cause: watchedFormValues.cause,
			// 		data: selectedStopsData,
			// 		effect: watchedFormValues.effect,
			// 		reference_type: 'stops',
			// 		references: watchedFormValues.references,
			// 	});
		}
		if (!alertTemplating) return;
		formRef.current.setFieldValue('description', alertTemplating.description.pt);
		formRef.current.setFieldValue('title', alertTemplating.title.pt);
	}, [agenciesData, formRef, operationalLinesData, ridesData, watchedFormValues.auto_texts, watchedFormValues.cause, watchedFormValues.effect, watchedFormValues.reference_type, watchedFormValues.references]);

	//
	// D. Handle actions

	const { action: handleSave, isLoading: isSaving } = useHandleUpdate({
		fetchFn: async () => await fetchData<Alert>(API_ROUTES.alerts.ALERTS_DETAIL(alertId), 'PUT', formRef.current.getValues()),
		onSuccess: (updatedItem) => {
			formRef.current.resetDirty();
			alertMutate(updatedItem);
			alertImageMutate();
			alertsListMutate();
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
			handleSave();
			setImageFile(undefined);
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
		handleUploadImage();
	}, [handleUploadImage, imageFile]);

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
			isLoading: alertLoading || agenciesLoading || operationalLinesLoading || ridesLoading,
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
