'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Agency, type AgencyPlans, type UpdateAgencyDto, UpdateAgencySchema } from '@tmlmobilidade/go-types-core';
import { type GtfsValidatorRulesDraft } from '@tmlmobilidade/go-types-gtfs-validator';
import { hasPermission } from '@tmlmobilidade/go-types-permissions';
import { type StandardFormContextValue, useMeData, useStandardForm, useStandardFormCapabilities } from '@tmlmobilidade/ui';
import { fetchApiData, useHandleAction, useToast } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useCallback, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useAgenciesListData } from '../list/use-agencies-list-data';
import { getAgenciesDetailValidationRules } from './get-agencies-detail-validation-rules';
import { useAgenciesDetailAgencyId } from './use-agencies-detail-agency-id';
import { useAgenciesDetailData } from './use-agencies-detail-data';

/* * */

type AgenciesDetailFormValues = Omit<UpdateAgencyDto, 'plans'> & {
	plans?: Omit<AgencyPlans, 'validation_rules'> & {
		validation_rules: GtfsValidatorRulesDraft
	}
};

const AgenciesDetailFormContext = createContext<StandardFormContextValue<AgenciesDetailFormValues> | undefined>(undefined);

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

	const { t } = useTranslation();

	const { agencyId } = useAgenciesDetailAgencyId();

	const { data: meData } = useMeData();

	const { mutate: agenciesListMutate } = useAgenciesListData();

	const { data: agencyData, isLoading: agencyDataLoading, mutate: agenciesDetailMutate } = useAgenciesDetailData();

	//
	// B. Setup form

	const agencyFormData = useMemo(() => {
		if (!agencyData?.plans) return agencyData;
		return {
			...agencyData,
			plans: {
				...agencyData.plans,
				validation_rules: getAgenciesDetailValidationRules(agencyData.plans.validation_rules),
			},
		};
	}, [agencyData]);

	const { form, isDirty, isValid, unblock } = useStandardForm<AgenciesDetailFormValues, typeof UpdateAgencySchema>({
		apiData: agencyFormData,
		schema: UpdateAgencySchema,
	});

	//
	// C. Handle actions

	const { action: handleUpdate, isLoading: isUpdating } = useHandleAction<Agency, UpdateAgencyDto>({
		fetchFn: async body => await fetchApiData<Agency>({ body, method: 'PUT', url: API_ROUTES.core.AGENCIES_DETAIL(agencyId) }),
		labels: { error_title: t('default:agencies.detail.validationError') },
		onError: (error) => {
			console.error('Failed to save agency', agencyId, error);
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
			validateOnSubmit: true,
		},
	});

	const handleSave = useCallback(async () => {
		if (!updateEnabled || isUpdating) return;
		const values = form.getValues();
		const result = UpdateAgencySchema.safeParse({
			...values,
			...(values.plans && {
				plans: {
					...values.plans,
					validation_rules: getAgenciesDetailValidationRules(values.plans.validation_rules),
				},
			}),
		});
		if (!result.success) {
			const severityIssues = result.error.issues.filter(issue => issue.path[0] === 'plans' && issue.path[1] === 'validation_rules' && issue.path.at(-1) === 'severity');
			useToast.error({
				message: severityIssues.length
					? severityIssues.map(issue => String(issue.path[2])).join(', ')
					: result.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join('\n'),
				title: t(severityIssues.length ? 'default:agencies.detail.ValidationRules.invalidSeverities' : 'default:agencies.detail.validationError'),
			});
			return;
		}
		await handleUpdate(result.data);
	}, [form, handleUpdate, isUpdating, t, updateEnabled]);

	//
	// E. Return state

	const stateValue: StandardFormContextValue<AgenciesDetailFormValues> = useMemo(() => ({
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
	}), [editEnabled, form, handleSave, isUpdating, agencyDataLoading, unblock, updateEnabled, isDirty, isValid]);

	return (
		<AgenciesDetailFormContext.Provider value={stateValue}>
			{children}
		</AgenciesDetailFormContext.Provider>
	);
}
