'use client';

import { type CreateSchoolDto, CreateSchoolSchema } from '@tmlmobilidade/go-types-operation';
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
		address: '',
		agency_id: '',
		district_id: '',
		district_name: '',
		email: '',
		grouping: '',
		locality: '',
		municipality_id: '',
		municipality_name: '',
		name: '',
		nature: '',
		parish_name: '',
		postal_code: '',
		region_id: '',
		region_name: '',
	}), []);

	const { form, unblock } = useStandardForm<CreateSchoolDto, typeof CreateSchoolSchema>({
		defaultValues: formDefaultValues,
		schema: CreateSchoolSchema,
	});

	//
	// C. Return state

	return (
		<SchoolCreateFormContext.Provider value={{ form, unblock }}>
			{children}
		</SchoolCreateFormContext.Provider>
	);
}
