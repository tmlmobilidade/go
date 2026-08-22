'use client';

import { type CreateOrganizationDto, CreateOrganizationSchema } from '@tmlmobilidade/go-types-core';
import { useContextForm, type UseContextFormReturnType } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';

/* * */

const OrganizationsCreateFormContext = createContext<undefined | UseContextFormReturnType<CreateOrganizationDto>>(undefined);

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

	const formDefaultValues = useMemo<Partial<CreateOrganizationDto>>(() => CreateOrganizationSchema.parse({}), []);

	const { form, unblock } = useContextForm<CreateOrganizationDto>({
		defaultValues: formDefaultValues,
		// schema: CreateOrganizationSchema,
	});

	//
	// B. Return state

	return (
		<OrganizationsCreateFormContext.Provider value={{ form, unblock }}>
			{children}
		</OrganizationsCreateFormContext.Provider>
	);
}
