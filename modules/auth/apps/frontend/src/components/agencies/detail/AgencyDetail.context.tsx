'use client';

/* * */

import { API_ROUTES } from '@tmlmobilidade/consts';
import { Agency, PermissionCatalog, UpdateAgencyDto, UpdateAgencySchema } from '@tmlmobilidade/types';
import { type DetailContextStateTemplate, useFlagCanLock, useFlagCanSave, useFlagReadOnly, type UseFormReturnType, useHandleUpdate, useMeContext, useTypicalForm } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { createContext, PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface AgencyDetailContextState extends DetailContextStateTemplate {
	data: {
		agency: Agency | null
		form: UseFormReturnType<UpdateAgencyDto>
		id: string
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

	const { form } = useTypicalForm<UpdateAgencyDto>(UpdateAgencySchema, agencyData);

	//
	// D. Handle actions

	const { action: handleSave, isLoading: isSaving } = useHandleUpdate({
		fetchFn: async () => await fetchData<Agency>(API_ROUTES.auth.AGENCIES_DETAIL(agencyId), 'PUT', form.getValues()),
		onSuccess: (updatedItem) => {
			form.resetDirty();
			agencyMutate(updatedItem);
			allAgenciesMutate();
		},
	});

	const { action: handleLock, isLoading: isLocking } = useHandleUpdate({
		fetchFn: async () => await fetchData<Agency>(API_ROUTES.auth.AGENCIES_DETAIL_LOCK(agencyId)),
		onSuccess: (updatedItem) => {
			form.resetDirty();
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
		isDirty: form.isDirty(),
		isLoading: agencyLoading,
		isLocked: agencyData?.is_locked,
		isLocking: isLocking,
		isValid: form.isValid(),
	});

	const { canLock } = useFlagCanLock({
		hasPermission: meContext.actions.hasPermission(PermissionCatalog.all.agencies.scope, PermissionCatalog.all.agencies.actions.update),
		isDirty: form.isDirty(),
		isLoading: agencyLoading,
		isLocking: isLocking,
		isValid: form.isValid(),
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
			form,
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
	}), [
		canLock,
		canSave,
		agencyError,
		agencyLoading,
		isLocking,
		isReadOnly,
		isSaving,
		form,
		agencyData,
		agencyId,
	]);

	//
	// F. Render components

	return (
		<AgencyDetailContext.Provider value={contextValue}>
			{children}
		</AgencyDetailContext.Provider>
	);

	//
};
