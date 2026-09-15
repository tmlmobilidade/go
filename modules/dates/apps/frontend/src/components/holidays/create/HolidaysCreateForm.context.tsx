'use client';

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type CreateHolidayDto, CreateHolidaySchema, type Holiday } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { fetchApiData, keepUrlParams, type StandardFormContextValue, useHandleAction, useMeData, useStandardForm, useStandardFormCapabilities } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';

import { useHolidaysListData } from '../list/use-holidays-list-data';
import { closeHolidaysCreateModal } from './HolidaysCreate.modal';

/* * */

const HolidaysCreateFormContext = createContext<StandardFormContextValue<CreateHolidayDto> | undefined>(undefined);

export function useHolidaysCreateFormContext() {
	const context = useContext(HolidaysCreateFormContext);
	if (!context) throw new Error('useHolidaysCreateFormContext must be used within a HolidaysCreateFormContextProvider');
	return context;
}

/* * */

export function HolidaysCreateFormContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const { data: meData } = useMeData();

	const { mutate: holidaysListMutate } = useHolidaysListData();

	//
	// B. Setup form

	const { form, isDirty, isValid, unblock } = useStandardForm<CreateHolidayDto, typeof CreateHolidaySchema>({
		schema: CreateHolidaySchema,
	});

	//
	// C. Handle actions

	const { action: handleCreate, isLoading: isCreating } = useHandleAction({
		fetchFn: async () => await fetchApiData<Holiday>({ body: form.getValues(), method: 'POST', url: API_ROUTES.dates.HOLIDAYS_LIST }),
		onSuccess: ({ data }) => {
			closeHolidaysCreateModal();
			form.reset();
			unblock();
			holidaysListMutate();
			if (!data?._id) return;
			router.push(keepUrlParams(PAGE_ROUTES.dates.HOLIDAYS_DETAIL(data._id)));
		},
	});

	//
	// D. Setup flags

	const hasCreatePermission = useMemo(() => {
		return PermissionCatalog.hasPermission(meData?.permissions ?? [], PermissionCatalog.all.holidays.scope, PermissionCatalog.all.holidays.actions.create);
	}, [meData?.permissions]);

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
	// E. Return state

	const stateValue: StandardFormContextValue<CreateHolidayDto> = useMemo(() => ({
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
	}), [createEnabled, editEnabled, form, handleCreate, isCreating, isDirty, isValid, unblock]);

	return (
		<HolidaysCreateFormContext.Provider value={stateValue}>
			{children}
		</HolidaysCreateFormContext.Provider>
	);
}
