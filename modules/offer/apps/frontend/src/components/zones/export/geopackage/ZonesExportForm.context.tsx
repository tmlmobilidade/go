'use client';

import { useZonesListData } from '@/components/zones/list/use-zones-list-data';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Extraction, type OfferZonesGeopackageV1ExtractionCreate, type OfferZonesGeopackageV1ExtractionProperties, OfferZonesGeopackageV1ExtractionPropertiesSchema, OfferZonesGeopackageV1ExtractionVersionValue } from '@tmlmobilidade/go-types-extractions';
import { fetchApiData, openExtractionsListModal, type SelectDataItem, type StandardFormContextValue, useExtractionsListData, useHandleAction, useStandardForm, useStandardFormCapabilities } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useCallback, useContext, useMemo } from 'react';

import { closeZonesExportGeopackageModal } from './ZonesExport.modal';

/* * */

interface ZonesExportFormContextValue extends Omit<StandardFormContextValue<OfferZonesGeopackageV1ExtractionProperties>, 'actions'> {
	actions: {
		exportGeopackage: () => void
	}
	error: null | string
	options: SelectDataItem[]
}

const ZonesExportFormContext = createContext<undefined | ZonesExportFormContextValue>(undefined);

export function useZonesExportFormContext() {
	const context = useContext(ZonesExportFormContext);
	if (!context) throw new Error('useZonesExportFormContext must be used within ZonesExportFormContextProvider');
	return context;
}

/* * */

export function ZonesExportFormContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const { data: zones, error, isLoading } = useZonesListData();
	const { mutate } = useExtractionsListData();
	const options = useMemo(() => zones.map(zone => ({ label: zone.name, value: zone._id })), [zones]);

	//
	// B. Setup form

	const { form, isDirty, unblock } = useStandardForm<OfferZonesGeopackageV1ExtractionProperties, typeof OfferZonesGeopackageV1ExtractionPropertiesSchema>({
		defaultValues: { zone_ids: [] },
		schema: OfferZonesGeopackageV1ExtractionPropertiesSchema,
	});
	const { isValid } = form.formState;

	//
	// C. Handle actions

	const { action, isLoading: isCreating } = useHandleAction({
		fetchFn: (properties: OfferZonesGeopackageV1ExtractionProperties) => fetchApiData<Extraction[], OfferZonesGeopackageV1ExtractionCreate>({
			body: { properties, send_email_notification: false, version: OfferZonesGeopackageV1ExtractionVersionValue },
			method: 'POST',
			url: API_ROUTES.core.EXTRACTIONS_CREATE,
		}),
		onSuccess: (response) => {
			mutate(response);
			unblock();
			closeZonesExportGeopackageModal();
			openExtractionsListModal();
		},
	});

	const capabilities = useStandardFormCapabilities({
		create: { hasPermission: !error, isCreating },
		form: { isDirty, isValid },
		loading: { isLoading },
	});
	const handleExportGeopackage = useCallback(async () => {
		if (capabilities.createEnabled) await form.handleSubmit(action)();
	}, [action, capabilities.createEnabled, form]);

	//
	// D. Return context value

	const state = useMemo<ZonesExportFormContextValue>(() => ({
		actions: {
			exportGeopackage: handleExportGeopackage,
		},
		capabilities,
		error,
		form,
		isDirty,
		isValid,
		options,
		status: { isCreating },
		unblock,
	}), [capabilities, error, form, handleExportGeopackage, isCreating, isDirty, isValid, options, unblock]);

	return (
		<ZonesExportFormContext.Provider value={state}>
			{children}
		</ZonesExportFormContext.Provider>
	);
}
