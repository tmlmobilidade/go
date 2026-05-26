'use client';

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { PermissionCatalog, type Typology, type UpdateTypologyDto, UpdateTypologySchema } from '@tmlmobilidade/types';
import { DetailContextStateTemplate, keepUrlParams, useDetailState, type UseFormReturnType, useHandleUpdate, useMeContext, useTypicalForm } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface TypologyDetailContextState {
	actions: DetailContextStateTemplate['actions']
	data: {
		form: UseFormReturnType<UpdateTypologyDto>
		id: string
		typology: null | Typology
	}
	flags: DetailContextStateTemplate['flags']
}

/* * */

const TypologyDetailContext = createContext<TypologyDetailContextState | undefined>(undefined);

export function useTypologyDetailContext() {
	const context = useContext(TypologyDetailContext);
	if (!context) {
		throw new Error('useTypologyDetailContext must be used within a TypologyDetailContextProvider');
	}
	return context;
}

/* * */

export const TypologyDetailContextProvider = ({ children, typologyId }: PropsWithChildren<{ typologyId: string }>) => {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const meContext = useMeContext();

	//
	// B. Fetch data

	const { mutate: typologiesListMutate } = useSWR<Typology[]>(API_ROUTES.offer.TYPOLOGIES_LIST);
	const { data: typologyData, error: typologyError, isLoading: typologyLoading, mutate: typologyMutate } = useSWR<Typology>(API_ROUTES.offer.TYPOLOGIES_DETAIL(typologyId));

	//
	// C. Setup form

	const { form } = useTypicalForm<UpdateTypologyDto>(UpdateTypologySchema, typologyData);

	//
	// D. Handle actions

	const { action: handleSave, isLoading: isSaving } = useHandleUpdate({
		fetchFn: async () => await fetchData<Typology>(API_ROUTES.offer.TYPOLOGIES_DETAIL(typologyId), 'PUT', form.getValues()),
		onSuccess: (updatedItem) => {
			form.resetDirty();
			typologyMutate(updatedItem);
			typologiesListMutate();
		},
	});

	const { action: handleDelete, isLoading: isDeleting } = useHandleUpdate({
		fetchFn: async () => await fetchData<Typology>(API_ROUTES.offer.TYPOLOGIES_DETAIL(typologyId), 'DELETE', typologyData),
		onSuccess: () => {
			form.resetDirty();
			typologiesListMutate();
			router.push(keepUrlParams(PAGE_ROUTES.offer.TYPOLOGIES_LIST));
		},
	});

	const { action: handleLock, isLoading: isLocking } = useHandleUpdate({
		fetchFn: async () => await fetchData<Typology>(API_ROUTES.offer.TYPOLOGIES_DETAIL_LOCK(typologyId)),
		onSuccess: (updatedItem) => {
			form.resetDirty();
			typologyMutate(updatedItem);
			typologiesListMutate();
		},
	});

	//
	// E. Setup permissions

	// For read permission, user needs access to at least ONE agency (requireAll: false)
	const viewPermissions = meContext.actions.getScopePermissions({
		actions: PermissionCatalog.all.typologies.actions,
		resource: {
			key: 'agency_ids',
			requireAll: false,
			value: typologyData?.agency_ids ?? [],
		},
		scope: PermissionCatalog.all.typologies.scope,
	});

	// For update/delete/lock permissions, user needs access to ALL agencies (requireAll: true)
	const editPermissions = meContext.actions.getScopePermissions({
		actions: PermissionCatalog.all.typologies.actions,
		resource: {
			key: 'agency_ids',
			requireAll: true,
			value: typologyData?.agency_ids ?? [],
		},
		scope: PermissionCatalog.all.typologies.scope,
	});

	const permissions = useMemo(() => ({
		delete: editPermissions.delete,
		lock: editPermissions.lock,
		read: viewPermissions.read,
		update: editPermissions.update,
	}), [editPermissions, viewPermissions]);

	const { canDelete, canLock, canSave, isReadOnly } = useDetailState({
		hasError: !!typologyError,
		isDeleted: null,
		isDeleting,
		isDirty: form.isDirty(),
		isLoading: typologyLoading,
		isLocked: typologyData?.is_locked,
		isLocking,
		isSaving: isSaving,
		isValid: form.isValid(),
		permissions: {
			delete: permissions.delete,
			lock: permissions.lock,
			read: permissions.read,
			update: permissions.update,
		},
	});

	//
	// F. Define context value

	const contextValue: TypologyDetailContextState = useMemo(() => ({
		actions: {
			delete: handleDelete,
			lock: handleLock,
			save: handleSave,
		},
		data: {
			form,
			id: typologyId,
			typology: typologyData,
		},
		flags: {
			canDelete,
			canLock,
			canSave,
			error: typologyError,
			isDeleting,
			isLoading: typologyLoading,
			isLocking,
			isReadOnly,
			isSaving: isSaving,
		},
	}), [
		typologyData,
		typologyError,
		typologyLoading,
		typologyId,
		form,
		isSaving,
	]);

	//
	// G. Render components

	return (
		<TypologyDetailContext.Provider value={contextValue}>
			{children}
		</TypologyDetailContext.Provider>
	);

	//
};
