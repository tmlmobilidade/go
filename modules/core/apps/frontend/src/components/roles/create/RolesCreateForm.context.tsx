'use client';

import { type CreateRoleDto, CreateRoleSchema } from '@tmlmobilidade/go-types-core';
import { useContextForm, type UseContextFormReturnType } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';

/* * */

const RolesCreateFormContext = createContext<undefined | UseContextFormReturnType<CreateRoleDto>>(undefined);

export function useRolesCreateFormContext() {
	const context = useContext(RolesCreateFormContext);
	if (!context) throw new Error('useRolesCreateFormContext must be used within a RolesCreateFormContextProvider');
	return context;
}

/* * */

export function RolesCreateFormContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup form

	const formDefaultValues = useMemo<Partial<CreateRoleDto>>(() => CreateRoleSchema.parse({}), []);

	const { form, unblock } = useContextForm<CreateRoleDto>({
		defaultValues: formDefaultValues,
		// schema: CreateRoleSchema,
	});

	//
	// B. Return state

	return (
		<RolesCreateFormContext.Provider value={{ form, unblock }}>
			{children}
		</RolesCreateFormContext.Provider>
	);
}
