'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Agency, type AgencyPlans, type UpdateAgencyDto, UpdateAgencySchema } from '@tmlmobilidade/go-types-core';
import { hasPermission } from '@tmlmobilidade/go-types-permissions';
import { type StandardFormContextValue, useMeData, useStandardForm, useStandardFormCapabilities, useStandardFormWatch } from '@tmlmobilidade/ui';
import { fetchApiData, useHandleAction } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useCallback, useContext, useMemo } from 'react';

import { useAgenciesListData } from '../list/use-agencies-list-data';
import { useAgenciesDetailAgencyId } from './use-agencies-detail-agency-id';
import { useAgenciesDetailData } from './use-agencies-detail-data';

/* * */

interface AgenciesDetailFormContextValue extends StandardFormContextValue<UpdateAgencyDto> {
	validationRules: AgencyPlans['validation_rules']
}

const AgenciesDetailFormContext = createContext<AgenciesDetailFormContextValue | undefined>(undefined);

export function useAgenciesDetailFormContext() {
	const context = useContext(AgenciesDetailFormContext);
	if (!context) throw new Error('useAgenciesDetailFormContext must be used within a AgenciesDetailFormContextProvider');
	return context;
}

/* * */

export function AgenciesDetailFormContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const { agencyId } = useAgenciesDetailAgencyId();

	const { data: meData } = useMeData();

	const { mutate: agenciesListMutate } = useAgenciesListData();

	const { data: agencyData, isLoading: agencyDataLoading, mutate: agenciesDetailMutate } = useAgenciesDetailData();

	//
	// B. Setup form

	const { form, isDirty, isValid, unblock } = useStandardForm<UpdateAgencyDto, typeof UpdateAgencySchema>({
		apiData: agencyData,
		schema: UpdateAgencySchema,
	});

	const validationRules = useStandardFormWatch({ control: form.control, name: 'plans.validation_rules' });

	//
	// C. Handle actions

	const { action: handleUpdate, isLoading: isUpdating } = useHandleAction({
		fetchFn: async () => {
			const body = UpdateAgencySchema.parse(form.getValues());
			return await fetchApiData<Agency>({ body, method: 'PUT', url: API_ROUTES.core.AGENCIES_DETAIL(agencyId) });
		},
		onSuccess: (response) => {
			form.reset(response.data);
			agenciesDetailMutate(response);
			agenciesListMutate();
		},
	});

	//
	// D. Setup flags

	const hasUpdatePermission = useMemo(() => {
		return hasPermission(meData?.permissions, {
			action: 'update',
			scope: 'agencies',
		});
	}, [meData?.permissions]);

	const { editEnabled, updateEnabled } = useStandardFormCapabilities({
		form: {
			isDirty,
			isValid,
		},
		loading: {
			isLoading: agencyDataLoading,
		},
		locked: { isLocked: !hasUpdatePermission },
		update: {
			hasPermission: hasUpdatePermission,
			isUpdating: isUpdating,
		},
	});

	const handleSave = useCallback(async () => {
		if (!updateEnabled || isUpdating || !await form.trigger()) return;
		await handleUpdate();
	}, [form, handleUpdate, isUpdating, updateEnabled]);

	//
	// E. Return state

	const stateValue: AgenciesDetailFormContextValue = useMemo(() => ({
		actions: {
			update: handleSave,
		},
		capabilities: {
			editEnabled,
			updateEnabled,
		},
		form,
		isDirty,
		isValid,
		status: {
			isLoading: agencyDataLoading,
			isUpdating,
		},
		unblock,
		validationRules: validationRules ?? {},
	}), [editEnabled, form, handleSave, isUpdating, agencyDataLoading, unblock, updateEnabled, isDirty, isValid, validationRules]);

	return (
		<AgenciesDetailFormContext.Provider value={stateValue}>
			{children}
		</AgenciesDetailFormContext.Provider>
	);
}
