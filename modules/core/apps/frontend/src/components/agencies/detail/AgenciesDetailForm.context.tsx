'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Agency, type UpdateAgencyDto, UpdateAgencySchema } from '@tmlmobilidade/go-types-core';
import { normalizeValidationRules, type ValidationRulesInput } from '@tmlmobilidade/go-types-gtfs-validator';
import { hasPermission } from '@tmlmobilidade/go-types-permissions';
import { type StandardFormContextValue, useMeData, useStandardForm, useStandardFormCapabilities, useStandardFormWatch } from '@tmlmobilidade/ui';
import { fetchApiData, useHandleAction } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';

import { useAgenciesListData } from '../list/use-agencies-list-data';
import { useAgenciesDetailAgencyId } from './use-agencies-detail-agency-id';
import { useAgenciesDetailData } from './use-agencies-detail-data';

/* * */

interface AgenciesDetailFormContextValue extends StandardFormContextValue<UpdateAgencyDto> {
	validationRules: null | ValidationRulesInput
	validationRulesError: null | string
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

	const { form, isDirty: formIsDirty, isValid: formIsValid, unblock } = useStandardForm<UpdateAgencyDto, typeof UpdateAgencySchema>({
		apiData: agencyData,
		schema: UpdateAgencySchema,
	});

	const savedRulesValue = useStandardFormWatch({ control: form.control, name: 'plans.validation_rules' });
	const { hasRulesChanges, validationRules, validationRulesError } = useMemo(() => {
		let validationRules: null | ValidationRulesInput = null;
		try {
			const parsedRules: unknown = typeof savedRulesValue === 'string' ? JSON.parse(savedRulesValue) : savedRulesValue;

			validationRules = normalizeValidationRules(parsedRules, { allowIncomplete: true });
			normalizeValidationRules(parsedRules);

			const hasRulesChanges = JSON.stringify(parsedRules ?? {}) !== JSON.stringify(validationRules);

			return { hasRulesChanges, validationRules, validationRulesError: null };
		} catch (error) {
			return { hasRulesChanges: false, validationRules, validationRulesError: error instanceof Error ? error.message : String(error) };
		}
	}, [savedRulesValue]);
	const isDirty = formIsDirty || hasRulesChanges;
	const isValid = formIsValid && !validationRulesError;

	//
	// C. Handle actions

	const { action: handleUpdate, isLoading: isUpdating } = useHandleAction({
		fetchFn: async () => {
			const values = form.getValues();
			const body = {
				...values,
				...(values.plans && { plans: { ...values.plans, validation_rules: normalizeValidationRules(values.plans.validation_rules) } }),
			};
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
		update: {
			hasPermission: hasUpdatePermission,
			isUpdating: isUpdating,
		},
	});

	//
	// E. Return state

	const stateValue: AgenciesDetailFormContextValue = useMemo(() => ({
		actions: {
			update: handleUpdate,
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
		validationRules,
		validationRulesError,
	}), [editEnabled, form, handleUpdate, isUpdating, agencyDataLoading, unblock, updateEnabled, isDirty, isValid, validationRules, validationRulesError]);

	return (
		<AgenciesDetailFormContext.Provider value={stateValue}>
			{children}
		</AgenciesDetailFormContext.Provider>
	);
}
