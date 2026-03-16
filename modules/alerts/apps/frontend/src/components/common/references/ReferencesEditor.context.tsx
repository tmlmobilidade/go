'use client';

/* * */

import { useLinesContext } from '@/contexts/Lines.context';
import { useStopsContext } from '@/contexts/Stops.context';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { type Alert, type RideNormalized, type UnixTimestamp } from '@tmlmobilidade/types';
import { Label, openConfirmModal, SelectDataItem, useDataRides, useFilterStateList, type UseFilterStateListReturnType, useFilterStateString, type UseFilterStateStringReturnType } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { createContext, type PropsWithChildren, useContext, useEffect, useState } from 'react';

/* * */

export interface ReferencesEditorContextProps {
	activePeriodEndDate: undefined | UnixTimestamp
	activePeriodStartDate: undefined | UnixTimestamp
	availableAgenciesOptions: SelectDataItem[]
	enabledReferenceTypes: Alert['reference_type'][]
	onChangeAgencyId: (type: Alert['agency_id']) => void
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
		changeAgencyId: (value: Alert['agency_id']) => void
		changeReferenceType: (value: Alert['reference_type']) => void
		removeAllRides: () => void
		removeReference: (index: number) => void
		toggleRideSelection: (rideId: string) => void
		updateReference: (index: number, field: 'child_ids' | 'parent_id', value: string | string[]) => void
	}
	data: {
		available_agencies_options: SelectDataItem[]
		enabled_reference_types: Alert['reference_type'][]
		filtered_rides: RideNormalized[]
		selected_agency_id: Alert['agency_id']
		selected_reference_type: Alert['reference_type']
		selected_references: Alert['references']
		selected_rides_data: RideNormalized[]
	}
	filters: {
		lines: UseFilterStateListReturnType
		search: UseFilterStateStringReturnType
		stops: UseFilterStateListReturnType
		view_mode?: UseFilterStateStringReturnType
	}
	flags: {
		isRidesLoading: boolean
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

export const ReferencesEditorContextProvider = ({ activePeriodEndDate, activePeriodStartDate, availableAgenciesOptions, children, enabledReferenceTypes, onChangeAgencyId, onChangeReferences, onChangeReferenceType, selectedAgencyId, selectedReferences, selectedReferenceType }: PropsWithChildren<ReferencesEditorContextProps>) => {
	//

	//
	// A. Setup variables

	const linesContext = useLinesContext();
	const stopsContext = useStopsContext();

	const filterLines = useFilterStateList('lines', [], linesContext.data.options);
	const filterStops = useFilterStateList('stops', [], stopsContext.data.options);
	const filterSearch = useFilterStateString('rides_search');
	const filterViewMode = useFilterStateString('view_mode', 'selected');

	const [startDate, setStartDate] = useState<UnixTimestamp>();
	const [endDate, setEndDate] = useState<UnixTimestamp>();

	const [selectedRidesData, setSelectedRidesData] = useState<RideNormalized[]>([]);

	//
	// B. Fetch data

	const { isLoading: ridesLoading, raw: ridesData } = useDataRides(API_ROUTES.alerts.RIDES_LIST, {
		filters: {
			agency_ids: [selectedAgencyId],
			date_end: endDate,
			date_start: startDate,
			line_ids: filterLines.value,
			operational_statuses: ['running', 'missed', 'scheduled'],
			search: filterSearch.value,
			stop_ids: filterStops.value,
		},
	});

	//
	// C. Handle actions

	useEffect(() => {
		// Skip if no selected references
		if (selectedReferenceType !== 'rides') return;
		// Set filter mode to 'all' if there are no selected references
		if (!selectedReferences?.length) filterViewMode.set('all');
	}, [selectedReferences, selectedReferenceType]);

	const changeAgencyId = (value: Alert['agency_id']) => {
		if (selectedReferences?.length > 0) {
			openConfirmModal({
				cancelProps: { variant: 'danger' },
				centered: true,
				children: <Label>Ao alterar o operador, irá perder as referências que já foram adicionadas.</Label>,
				closeOnClickOutside: true,
				labels: { cancel: 'Cancelar', confirm: 'Continuar' },
				onConfirm: () => {
					onChangeAgencyId(value);
					onChangeReferences([]);
				},
				title: 'Tem a certeza que pretende mudar de operador?',
			});
		} else {
			onChangeAgencyId(value);
			onChangeReferences([]);
		}
	};

	const changeReferenceType = (value: Alert['reference_type']) => {
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
	};

	const addReference = () => {
		const updatedReferences = Array.from(selectedReferences || []);
		updatedReferences.push({ child_ids: [], parent_id: '' });
		onChangeReferences(updatedReferences);
	};

	const removeReference = (index: number) => {
		const currentReferences = selectedReferences || [];
		onChangeReferences(currentReferences.filter((_, i) => i !== index));
	};

	const updateReference = (index: number, field: 'child_ids' | 'parent_id', value: string | string[]) => {
		if (field === 'parent_id') {
			const updatedReferences = Array.from(selectedReferences);
			updatedReferences[index].parent_id = value as string;
			updatedReferences[index].child_ids = [];
			onChangeReferences(updatedReferences);
		} else {
			const updatedReferences = Array.from(selectedReferences);
			updatedReferences[index].child_ids = value as string[];
			onChangeReferences(updatedReferences);
		}
	};

	const toggleRideSelection = (rideId: string) => {
		// Get existing references
		const existingReferences = selectedReferences ?? [];
		// If ride is already selected, remove it and return
		if (existingReferences?.some(reference => reference.parent_id === rideId)) {
			onChangeReferences(existingReferences.filter(reference => reference.parent_id !== rideId));
			return;
		}
		// Otherwise, add it to the references array
		onChangeReferences([...existingReferences, { child_ids: [], parent_id: rideId }]);
	};

	const removeAllRides = () => {
		onChangeReferences([]);
	};

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

	useEffect(() => {
		// Add a margin to the start date
		if (!activePeriodStartDate) return;
		setStartDate(Dates.fromUnixTimestamp(activePeriodStartDate).minus({ minutes: 30 }).unix_timestamp);
	}, [activePeriodStartDate]);

	useEffect(() => {
		// Add a margin to the end date
		if (!activePeriodEndDate) {
			console.warn(activePeriodEndDate, 'ReferencesEditorContextProvider: activePeriodEndDate is undefined');
			if (!activePeriodStartDate) return;
			setEndDate(Dates.fromUnixTimestamp(activePeriodStartDate).plus({ hours: 4 }).unix_timestamp);
		}
		setEndDate(activePeriodEndDate);
	}, [activePeriodStartDate, activePeriodEndDate]);

	//
	// D. Define State

	const contextValue: ReferencesEditorContextState = {
		actions: {
			addReference,
			changeAgencyId,
			changeReferenceType,
			removeAllRides,
			removeReference,
			toggleRideSelection,
			updateReference,
		},
		data: {
			available_agencies_options: availableAgenciesOptions,
			enabled_reference_types: enabledReferenceTypes || [],
			filtered_rides: ridesData,
			selected_agency_id: selectedAgencyId,
			selected_reference_type: selectedReferenceType,
			selected_references: selectedReferences ?? [],
			selected_rides_data: selectedRidesData,
		},
		filters: {
			lines: filterLines,
			search: filterSearch,
			stops: filterStops,
			view_mode: filterViewMode,
		},
		flags: {
			isRidesLoading: ridesLoading,
		},
	};

	//
	// E. Return state

	return (
		<ReferencesEditorContext.Provider value={contextValue}>
			{children}
		</ReferencesEditorContext.Provider>
	);

	//
};
