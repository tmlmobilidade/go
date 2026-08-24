'use client';

import { type CreateSchoolDto, CreateSchoolSchema } from '@tmlmobilidade/go-types-operation';
import { useStandardForm, type UseStandardFormReturnType } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export type UseSchoolCreateFormReturnType = UseStandardFormReturnType<CreateSchoolDto>;

/* * */

export function useSchoolsCreateForm(): UseSchoolCreateFormReturnType {
	//

	//
	// A. Setup form

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

	const { form, isDirty, unblock } = useStandardForm<CreateSchoolDto, typeof CreateSchoolSchema>({
		defaultValues: formDefaultValues,
		schema: CreateSchoolSchema,
	});

	//
	// B. Return state

	return { form, isDirty, unblock };
}
