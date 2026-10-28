'use client';

import { useStopsListFilterAgency } from '@/components/stops/list/filters/StopsListFilterAgency/use-stops-list-filter-agency';
import { useStopsListFilterLifecycleStatus } from '@/components/stops/list/filters/StopsListFilterLifecycleStatus/use-stops-list-filter-lifecycle-status';
import { useStopsListFilterLocationPrimary } from '@/components/stops/list/filters/StopsListFilterLocationPrimary/use-stops-list-filter-location-primary';
import { useStopsListFilterLocationSecondary } from '@/components/stops/list/filters/StopsListFilterLocationSecondary/use-stops-list-filter-location-secondary';
import { useStopsListFilterLocationTertiary } from '@/components/stops/list/filters/StopsListFilterLocationTertiary/use-stops-list-filter-location-tertiary';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Extraction, type InfrastructureStopsV1ExtractionCreate, type InfrastructureStopsV1ExtractionProperties, InfrastructureStopsV1ExtractionPropertiesSchema, InfrastructureStopsV1ExtractionVersionValue } from '@tmlmobilidade/go-types-extractions';
import { hasPermission } from '@tmlmobilidade/go-types-permissions';
import { fetchApiData, openExtractionsListModal, type StandardFormContextValue, useExtractionsListData, useHandleAction, useMeData, useStandardForm, useStandardFormCapabilities } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';

import { closeStopsExtractModal } from '../../StopsExtract.modal';

/* * */

const StopsExtractV1FormContext = createContext<StandardFormContextValue<InfrastructureStopsV1ExtractionProperties> | undefined>(undefined);

export function useStopsExtractV1FormContext() {
	const context = useContext(StopsExtractV1FormContext);
	if (!context) throw new Error('useStopsExtractV1FormContext must be used within a StopsExtractV1FormContextProvider');
	return context;
}

/* * */

export function StopsExtractV1FormContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const { data: meData } = useMeData();
	const { mutate } = useExtractionsListData();

	const filterAgency = useStopsListFilterAgency();
	const filterLifecycleStatus = useStopsListFilterLifecycleStatus();
	const filterLocationPrimary = useStopsListFilterLocationPrimary();
	const filterLocationSecondary = useStopsListFilterLocationSecondary();
	const filterLocationTertiary = useStopsListFilterLocationTertiary();

	//
	// B. Setup form

	const initialProperties = useMemo((): InfrastructureStopsV1ExtractionProperties | null => {
		return {
			agency_ids: filterAgency.value,
			lifecycle_statuses: filterLifecycleStatus.value,
			location_primary_ids: filterLocationPrimary.isActive ? filterLocationPrimary.value : undefined,
			location_secondary_ids: filterLocationSecondary.isActive ? filterLocationSecondary.value : undefined,
			location_tertiary_ids: filterLocationTertiary.isActive ? filterLocationTertiary.value : undefined,
		};
	}, [filterAgency.value, filterLifecycleStatus.value, filterLocationPrimary.isActive, filterLocationPrimary.value, filterLocationSecondary.isActive, filterLocationSecondary.value, filterLocationTertiary.isActive, filterLocationTertiary.value]);

	const { form, isDirty, isValid, unblock } = useStandardForm<InfrastructureStopsV1ExtractionProperties, typeof InfrastructureStopsV1ExtractionPropertiesSchema>({
		apiData: initialProperties,
		schema: InfrastructureStopsV1ExtractionPropertiesSchema,
	});

	//
	// C. Handle actions

	const { action: handleExtract, isLoading: isExtracting } = useHandleAction({
		fetchFn: async () => await fetchApiData<Extraction[], InfrastructureStopsV1ExtractionCreate>({
			body: {
				properties: form.getValues(),
				send_email_notification: false,
				version: InfrastructureStopsV1ExtractionVersionValue,
			},
			method: 'POST',
			url: API_ROUTES.core.EXTRACTIONS_CREATE,
		}),
		onSuccess: (response) => {
			mutate(response);
			unblock();
			closeStopsExtractModal();
			openExtractionsListModal();
		},
	});

	//
	// D. Setup flags

	const hasExtractPermission = useMemo(() => {
		return hasPermission(meData?.permissions, { action: 'read', scope: 'stops' });
	}, [meData?.permissions]);

	const { createEnabled, editEnabled } = useStandardFormCapabilities({
		create: {
			hasPermission: hasExtractPermission,
			isCreating: isExtracting,
		},
		form: {
			isDirty,
			isValid,
		},
	});

	//
	// E. Return context value

	const stateValue: StandardFormContextValue<InfrastructureStopsV1ExtractionProperties> = useMemo(() => ({
		actions: {
			create: handleExtract,
		},
		capabilities: {
			createEnabled,
			editEnabled,
		},
		form,
		isDirty,
		isValid,
		status: {
			isCreating: isExtracting,
		},
		unblock,
	}), [createEnabled, editEnabled, form, handleExtract, isExtracting, isDirty, isValid, unblock]);

	return (
		<StopsExtractV1FormContext.Provider value={stateValue}>
			{children}
		</StopsExtractV1FormContext.Provider>
	);
}
