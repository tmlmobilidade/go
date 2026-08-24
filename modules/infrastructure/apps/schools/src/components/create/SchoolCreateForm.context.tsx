'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type CreateSchoolDto, CreateSchoolSchema } from '@tmlmobilidade/go-types-operation';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { useStandardForm, type UseStandardFormReturnType } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';

/* * */

const SchoolCreateFormContext = createContext<undefined | UseStandardFormReturnType<CreateSchoolDto>>(undefined);

export function useSchoolCreateFormContext() {
	const context = useContext(SchoolCreateFormContext);
	if (!context) throw new Error('useSchoolCreateFormContext must be used within a SchoolCreateFormContextProvider');
	return context;
}

/* * */

export function SchoolCreateFormContextProvider({ children }: PropsWithChildren) {
	//

	//
	// B. Setup form

	const formDefaultValues = useMemo<Partial<CreateSchoolDto>>(() => ({

	}), []);

	const { form, unblock } = useStandardForm<CreateSchoolDto>({
		defaultValues: formDefaultValues,
		schema: CreateSchoolSchema,
	});

	//
	// C. Fetch data

	const { filtered: schoolsData } = useSchoolsListData(API_ROUTES.schools.SCHOOLS_LIST, {
		actions: [PermissionCatalog.all.schools.actions.create],
		scope: PermissionCatalog.all.schools.scope,
	});

	//
	// D. Return state

	if (!schoolsData?.length) return null;

	return (
		<SchoolCreateFormContext.Provider value={{ form, unblock }}>
			{children}
		</SchoolCreateFormContext.Provider>
	);
}
