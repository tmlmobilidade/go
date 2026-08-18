'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type AlertsDescribeRequest, type AlertsDescribeResponse } from '@tmlmobilidade/go-alerts-pckg-types';
import { type ApiResponse, type UnixTimestamp } from '@tmlmobilidade/go-types-shared';
import { useContextFormWatch } from '@tmlmobilidade/ui';
import { fetchDataNew } from '@tmlmobilidade/utils';
import { useMemo } from 'react';
import useSWR from 'swr';

import { useAlertsCreateFormContext } from '../../shared/AlertsCreateForm.context';

/* * */

interface UseAlertsDescribeDataReturnType {
	data: AlertsDescribeResponse
	error: null | string
	isLoading: boolean
	isValidating: boolean
	timestamp: null | UnixTimestamp
}

/* * */

export function useAlertsDescribeData(): UseAlertsDescribeDataReturnType {
	//

	//
	// A. Setup variables

	const { form: alertsCreateForm } = useAlertsCreateFormContext();

	const agencyIdValue = useContextFormWatch({ control: alertsCreateForm.control, name: 'agency_id' });
	const activePeriodEndDateValue = useContextFormWatch({ control: alertsCreateForm.control, name: 'active_period_end_date' });
	const activePeriodStartDateValue = useContextFormWatch({ control: alertsCreateForm.control, name: 'active_period_start_date' });
	const causeValue = useContextFormWatch({ control: alertsCreateForm.control, name: 'cause' });
	const effectValue = useContextFormWatch({ control: alertsCreateForm.control, name: 'effect' });
	const referenceTypeValue = useContextFormWatch({ control: alertsCreateForm.control, name: 'reference_type' });
	const referencesValue = useContextFormWatch({ control: alertsCreateForm.control, name: 'references' });
	const userInstructionsValue = useContextFormWatch({ control: alertsCreateForm.control, name: 'user_instructions' });

	//
	// B. Transform data

	const requestBody = useMemo<AlertsDescribeRequest>(() => ({
		active_period_end_date: activePeriodEndDateValue,
		active_period_start_date: activePeriodStartDateValue,
		agency_id: agencyIdValue,
		cause: causeValue,
		effect: effectValue,
		reference_type: referenceTypeValue,
		references: referencesValue,
		user_instructions: userInstructionsValue,
	}), [agencyIdValue, activePeriodEndDateValue, activePeriodStartDateValue, causeValue, effectValue, referenceTypeValue, referencesValue, userInstructionsValue]);

	//
	// C. Fetch data

	const { data, error, isLoading, isValidating } = useSWR<ApiResponse<AlertsDescribeResponse>>([API_ROUTES.alerts.ALERTS_DESCRIBE, requestBody], {
		fetcher: async ([url, requestBody]) => await fetchDataNew<AlertsDescribeResponse>(url, 'POST', requestBody),
		refreshInterval: 0, // Disabled
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
