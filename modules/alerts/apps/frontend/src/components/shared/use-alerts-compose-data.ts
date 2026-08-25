'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { AlertsComposeRequest, AlertsComposeResponse } from '@tmlmobilidade/go-alerts-pckg-types';
import { type ApiResponse, type UnixTimestamp } from '@tmlmobilidade/go-types-shared';
import { useDebouncedValue, useStandardFormWatch } from '@tmlmobilidade/ui';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

import { useAlertsCreateFormContext } from '../create/shared/AlertsCreateForm.context';

/* * */

interface UseAlertsComposeDataReturnType {
	data: AlertsComposeResponse
	error: null | string
	isLoading: boolean
	isValidating: boolean
	timestamp: null | UnixTimestamp
}

/* * */

export function useAlertsComposeData(): UseAlertsComposeDataReturnType {
	//

	//
	// A. Setup variables

	const { form: alertsCreateForm } = useAlertsCreateFormContext();

	const agencyIdValue = useStandardFormWatch({ control: alertsCreateForm.control, name: 'agency_id' });
	const activePeriodEndDateValue = useStandardFormWatch({ control: alertsCreateForm.control, name: 'active_period_end_date' });
	const activePeriodStartDateValue = useStandardFormWatch({ control: alertsCreateForm.control, name: 'active_period_start_date' });
	const causeValue = useStandardFormWatch({ control: alertsCreateForm.control, name: 'cause' });
	const effectValue = useStandardFormWatch({ control: alertsCreateForm.control, name: 'effect' });
	const referenceTypeValue = useStandardFormWatch({ control: alertsCreateForm.control, name: 'reference_type' });
	const referencesValue = useStandardFormWatch({ control: alertsCreateForm.control, name: 'references' });
	const userInstructionsValue = useStandardFormWatch({ control: alertsCreateForm.control, name: 'user_instructions' });

	const [debouncedUserInstructions] = useDebouncedValue(userInstructionsValue, 1_000, { leading: false });

	//
	// B. Transform data

	const requestBody = useMemo<AlertsComposeRequest>(() => ({
		active_period_end_date: activePeriodEndDateValue,
		active_period_start_date: activePeriodStartDateValue,
		agency_id: agencyIdValue,
		cause: causeValue,
		effect: effectValue,
		reference_type: referenceTypeValue,
		references: referencesValue,
		user_instructions: debouncedUserInstructions,
	}), [agencyIdValue, activePeriodEndDateValue, activePeriodStartDateValue, causeValue, effectValue, referenceTypeValue, referencesValue, debouncedUserInstructions]);

	//
	// C. Fetch data

	const { data, error, isLoading, isValidating } = useSWR<ApiResponse<AlertsComposeResponse>>([API_ROUTES.alerts.ALERTS_COMPOSE, requestBody], {
		fetcher: async ([url, requestBody]) => await fetchApiData<AlertsComposeResponse>({ body: requestBody, method: 'POST', url }),
		refreshInterval: 0, // Disabled
		revalidateIfStale: false,
		revalidateOnFocus: false,
		revalidateOnReconnect: false,
	});

	//
	// D. Return data

	return useMemo(() => ({
		data: data?.data,
		error: error?.error,
		isLoading,
		isValidating,
		timestamp: data?.timestamp,
	}), [data, error, isLoading, isValidating]);
};
