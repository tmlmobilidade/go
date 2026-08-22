'use client';

import { CreateOrganizationSchema } from '@tmlmobilidade/go-types-core';
import { useStandardForm, type UseStandardFormReturnType } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext } from 'react';

/* * */

const OrganizationsCreateFormContext = createContext<undefined | UseStandardFormReturnType<typeof CreateOrganizationSchema>>(undefined);

export function useOrganizationsCreateFormContext() {
	const context = useContext(OrganizationsCreateFormContext);
	if (!context) throw new Error('useOrganizationsCreateFormContext must be used within a OrganizationsCreateFormContextProvider');
	return context;
}

/* * */

export function OrganizationsCreateFormContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup form

	const { form, unblock } = useStandardForm<typeof CreateOrganizationSchema>({
		schema: CreateOrganizationSchema,
	});

	//
	// B. Return state

	return (
		<OrganizationsCreateFormContext.Provider value={{ form, unblock }}>
			{children}
		</OrganizationsCreateFormContext.Provider>
	);
}
