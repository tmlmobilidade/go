'use client';

/* * */

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Alert, type RideNormalized, type UnixTimestamp } from '@tmlmobilidade/types';
import { Label, openConfirmModal, type SelectDataItem, useDataOperationalLines, useDataOperationalStops, useDataRides } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';

/* * */

export interface ReferencesEditorContextProps {
	activePeriodEndDate: undefined | UnixTimestamp
	activePeriodStartDate: undefined | UnixTimestamp
	availableAgenciesOptions: SelectDataItem[]
	enabledReferenceTypes: Alert['reference_type'][]
	onChangeReferences: (references: Alert['references']) => void
	onChangeReferenceType: (type: Alert['reference_type']) => void
	selectedAgencyId: Alert['agency_id']
	selectedMunicipalityIds?: Alert['municipality_ids']
	selectedReferences: Alert['references']
	selectedReferenceType: Alert['reference_type']
};

interface ReferencesEditorContextState {
	actions: {
		addReference: () => void
		changeReferenceType: (value: Alert['reference_type']) => void
		removeAllRides: () => void
		removeReference: (index: number) => void
		toggleRideSelection: (rideId: string) => void
		updateReference: (index: number, field: 'child_ids' | 'parent_id', value: string | string[]) => void
	}
	data: {
		active_period_end_date: UnixTimestamp
		active_period_start_date: UnixTimestamp
		available_agencies_options: SelectDataItem[]
		enabled_reference_types: Alert['reference_type'][]
		selected_agency_id: Alert['agency_id']
		selected_reference_type: Alert['reference_type']
		selected_references: Alert['references']
		selected_rides_data: RideNormalized[]
	}
	flags: {
		isLoading: boolean
	}
};

/* * */

const ReferencesEditorContext = createContext<ReferencesEditorContextState | undefined>(undefined);

export function useReferencesEditorContext() {
	const context = useContext(ReferencesEditorContext);
	if (!context) {
		throw new Error('useReferencesEditorContext must be used within a ReferencesEditorContextProvider');
	}
	return context;
}

/* * */

