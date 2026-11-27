'use client';

import { useZonesListData } from '@/components/zones/list/use-zones-list-data';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Extraction, type OfferZonesGeopackageV1ExtractionCreate, type OfferZonesGeopackageV1ExtractionProperties, OfferZonesGeopackageV1ExtractionPropertiesSchema, OfferZonesGeopackageV1ExtractionVersionValue } from '@tmlmobilidade/go-types-extractions';
import { fetchApiData, openExtractionsListModal, type SelectDataItem, type StandardFormContextValue, useExtractionsListData, useHandleAction, useMePermissions, useStandardForm, useStandardFormCapabilities } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo } from 'react';

import { getZonesExportOptions } from './get-zones-extract-options';
import { closeZonesExtractGeopackageModal } from './ZonesExtract.modal';

/* * */

interface ZonesExtractFormContextValue extends Omit<StandardFormContextValue<OfferZonesGeopackageV1ExtractionProperties>, 'actions'> {
	actions: {
		exportGeopackage: () => void
	}
	error: null | string
	options: SelectDataItem[]
}

const ZonesExtractFormContext = createContext<undefined | ZonesExtractFormContextValue>(undefined);

export function useZonesExtractFormContext() {
	const context = useContext(ZonesExtractFormContext);
	if (!context) throw new Error('useZonesExtractFormContext must be used within ZonesExtractFormContextProvider');
	return context;
}

/* * */

export function ZonesExtractFormContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const { data: zones, error: zonesError, isLoading: zonesLoading } = useZonesListData();
	const { data: permissions, error: permissionsError, isLoading: permissionsLoading } = useMePermissions();
	const { mutate } = useExtractionsListData();
	const error = zonesError || permissionsError;
	const isLoading = zonesLoading || permissionsLoading;
	const options = useMemo(() => getZonesExportOptions(zones, permissions), [permissions, zones]);

	//
	// B. Setup form

	const { form, isDirty, unblock } = useStandardForm<OfferZonesGeopackageV1ExtractionProperties, typeof OfferZonesGeopackageV1ExtractionPropertiesSchema>({
		defaultValues: { zone_ids: [] },
		schema: OfferZonesGeopackageV1ExtractionPropertiesSchema,
	});
	const { isValid } = form.formState;

	useEffect(() => {
		if (isLoading || error) return;
		const availableIds = new Set(options.map(option => option.value));
		const selected = form.getValues('zone_ids');
		const eligible = selected.filter(id => availableIds.has(id));
		if (eligible.length !== selected.length) form.setValue('zone_ids', eligible, { shouldDirty: true, shouldValidate: true });
	}, [error, form, isLoading, options]);

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
			closeZonesExtractGeopackageModal();
			openExtractionsListModal();
		},
	});

	const capabilities = useStandardFormCapabilities({
		create: { hasPermission: !error && options.length > 0, isCreating },
		form: { isDirty, isValid },
		loading: { isLoading },
	});
	const handleExportGeopackage = useCallback(async () => {
		if (capabilities.createEnabled) await form.handleSubmit(action)();
	}, [action, capabilities.createEnabled, form]);

	//
	// D. Return context value

	const state = useMemo<ZonesExtractFormContextValue>(() => ({
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
		<ZonesExtractFormContext.Provider value={state}>
			{children}
		</ZonesExtractFormContext.Provider>
	);
}
