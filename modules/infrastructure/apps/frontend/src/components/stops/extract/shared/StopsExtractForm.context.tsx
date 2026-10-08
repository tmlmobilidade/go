'use client';

import { useStopsListFilterAgency } from '@/components/stops/list/filters/StopsListFilterAgency/use-stops-list-filter-agency';
import { useStopsListFilterConnections } from '@/components/stops/list/filters/StopsListFilterConnections/use-stops-list-filter-connections';
import { useStopsListFilterFacilities } from '@/components/stops/list/filters/StopsListFilterFacilities/use-stops-list-filter-facilities';
import { useStopsListFilterLifecycleStatus } from '@/components/stops/list/filters/StopsListFilterLifecycleStatus/use-stops-list-filter-lifecycle-status';
import { useStopsListFilterLocationNeighbourhood } from '@/components/stops/list/filters/StopsListFilterLocationNeighberhood/use-stops-list-filter-location-neighberhood';
import { useStopsListFilterLocationPrimary } from '@/components/stops/list/filters/StopsListFilterLocationPrimary/use-stops-list-filter-location-primary';
import { useStopsListFilterLocationSecondary } from '@/components/stops/list/filters/StopsListFilterLocationSecondary/use-stops-list-filter-location-secondary';
import { useStopsListFilterLocationTertiary } from '@/components/stops/list/filters/StopsListFilterLocationTertiary/use-stops-list-filter-location-tertiary';
import { useStopsListFilterSearch } from '@/components/stops/list/filters/StopsListFilterSearch/use-stops-list-filter-search';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Extraction, type InfrastructureNodesV1ExtractionCreate, type InfrastructureNodesV1ExtractionCreateSchema, type InfrastructureStopsV1ExtractionCreate, type InfrastructureStopsV1ExtractionCreateSchema } from '@tmlmobilidade/go-types-extractions';
import { hasPermission, PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { fetchApiData, openExtractionsListModal, type StandardFormContextValue, useExtractionsListData, useHandleAction, useMeData, useStandardForm, useStandardFormCapabilities } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';

/* * */

type StopsExtractionCreate = InfrastructureNodesV1ExtractionCreate | InfrastructureStopsV1ExtractionCreate;
export type StopsExtractionCreateSchema = typeof InfrastructureNodesV1ExtractionCreateSchema | typeof InfrastructureStopsV1ExtractionCreateSchema;

const StopsExtractFormContext = createContext<StandardFormContextValue<StopsExtractionCreate> | undefined>(undefined);

export function useStopsExtractFormContext() {
	const context = useContext(StopsExtractFormContext);
	if (!context) throw new Error('useStopsExtractFormContext must be used within a StopsExtractFormContextProvider');
	return context;
}

/* * */

export function StopsExtractFormContextProvider({ children, onClose, schema, showFacilitiesAndConnections = true }: PropsWithChildren<{ onClose: () => void, schema: StopsExtractionCreateSchema, showFacilitiesAndConnections?: boolean }>) {
	const { data: meData } = useMeData();
	const { mutate } = useExtractionsListData();
	const filterAgency = useStopsListFilterAgency();
	const filterConnections = useStopsListFilterConnections();
	const filterFacilities = useStopsListFilterFacilities();
	const filterLifecycleStatus = useStopsListFilterLifecycleStatus();
	const filterLocationNeighbourhood = useStopsListFilterLocationNeighbourhood();
	const filterLocationPrimary = useStopsListFilterLocationPrimary();
	const filterLocationSecondary = useStopsListFilterLocationSecondary();
	const filterLocationTertiary = useStopsListFilterLocationTertiary();
	const filterSearch = useStopsListFilterSearch();

	const { form, isDirty, isValid, unblock } = useStandardForm<StopsExtractionCreate, StopsExtractionCreateSchema>({
		defaultValues: {
			properties: {
				agency_ids: filterAgency.isActive ? filterAgency.value : undefined,
				connections: showFacilitiesAndConnections && filterConnections.isActive ? filterConnections.value : undefined,
				facilities: showFacilitiesAndConnections && filterFacilities.isActive ? filterFacilities.value : undefined,
				lifecycle_statuses: filterLifecycleStatus.isActive ? filterLifecycleStatus.value : undefined,
				location_neighbourhood_ids: filterLocationNeighbourhood.isActive ? filterLocationNeighbourhood.value : undefined,
				location_primary_ids: filterLocationPrimary.isActive ? filterLocationPrimary.value : undefined,
				location_secondary_ids: filterLocationSecondary.isActive ? filterLocationSecondary.value : undefined,
				location_tertiary_ids: filterLocationTertiary.isActive ? filterLocationTertiary.value : undefined,
				search: filterSearch.value,
			},
			send_email_notification: false,
			version: schema.shape.version.value,
		},
		schema,
	});

	const { action: handleExtract, isLoading: isExtracting } = useHandleAction({
		fetchFn: async (body: StopsExtractionCreate) => await fetchApiData<Extraction[], StopsExtractionCreate>({
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
			hasPermission: hasPermission(meData?.permissions, {
				action: PermissionCatalog.all.stops.actions.export,
				scope: PermissionCatalog.all.stops.scope,
			}),
			isCreating: isExtracting,
		},
		form: { isDirty, isValid },
	});

	const stateValue: StandardFormContextValue<StopsExtractionCreate> = useMemo(() => ({
		actions: { create: form.handleSubmit(handleExtract) },
		capabilities: { createEnabled, editEnabled },
		form,
		isDirty,
		isValid,
		status: { isCreating: isExtracting },
		unblock,
	}), [createEnabled, editEnabled, form, handleExtract, isDirty, isExtracting, isValid, unblock]);

	return <StopsExtractFormContext.Provider value={stateValue}>{children}</StopsExtractFormContext.Provider>;
}
