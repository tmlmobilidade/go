'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Alert, type UpdateAlertDto, UpdateAlertSchema } from '@tmlmobilidade/go-types-operation';
import { hasPermission } from '@tmlmobilidade/go-types-permissions';
import { type StandardFormContextValue, useMeData, useStandardForm, useStandardFormCapabilities } from '@tmlmobilidade/ui';
import { fetchApiData, useHandleUpdate } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';

import { useAlertsListData } from '../list/use-alerts-list-data';
import { useAlertsDetailAlertId } from './use-alerts-detail-alert-id';
import { useAlertsDetailData } from './use-alerts-detail-data';

/* * */

const AlertsDetailFormContext = createContext<StandardFormContextValue<UpdateAlertDto> | undefined>(undefined);

export function useAlertsDetailFormContext() {
	const context = useContext(AlertsDetailFormContext);
	if (!context) throw new Error('useAlertsDetailFormContext must be used within a AlertsDetailFormContextProvider');
	return context;
}

/* * */

export function AlertsDetailFormContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const { alertId } = useAlertsDetailAlertId();

	const { data: meData } = useMeData();

	const { mutate: alertsListMutate } = useAlertsListData();

	const { data: alertData, isLoading: alertDataLoading, mutate: alertsDetailMutate } = useAlertsDetailData();

	//
	// B. Setup form

	const { form, isDirty, isValid, unblock } = useStandardForm<UpdateAlertDto, typeof UpdateAlertSchema>({
		apiData: alertData,
		schema: UpdateAlertSchema,
	});

	//
	// C. Handle actions

	const { action: handleUpdate, isLoading: isUpdating } = useHandleUpdate({
		fetchFn: async () => await fetchApiData<Alert>({ body: form.getValues(), method: 'PUT', url: API_ROUTES.core.AGENCIES_DETAIL(alertId) }),
		onSuccess: (response) => {
			form.reset(response.data);
			alertsDetailMutate(response);
			alertsListMutate();
		},
	});

	//
	// D. Setup flags

	const hasUpdatePermission = useMemo(() => {
		return hasPermission(meData?.permissions, {
			action: 'update',
			resources: {
				agency_ids: [alertData?.agency_id],
				reference_types: [alertData?.reference_type],
			},
			scope: 'alerts',
		});
	}, [alertData?.agency_id, alertData?.reference_type, meData?.permissions]);

	const { editEnabled, updateEnabled } = useStandardFormCapabilities({
		form: {
			isDirty,
			isValid,
		},
		loading: {
			isLoading: alertDataLoading,
		},
		update: {
			hasPermission: hasUpdatePermission,
			isUpdating: isUpdating,
		},
	});

	//
	// E. Return state

	const stateValue: StandardFormContextValue<UpdateAlertDto> = useMemo(() => ({
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
			isLoading: alertDataLoading,
			isUpdating,
		},
		unblock,
	}), [editEnabled, form, handleUpdate, isUpdating, alertDataLoading, unblock, updateEnabled, isDirty, isValid]);

	return (
		<AlertsDetailFormContext.Provider value={stateValue}>
			{children}
		</AlertsDetailFormContext.Provider>
	);
}
