'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Extraction, type OfferZonesV1ExtractionCreate, OfferZonesV1ExtractionCreateSchema, OfferZonesV1ExtractionVersionValue } from '@tmlmobilidade/go-types-extractions';
import { fetchApiData, openExtractionsListModal, type StandardFormContextValue, useExtractionsListData, useHandleAction, useStandardForm, useStandardFormCapabilities, useStandardFormWatch } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useZonesListFilterAgencies } from '../list/filters/ZonesListFilterAgencies/use-zones-list-filter-agencies';
import { useZonesListFilterSearch } from '../list/filters/ZonesListFilterSearch/use-zones-list-filter-search';
import { useZonesExtractAgenciesData } from './use-zones-extract-agencies-data';
import { closeZonesExtractModal } from './ZonesExtract.modal';

/* * */

const ZonesExtractFormContext = createContext<StandardFormContextValue<OfferZonesV1ExtractionCreate> | undefined>(undefined);

export function useZonesExtractFormContext() {
	const context = useContext(ZonesExtractFormContext);
	if (!context) throw new Error('useZonesExtractFormContext must be used within a ZonesExtractFormContextProvider');
	return context;
}

/* * */

export function ZonesExtractFormContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { mutate } = useExtractionsListData();
	const { error, hasReadPermission, ids, isLoading } = useZonesExtractAgenciesData();
	const filterAgency = useZonesListFilterAgencies();
	const filterSearch = useZonesListFilterSearch();

	//
	// B. Initialize the extraction form without changing the list URL filters

	const { form, isDirty, unblock } = useStandardForm<OfferZonesV1ExtractionCreate, typeof OfferZonesV1ExtractionCreateSchema>({
		defaultValues: {
			properties: {
				agency_ids: filterAgency.value.filter(id => ids.includes(id)),
				search: filterSearch.value ?? undefined,
			},
			send_email_notification: false,
			version: OfferZonesV1ExtractionVersionValue,
		},
		schema: OfferZonesV1ExtractionCreateSchema,
	});

	const propertiesValue = useStandardFormWatch({ control: form.control, name: 'properties' });
	const isValid = form.formState.isValid;

	useEffect(() => {
		void form.trigger();
	}, [form, propertiesValue]);

	//
	// C. Create the task through the existing extraction endpoint

	const { action: handleExtract, isLoading: isExtracting } = useHandleAction({
		fetchFn: async (body: OfferZonesV1ExtractionCreate) => await fetchApiData<Extraction[], OfferZonesV1ExtractionCreate>({
			body,
			method: 'POST',
			url: API_ROUTES.core.EXTRACTIONS_CREATE,
		}),
		labels: {
			error_title: t('default:zones.extract.ZonesExtract.action.error_title'),
			success_title: t('default:zones.extract.ZonesExtract.action.success_title'),
		},
		onSuccess: (response) => {
			mutate(response);
			unblock();
			closeZonesExtractModal();
			openExtractionsListModal();
		},
	});

	//
	// D. Require a non-empty selection within the current agency access

	const hasExtractPermission = hasReadPermission && !error && !!propertiesValue?.agency_ids?.length && propertiesValue.agency_ids.every(id => ids.includes(id));

	const { createEnabled, editEnabled } = useStandardFormCapabilities({
		create: { hasPermission: hasExtractPermission, isCreating: isExtracting },
		form: { isDirty, isValid },
		loading: { isLoading },
	});

	//
	// E. Return context value

	const stateValue: StandardFormContextValue<OfferZonesV1ExtractionCreate> = useMemo(() => ({
		actions: {
			create: () => {
				if (!createEnabled) return;
				void form.handleSubmit(handleExtract)();
			},
		},
		capabilities: { createEnabled, editEnabled },
		form,
		isDirty,
		isValid,
		status: { isCreating: isExtracting, isLoading },
		unblock,
	}), [createEnabled, editEnabled, form, handleExtract, isDirty, isExtracting, isLoading, isValid, unblock]);

	return <ZonesExtractFormContext.Provider value={stateValue}>{children}</ZonesExtractFormContext.Provider>;
}
