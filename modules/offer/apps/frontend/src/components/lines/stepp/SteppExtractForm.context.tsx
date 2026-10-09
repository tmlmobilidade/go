'use client';

import { useLinesAgenciesData } from '@/components/lines/shared/use-agencies-data';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Extraction, type OfferGtfsSteppV1ExtractionCreate, type OfferGtfsSteppV1ExtractionProperties, OfferGtfsSteppV1ExtractionPropertiesSchema, OfferGtfsSteppV1ExtractionVersionValue } from '@tmlmobilidade/go-types-extractions';
import { fetchApiData, openExtractionsListModal, type StandardFormContextValue, useExtractionsListData, useHandleAction, useStandardForm, useStandardFormCapabilities, useStandardFormWatch } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';

import { closeSteppExtractsModal } from './SteppExtract.modal';

/* * */

const SteppExtractFormContext = createContext<StandardFormContextValue<OfferGtfsSteppV1ExtractionProperties> | undefined>(undefined);

export function useSteppExtractFormContext() {
	const context = useContext(SteppExtractFormContext);
	if (!context) throw new Error('useSteppExtractFormContext must be used within a SteppExtractFormContextProvider');
	return context;
}

/* * */

export function SteppExtractFormContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const { ids: permittedAgencyIds, isLoading: isLoadingAgencies } = useLinesAgenciesData({
		permissions: { actions: ['extract-stepp'], scope: 'lines' },
	});

	const { mutate } = useExtractionsListData();

	//
	// B. Setup form

	const { form, isDirty, isValid, unblock } = useStandardForm<OfferGtfsSteppV1ExtractionProperties, typeof OfferGtfsSteppV1ExtractionPropertiesSchema>({
		defaultValues: { agency_id: '' },
		schema: OfferGtfsSteppV1ExtractionPropertiesSchema,
	});

	const agencyIdValue = useStandardFormWatch({ control: form.control, name: 'agency_id' });

	//
	// C. Handle actions

	const { action: handleExtract, isLoading: isExtracting } = useHandleAction({
		fetchFn: async () => await fetchApiData<Extraction[], OfferGtfsSteppV1ExtractionCreate>({
			body: {
				properties: form.getValues(),
				send_email_notification: false,
				version: OfferGtfsSteppV1ExtractionVersionValue,
			},
			method: 'POST',
			url: API_ROUTES.core.EXTRACTIONS_CREATE,
		}),
		onSuccess: (response) => {
			mutate(response);
			unblock();
			closeSteppExtractsModal();
			openExtractionsListModal();
		},
	});

	//
	// D. Setup flags

	const hasExtractPermission = useMemo(() => {
		return permittedAgencyIds.includes(agencyIdValue);
	}, [agencyIdValue, permittedAgencyIds]);

	const { createEnabled, editEnabled } = useStandardFormCapabilities({
		create: {
			hasPermission: hasExtractPermission,
			isCreating: isExtracting,
		},
		form: {
			isDirty,
			isValid: isValid && !!agencyIdValue?.trim(),
		},
		loading: {
			isLoading: isLoadingAgencies,
		},
	});

	//
	// E. Return context value

	const stateValue: StandardFormContextValue<OfferGtfsSteppV1ExtractionProperties> = useMemo(() => ({
		actions: {
			create: async () => {
				if (!createEnabled) return;
				await form.handleSubmit(() => handleExtract())();
			},
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

	//
	// F. Render context

	return (
		<SteppExtractFormContext.Provider value={stateValue}>
			{children}
		</SteppExtractFormContext.Provider>
	);
}
