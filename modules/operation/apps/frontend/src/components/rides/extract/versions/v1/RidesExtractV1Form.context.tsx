'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Extraction, type OperationRidesV1ExtractionCreate, type OperationRidesV1ExtractionProperties, OperationRidesV1ExtractionPropertiesSchema, OperationRidesV1ExtractionVersionValue } from '@tmlmobilidade/go-types-extractions';
import { hasPermission, PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { fetchApiData, openExtractionsListModal, type StandardFormContextValue, useExtractionsListData, useHandleAction, useMeData, useStandardForm, useStandardFormCapabilities, useStandardFormWatch } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';

import { useRidesListFilterAgency } from '../../../list/filters/RidesListFilterAgency/use-rides-list-filter-agency';
import { useRidesListFilterDateRange } from '../../../list/filters/RidesListFilterDateRange/use-rides-list-filter-date-range';
import { closeRidesExtractModal } from '../../RidesExtract.modal';

/* * */

const RidesExtractV1FormContext = createContext<StandardFormContextValue<OperationRidesV1ExtractionProperties> | undefined>(undefined);

export function useRidesExtractV1FormContext() {
	const context = useContext(RidesExtractV1FormContext);
	if (!context) throw new Error('useRidesExtractV1FormContext must be used within a RidesExtractV1FormContextProvider');
	return context;
}

/* * */

export function RidesExtractV1FormContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const { data: meData } = useMeData();

	const { mutate } = useExtractionsListData();

	const filterAgency = useRidesListFilterAgency();
	const filterDateRange = useRidesListFilterDateRange();

	//
	// B. Setup form

	const initialProperties = useMemo((): null | OperationRidesV1ExtractionProperties => {
		if (!filterDateRange.value_start || !filterDateRange.value_end) return null;
		return {
			agency_ids: filterAgency.value,
			start_time_scheduled_end: filterDateRange.value_end,
			start_time_scheduled_start: filterDateRange.value_start,
		};
	}, [filterAgency.value, filterDateRange.value_end, filterDateRange.value_start]);

	const { form, isDirty, isValid, unblock } = useStandardForm<OperationRidesV1ExtractionProperties, typeof OperationRidesV1ExtractionPropertiesSchema>({
		apiData: initialProperties,
		schema: OperationRidesV1ExtractionPropertiesSchema,
	});

	const agencyIdsValue = useStandardFormWatch({ control: form.control, name: 'agency_ids' });

	//
	// C. Handle actions

	const { action: handleExtract, isLoading: isExtracting } = useHandleAction({
		fetchFn: async () => await fetchApiData<Extraction[], OperationRidesV1ExtractionCreate>({
			body: {
				properties: form.getValues(),
				send_email_notification: false,
				version: OperationRidesV1ExtractionVersionValue,
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
			// The extraction query matches rides with has(agency_ids, agency_id),
			// so an empty selection would always produce an empty file.
			isValid: isValid && !!agencyIdsValue?.length,
		},
	});

	//
	// E. Return context value

	const stateValue: StandardFormContextValue<OperationRidesV1ExtractionProperties> = useMemo(() => ({
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
		<RidesExtractV1FormContext.Provider value={stateValue}>
			{children}
		</RidesExtractV1FormContext.Provider>
	);
}
