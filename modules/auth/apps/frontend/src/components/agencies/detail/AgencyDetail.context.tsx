'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Agency, PermissionCatalog, type UpdateAgencyDto } from '@tmlmobilidade/types';
import { type DetailContextStateTemplate, useContextForm, useFlagCanLock, useFlagCanSave, useFlagReadOnly, useHandleUpdate, useMeContext } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface AgencyDetailContextState extends DetailContextStateTemplate<UpdateAgencyDto> {
	data: {
		agency: Agency | undefined
		id: string | undefined
	}
}

/* * */

const AgencyDetailContext = createContext<AgencyDetailContextState | undefined>(undefined);

export function useAgencyDetailContext() {
	const context = useContext(AgencyDetailContext);
	if (!context) {
		throw new Error('useAgencyDetailContext must be used within a AgencyDetailContextProvider');
	}
	return context;
}

/* * */

export const AgencyDetailContextProvider = ({ agencyId, children }: PropsWithChildren<{ agencyId: string }>) => {
	//

	//
	// A. Setup variables

	const meContext = useMeContext();

	//
	// B. Fetch data

	const { mutate: allAgenciesMutate } = useSWR<Agency>(API_ROUTES.auth.AGENCIES_LIST);
	const { data: agencyData, error: agencyError, isLoading: agencyLoading, mutate: agencyMutate } = useSWR<Agency>(API_ROUTES.auth.AGENCIES_DETAIL(agencyId));

	//
	// C. Setup form

	const { form } = useContextForm<UpdateAgencyDto>({
		apiData: agencyData,
		// schema: UpdateAgencySchema,
	});

	//
	// D. Handle actions

	const { action: handleSave, isLoading: isSaving } = useHandleUpdate({
		fetchFn: async () => await fetchData<Agency>(API_ROUTES.auth.AGENCIES_DETAIL(agencyId), 'PUT', form.getValues()),
		onSuccess: (updatedItem) => {
			form.reset(updatedItem);
			agencyMutate(updatedItem);
			allAgenciesMutate();
		},
	});

	const { action: handleLock, isLoading: isLocking } = useHandleUpdate({
		fetchFn: async () => await fetchData<Agency>(API_ROUTES.auth.AGENCIES_DETAIL_LOCK(agencyId)),
		onSuccess: (updatedItem) => {
			form.reset(updatedItem);
			agencyMutate(updatedItem);
			allAgenciesMutate();
		},
	});

	//
	// E. Setup flags

	const { isReadOnly } = useFlagReadOnly({
		hasPermission: meContext.actions.hasPermission(PermissionCatalog.all.agencies.scope, PermissionCatalog.all.agencies.actions.update),
		isLoading: agencyLoading,
		isLocked: agencyData?.is_locked,
		isLocking: isLocking,
		isSaving: isSaving,
	});

	const { canSave } = useFlagCanSave({
		hasPermission: meContext.actions.hasPermission(PermissionCatalog.all.agencies.scope, PermissionCatalog.all.agencies.actions.update),
		isDirty: Object.keys(form.formState.dirtyFields).length > 0,
		isLoading: agencyLoading,
		isLocked: agencyData?.is_locked,
		isLocking: isLocking,
		isValid: form.formState.isValid,
	});

	const { canLock } = useFlagCanLock({
		hasPermission: meContext.actions.hasPermission(PermissionCatalog.all.agencies.scope, PermissionCatalog.all.agencies.actions.update),
		isDirty: Object.keys(form.formState.dirtyFields).length > 0,
		isLoading: agencyLoading,
		isLocking: isLocking,
		isValid: form.formState.isValid,
	});

	//
	// E. Define context value

	const contextValue: AgencyDetailContextState = useMemo(() => ({
		actions: {
			lock: handleLock,
			save: handleSave,
		},
		data: {
			agency: agencyData,
			id: agencyId,
		},
		flags: {
			canLock,
			canSave,
			error: agencyError,
			isLoading: agencyLoading,
			isLocking,
			isReadOnly,
			isSaving,
		},
		form: {
			instance: form,
		},
	}), [handleLock, handleSave, agencyData, agencyId, canLock, canSave, agencyError, agencyLoading, isLocking, isReadOnly, isSaving, form]);

	//
	// F. Render components

	return (
		<AgencyDetailContext.Provider value={contextValue}>
			{children}
		</AgencyDetailContext.Provider>
	);

	//
};
