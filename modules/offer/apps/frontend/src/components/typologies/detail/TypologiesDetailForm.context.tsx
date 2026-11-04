'use client';

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type Typology, type UpdateTypologyDto, UpdateTypologySchema } from '@tmlmobilidade/go-types-offer';
import { fetchApiData, keepUrlParams, type StandardFormContextValue, useHandleAction, useMeData, useStandardForm, useStandardFormCapabilities, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useCallback, useContext, useMemo } from 'react';

import { getTypologiesPermissions } from '../shared/typologies-permissions';
import { useTypologiesData } from '../shared/use-typologies-data';
import { useTypologiesDetailData } from './use-typologies-detail-data';
import { useTypologiesDetailTypologyId } from './use-typologies-detail-typology-id';

/* * */

const TypologiesDetailFormContext = createContext<StandardFormContextValue<UpdateTypologyDto> | undefined>(undefined);

/* * */

export function useTypologiesDetailFormContext() {
	const context = useContext(TypologiesDetailFormContext);
	if (!context) throw new Error('useTypologiesDetailFormContext must be used within TypologiesDetailFormContextProvider');
	return context;
}

/* * */

export function TypologiesDetailFormContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const { data: me, error: meError, isLoading: meLoading } = useMeData();

	const { mutate: listMutate } = useTypologiesData();
	const { typologyId } = useTypologiesDetailTypologyId();
	const { data: typology, error, isLoading, mutate: detailMutate } = useTypologiesDetailData();

	//
	// B. Setup form

	const { form, isDirty, unblock } = useStandardForm<UpdateTypologyDto, typeof UpdateTypologySchema>({
		apiData: typology,
		schema: UpdateTypologySchema,
	});
	const values = useStandardFormWatch({ control: form.control });
	// Check current values: the shared form hook only counts recorded errors.
	const isValid = UpdateTypologySchema.safeParse(values).success;

	//
	// C. Handle actions

	const { action: handleUpdateRequest, isLoading: isUpdating } = useHandleAction({
		fetchFn: async (data: UpdateTypologyDto) => await fetchApiData<Typology>({ body: UpdateTypologySchema.parse(data), method: 'PUT', url: API_ROUTES.offer.TYPOLOGIES_DETAIL(typologyId) }),
		onSuccess: (response) => {
			form.reset(response.data);
			detailMutate(response, { revalidate: false });
			listMutate();
		},
	});
	const { action: handleLockRequest, isLoading: isLocking } = useHandleAction({
		fetchFn: async () => await fetchApiData<Typology>({ url: API_ROUTES.offer.TYPOLOGIES_DETAIL_LOCK(typologyId) }),
		onSuccess: (response) => {
			form.reset(response.data);
			detailMutate(response, { revalidate: false });
			listMutate();
		},
	});
	const { action: handleDeleteRequest, isLoading: isDeleting } = useHandleAction({
		fetchFn: async () => await fetchApiData<undefined>({ method: 'DELETE', url: API_ROUTES.offer.TYPOLOGIES_DETAIL(typologyId) }),
		onSuccess: () => {
			form.reset();
			unblock();
			listMutate();
			router.push(keepUrlParams(PAGE_ROUTES.offer.TYPOLOGIES_LIST));
		},
	});

	//
	// D. Setup permissions

	const permissions = getTypologiesPermissions({
		currentAgencyIds: typology?.agency_ids ?? [],
		selectedAgencyIds: values.agency_ids ?? [],
		userPermissions: me?.permissions,
	});

	//
	// E. Setup capabilities and handlers

	const busy = isUpdating || isLocking || isDeleting;
	const loading = isLoading || meLoading || !typology || !!error || !!meError;

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
			isLocked: typology?.is_locked,
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

	const stateValue: StandardFormContextValue<UpdateTypologyDto> = useMemo(() => ({
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
			isLocked: typology?.is_locked,
			isLocking,
			isUpdating,
		},
		unblock,
	}), [handleDelete, handleLock, handleUpdate, deleteEnabled, editEnabled, lockEnabled, updateEnabled, form, isDirty, isValid, isDeleting, isLoading, typology?.is_locked, isLocking, isUpdating, unblock]);

	return (
		<TypologiesDetailFormContext.Provider value={stateValue}>
			{children}
		</TypologiesDetailFormContext.Provider>
	);
}
