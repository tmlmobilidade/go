'use client';

import { type CreateSchoolDto, CreateSchoolSchema } from '@tmlmobilidade/go-types-operation';
import { useStandardForm, type UseStandardFormReturnType } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';

/* * */

const SchoolsCreateSchema = CreateSchoolSchema.extend({
	email: CreateSchoolSchema.shape.email.refine(value => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), 'Email inválido'),
	postal_code: CreateSchoolSchema.shape.postal_code.regex(/^\d{4}-\d{3}$/, 'Código postal inválido'),
	stops: CreateSchoolSchema.shape.stops.refine(value => value.length > 0, 'Selecione pelo menos uma paragem'),
});

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
		is_active: true,
		is_deleted: false,
		is_locked: false,
		locality: '',
		municipality_id: '',
		municipality_name: '',
		name: '',
		nature: '',
		other: false,
		parish_name: '',
		period_organization: 'semester',
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

	const { form, isDirty, isValid, unblock } = useStandardForm<CreateSchoolDto, typeof SchoolsCreateSchema>({
		defaultValues: formDefaultValues,
		schema: SchoolsCreateSchema,
	});

	return (
		<SchoolsCreateFormContext.Provider value={{ form, isDirty, isValid, unblock }}>
			{children}
		</SchoolsCreateFormContext.Provider>
	);
}
