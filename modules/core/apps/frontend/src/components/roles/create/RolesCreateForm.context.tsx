'use client';

import { CreateRoleDto, CreateRoleSchema } from '@tmlmobilidade/go-types-core';
import { useStandardForm, type UseStandardFormReturnType } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext } from 'react';

/* * */

const RolesCreateFormContext = createContext<undefined | UseStandardFormReturnType<CreateRoleDto>>(undefined);

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

	const { form, isDirty, unblock } = useStandardForm<CreateRoleDto, typeof CreateRoleSchema>({
		schema: CreateRoleSchema,
	});

	//
	// B. Return state

	return (
		<RolesCreateFormContext.Provider value={{ form, isDirty, unblock }}>
			{children}
		</RolesCreateFormContext.Provider>
	);
}
