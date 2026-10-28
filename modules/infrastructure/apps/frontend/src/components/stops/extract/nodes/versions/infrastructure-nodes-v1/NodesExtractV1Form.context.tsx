'use client';

import { useStopsListFilterAgency } from '@/components/stops/list/filters/StopsListFilterAgency/use-stops-list-filter-agency';
import { useStopsListFilterLifecycleStatus } from '@/components/stops/list/filters/StopsListFilterLifecycleStatus/use-stops-list-filter-lifecycle-status';
import { useStopsListFilterLocationPrimary } from '@/components/stops/list/filters/StopsListFilterLocationPrimary/use-stops-list-filter-location-primary';
import { useStopsListFilterLocationSecondary } from '@/components/stops/list/filters/StopsListFilterLocationSecondary/use-stops-list-filter-location-secondary';
import { useStopsListFilterLocationTertiary } from '@/components/stops/list/filters/StopsListFilterLocationTertiary/use-stops-list-filter-location-tertiary';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Extraction, type InfrastructureNodesV1ExtractionCreate, type InfrastructureNodesV1ExtractionProperties, InfrastructureNodesV1ExtractionPropertiesSchema, InfrastructureNodesV1ExtractionVersionValue } from '@tmlmobilidade/go-types-extractions';
import { hasPermission } from '@tmlmobilidade/go-types-permissions';
import { fetchApiData, openExtractionsListModal, type StandardFormContextValue, useExtractionsListData, useHandleAction, useMeData, useStandardForm, useStandardFormCapabilities, useStandardFormWatch } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';

import { closeNodesExtractModal } from '../../NodesExtract.modal';

/* * */

const NodesExtractV1FormContext = createContext<StandardFormContextValue<InfrastructureNodesV1ExtractionProperties> | undefined>(undefined);

export function useNodesExtractV1FormContext() {
	const context = useContext(NodesExtractV1FormContext);
	if (!context) throw new Error('useNodesExtractV1FormContext must be used within a NodesExtractV1FormContextProvider');
	return context;
}

/* * */

export function NodesExtractV1FormContextProvider({ children }: PropsWithChildren) {
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

	const initialProperties = useMemo((): InfrastructureNodesV1ExtractionProperties | null => {
		return {
			agency_ids: filterAgency.value,
			lifecycle_statuses: filterLifecycleStatus.value,
			location_primary_ids: filterLocationPrimary.isActive ? filterLocationPrimary.value : undefined,
			location_secondary_ids: filterLocationSecondary.isActive ? filterLocationSecondary.value : undefined,
			location_tertiary_ids: filterLocationTertiary.isActive ? filterLocationTertiary.value : undefined,
		};
	}, [filterAgency.value, filterLifecycleStatus.value, filterLocationPrimary.isActive, filterLocationPrimary.value, filterLocationSecondary.isActive, filterLocationSecondary.value, filterLocationTertiary.isActive, filterLocationTertiary.value]);

	const { form, isDirty, isValid, unblock } = useStandardForm<InfrastructureNodesV1ExtractionProperties, typeof InfrastructureNodesV1ExtractionPropertiesSchema>({
		apiData: initialProperties,
		schema: InfrastructureNodesV1ExtractionPropertiesSchema,
	});

	const agencyIdsValue = useStandardFormWatch({ control: form.control, name: 'agency_ids' });

	//
	// C. Handle actions

	const { action: handleExtract, isLoading: isExtracting } = useHandleAction({
		fetchFn: async () => await fetchApiData<Extraction[], InfrastructureNodesV1ExtractionCreate>({
			body: {
				properties: form.getValues(),
				send_email_notification: false,
				version: InfrastructureNodesV1ExtractionVersionValue,
			},
			method: 'POST',
			url: API_ROUTES.core.EXTRACTIONS_CREATE,
		}),
		onSuccess: (response) => {
			mutate(response);
			unblock();
			closeNodesExtractModal();
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
			// The extraction query matches rides with has(agency_ids, agency_id),
			// so an empty selection would always produce an empty file.
			isValid: isValid && !!agencyIdsValue?.length,
		},
	});

	//
	// E. Return context value

	const stateValue: StandardFormContextValue<InfrastructureNodesV1ExtractionProperties> = useMemo(() => ({
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
		<NodesExtractV1FormContext.Provider value={stateValue}>
			{children}
		</NodesExtractV1FormContext.Provider>
	);
}
