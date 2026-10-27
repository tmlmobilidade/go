'use client';

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type Fare, type UpdateFareDto, UpdateFareSchema } from '@tmlmobilidade/go-types-offer';
import { fetchApiData, keepUrlParams, type StandardFormContextValue, useHandleAction, useMeData, useStandardForm, useStandardFormCapabilities, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useCallback, useContext, useMemo } from 'react';

import { getFaresPermissions } from '../shared/fares-permissions';
import { useFaresData } from '../shared/use-fares-data';
import { useFaresDetailData } from './use-fares-detail-data';
import { useFaresDetailFareId } from './use-fares-detail-fare-id';

/* * */

const FaresDetailFormContext = createContext<StandardFormContextValue<UpdateFareDto> | undefined>(undefined);

/* * */

export function useFaresDetailFormContext() {
	const context = useContext(FaresDetailFormContext);
	if (!context) throw new Error('useFaresDetailFormContext must be used within FaresDetailFormContextProvider');
	return context;
}

/* * */

export function FaresDetailFormContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const { data: me, error: meError, isLoading: meLoading } = useMeData();

	const { mutate: listMutate } = useFaresData();
	const { fareId } = useFaresDetailFareId();
	const { data: fare, error, isLoading, mutate: detailMutate } = useFaresDetailData();

	//
	// B. Setup form

	const { form, isDirty, unblock } = useStandardForm<UpdateFareDto, typeof UpdateFareSchema>({
		apiData: fare,
		schema: UpdateFareSchema,
	});
	const values = useStandardFormWatch({ control: form.control });
	// Check current values: the shared form hook only counts recorded errors.
	const isValid = UpdateFareSchema.safeParse(values).success;

	//
	// C. Handle actions

	const { action: handleUpdateRequest, isLoading: isUpdating } = useHandleAction({
		fetchFn: async (data: UpdateFareDto) => await fetchApiData<Fare>({ body: UpdateFareSchema.parse(data), method: 'PUT', url: API_ROUTES.offer.FARES_DETAIL(fareId) }),
		onSuccess: (response) => {
			form.reset(response.data);
			detailMutate(response, { revalidate: false });
			listMutate();
		},
	});
	const { action: handleLockRequest, isLoading: isLocking } = useHandleAction({
		fetchFn: async () => await fetchApiData<Fare>({ url: API_ROUTES.offer.FARES_DETAIL_LOCK(fareId) }),
		onSuccess: (response) => {
			form.reset(response.data);
			detailMutate(response, { revalidate: false });
			listMutate();
		},
	});
	const { action: handleDeleteRequest, isLoading: isDeleting } = useHandleAction({
		fetchFn: async () => await fetchApiData<undefined>({ method: 'DELETE', url: API_ROUTES.offer.FARES_DETAIL(fareId) }),
		onSuccess: () => {
			form.reset();
			unblock();
			listMutate();
			router.push(keepUrlParams(PAGE_ROUTES.offer.FARES_LIST));
		},
	});

	//
	// D. Setup permissions

	const permissions = getFaresPermissions({
		currentAgencyIds: fare?.agency_ids ?? [],
		selectedAgencyIds: values.agency_ids ?? [],
		userPermissions: me?.permissions,
	});

	//
	// E. Setup capabilities and handlers

	const busy = isUpdating || isLocking || isDeleting;
	const loading = isLoading || meLoading || !fare || !!error || !!meError;

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
			isLocked: fare?.is_locked,
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
	const updateEnabled = standardCapabilities.updateEnabled && !busy;

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

	const stateValue: StandardFormContextValue<UpdateFareDto> = useMemo(() => ({
		actions: {
			delete: handleDelete,
			lock: handleLock,
			update: handleUpdate,
		},
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
			isLocked: fare?.is_locked,
			isLocking,
			isUpdating,
		},
		unblock,
	}), [handleDelete, handleLock, handleUpdate, deleteEnabled, editEnabled, lockEnabled, updateEnabled, form, isDirty, isValid, isDeleting, isLoading, fare?.is_locked, isLocking, isUpdating, unblock]);

	return (
		<FaresDetailFormContext.Provider value={stateValue}>
			{children}
		</FaresDetailFormContext.Provider>
	);
}
