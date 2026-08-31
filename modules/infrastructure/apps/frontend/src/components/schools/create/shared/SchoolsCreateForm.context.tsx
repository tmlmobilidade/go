'use client';

import { useSchoolsListData } from '@/components/schools/list/use-schools-list-data';
import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type CreateSchoolDto, CreateSchoolSchema, type School } from '@tmlmobilidade/go-types-operation';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { fetchApiData, keepUrlParams, type StandardFormContextValue, useHandleUpdate, useMeContext, useStandardForm, useStandardFormCapabilities } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

const SchoolsCreateFormContext = createContext<StandardFormContextValue<CreateSchoolDto> | undefined>(undefined);

export function useSchoolsCreateFormContext() {
	const context = useContext(SchoolsCreateFormContext);
	if (!context) throw new Error('useSchoolsCreateFormContext must be used within a SchoolsCreateFormContextProvider');
	return context;
}

/* * */

export function SchoolsCreateFormContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const { t } = useTranslation();

	const meContext = useMeContext();

	const { mutate } = useSchoolsListData();

	//
	// B. Setup form

	const schoolsCreateSchema = useMemo(() => CreateSchoolSchema.extend({
		email: CreateSchoolSchema.shape.email.refine(value => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), t('schools:create.validation.email')),
		postal_code: CreateSchoolSchema.shape.postal_code.regex(/^\d{4}-\d{3}$/, t('schools:create.validation.postal_code')),
		stops: CreateSchoolSchema.shape.stops.refine(value => value.length > 0, t('schools:create.validation.stops')),
	}), [t]);

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

	const { form, isDirty, isValid, unblock } = useStandardForm<CreateSchoolDto, typeof schoolsCreateSchema>({
		defaultValues: formDefaultValues,
		schema: schoolsCreateSchema,
	});

	//
	// C. Handle actions

	const { action: handleCreate, isLoading: isCreating } = useHandleUpdate({
		fetchFn: async () => await fetchApiData<School>({ body: form.getValues(), method: 'POST', url: `${API_ROUTES.infrastructure.BASE}/schools` }),
		onSuccess: ({ data }) => {
			form.reset();
			unblock();
			mutate();
			if (!data?._id) return;
			router.push(keepUrlParams(PAGE_ROUTES.infrastructure.SCHOOLS_DETAIL(data._id)));
		},
	});

	//
	// D. Setup flags

	const hasCreatePermission = useMemo(() => {
		return meContext?.actions.hasPermission(PermissionCatalog.all.schools.scope, PermissionCatalog.all.schools.actions.create);
	}, [meContext]);

	const { createEnabled, editEnabled } = useStandardFormCapabilities({
		create: {
			hasPermission: hasCreatePermission,
			isCreating: isCreating,
		},
		form: {
			isDirty,
			isValid,
		},
	});

	//
	// E. Return context value

	const stateValue: StandardFormContextValue<CreateSchoolDto> = useMemo(() => ({
		actions: {
			create: handleCreate,
		},
		capabilities: {
			createEnabled,
			editEnabled,
		},
		form,
		isDirty,
		isValid,
		status: {
			isCreating,
		},
		unblock,
	}), [createEnabled, editEnabled, form, handleCreate, isCreating, unblock, isDirty, isValid]);

	return (
		<SchoolsCreateFormContext.Provider value={stateValue}>
			{children}
		</SchoolsCreateFormContext.Provider>
	);
}
