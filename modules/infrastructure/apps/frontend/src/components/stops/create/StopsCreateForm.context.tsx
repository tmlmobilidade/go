'use client';

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type StopsCreateRequest, StopsCreateRequestSchema } from '@tmlmobilidade/go-infrastructure-pckg-types';
import { type Stop } from '@tmlmobilidade/go-types-infrastructure';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { fetchApiData, keepUrlParams, type StandardFormContextValue, useHandleAction, useStandardForm, useStandardFormCapabilities, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useStopsAgenciesData } from '../shared/use-stops-agencies-data';
import { closeStopsCreateModal } from './StopsCreate.modal';

/* * */

interface StopsCreateFormContextValue extends StandardFormContextValue<StopsCreateRequest> {
	agencies: ReturnType<typeof useStopsAgenciesData>
	agenciesValid: boolean
}

/* * */

const StopsCreateFormContext = createContext<StopsCreateFormContextValue | undefined>(undefined);

export function useStopsCreateFormContext() {
	const context = useContext(StopsCreateFormContext);
	if (!context) throw new Error('useStopsCreateFormContext must be used within a StopsCreateFormContextProvider');
	return context;
}

/* * */

export function StopsCreateFormContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const { t } = useTranslation();

	const agencies = useStopsAgenciesData({
		permissions: { actions: [PermissionCatalog.all.stops.actions.create], scope: PermissionCatalog.all.stops.scope },
	});

	//
	// B. Setup form

	const formDefaultValues = useMemo<StopsCreateRequest>(() => ({
		agency_ids: [],
		latitude: undefined,
		longitude: undefined,
		name: '',
	}), []);

	const { form, isDirty, isValid, unblock } = useStandardForm<StopsCreateRequest, typeof StopsCreateRequestSchema>({
		defaultValues: formDefaultValues,
		schema: StopsCreateRequestSchema,
	});

	const agencyIds = useStandardFormWatch({ control: form.control, name: 'agency_ids' });
	const agenciesReady = !agencies.isLoading && !agencies.error && !!agencies.data && agencies.ids.length > 0;
	const agenciesValid = agenciesReady && !!agencyIds?.length && agencyIds.every(id => agencies.ids.includes(id));

	useEffect(() => {
		if (!agenciesReady) return;
		const currentIds = form.getValues('agency_ids');
		const nextIds = agencies.ids.length === 1 ? agencies.ids : currentIds.filter(id => agencies.ids.includes(id));
		if (JSON.stringify(currentIds) === JSON.stringify(nextIds)) return;
		form.setValue('agency_ids', nextIds, { shouldDirty: true, shouldValidate: true });
	}, [agenciesReady, agencies.ids, form]);

	//
	// C. Handle actions

	const { action: handleCreate, isLoading: isCreating } = useHandleAction({
		fetchFn: async () => {
			if (!agenciesValid) throw new Error(t('default:stops.create.StepNames.fields.agency_ids.required'));
			return await fetchApiData<Stop>({ body: form.getValues(), method: 'POST', url: API_ROUTES.infrastructure.STOPS_CREATE });
		},
		onSuccess: (response) => {
			form.reset();
			unblock();
			closeStopsCreateModal();
			router.push(keepUrlParams(PAGE_ROUTES.infrastructure.STOPS_DETAIL(String(response.data._id))));
		},
	});

	//
	// D. Setup flags

	const { createEnabled, editEnabled } = useStandardFormCapabilities({
		create: {
			hasPermission: agenciesValid,
			isCreating,
		},
		form: {
			isDirty,
			isValid,
		},
	});

	//
	// E. Return state

	const stateValue: StopsCreateFormContextValue = useMemo(() => ({
		actions: {
			create: handleCreate,
		},
		agencies,
		agenciesValid,
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
	}), [agencies, agenciesValid, handleCreate, createEnabled, editEnabled, form, isDirty, isValid, isCreating, unblock]);

	return (
		<StopsCreateFormContext.Provider value={stateValue}>
			{children}
		</StopsCreateFormContext.Provider>
	);
}