export function ReferencesEditorContextProvider({ activePeriodEndDate, activePeriodStartDate, availableAgenciesOptions, children, enabledReferenceTypes, onChangeReferences, onChangeReferenceType, selectedAgencyId, selectedReferences, selectedReferenceType }: PropsWithChildren<ReferencesEditorContextProps>) {
	//

	//
	// A. Setup variables

	const [selectedRidesData, setSelectedRidesData] = useState<RideNormalized[]>([]);

	//
	// B. Fetch data

	const { isLoading: operationalLinesLoading } = useDataOperationalLines(API_ROUTES.alerts.OPERATION_LINES, {
		filters: {
			agency_ids: [selectedAgencyId],
			date_end: activePeriodEndDate,
			date_start: activePeriodStartDate,
		},
	});

	const { isLoading: operationalStopsLoading } = useDataOperationalStops(API_ROUTES.alerts.OPERATION_STOPS, {
		filters: {
			agency_ids: [selectedAgencyId],
			date_end: activePeriodEndDate,
			date_start: activePeriodStartDate,
		},
	});

	const { isLoading: ridesLoading } = useDataRides(API_ROUTES.alerts.RIDES_LIST, {
		filters: {
			agency_ids: [selectedAgencyId],
			date_end: activePeriodEndDate,
			date_start: activePeriodStartDate,
			operational_statuses: ['running', 'missed', 'scheduled'],
		},
	});

	//
	// C. Handle actions

	const changeReferenceType = useCallback((value: Alert['reference_type']) => {
		if (selectedReferences?.length > 0) {
			openConfirmModal({
				cancelProps: { variant: 'danger' },
				centered: true,
				children: <Label>Ao alterar o tipo, irá perder as referências que já foram adicionadas.</Label>,
				closeOnClickOutside: true,
				labels: { cancel: 'Cancelar', confirm: 'Continuar' },
				onConfirm: () => {
					onChangeReferenceType(value);
					onChangeReferences([]);
				},
				title: 'Tem a certeza que pretende mudar de tipo de referência?',
			});
		} else {
			onChangeReferenceType(value);
			onChangeReferences([]);
		}
	}, [selectedReferences, onChangeReferenceType, onChangeReferences]);

	const addReference = useCallback(() => {
		onChangeReferences([...(selectedReferences || []), { child_ids: [], parent_id: '' }]);
	}, [selectedReferences, onChangeReferences]);

	const removeReference = useCallback((index: number) => {
		onChangeReferences((selectedReferences || []).filter((_, i) => i !== index));
	}, [selectedReferences, onChangeReferences]);

	const updateReference = useCallback((index: number, field: 'child_ids' | 'parent_id', value: string | string[]) => {
		const updatedReferences = (selectedReferences || []).map((ref, i) => {
			if (i !== index) return ref;
			if (field === 'parent_id') return { ...ref, child_ids: [], parent_id: value as string };
			return { ...ref, child_ids: value as string[] };
		});
		onChangeReferences(updatedReferences);
	}, [selectedReferences, onChangeReferences]);

	const toggleRideSelection = useCallback((rideId: string) => {
		const existingReferences = selectedReferences ?? [];
		if (existingReferences.some(reference => reference.parent_id === rideId)) {
			onChangeReferences(existingReferences.filter(reference => reference.parent_id !== rideId));
			return;
		}
		onChangeReferences([...existingReferences, { child_ids: [], parent_id: rideId }]);
	}, [selectedReferences, onChangeReferences]);

	const removeAllRides = useCallback(() => {
		onChangeReferences([]);
	}, [onChangeReferences]);

	useEffect(() => {
		(async () => {
			// Reset state if no selected references
			if (!selectedReferences?.length) return setSelectedRidesData([]);
			if (selectedReferenceType !== 'rides') return setSelectedRidesData([]);
			// Fetch data for each selected ride
			const result: RideNormalized[] = [];
			for (const rideId of selectedReferences.map(reference => reference.parent_id)) {
				const response = await fetchData<RideNormalized>(API_ROUTES.alerts.RIDES_DETAIL_RIDE(rideId));
				if (!response.data) continue;
				result.push(response.data);
			}
			setSelectedRidesData(result);
		})();
	}, [selectedReferences, selectedReferenceType]);

	//
	// D. Define State

	const contextValue: ReferencesEditorContextState = useMemo(() => ({
		actions: {
			addReference,
			changeReferenceType,
			removeAllRides,
			removeReference,
			toggleRideSelection,
			updateReference,
		},
		data: {
			active_period_end_date: activePeriodEndDate,
			active_period_start_date: activePeriodStartDate,
			available_agencies_options: availableAgenciesOptions,
			enabled_reference_types: enabledReferenceTypes || [],
			selected_agency_id: selectedAgencyId,
			selected_reference_type: selectedReferenceType,
			selected_references: selectedReferences ?? [],
			selected_rides_data: selectedRidesData,
		},
		flags: {
			isLoading: operationalLinesLoading || operationalStopsLoading || ridesLoading,
		},
	}), [
		addReference,
		changeReferenceType,
		removeAllRides,
		removeReference,
		toggleRideSelection,
		updateReference,
		activePeriodEndDate,
		activePeriodStartDate,
		availableAgenciesOptions,
		enabledReferenceTypes,
		selectedAgencyId,
		selectedReferenceType,
		selectedReferences,
		selectedRidesData,
		operationalLinesLoading,
		operationalStopsLoading,
		ridesLoading,
	]);

	//
	// E. Return state

	return (
		<ReferencesEditorContext.Provider value={contextValue}>
			{children}
		</ReferencesEditorContext.Provider>
	);

	//
};
