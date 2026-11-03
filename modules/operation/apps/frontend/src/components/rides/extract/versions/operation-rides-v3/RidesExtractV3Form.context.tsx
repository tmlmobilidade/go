'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Extraction, type OperationRidesV3ExtractionCreate, type OperationRidesV3ExtractionProperties, OperationRidesV3ExtractionPropertiesSchema, OperationRidesV3ExtractionVersionValue } from '@tmlmobilidade/go-types-extractions';
import { hasPermission, PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { fetchApiData, openExtractionsListModal, type StandardFormContextValue, useExtractionsListData, useHandleAction, useMeData, useStandardForm, useStandardFormCapabilities, useStandardFormWatch } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';

import { useRidesListFilterAgency } from '../../../list/filters/RidesListFilterAgency/use-rides-list-filter-agency';
import { useRidesListFilterAnalysisAtLeastOneVehicleEventOnLastStop } from '../../../list/filters/RidesListFilterAnalysisAtLeastOneVehicleEventOnLastStop/use-rides-list-filter-analysis-at-least-one-vehicle-event-on-last-stop';
import { useRidesListFilterAnalysisExpectedApexValidationInterval } from '../../../list/filters/RidesListFilterAnalysisExpectedApexValidationInterval/use-rides-list-filter-analysis-expected-apex-validation-interval';
import { useRidesListFilterAnalysisSimpleThreeEvents } from '../../../list/filters/RidesListFilterAnalysisSimpleThreeEvents/use-rides-list-filter-analysis-simple-three-events';
import { useRidesListFilterAnalysisTransactionSequentiality } from '../../../list/filters/RidesListFilterAnalysisTransactionSequentiality/use-rides-list-filter-analysis-transaction-sequentiality';
import { useRidesListFilterDateRange } from '../../../list/filters/RidesListFilterDateRange/use-rides-list-filter-date-range';
import { useRidesListFilterDriver } from '../../../list/filters/RidesListFilterDriver/use-rides-list-filter-driver';
import { useRidesListFilterEndDelayStatus } from '../../../list/filters/RidesListFilterEndDelayStatus/use-rides-list-filter-end-delay-status';
import { useRidesListFilterOperationalStatus } from '../../../list/filters/RidesListFilterOperationalStatus/use-rides-list-filter-operational-status';
import { useRidesListFilterSearch } from '../../../list/filters/RidesListFilterSearch/use-rides-list-filter-search';
import { useRidesListFilterStartDelayStatus } from '../../../list/filters/RidesListFilterStartDelayStatus/use-rides-list-filter-start-delay-status';
import { useRidesListFilterVehicle } from '../../../list/filters/RidesListFilterVehicle/use-rides-list-filter-vehicle';
import { closeRidesExtractModal } from '../../RidesExtract.modal';

/* * */

const RidesExtractV3FormContext = createContext<StandardFormContextValue<OperationRidesV3ExtractionProperties> | undefined>(undefined);

export function useRidesExtractV3FormContext() {
	const context = useContext(RidesExtractV3FormContext);
	if (!context) throw new Error('useRidesExtractV3FormContext must be used within a RidesExtractV3FormContextProvider');
	return context;
}

/* * */

export function RidesExtractV3FormContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const { data: meData } = useMeData();

	const { mutate } = useExtractionsListData();

	const filterAgency = useRidesListFilterAgency();
	const filterAnalysisAtLeastOneVehicleEventOnLastStop = useRidesListFilterAnalysisAtLeastOneVehicleEventOnLastStop();
	const filterAnalysisExpectedApexValidationInterval = useRidesListFilterAnalysisExpectedApexValidationInterval();
	const filterAnalysisSimpleThreeEvents = useRidesListFilterAnalysisSimpleThreeEvents();
	const filterAnalysisTransactionSequentiality = useRidesListFilterAnalysisTransactionSequentiality();
	const filterDateRange = useRidesListFilterDateRange();
	const filterDriver = useRidesListFilterDriver();
	const filterEndDelayStatus = useRidesListFilterEndDelayStatus();
	const filterOperationalStatus = useRidesListFilterOperationalStatus();
	const filterSearch = useRidesListFilterSearch();
	const filterStartDelayStatus = useRidesListFilterStartDelayStatus();
	const filterVehicle = useRidesListFilterVehicle();

	//
	// B. Setup form

	const initialProperties = useMemo((): null | OperationRidesV3ExtractionProperties => {
		if (!filterDateRange.value_start || !filterDateRange.value_end) return null;
		return {
			agency_ids: filterAgency.value,
			analysis_at_least_one_vehicle_event_on_last_stop_grades: filterAnalysisAtLeastOneVehicleEventOnLastStop.value,
			analysis_expected_apex_validation_interval_grades: filterAnalysisExpectedApexValidationInterval.value,
			analysis_simple_three_vehicle_events_grades: filterAnalysisSimpleThreeEvents.value,
			analysis_transaction_sequentiality_grades: filterAnalysisTransactionSequentiality.value,
			driver_ids: filterDriver.value,
			end_delay_statuses: filterEndDelayStatus.value,
			operational_statuses: filterOperationalStatus.value,
			search: filterSearch.value,
			start_delay_statuses: filterStartDelayStatus.value,
			start_time_scheduled_end: filterDateRange.value_end,
			start_time_scheduled_start: filterDateRange.value_start,
			vehicle_ids: filterVehicle.value,
		};
	}, [filterAgency.value, filterAnalysisAtLeastOneVehicleEventOnLastStop.value, filterAnalysisExpectedApexValidationInterval.value, filterAnalysisSimpleThreeEvents.value, filterAnalysisTransactionSequentiality.value, filterDateRange.value_end, filterDateRange.value_start, filterDriver.value, filterEndDelayStatus.value, filterOperationalStatus.value, filterSearch.value, filterStartDelayStatus.value, filterVehicle.value]);

	const { form, isDirty, isValid, unblock } = useStandardForm<OperationRidesV3ExtractionProperties, typeof OperationRidesV3ExtractionPropertiesSchema>({
		apiData: initialProperties,
		schema: OperationRidesV3ExtractionPropertiesSchema,
	});

	const agencyIdsValue = useStandardFormWatch({ control: form.control, name: 'agency_ids' });

	//
	// C. Handle actions

	const { action: handleExtract, isLoading: isExtracting } = useHandleAction({
		fetchFn: async () => await fetchApiData<Extraction[], OperationRidesV3ExtractionCreate>({
			body: {
				properties: form.getValues(),
				send_email_notification: false,
				version: OperationRidesV3ExtractionVersionValue,
			},
			method: 'POST',
			url: API_ROUTES.core.EXTRACTIONS_CREATE,
		}),
		onSuccess: (response) => {
			mutate(response);
			unblock();
			closeRidesExtractModal();
			openExtractionsListModal();
		},
	});

	//
	// D. Setup flags

	const hasExtractPermission = useMemo(() => {
		return hasPermission(meData?.permissions, {
			action: PermissionCatalog.all.rides.actions.analysis_read,
			scope: PermissionCatalog.all.rides.scope,
		});
	}, [meData?.permissions]);

	const { createEnabled, editEnabled } = useStandardFormCapabilities({
		create: {
			hasPermission: hasExtractPermission,
			isCreating: isExtracting,
		},
		form: {
			isDirty,
			// The extraction query matches rides by agency,
			// so an empty selection would always produce an empty file.
			isValid: isValid && !!agencyIdsValue?.length,
		},
	});

	//
	// E. Return context value

	const stateValue: StandardFormContextValue<OperationRidesV3ExtractionProperties> = useMemo(() => ({
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
		<RidesExtractV3FormContext.Provider value={stateValue}>
			{children}
		</RidesExtractV3FormContext.Provider>
	);
}
