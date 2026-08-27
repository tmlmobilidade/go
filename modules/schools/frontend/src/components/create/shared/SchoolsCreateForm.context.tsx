'use client';

import { type CreateSchoolDto, CreateSchoolSchema } from '@tmlmobilidade/go-types-operation';
import { ErrorDisplay, useStandardForm, type UseStandardFormReturnType, useStandardFormWatch } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo } from 'react';

import { useSchoolsAgenciesData } from '../../shared/use-schools-agencies-data';

/* * */

const SchoolsCreateFormContext = createContext<undefined | UseStandardFormReturnType<CreateSchoolDto>>(undefined);

export function useSchoolsCreateFormContext() {
	const context = useContext(SchoolsCreateFormContext);
	if (!context) throw new Error('useSchoolsCreateFormContext must be used within a SchoolsCreateFormContextProvider');
	return context;
}

/* * */

export function SchoolsCreateFormContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup form

	const formDefaultValues = useMemo<Partial<CreateSchoolDto>>(() => ({
		address: '',
		agency_id: '',
		artistic: false,
		basic_1: false,
		basic_2: false,
		basic_3: false,
		code: '',
		coordinates: null,
		district_id: '',
		district_name: '',
		email: '',
		grouping: '',
		high_school: false,
		is_active: false,
		is_deleted: false,
		is_locked: false,
		locality: '',
		municipality_id: '',
		municipality_name: '',
		name: '',
		nature: '',
		other: false,
		parish_name: '',
		postal_code: '',
		pre_school: false,
		professional: false,
		publish_status: 'draft',
		region_id: '',
		region_name: '',
		special: false,
		stops: [],
		university: false,
		url: '',
		validation_date: null,
	}), []);

	const { form, isDirty, isValid, unblock } = useStandardForm<CreateSchoolDto, typeof CreateSchoolSchema>({
		defaultValues: formDefaultValues,
		schema: CreateSchoolSchema,
	});

	const agencyIdValue = useStandardFormWatch({ control: form.control, name: 'agency_id' });

	//
	// C. Fetch data

	const { data: agenciesData } = useSchoolsAgenciesData({
		permissions: {
			actions: ['create'],
			scope: 'schools',
		},
	});

	//
	// D. Side effects

	/**
	 * Auto-select "agency_id" when only one agency is available.
	 */
	useEffect(() => {
		// Skip if no agencies are available
		if (!agenciesData?.length) return;
		// Skip if more than one agency is available
		if (agenciesData?.length !== 1) return;
		// Skip if "agency_id" is already set
		if (agencyIdValue) return;
		// Auto-select "agency_id"
		form.setValue('agency_id', agenciesData[0]._id, { shouldDirty: false });
		// eslint-disable-next-line no-console
		console.log('[Form] Auto-selected "agency_id" based on available agencies data.');
	}, [agenciesData, agencyIdValue, form]);

	//
	// H. Return state

	if (!agenciesData?.length) {
		return <ErrorDisplay message="Não há agências disponíveis" />;
	}

	return (
		<SchoolsCreateFormContext.Provider value={{ form, isDirty, isValid, unblock }}>
			{children}
		</SchoolsCreateFormContext.Provider>
	);
}
