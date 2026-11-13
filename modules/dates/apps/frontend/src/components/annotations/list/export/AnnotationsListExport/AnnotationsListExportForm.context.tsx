'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { AnnotationCategorySchema } from '@tmlmobilidade/go-types-dates';
import { type DatesAnnotationsV1ExtractionCreate, type DatesAnnotationsV1ExtractionProperties, DatesAnnotationsV1ExtractionPropertiesSchema, DatesAnnotationsV1ExtractionVersionValue, DatesAnnotationsV1WithoutCategoryValue, type Extraction } from '@tmlmobilidade/go-types-extractions';
import { fetchApiData, openExtractionsListModal, type StandardFormContextValue, useExtractionsListData, useHandleAction, useMeData, useStandardForm, useStandardFormCapabilities, useStandardFormWatch } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useCallback, useContext, useMemo } from 'react';

import { useAnnotationsAgenciesData } from '../../../shared/use-annotations-agencies-data';
import { useAnnotationsListFilterAgencies } from '../../AnnotationsListFilterAgencies/use-annotations-list-filter-agencies';
import { useAnnotationsListFilterCategories } from '../../filters/AnnotationsListFilterCategories/use-annotations-list-filter-categories';
import { useAnnotationsListFilterDates } from '../../filters/AnnotationsListFilterDates/use-annotations-list-filter-dates';
import { useAnnotationsListFilterLocations } from '../../filters/AnnotationsListFilterLocations/use-annotations-list-filter-locations';
import { closeAnnotationsListExportModal } from './AnnotationsListExport.modal';

/* * */

const AnnotationsListExportFormContext = createContext<StandardFormContextValue<DatesAnnotationsV1ExtractionProperties> | undefined>(undefined);

export function useAnnotationsListExportFormContext() {
	const context = useContext(AnnotationsListExportFormContext);
	if (!context) throw new Error('useAnnotationsListExportFormContext must be used within AnnotationsListExportFormContextProvider');
	return context;
}

/* * */

export function AnnotationsListExportFormContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const { data: me, error: meError, isLoading: meLoading } = useMeData();
	const { error: agenciesError, isLoading: agenciesLoading } = useAnnotationsAgenciesData();
	const { mutate } = useExtractionsListData();
	const agencies = useAnnotationsListFilterAgencies();
	const categories = useAnnotationsListFilterCategories();
	const dates = useAnnotationsListFilterDates();
	const locations = useAnnotationsListFilterLocations();

	//
	// B. Setup form

	const initialProperties = useMemo<DatesAnnotationsV1ExtractionProperties>(() => ({
		agency_ids: agencies.isActive ? agencies.value : [],
		categories: categories.isActive ? categories.value.filter((value): value is DatesAnnotationsV1ExtractionProperties['categories'][number] => value === DatesAnnotationsV1WithoutCategoryValue || AnnotationCategorySchema.safeParse(value).success) : [],
		end_date: dates.endDate,
		location_ids: locations.value,
		start_date: dates.startDate,
	}), [agencies.isActive, agencies.value, categories.isActive, categories.value, dates.endDate, dates.startDate, locations.value]);
	const { form, isDirty, unblock } = useStandardForm<DatesAnnotationsV1ExtractionProperties, typeof DatesAnnotationsV1ExtractionPropertiesSchema>({ apiData: initialProperties, schema: DatesAnnotationsV1ExtractionPropertiesSchema });
	const values = useStandardFormWatch({ control: form.control });
	const isValid = DatesAnnotationsV1ExtractionPropertiesSchema.safeParse(values).success;

	//
	// C. Handle actions

	const { action, isLoading: isCreating } = useHandleAction({
		fetchFn: async (properties: DatesAnnotationsV1ExtractionProperties) => await fetchApiData<Extraction[], DatesAnnotationsV1ExtractionCreate>({
			body: { properties, send_email_notification: false, version: DatesAnnotationsV1ExtractionVersionValue },
			method: 'POST',
			url: API_ROUTES.core.EXTRACTIONS_CREATE,
		}),
		onSuccess: (response) => {
			mutate(response);
			unblock();
			closeAnnotationsListExportModal();
			openExtractionsListModal();
		},
	});

	//
	// D. Setup capabilities

	const capabilities = useStandardFormCapabilities({
		create: { hasPermission: !!me && !meError && !agenciesError, isCreating },
		form: { isDirty, isValid },
		loading: { isLoading: meLoading || agenciesLoading },
	});
	const handleCreate = useCallback(async () => {
		if (capabilities.createEnabled) await form.handleSubmit(action)();
	}, [action, capabilities.createEnabled, form]);

	//
	// E. Return context value

	const state = useMemo<StandardFormContextValue<DatesAnnotationsV1ExtractionProperties>>(() => ({
		actions: { create: handleCreate },
		capabilities,
		form,
		isDirty,
		isValid,
		status: { isCreating },
		unblock,
	}), [capabilities, form, handleCreate, isCreating, isDirty, isValid, unblock]);
	return <AnnotationsListExportFormContext.Provider value={state}>{children}</AnnotationsListExportFormContext.Provider>;
}
