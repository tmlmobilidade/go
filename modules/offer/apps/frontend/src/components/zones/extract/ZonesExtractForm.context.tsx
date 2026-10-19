'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Extraction, type OfferZonesV1ExtractionCreate, OfferZonesV1ExtractionCreateSchema, OfferZonesV1ExtractionVersionValue } from '@tmlmobilidade/go-types-extractions';
import { fetchApiData, openExtractionsListModal, type StandardFormContextValue, useExtractionsListData, useHandleAction, useMeData, useStandardForm, useStandardFormCapabilities } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';

import { getZonesExtractAgencyAccess } from './zones-extract-permissions';

/* * */

const ZonesExtractFormContext = createContext<StandardFormContextValue<OfferZonesV1ExtractionCreate> | undefined>(undefined);

export function useZonesExtractFormContext() {
	const context = useContext(ZonesExtractFormContext);
	if (!context) throw new Error('useZonesExtractFormContext must be used within a ZonesExtractFormContextProvider');
	return context;
}

/* * */

export function ZonesExtractFormContextProvider({ children, onClose, zoneIds }: PropsWithChildren<{ onClose: () => void, zoneIds: string[] }>) {
	const { data: meData } = useMeData();
	const { mutate } = useExtractionsListData();
	const agencyAccess = getZonesExtractAgencyAccess(meData?.permissions);

	const { form, isDirty, isValid, unblock } = useStandardForm<OfferZonesV1ExtractionCreate, typeof OfferZonesV1ExtractionCreateSchema>({
		defaultValues: {
			properties: { zone_ids: zoneIds },
			send_email_notification: false,
			version: OfferZonesV1ExtractionVersionValue,
		},
		schema: OfferZonesV1ExtractionCreateSchema,
	});

	const { action: handleExtract, isLoading: isExtracting } = useHandleAction({
		fetchFn: async (body: OfferZonesV1ExtractionCreate) => await fetchApiData<Extraction[], OfferZonesV1ExtractionCreate>({
			body,
			method: 'POST',
			url: API_ROUTES.core.EXTRACTIONS_CREATE,
		}),
		onSuccess: (response) => {
			mutate(response);
			unblock();
			onClose();
			openExtractionsListModal();
		},
	});

	const { createEnabled, editEnabled } = useStandardFormCapabilities({
		create: {
			hasPermission: zoneIds.length > 0 && (agencyAccess.allowAll || agencyAccess.values.length > 0),
			isCreating: isExtracting,
		},
		form: { isDirty, isValid },
	});

	const stateValue: StandardFormContextValue<OfferZonesV1ExtractionCreate> = useMemo(() => ({
		actions: { create: form.handleSubmit(handleExtract) },
		capabilities: { createEnabled, editEnabled },
		form,
		isDirty,
		isValid,
		status: { isCreating: isExtracting },
		unblock,
	}), [createEnabled, editEnabled, form, handleExtract, isDirty, isExtracting, isValid, unblock]);

	return <ZonesExtractFormContext.Provider value={stateValue}>{children}</ZonesExtractFormContext.Provider>;
}
